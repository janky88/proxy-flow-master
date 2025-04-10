
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { mockServers } from '@/lib/mockData';
import { ServerCard } from '@/components/servers/ServerCard';
import { AddServerDialog } from '@/components/servers/AddServerDialog';

const ServersPage = () => {
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  const [refresh, setRefresh] = useState(0); // 添加刷新状态
  
  // 当对话框关闭时触发刷新
  const handleDialogChange = (open: boolean) => {
    setIsAddServerOpen(open);
    if (!open) {
      // 对话框关闭时刷新页面
      setRefresh(prev => prev + 1);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">服务器管理</h1>
        <Button onClick={() => setIsAddServerOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> 添加服务器
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockServers.map(server => (
          <ServerCard key={`${server.id}-${refresh}`} server={server} onStatusChange={() => setRefresh(prev => prev + 1)} />
        ))}
      </div>
      
      <AddServerDialog open={isAddServerOpen} onOpenChange={handleDialogChange} />
    </div>
  );
};

export default ServersPage;
