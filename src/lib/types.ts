
export interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  status: 'online' | 'offline' | 'warning';
  latency: number;
  uptime: number;
  lastSeen: Date;
}

export interface ProxyChain {
  id: string;
  name: string;
  nodes: ProxyNode[];
  status: 'active' | 'inactive' | 'error';
  trafficIn: number;
  trafficOut: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProxyNode {
  id: string;
  name: string;
  serverId: string;
  protocol: 'tcp' | 'udp' | 'ws' | 'wss' | 'tls';
  listenPort: number;
  targetHost?: string;
  targetPort?: number;
  encrypted: boolean;
  methods?: string[];
  position: number;
}

export interface TrafficData {
  timestamp: Date;
  inbound: number;
  outbound: number;
}

export interface ServerStats {
  serverId: string;
  cpu: number;
  memory: number;
  connections: number;
  trafficData: TrafficData[];
}
