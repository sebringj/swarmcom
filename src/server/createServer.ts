import { loadEnvironment } from "../config/env";
import { loadNetworkConfig } from "../config/networkConfig";
import { LocalAdapter } from "../adapters/local/localAdapter";
import { MatrixAdapter } from "../adapters/matrix/matrixAdapter";
import { McpAdapter } from "../adapters/mcp/mcpAdapter";
import { OpenClawBridgeAdapter } from "../adapters/openclaw/bridgeAdapter";
import { MessagingService } from "../services/messagingService";
import { NetworkService } from "../services/networkService";
import { StatusService } from "../services/statusService";
import { DatabaseService } from "../db/database";

export type SwarmServer = {
  environment: ReturnType<typeof loadEnvironment>;
  networkConfig: ReturnType<typeof loadNetworkConfig>;
  dbService: DatabaseService;
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
  
  const dbService = new DatabaseService({ filePath: "./.swarmcom/db/swarmcom.sqlite" });
  const statusService = new StatusService(dbService);
  const networkService = new NetworkService(statusService);
  const messagingService = new MessagingService(dbService);

  return {
    environment,
    networkConfig,
    dbService,
    statusService,
    networkService,
    messagingService,
    localAdapter: new LocalAdapter(),
    matrixAdapter: new MatrixAdapter(),
    mcpAdapter: new McpAdapter(),
    openClawAdapter: new OpenClawBridgeAdapter()
  };
}