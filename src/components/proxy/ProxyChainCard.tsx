
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProxyChain } from '@/lib/types';
import { ArrowRight, PlayIcon, PauseIcon, Settings2, TrashIcon } from 'lucide-react';
import { mockProxyChains, mockServers } from '@/lib/mockData';
import { ProxyNodeCard } from './ProxyNodeCard';
import { useToast } from '@/hooks/use-toast';
import { EditProxyChainDialog } from './EditProxyChainDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ProxyChainCardProps {
  proxyChain: ProxyChain;
  onStatusChange?: () => void;
}

export const ProxyChainCard = ({ proxyChain, onStatusChange }: ProxyChainCardProps) => {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
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
  
  // 处理启动/停止代理链
  const handleToggleStatus = () => {
    const index = mockProxyChains.findIndex(c => c.id === proxyChain.id);
    if (index !== -1) {
      const newStatus = proxyChain.status === 'active' ? 'inactive' : 'active';
      mockProxyChains[index] = {
        ...mockProxyChains[index],
        status: newStatus,
        updatedAt: new Date()
      };
      
      toast({
        title: `代理链已${newStatus === 'active' ? '启动' : '停止'}`,
        description: `代理链 ${proxyChain.name} 已${newStatus === 'active' ? '成功启动' : '成功停止'}`,
      });
      
      if (onStatusChange) onStatusChange();
    }
  };
  
  // 处理删除代理链
  const handleDelete = () => {
    const index = mockProxyChains.findIndex(c => c.id === proxyChain.id);
    if (index !== -1) {
      mockProxyChains.splice(index, 1);
      
      toast({
        title: "代理链已删除",
        description: `代理链 ${proxyChain.name} 已成功删除`,
      });
      
      if (onStatusChange) onStatusChange();
    }
    setIsDeleteDialogOpen(false);
  };
  
  // 处理编辑代理链
  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  // 处理编辑对话框关闭
  const handleEditDialogChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open && onStatusChange) {
      onStatusChange();
    }
  };

  return (
    <>
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleToggleStatus}
              >
                <PauseIcon className="h-4 w-4 mr-1" />
                停止
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="sm"
                onClick={handleToggleStatus}
              >
                <PlayIcon className="h-4 w-4 mr-1" />
                启动
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleEdit}
            >
              <Settings2 className="h-4 w-4 mr-1" />
              编辑
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              删除
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* 编辑代理链对话框 */}
      <EditProxyChainDialog 
        open={isEditDialogOpen} 
        onOpenChange={handleEditDialogChange} 
        proxyChain={proxyChain} 
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除代理链 "{proxyChain.name}" 吗？此操作无法撤消。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

