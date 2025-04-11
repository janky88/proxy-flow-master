
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProxyNode } from '@/lib/types';
import { Lock, Unlock } from 'lucide-react';
import { mockServers } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface ProxyNodeCardProps {
  node: ProxyNode;
  className?: string;
  isLastNode?: boolean;
  servers?: { value: string; label: string; }[];
  onUpdate?: (updatedNode: ProxyNode) => void;
  onDelete?: () => void;
}

export const ProxyNodeCard = ({ 
  node, 
  className, 
  isLastNode = false,
  servers = [],
  onUpdate,
  onDelete
}: ProxyNodeCardProps) => {
  const server = mockServers.find(s => s.id === node.serverId);
  
  const isFirst = node.position === 0;
  const nodeType = isFirst ? "入口节点" : isLastNode ? "出口节点" : "中继节点";
  
  const protocolBadgeVariant = {
    'tcp': 'default',
    'udp': 'secondary',
    'ws': 'outline',
    'wss': 'outline',
    'tls': 'outline',
  }[node.protocol] as "default" | "secondary" | "outline";
  
  // If this is just a display card (no editing functionality)
  if (!onUpdate) {
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
  }
  
  // Editable card with form fields
  const handleNodeChange = (updates: Partial<ProxyNode>) => {
    onUpdate({
      ...node,
      ...updates
    });
  };
  
  return (
    <Card className={cn("border shadow-sm", className)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{node.name || `节点 ${node.position + 1}`}</h4>
            <Badge variant="secondary" className="text-xs">
              {nodeType}
            </Badge>
          </div>
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
              <span className="sr-only">删除节点</span>
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`node-${node.id}-name`}>节点名称</Label>
              <Input
                id={`node-${node.id}-name`}
                value={node.name}
                onChange={(e) => handleNodeChange({ name: e.target.value })}
                placeholder={`节点 ${node.position + 1}`}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`node-${node.id}-server`}>服务器</Label>
              <Select
                value={node.serverId}
                onValueChange={(value) => handleNodeChange({ serverId: value })}
              >
                <SelectTrigger id={`node-${node.id}-server`}>
                  <SelectValue placeholder="选择服务器" />
                </SelectTrigger>
                <SelectContent>
                  {servers.map((server) => (
                    <SelectItem key={server.value} value={server.value}>
                      {server.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`node-${node.id}-protocol`}>协议</Label>
              <Select
                value={node.protocol}
                onValueChange={(value: 'tcp' | 'udp' | 'ws' | 'wss' | 'tls') => 
                  handleNodeChange({ protocol: value })}
              >
                <SelectTrigger id={`node-${node.id}-protocol`}>
                  <SelectValue placeholder="选择协议" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tcp">TCP</SelectItem>
                  <SelectItem value="udp">UDP</SelectItem>
                  <SelectItem value="ws">WebSocket (WS)</SelectItem>
                  <SelectItem value="wss">WebSocket Secure (WSS)</SelectItem>
                  <SelectItem value="tls">TLS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`node-${node.id}-listenPort`}>监听端口</Label>
              <Input
                id={`node-${node.id}-listenPort`}
                type="number"
                value={node.listenPort || ''}
                onChange={(e) => handleNodeChange({ listenPort: parseInt(e.target.value) || 0 })}
                placeholder="8080"
              />
            </div>
          </div>
          
          {!isLastNode && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`node-${node.id}-targetHost`}>目标主机</Label>
                <Input
                  id={`node-${node.id}-targetHost`}
                  value={node.targetHost || ''}
                  onChange={(e) => handleNodeChange({ targetHost: e.target.value })}
                  placeholder="example.com 或 IP 地址"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`node-${node.id}-targetPort`}>目标端口</Label>
                <Input
                  id={`node-${node.id}-targetPort`}
                  type="number"
                  value={node.targetPort || ''}
                  onChange={(e) => handleNodeChange({ targetPort: parseInt(e.target.value) || 0 })}
                  placeholder="8080"
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <input
              id={`node-${node.id}-encrypted`}
              type="checkbox"
              className="rounded border-gray-300"
              checked={node.encrypted}
              onChange={(e) => handleNodeChange({ encrypted: e.target.checked })}
            />
            <Label htmlFor={`node-${node.id}-encrypted`}>加密传输</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
