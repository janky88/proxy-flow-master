
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProxyChain } from '@/lib/types';
import { ArrowRight, PlayIcon, PauseIcon, Settings2, TrashIcon } from 'lucide-react';
import { mockServers } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { ProxyNodeCard } from './ProxyNodeCard';

interface ProxyChainCardProps {
  proxyChain: ProxyChain;
}

export const ProxyChainCard = ({ proxyChain }: ProxyChainCardProps) => {
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };
  
  const getServerNameById = (id: string): string => {
    return mockServers.find(server => server.id === id)?.name || '未知服务器';
  };
  
  const statusVariant = {
    'active': 'default',
    'inactive': 'secondary',
    'error': 'destructive'
  }[proxyChain.status] as "default" | "secondary" | "destructive";
  
  const statusText = {
    'active': '活跃',
    'inactive': '未启用',
    'error': '错误'
  }[proxyChain.status];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle>{proxyChain.name}</CardTitle>
          <Badge variant={statusVariant}>{statusText}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="mb-4">
          <div className="text-sm text-muted-foreground">
            创建于 {new Date(proxyChain.createdAt).toLocaleString('zh-CN')}
          </div>
          <div className="flex items-center gap-2 text-sm mt-1">
            <span>流量:</span>
            <span className="font-medium">↑ {formatBytes(proxyChain.trafficIn)}</span>
            <span className="font-medium">↓ {formatBytes(proxyChain.trafficOut)}</span>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 bg-background/50">
          <h4 className="text-sm font-medium mb-4">代理链节点</h4>
          
          <div className="space-y-4">
            {proxyChain.nodes.map((node, index) => (
              <div key={node.id} className="relative">
                <ProxyNodeCard node={node} />
                
                {index < proxyChain.nodes.length - 1 && (
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 z-10">
                    <div className="bg-muted rounded-full w-8 h-8 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <div className="text-sm text-muted-foreground">
          上次更新: {new Date(proxyChain.updatedAt).toLocaleString('zh-CN')}
        </div>
        <div className="space-x-2">
          {proxyChain.status === 'active' ? (
            <Button variant="outline" size="sm">
              <PauseIcon className="h-4 w-4 mr-1" />
              停止
            </Button>
          ) : (
            <Button variant="default" size="sm">
              <PlayIcon className="h-4 w-4 mr-1" />
              启动
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Settings2 className="h-4 w-4 mr-1" />
            编辑
          </Button>
          <Button variant="outline" size="sm">
            <TrashIcon className="h-4 w-4 mr-1" />
            删除
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
