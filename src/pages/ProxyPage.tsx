
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { mockProxyChains } from '@/lib/mockData';
import { ProxyChainCard } from '@/components/proxy/ProxyChainCard';
import { AddProxyChainDialog } from '@/components/proxy/AddProxyChainDialog';

const ProxyPage = () => {
  const [isAddProxyOpen, setIsAddProxyOpen] = useState(false);
  const [refresh, setRefresh] = useState(0); // 刷新状态
  
  // 从本地存储加载代理链
  useEffect(() => {
    try {
      const savedProxyChains = localStorage.getItem('proxyChains');
      if (savedProxyChains) {
        const parsedChains = JSON.parse(savedProxyChains);
        // 更新mockProxyChains，但保持引用不变
        mockProxyChains.length = 0;
        mockProxyChains.push(...parsedChains);
        setRefresh(prev => prev + 1);
      }
    } catch (error) {
      console.error('加载代理链数据失败', error);
    }
  }, []);
  
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
    }
    setRefresh(prev => prev + 1);
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
            onStatusChange={handleProxyStatusChange}
          />
        ))}
      </div>
      
      <AddProxyChainDialog open={isAddProxyOpen} onOpenChange={handleDialogChange} />
    </div>
  );
};

export default ProxyPage;
