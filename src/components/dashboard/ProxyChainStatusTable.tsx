
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ProxyChain } from '@/lib/types';
import { Activity, ArrowRight } from 'lucide-react';
import { mockServers } from '@/lib/mockData';

interface ProxyChainStatusTableProps {
  proxyChains: ProxyChain[];
}

export const ProxyChainStatusTable = ({ proxyChains }: ProxyChainStatusTableProps) => {
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };
  
  const getServerNameById = (id: string): string => {
    return mockServers.find(server => server.id === id)?.name || '未知服务器';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>代理链名称</TableHead>
          <TableHead>节点路径</TableHead>
          <TableHead className="text-center">状态</TableHead>
          <TableHead className="text-right">流量 (入/出)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {proxyChains.map((chain) => (
          <TableRow key={chain.id}>
            <TableCell className="font-medium">{chain.name}</TableCell>
            <TableCell>
              <div className="flex items-center flex-wrap gap-1">
                {chain.nodes.map((node, index) => (
                  <React.Fragment key={node.id}>
                    <span className="text-sm">
                      {getServerNameById(node.serverId)}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({node.protocol}:{node.listenPort})
                      </span>
                    </span>
                    {index < chain.nodes.length - 1 && <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />}
                  </React.Fragment>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <Badge variant={
                chain.status === 'active' ? 'default' : 
                chain.status === 'inactive' ? 'secondary' : 'destructive'
              }>
                {chain.status === 'active' ? '活跃' : 
                 chain.status === 'inactive' ? '未启用' : '错误'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Activity className="h-3 w-3 text-muted-foreground" />
                <span>
                  {formatBytes(chain.trafficIn)} / {formatBytes(chain.trafficOut)}
                </span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
