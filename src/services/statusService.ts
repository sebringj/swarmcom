import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { StatusHistoryEntry, StatusSnapshot, NodeSummary, nodeSummarySchema, statusHistoryEntrySchema, statusSnapshotSchema } from "../domain/status";

export class StatusService {
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
  }

  public appendHistory(historyFilePath: string, entry: StatusHistoryEntry): void {
    const absolutePath = resolve(historyFilePath);
    mkdirSync(dirname(absolutePath), { recursive: true });

    const history = this.loadHistory(historyFilePath);
    history.unshift(statusHistoryEntrySchema.parse(entry));
    writeFileSync(absolutePath, `${JSON.stringify(history.slice(0, 50), null, 2)}\n`, "utf8");
  }

  public loadHistory(historyFilePath: string): StatusHistoryEntry[] {
    const absolutePath = resolve(historyFilePath);
    if (!existsSync(absolutePath)) {
      return [];
    }

    const raw = JSON.parse(readFileSync(absolutePath, "utf8")) as unknown;
    return Array.isArray(raw) ? raw.map((entry) => statusHistoryEntrySchema.parse(entry)) : [];
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