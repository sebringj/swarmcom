import { ChildNodeReference, NodeRecord, nodeRecordSchema } from "../domain/node";
import { NetworkConfig } from "../config/networkConfig";
import { NodeSummary, StatusSnapshot } from "../domain/status";
import { StatusService } from "./statusService";

export class NetworkService {
  public constructor(private readonly statusService: StatusService) {}

  public registerNode(node: NodeRecord): NodeRecord {
    return nodeRecordSchema.parse({
      ...node,
      lastSeenAt: node.lastSeenAt ?? new Date().toISOString()
    });
  }

  public getCurrentStatus(statusFile: string): StatusSnapshot | null {
    return this.statusService.loadSnapshot(statusFile);
  }

  public summarizeNode(config: NetworkConfig, childSummaries: NodeSummary[]): NodeSummary | null {
    const selfStatus = this.statusService.loadSnapshot(config.statusFile);
    if (!selfStatus) {
      return null;
    }

    return this.statusService.buildSummary(selfStatus, childSummaries);
  }

  public summarizeChildren(children: ChildNodeReference[]): NodeSummary[] {
    return children.flatMap((child) => {
      if (!child.statusFile) {
        return [];
      }

      const snapshot = this.statusService.loadSnapshot(child.statusFile);
      if (!snapshot) {
        return [];
      }

      return this.statusService.buildSummary(snapshot, []);
    });
  }
}