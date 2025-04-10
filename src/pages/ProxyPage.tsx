
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { mockProxyChains } from '@/lib/mockData';
import { ProxyChainCard } from '@/components/proxy/ProxyChainCard';
import { AddProxyChainDialog } from '@/components/proxy/AddProxyChainDialog';

const ProxyPage = () => {
  const [isAddProxyOpen, setIsAddProxyOpen] = useState(false);
  const [refresh, setRefresh] = useState(0); // 添加刷新状态
  
  // 当对话框关闭时触发刷新
  const handleDialogChange = (open: boolean) => {
    setIsAddProxyOpen(open);
    if (!open) {
      // 对话框关闭时刷新页面
      setRefresh(prev => prev + 1);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">代理配置</h1>
        <Button onClick={() => setIsAddProxyOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> 新建代理链
        </Button>
      </div>
      
      <div className="space-y-6">
        {mockProxyChains.map(chain => (
          <ProxyChainCard 
            key={`${chain.id}-${refresh}`} 
            proxyChain={chain} 
            onStatusChange={() => setRefresh(prev => prev + 1)}
          />
        ))}
      </div>
      
      <AddProxyChainDialog open={isAddProxyOpen} onOpenChange={handleDialogChange} />
    </div>
  );
};

export default ProxyPage;
