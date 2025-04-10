
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Server } from '@/lib/types';
import { mockServerStats } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CpuIcon, MemoryStick, Network } from 'lucide-react';

interface ServerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server: Server;
}

export const ServerDetailDialog = ({ open, onOpenChange, server }: ServerDetailDialogProps) => {
  const serverStats = mockServerStats.find(stats => stats.serverId === server.id);
  
  if (!serverStats) {
    return null;
  }
  
  // Format traffic data
  const trafficData = serverStats.trafficData.map(item => ({
    time: item.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    inbound: item.inbound / (1024 * 1024), // Convert to MB
    outbound: item.outbound / (1024 * 1024), // Convert to MB
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>{server.name} - 详细信息</DialogTitle>
          <DialogDescription>
            服务器运行状态和流量统计
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="stats">
          <TabsList>
            <TabsTrigger value="stats">资源统计</TabsTrigger>
            <TabsTrigger value="traffic">流量监控</TabsTrigger>
          </TabsList>
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <CpuIcon className="mr-2 h-4 w-4" /> CPU使用率
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{serverStats.cpu.toFixed(1)}%</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <MemoryStick className="mr-2 h-4 w-4" /> 内存使用率
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{serverStats.memory.toFixed(1)}%</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Network className="mr-2 h-4 w-4" /> 活跃连接
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{serverStats.connections}</div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>性能监控 (24小时)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={serverStats.trafficData.map((item, i) => ({
                        time: item.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                        cpu: mockServerStats.find(s => s.serverId === server.id)?.cpu || 0,
                        memory: mockServerStats.find(s => s.serverId === server.id)?.memory || 0,
                        connections: mockServerStats.find(s => s.serverId === server.id)?.connections || 0,
                      }))}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="cpu" 
                        name="CPU(%)" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary)/30)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="memory" 
                        name="内存(%)" 
                        stroke="hsl(var(--secondary))" 
                        fill="hsl(var(--secondary)/30)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="traffic">
            <Card>
              <CardHeader>
                <CardTitle>流量统计 (24小时)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trafficData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="time" />
                      <YAxis 
                        tickFormatter={(value) => `${value.toFixed(0)} MB`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(2)} MB`, undefined]} 
                        labelFormatter={(label) => `时间: ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="inbound" 
                        name="入站流量" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary)/30)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="outbound" 
                        name="出站流量" 
                        stroke="hsl(var(--secondary))" 
                        fill="hsl(var(--secondary)/30)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
