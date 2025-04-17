
import { Server, ServerStats, TrafficData } from "./types";

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
