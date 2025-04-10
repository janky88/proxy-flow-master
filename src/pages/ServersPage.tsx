
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { mockServers } from '@/lib/mockData';
import { ServerCard } from '@/components/servers/ServerCard';
import { AddServerDialog } from '@/components/servers/AddServerDialog';

const ServersPage = () => {
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  
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
          <ServerCard key={server.id} server={server} />
        ))}
      </div>
      
      <AddServerDialog open={isAddServerOpen} onOpenChange={setIsAddServerOpen} />
    </div>
  );
};

export default ServersPage;
