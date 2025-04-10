
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { mockServers } from '@/lib/mockData';
import { ServerCard } from '@/components/servers/ServerCard';
import { AddServerDialog } from '@/components/servers/AddServerDialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ServersPage = () => {
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  const [refresh, setRefresh] = useState(0); // 添加刷新状态
  const [editingServer, setEditingServer] = useState<any>(null);
  const { toast } = useToast();
  
  // 当对话框关闭时触发刷新
  const handleDialogChange = (open: boolean) => {
    setIsAddServerOpen(open);
    if (!open) {
      // 对话框关闭时刷新页面
      setRefresh(prev => prev + 1);
    }
  };

  // 监听子组件的编辑请求
  const handleEditRequest = (server: any) => {
    setEditingServer(server);
  };

  // 保存编辑的服务器信息
  const handleSaveEdit = () => {
    if (editingServer) {
      const index = mockServers.findIndex(s => s.id === editingServer.id);
      if (index !== -1) {
        mockServers[index] = {
          ...mockServers[index],
          ...editingServer,
          updatedAt: new Date()
        };
        
        toast({
          title: "服务器已更新",
          description: `服务器 ${editingServer.name} 已成功更新`,
        });
        
        setEditingServer(null);
        setRefresh(prev => prev + 1);
      }
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
          <ServerCard 
            key={`${server.id}-${refresh}`} 
            server={server} 
            onStatusChange={() => setRefresh(prev => prev + 1)}
            onEditRequest={handleEditRequest}
          />
        ))}
      </div>
      
      <AddServerDialog open={isAddServerOpen} onOpenChange={handleDialogChange} />

      {/* 编辑服务器对话框 */}
      <Dialog open={!!editingServer} onOpenChange={(open) => !open && setEditingServer(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑服务器</DialogTitle>
            <DialogDescription>
              修改服务器的配置信息
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editingServer && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    服务器名称
                  </Label>
                  <Input
                    id="name"
                    value={editingServer.name}
                    onChange={(e) => setEditingServer({...editingServer, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="host" className="text-right">
                    主机地址
                  </Label>
                  <Input
                    id="host"
                    value={editingServer.host}
                    onChange={(e) => setEditingServer({...editingServer, host: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="port" className="text-right">
                    端口
                  </Label>
                  <Input
                    id="port"
                    value={editingServer.port}
                    onChange={(e) => setEditingServer({...editingServer, port: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    类型
                  </Label>
                  <Select
                    value={editingServer.type}
                    onValueChange={(value) => setEditingServer({...editingServer, type: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="选择服务器类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vps">VPS</SelectItem>
                      <SelectItem value="shared">共享主机</SelectItem>
                      <SelectItem value="dedicated">专用服务器</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleSaveEdit}>保存更改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServersPage;
