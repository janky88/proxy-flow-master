
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Server as ServerIcon, Wifi } from 'lucide-react';
import { Server } from '@/lib/types';
import { LatencyIndicator } from './LatencyIndicator';
import { cn } from '@/lib/utils';

interface ServerStatusCardProps {
  server: Server;
}

export const ServerStatusCard = ({ server }: ServerStatusCardProps) => {
  const statusBadgeClass = {
    'online': 'status-badge-online',
    'offline': 'status-badge-offline',
    'warning': 'status-badge-warning',
  }[server.status];
  
  const statusText = {
    'online': '在线',
    'offline': '离线',
    'warning': '警告',
  }[server.status];
  
  const lastSeenFormatted = new Date(server.lastSeen).toLocaleString('zh-CN');
  
  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-md">
              <ServerIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{server.name}</h3>
              <p className="text-sm text-muted-foreground">{server.host}:{server.port}</p>
            </div>
          </div>
          <span className={cn(statusBadgeClass)}>
            {statusText}
          </span>
        </div>
        
        {server.status !== 'offline' && (
          <div className="mt-4">
            <LatencyIndicator latency={server.latency} />
            <div className="mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Wifi className="h-4 w-4" />
                {server.uptime.toFixed(1)}% 可用性
              </span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground p-4 pt-0 border-t">
        最后在线: {lastSeenFormatted}
      </CardFooter>
    </Card>
  );
};
