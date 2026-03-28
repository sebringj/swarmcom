import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { StatusHistoryEntry, StatusSnapshot, NodeSummary, nodeSummarySchema, statusHistoryEntrySchema, statusSnapshotSchema } from "../domain/status";
import { DatabaseService } from "../db/database";

export class StatusService {
  private dbService?: DatabaseService;

  constructor(dbService?: DatabaseService) {
    this.dbService = dbService;
  }

  public loadSnapshot(filePath: string): StatusSnapshot | null {
    const absolutePath = resolve(filePath);
    if (!existsSync(absolutePath)) {
      return null;
    }

    const raw = readFileSync(absolutePath, "utf8");
    return statusSnapshotSchema.parse(JSON.parse(raw));
  }

  public writeSnapshot(filePath: string, snapshot: StatusSnapshot): void {
    const absolutePath = resolve(filePath);
    mkdirSync(dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, `${JSON.stringify(statusSnapshotSchema.parse(snapshot), null, 2)}\n`, "utf8");

    if (this.dbService) {
      try {
        const stmt = this.dbService.getDb().prepare(`
          INSERT INTO status_updates (created_at, node_id, state, summary, current_task, blockers, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          snapshot.updatedAt,
          snapshot.nodeId,
          snapshot.state,
          snapshot.summary,
          snapshot.currentTask || null,
          JSON.stringify(snapshot.blockers),
          JSON.stringify(snapshot.metadata)
        );
      } catch (err) {
        console.error("Failed to write status to DB:", err);
      }
    }
  }

  public appendHistory(historyFilePath: string, entry: StatusHistoryEntry): void {
    const absolutePath = resolve(historyFilePath);
    mkdirSync(dirname(absolutePath), { recursive: true });

    const history = this.loadHistory(historyFilePath);
    history.unshift(statusHistoryEntrySchema.parse(entry));
    writeFileSync(absolutePath, `${JSON.stringify(history.slice(0, 50), null, 2)}\n`, "utf8");
  }

  public loadHistory(historyFilePath: string, limit = 50): StatusHistoryEntry[] {
    if (this.dbService) {
      try {
        const stmt = this.dbService.getDb().prepare(`
          SELECT created_at, node_id, state, summary, current_task, blockers, metadata
          FROM status_updates
          ORDER BY created_at DESC
          LIMIT ?
        `);
        const rows = stmt.all(limit) as any[];
        return rows.map((row) => ({
          nodeId: row.node_id,
          state: row.state as any,
          summary: row.summary,
          currentTask: row.current_task || undefined,
          blockers: JSON.parse(row.blockers || "[]"),
          updatedAt: row.created_at,
          metadata: JSON.parse(row.metadata || "{}"),
          recordedAt: row.created_at
        }));
      } catch (err) {
        console.error("Failed to query DB for history:", err);
      }
    }

    const absolutePath = resolve(historyFilePath);
    if (!existsSync(absolutePath)) {
      return [];
    }

    const raw = JSON.parse(readFileSync(absolutePath, "utf8")) as unknown;
    return Array.isArray(raw) ? raw.map((entry) => statusHistoryEntrySchema.parse(entry)).slice(0, limit) : [];
  }

  public renderHumanStatus(snapshot: StatusSnapshot): string {
    const blockers = snapshot.blockers.length > 0 ? snapshot.blockers.map((blocker) => `- ${blocker}`).join("\n") : "- None";
    const metadata = Object.keys(snapshot.metadata).length > 0 ? `\n## Metadata\n\n\
${JSON.stringify(snapshot.metadata, null, 2)}\n` : "";

    return [
      `# Status: ${snapshot.nodeId}`,
      "",
      `- State: ${snapshot.state}`,
      `- Summary: ${snapshot.summary}`,
      `- Current Task: ${snapshot.currentTask ?? "None"}`,
      `- Updated At: ${snapshot.updatedAt}`,
      "",
      "## Blockers",
      "",
      blockers,
      metadata
    ].join("\n");
  }

  public buildSummary(selfStatus: StatusSnapshot, childSummaries: NodeSummary[]): NodeSummary {
    const blockedChildren = childSummaries.filter((summary) => summary.state === "blocked").length;
    const busyChildren = childSummaries.filter((summary) => summary.state === "busy").length;

    const highlights = [
      selfStatus.currentTask ? `Current task: ${selfStatus.currentTask}` : undefined,
      blockedChildren > 0 ? `${blockedChildren} child node(s) blocked` : undefined,
      ...childSummaries.flatMap((summary) => summary.highlights.slice(0, 1))
    ].filter((value): value is string => Boolean(value));

    return nodeSummarySchema.parse({
      nodeId: selfStatus.nodeId,
      summary: selfStatus.summary,
      state: selfStatus.state,
      updatedAt: selfStatus.updatedAt,
      childCount: childSummaries.length,
      blockedChildren,
      busyChildren,
      highlights
    });
  }
}