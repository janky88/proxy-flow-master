
export interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  status: 'online' | 'offline' | 'warning';
  latency: number;
  uptime: number;
  lastSeen: Date;
  scriptStatus?: 'not-installed' | 'installed' | 'configured';
  ehcoVersion?: string;
  ehcoRunning?: boolean;
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

// 端口转发规则类型定义 - 适配 EasyEhco
export interface PortForwardingRule {
  id: string;
  name: string;
  entryServer: {
    id: string;
    name: string;
    host: string;
    port: number;
  };
  entryPort: number;
  entryProtocols: ('tcp' | 'udp')[];
  exitServer: {
    id: string;
    name: string;
    host: string;
    port: number;
  };
  exitEncryption: boolean;  // 是否启用加密
  exitCompression: boolean; // 是否启用压缩 (仅WebSocket有效)
  targetHosts: {
    host: string;
    port: number;
  }[];
  protocols: ('tcp' | 'udp')[];
  status: 'active' | 'inactive' | 'error' | 'warning';
  latency?: number;
  trafficIn: number;
  trafficOut: number;
  createdAt: Date;
  updatedAt: Date;
  // Ehco 专用配置
  transportType: 'raw' | 'ws' | 'wss' | 'mwss'; // 传输隧道类型
  key?: string;  // 加密密钥
  bufferSize?: number; // 缓冲区大小（KB）
}

// 端口转发测试结果类型
export interface LatencyTestResult {
  ruleId: string;
  timestamp: Date;
  success: boolean;
  latency?: number;
  error?: string;
  hops: {
    from: string;
    to: string;
    latency: number;
    status: 'success' | 'error' | 'timeout';
  }[];
}

// Ehco 相关的类型定义
export interface EhcoConfig {
  web_host: string;
  web_port: number;
  enable_ping: boolean;
  relay_configs: EhcoRelayConfig[];
}

export interface EhcoRelayConfig {
  listen: string;
  listen_type: 'raw' | 'ws' | 'wss' | 'mwss';
  transport_type: 'raw' | 'ws' | 'wss' | 'mwss';
  tcp_remotes: string[];
  udp_remotes?: string[];
  encrypt?: boolean;
  compress?: boolean;
  key?: string;
  buffer_size?: number;
}

export interface EhcoStats {
  version: string;
  uptime: string;
  connections: number;
  bytesIn: number;
  bytesOut: number;
  relays: EhcoRelayStats[];
}

export interface EhcoRelayStats {
  listen: string;
  transport_type: string;
  remotes: string[];
  connections: number;
  bytesIn: number;
  bytesOut: number;
}
