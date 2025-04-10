
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProxyNode } from '@/lib/types';
import { Lock, Unlock } from 'lucide-react';
import { mockServers } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface ProxyNodeCardProps {
  node: ProxyNode;
  className?: string;
}

export const ProxyNodeCard = ({ node, className }: ProxyNodeCardProps) => {
  const server = mockServers.find(s => s.id === node.serverId);
  
  const isFirst = node.position === 0;
  const isLast = !node.targetHost && !node.targetPort;
  
  let nodeType = "中继节点";
  if (isFirst) nodeType = "入口节点";
  if (isLast) nodeType = "出口节点";
  
  const protocolBadgeVariant = {
    'tcp': 'default',
    'udp': 'secondary',
    'ws': 'outline',
    'wss': 'outline',
    'tls': 'outline',
  }[node.protocol] as "default" | "secondary" | "outline";
  
  return (
    <Card className={cn("border shadow-sm", className)}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">{node.name}</h4>
              <Badge variant="secondary" className="text-xs">
                {nodeType}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{server?.name || '未知服务器'}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={protocolBadgeVariant} className="uppercase">
              {node.protocol}
            </Badge>
            <Badge variant="outline">
              端口: {node.listenPort}
            </Badge>
            {node.encrypted ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Lock className="h-3 w-3 mr-1" />
                已加密
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Unlock className="h-3 w-3 mr-1" />
                未加密
              </Badge>
            )}
          </div>
        </div>
        
        {node.targetHost && node.targetPort && (
          <div className="mt-3 pt-3 border-t text-sm">
            <span className="text-muted-foreground">转发至: </span>
            <span className="font-medium">{node.targetHost}:{node.targetPort}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
