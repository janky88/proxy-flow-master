
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { mockProxyChains } from '@/lib/mockData';
import { ProxyChainCard } from '@/components/proxy/ProxyChainCard';
import { AddProxyChainDialog } from '@/components/proxy/AddProxyChainDialog';

const ProxyPage = () => {
  const [isAddProxyOpen, setIsAddProxyOpen] = useState(false);
  
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
          <ProxyChainCard key={chain.id} proxyChain={chain} />
        ))}
      </div>
      
      <AddProxyChainDialog open={isAddProxyOpen} onOpenChange={setIsAddProxyOpen} />
    </div>
  );
};

export default ProxyPage;
