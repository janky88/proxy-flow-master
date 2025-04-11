
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, AlertTriangle, Server } from 'lucide-react';
import { mockProxyChains } from '@/lib/mockData';
import { ProxyChainCard } from '@/components/proxy/ProxyChainCard';
import { AddProxyChainDialog } from '@/components/proxy/AddProxyChainDialog';
import { useToast } from '@/hooks/use-toast';

const ProxyPage = () => {
  const [isAddProxyOpen, setIsAddProxyOpen] = useState(false);
  const [refresh, setRefresh] = useState(0); // 刷新状态
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  
  // 从本地存储加载代理链
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      const savedProxyChains = localStorage.getItem('proxyChains');
      if (savedProxyChains) {
        const parsedChains = JSON.parse(savedProxyChains);
        // 更新mockProxyChains，但保持引用不变
        mockProxyChains.length = 0;
        mockProxyChains.push(...parsedChains);
      }
    } catch (error) {
      console.error('加载代理链数据失败', error);
      setHasError(true);
      toast({
        title: "加载数据失败",
        description: "无法加载代理链配置数据，请刷新页面重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [refresh, toast]);
  
  // 当对话框关闭时触发刷新
  const handleDialogChange = (open: boolean) => {
    setIsAddProxyOpen(open);
    if (!open) {
      // 对话框关闭时刷新页面
      setRefresh(prev => prev + 1);
    }
  };

  // 处理代理链状态变化
  const handleProxyStatusChange = () => {
    // 更新本地存储
    try {
      localStorage.setItem('proxyChains', JSON.stringify(mockProxyChains));
    } catch (error) {
      console.error('保存到本地存储失败', error);
      toast({
        title: "保存失败",
        description: "无法保存代理链配置更改",
        variant: "destructive"
      });
    }
    setRefresh(prev => prev + 1);
  };

  // 手动刷新页面
  const handleRefresh = () => {
    setRefresh(prev => prev + 1);
    toast({
      title: "刷新成功",
      description: "代理链配置数据已刷新",
    });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">代理配置</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setIsAddProxyOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> 新建代理链
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-32 border rounded-lg bg-muted/10">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">加载代理链配置...</p>
          </div>
        </div>
      ) : hasError ? (
        <div className="flex items-center justify-center h-32 border rounded-lg bg-destructive/10">
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <p className="text-sm text-destructive">加载数据失败，请刷新页面重试</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> 重试
            </Button>
          </div>
        </div>
      ) : mockProxyChains.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <Server className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
          <h3 className="text-lg font-medium mb-2">尚未创建代理链</h3>
          <p className="text-muted-foreground mb-4">创建您的第一个代理链以开始配置多级代理</p>
          <Button onClick={() => setIsAddProxyOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> 新建代理链
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {mockProxyChains.map(chain => (
            <ProxyChainCard 
              key={`${chain.id}-${refresh}`} 
              proxyChain={chain} 
              onStatusChange={handleProxyStatusChange}
            />
          ))}
        </div>
      )}
      
      <AddProxyChainDialog open={isAddProxyOpen} onOpenChange={handleDialogChange} />
    </div>
  );
};

export default ProxyPage;
