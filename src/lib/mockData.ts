import { Server, ProxyChain, ServerStats, TrafficData } from "./types";

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

// Generate mock proxy chains
export const mockProxyChains: ProxyChain[] = [
  {
    id: "chain-1",
    name: "香港 -> 日本 -> 美国",
    nodes: [
      {
        id: "node-1",
        name: "香港入口",
        serverId: "server-1",
        protocol: "tcp",
        listenPort: 10001,
        encrypted: false,
        position: 0,
      },
      {
        id: "node-2",
        name: "日本中继",
        serverId: "server-2",
        protocol: "ws",
        listenPort: 10002,
        targetHost: "192.168.1.101",
        targetPort: 10001,
        encrypted: true,
        position: 1,
      },
      {
        id: "node-3",
        name: "美国出口",
        serverId: "server-3",
        protocol: "tcp",
        listenPort: 10003,
        targetHost: "192.168.1.102",
        targetPort: 10002,
        encrypted: true,
        position: 2,
      },
    ],
    status: "active",
    trafficIn: 1024 * 1024 * 50, // 50 MB
    trafficOut: 1024 * 1024 * 30, // 30 MB
    createdAt: new Date(Date.now() - 7 * 86400000), // 7 days ago
    updatedAt: new Date(),
  },
  {
    id: "chain-2",
    name: "新加坡 -> 香港",
    nodes: [
      {
        id: "node-4",
        name: "新加坡入口",
        serverId: "server-4",
        protocol: "udp",
        listenPort: 20001,
        encrypted: false,
        position: 0,
      },
      {
        id: "node-5",
        name: "香港出口",
        serverId: "server-1",
        protocol: "udp",
        listenPort: 20002,
        targetHost: "192.168.1.100",
        targetPort: 20001,
        encrypted: false,
        position: 1,
      },
    ],
    status: "error",
    trafficIn: 1024 * 1024 * 10, // 10 MB
    trafficOut: 1024 * 1024 * 5, // 5 MB
    createdAt: new Date(Date.now() - 3 * 86400000), // 3 days ago
    updatedAt: new Date(Date.now() - 1 * 86400000), // 1 day ago
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

// 添加端口转发规则模拟数据
export let mockPortForwardingRules = [
  {
    id: '1',
    name: '香港转发',
    entryServer: {
      id: '1',
      name: '广州移动 (倍率 1.5)',
      host: '123.123.123.123',
      port: 22,
    },
    entryPort: 10000,
    entryProtocols: ['tcp', 'socks'],
    exitServer: {
      id: '2',
      name: '香港CMI (倍率 0)',
      host: '45.45.45.45',
      port: 22,
    },
    exitEncryption: true,
    exitCompression: true,
    targetHosts: [
      { host: '1.2.3.4', port: 5678 },
      { host: '2001::db8', port: 80 },
      { host: 'example.com', port: 443 }
    ],
    protocols: ['tcp', 'udp'],
    status: 'active',
    latency: 120,
    trafficIn: 1024000,
    trafficOut: 2048000,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];
