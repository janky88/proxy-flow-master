
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, Shield, Activity, Globe, ArrowUpDown } from 'lucide-react';
import { mockServers, mockServerStats, mockProxyChains } from '@/lib/mockData';
import { ServerStatusCard } from '@/components/dashboard/ServerStatusCard';
import { TrafficChart } from '@/components/dashboard/TrafficChart';
import { LatencyIndicator } from '@/components/dashboard/LatencyIndicator';
import { ProxyChainStatusTable } from '@/components/dashboard/ProxyChainStatusTable';

const Dashboard = () => {
  // Calculate summary data
  const activeServers = mockServers.filter(s => s.status === 'online').length;
  const totalServers = mockServers.length;
  const activeChains = mockProxyChains.filter(c => c.status === 'active').length;
  const totalChains = mockProxyChains.length;
  
  // Calculate total traffic
  const totalInTraffic = mockProxyChains.reduce((acc, chain) => acc + chain.trafficIn, 0);
  const totalOutTraffic = mockProxyChains.reduce((acc, chain) => acc + chain.trafficOut, 0);
  
  // Format traffic numbers to human-readable format
  const formatTraffic = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">仪表盘</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-row items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">服务器状态</p>
              <h2 className="text-2xl font-bold mt-1">{activeServers} / {totalServers}</h2>
            </div>
            <Server className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-row items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">活跃转发链</p>
              <h2 className="text-2xl font-bold mt-1">{activeChains} / {totalChains}</h2>
            </div>
            <Shield className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-row items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">入站流量</p>
              <h2 className="text-2xl font-bold mt-1">{formatTraffic(totalInTraffic)}</h2>
            </div>
            <ArrowUpDown className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-row items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">出站流量</p>
              <h2 className="text-2xl font-bold mt-1">{formatTraffic(totalOutTraffic)}</h2>
            </div>
            <Globe className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>
      </div>
      
      {/* Traffic Graph */}
      <Card>
        <CardHeader>
          <CardTitle>流量统计</CardTitle>
          <CardDescription>过去24小时的流量数据</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <TrafficChart />
          </div>
        </CardContent>
      </Card>
      
      {/* Server Status Cards */}
      <h2 className="text-xl font-bold mt-8 mb-4">服务器状态</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockServers.map((server) => (
          <ServerStatusCard key={server.id} server={server} />
        ))}
      </div>
      
      {/* Proxy Chain Status */}
      <h2 className="text-xl font-bold mt-8 mb-4">转发链状态</h2>
      <Card>
        <CardHeader>
          <CardTitle>转发链</CardTitle>
          <CardDescription>所有已配置的转发链</CardDescription>
        </CardHeader>
        <CardContent>
          <ProxyChainStatusTable proxyChains={mockProxyChains} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
