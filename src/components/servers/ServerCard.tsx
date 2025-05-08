
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server } from '@/lib/types';
import { PowerIcon, Settings2, TrashIcon, BarChart2, Terminal } from 'lucide-react';
import { LatencyIndicator } from '../dashboard/LatencyIndicator';
import { cn } from '@/lib/utils';
import { ServerDetailDialog } from './ServerDetailDialog';
import { ServerScriptDialog } from './ServerScriptDialog';
import { mockServers } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

interface ServerCardProps {
  server: Server;
  onStatusChange?: () => void;
  onEditRequest?: (server: Server) => void;
}

export const ServerCard = ({ server, onStatusChange, onEditRequest }: ServerCardProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isScriptOpen, setIsScriptOpen] = useState(false);
  const { toast } = useToast();
  
  const statusBadgeClass = {
    'online': 'bg-green-500',
    'offline': 'bg-red-500',
    'warning': 'bg-yellow-500',
  }[server.status];
  
  const statusText = {
    'online': '在线',
    'offline': '离线',
    'warning': '警告',
  }[server.status];

  // 处理服务器开关状态
  const handlePowerToggle = () => {
    const index = mockServers.findIndex(s => s.id === server.id);
    if (index !== -1) {
      const newStatus = server.status === 'online' ? 'offline' : 'online';
      mockServers[index] = {
        ...mockServers[index],
        status: newStatus,
        latency: newStatus === 'online' ? Math.floor(Math.random() * 200) + 50 : 0,
        lastSeen: new Date()
      };
      
      toast({
        title: `服务器已${newStatus === 'online' ? '启动' : '停止'}`,
        description: `服务器 ${server.name} 已${newStatus === 'online' ? '成功启动' : '成功停止'}`,
      });
      
      if (onStatusChange) onStatusChange();
    }
  };

  // 处理删除服务器
  const handleDelete = () => {
    const index = mockServers.findIndex(s => s.id === server.id);
    if (index !== -1) {
      mockServers.splice(index, 1);
      
      toast({
        title: "服务器已删除",
        description: `服务器 ${server.name} 已成功删除`,
      });
      
      if (onStatusChange) onStatusChange();
    }
  };

  // 处理编辑服务器
  const handleEdit = () => {
    if (onEditRequest) {
      onEditRequest(server);
    } else {
      toast({
        title: "编辑服务器",
        description: `正在编辑服务器 ${server.name}`,
      });
    }
  };

  // 处理脚本执行
  const handleScriptOpen = () => {
    if (server.status === 'online') {
      setIsScriptOpen(true);
    } else {
      toast({
        title: "服务器离线",
        description: "请先启动服务器再执行脚本",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <div className={cn("h-1", statusBadgeClass)} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>{server.name}</CardTitle>
          <div className={cn("status-badge", `status-badge-${server.status}`)}>
            {statusText}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">服务器地址</p>
            <p className="text-sm text-muted-foreground">{server.host}:{server.port}</p>
          </div>
          
          {server.status !== 'offline' && (
            <>
              <div>
                <p className="text-sm font-medium">可用性</p>
                <p className="text-sm text-muted-foreground">{server.uptime.toFixed(1)}%</p>
              </div>
              
              <LatencyIndicator latency={server.latency} />
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4 border-t">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(true)}>
            <BarChart2 className="h-4 w-4 mr-1" />
            统计
          </Button>
          <Button variant="outline" size="sm" onClick={handleScriptOpen}>
            <Terminal className="h-4 w-4 mr-1" />
            脚本
          </Button>
        </div>
        <div className="space-x-2">
          <Button 
            variant={server.status === 'online' ? "destructive" : "default"} 
            size="sm"
            className="h-8 px-3"
            onClick={handlePowerToggle}
          >
            <PowerIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-3"
            onClick={handleEdit}
          >
            <Settings2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-3"
            onClick={handleDelete}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
      
      <ServerDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        server={server}
      />

      <ServerScriptDialog
        open={isScriptOpen}
        onOpenChange={setIsScriptOpen}
        server={server}
      />
    </Card>
  );
};
