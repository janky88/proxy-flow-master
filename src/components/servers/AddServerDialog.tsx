
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { mockServers } from '@/lib/mockData';
import { Server } from '@/lib/types';

interface AddServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddServerDialog = ({ open, onOpenChange }: AddServerDialogProps) => {
  const { toast } = useToast();
  const [serverData, setServerData] = useState({
    name: '',
    host: '',
    port: '',
    username: '',
    password: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setServerData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleAddServer = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a new server with mock data for the prototype
    const newServer: Server = {
      id: `server-${Date.now()}`,
      name: serverData.name,
      host: serverData.host,
      port: Number(serverData.port),
      status: 'online',
      latency: Math.floor(Math.random() * 200) + 50, // Random latency between 50-250ms
      uptime: 100, // Start with 100% uptime
      lastSeen: new Date(),
    };
    
    // Add to the mock servers array
    mockServers.unshift(newServer);
    
    // Show success message
    toast({
      title: "服务器添加成功",
      description: "新的服务器已成功添加到系统。",
    });
    
    // Reset form and close dialog
    setServerData({
      name: '',
      host: '',
      port: '',
      username: '',
      password: ''
    });
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加新服务器</DialogTitle>
          <DialogDescription>
            添加一个新的代理服务器到系统。请填写服务器详细信息。
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleAddServer}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                名称
              </Label>
              <Input
                id="name"
                placeholder="香港服务器"
                className="col-span-3"
                required
                value={serverData.name}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="host" className="text-right">
                主机
              </Label>
              <Input
                id="host"
                placeholder="192.168.1.1 或 hostname"
                className="col-span-3"
                required
                value={serverData.host}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="port" className="text-right">
                端口
              </Label>
              <Input
                id="port"
                placeholder="8080"
                type="number"
                min="1"
                max="65535"
                className="col-span-3"
                required
                value={serverData.port}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                用户名
              </Label>
              <Input
                id="username"
                placeholder="可选"
                className="col-span-3"
                value={serverData.username}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                密码
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="可选"
                className="col-span-3"
                value={serverData.password}
                onChange={handleChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">添加服务器</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
