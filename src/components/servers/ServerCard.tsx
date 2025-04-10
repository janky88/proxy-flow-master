
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server } from '@/lib/types';
import { PowerIcon, Settings2, TrashIcon, BarChart2 } from 'lucide-react';
import { LatencyIndicator } from '../dashboard/LatencyIndicator';
import { cn } from '@/lib/utils';
import { ServerDetailDialog } from './ServerDetailDialog';

interface ServerCardProps {
  server: Server;
}

export const ServerCard = ({ server }: ServerCardProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
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
        <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(true)}>
          <BarChart2 className="h-4 w-4 mr-1" />
          统计
        </Button>
        <div className="space-x-2">
          <Button 
            variant={server.status === 'online' ? "destructive" : "default"} 
            size="sm"
            className="h-8 px-3"
          >
            <PowerIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-3">
            <Settings2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-3">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
      
      <ServerDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        server={server}
      />
    </Card>
  );
};
