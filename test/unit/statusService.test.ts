import { describe, expect, it } from "vitest";

import { StatusService } from "../../src/services/statusService";
import { StatusSnapshot } from "../../src/domain/status";

describe("StatusService", () => {
  const service = new StatusService();

  it("builds a rollup summary from self status and child summaries", () => {
    const selfStatus: StatusSnapshot = {
      nodeId: "boss-1",
      summary: "Coordinating build-out",
      state: "busy",
      currentTask: "Review child node progress",
      blockers: [],
      updatedAt: new Date().toISOString(),
      metadata: {}
    };

    const summary = service.buildSummary(selfStatus, [
      {
        nodeId: "worker-1",
        summary: "Blocked on credentials",
        state: "blocked",
        updatedAt: new Date().toISOString(),
        childCount: 0,
        blockedChildren: 0,
        busyChildren: 0,
        highlights: ["Waiting for matrix token"]
      }
    ]);

    expect(summary.nodeId).toBe("boss-1");
    expect(summary.blockedChildren).toBe(1);
    expect(summary.highlights.some((highlight) => highlight.includes("Current task"))).toBe(true);
  });

  it("renders human-readable markdown status", () => {
    const rendered = service.renderHumanStatus({
      nodeId: "worker-2",
      summary: "Idle and waiting",
      state: "idle",
      currentTask: "Stand by",
      blockers: [],
      updatedAt: new Date().toISOString(),
      metadata: {}
    });

    expect(rendered).toContain("# Status: worker-2");
    expect(rendered).toContain("- State: idle");
  });
});