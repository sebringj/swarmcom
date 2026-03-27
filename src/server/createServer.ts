import { loadEnvironment } from "../config/env";
import { loadNetworkConfig } from "../config/networkConfig";
import { LocalAdapter } from "../adapters/local/localAdapter";
import { MatrixAdapter } from "../adapters/matrix/matrixAdapter";
import { McpAdapter } from "../adapters/mcp/mcpAdapter";
import { OpenClawBridgeAdapter } from "../adapters/openclaw/bridgeAdapter";
import { MessagingService } from "../services/messagingService";
import { NetworkService } from "../services/networkService";
import { StatusService } from "../services/statusService";

export type SwarmServer = {
  environment: ReturnType<typeof loadEnvironment>;
  networkConfig: ReturnType<typeof loadNetworkConfig>;
  statusService: StatusService;
  networkService: NetworkService;
  messagingService: MessagingService;
  localAdapter: LocalAdapter;
  matrixAdapter: MatrixAdapter;
  mcpAdapter: McpAdapter;
  openClawAdapter: OpenClawBridgeAdapter;
};

export function createServer(configPath: string): SwarmServer {
  const environment = loadEnvironment();
  const networkConfig = loadNetworkConfig(configPath);
  const statusService = new StatusService();
  const networkService = new NetworkService(statusService);
  const messagingService = new MessagingService();

  return {
    environment,
    networkConfig,
    statusService,
    networkService,
    messagingService,
    localAdapter: new LocalAdapter(),
    matrixAdapter: new MatrixAdapter(),
    mcpAdapter: new McpAdapter(),
    openClawAdapter: new OpenClawBridgeAdapter()
  };
}