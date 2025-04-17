
import { Server, ServerStats, TrafficData, ProxyChain, ProxyNode } from "./types";

// Generate some sample servers
export const mockServers: Server[] = [
  {
    id: "server-1",
    name: "香港服务器",
    host: "192.168.1.100",
    port: 8080,
    status: "online",
    latency: 85,
    uptime: 99.9,
    lastSeen: new Date(),
  },
  {
    id: "server-2",
    name: "日本服务器",
    host: "192.168.1.101",
    port: 8080,
    status: "online",
    latency: 120,
    uptime: 98.7,
    lastSeen: new Date(),
  },
  {
    id: "server-3",
    name: "美国服务器",
    host: "192.168.1.102",
    port: 8080,
    status: "warning",
    latency: 220,
    uptime: 95.4,
    lastSeen: new Date(),
  },
  {
    id: "server-4",
    name: "新加坡服务器",
    host: "192.168.1.103",
    port: 8080,
    status: "offline",
    latency: 0,
    uptime: 0,
    lastSeen: new Date(Date.now() - 86400000), // 1 day ago
  },
];

// Generate mock statistics data
const generateTrafficData = (hours = 24): TrafficData[] => {
  const data: TrafficData[] = [];
  const now = new Date();
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 3600000);
    const inbound = Math.floor(Math.random() * 100000000); // Random bytes
    const outbound = Math.floor(Math.random() * 80000000); // Random bytes
    data.push({ timestamp, inbound, outbound });
  }
  
  return data;
};

export const mockServerStats: ServerStats[] = mockServers.map(server => ({
  serverId: server.id,
  cpu: server.status === "offline" ? 0 : Math.random() * 100,
  memory: server.status === "offline" ? 0 : Math.random() * 100,
  connections: server.status === "offline" ? 0 : Math.floor(Math.random() * 200),
  trafficData: generateTrafficData()
}));

// Add mock proxy chains data
export const mockProxyChains: ProxyChain[] = [
  {
    id: "proxy-chain-1",
    name: "香港 -> 日本 链路",
    nodes: [
      {
        id: "node-1",
        name: "香港入口",
        serverId: "server-1",
        protocol: "tcp",
        listenPort: 10080,
        targetHost: "192.168.1.101",
        targetPort: 20080,
        encrypted: true,
        methods: ["aes-256-gcm"],
        position: 0
      },
      {
        id: "node-2",
        name: "日本出口",
        serverId: "server-2",
        protocol: "tcp",
        listenPort: 20080,
        encrypted: false,
        methods: [],
        position: 1
      }
    ],
    status: "active",
    trafficIn: 1024000,
    trafficOut: 2048000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "proxy-chain-2",
    name: "三级链路",
    nodes: [
      {
        id: "node-3",
        name: "香港入口",
        serverId: "server-1",
        protocol: "tcp",
        listenPort: 10081,
        targetHost: "192.168.1.102",
        targetPort: 20081,
        encrypted: true,
        methods: ["aes-256-gcm"],
        position: 0
      },
      {
        id: "node-4",
        name: "美国中转",
        serverId: "server-3",
        protocol: "tcp",
        listenPort: 20081,
        targetHost: "192.168.1.101",
        targetPort: 30081,
        encrypted: true,
        methods: ["aes-256-gcm"],
        position: 1
      },
      {
        id: "node-5",
        name: "日本出口",
        serverId: "server-2",
        protocol: "tcp",
        listenPort: 30081,
        encrypted: false,
        methods: [],
        position: 2
      }
    ],
    status: "inactive",
    trafficIn: 512000,
    trafficOut: 768000,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
