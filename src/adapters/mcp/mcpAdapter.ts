export class McpAdapter {
  public describeTools(): string[] {
    return [
      "register_node",
      "update_status",
      "query_status",
      "query_status_history",
      "query_summary",
      "query_network",
      "send_message"
    ];
  }
}