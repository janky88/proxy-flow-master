
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { mockServers } from '@/lib/mockData';
import { Server } from '@/lib/types';
import { Loader2 } from 'lucide-react';

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
  const [isTesting, setIsTesting] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setServerData(prev => ({
      ...prev,
      [id]: value
    }));
    // Reset test status when data changes
    setTestPassed(false);
  };

  const handleTestConnection = async () => {
    if (!serverData.host || !serverData.port) {
      toast({
        title: "信息不完整",
        description: "请填写主机地址和端口",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    
    try {
      // 模拟连接测试过程，在真实应用中，这应该是一个API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 模拟80%的成功率
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        setTestPassed(true);
        toast({
          title: "连接测试成功",
          description: `与服务器 ${serverData.host}:${serverData.port} 连接正常`,
        });
      } else {
        setTestPassed(false);
        toast({
          title: "连接测试失败",
          description: "无法连接到服务器，请检查地址和端口",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "连接测试错误",
        description: "测试过程中发生错误",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleAddServer = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testPassed) {
      toast({
        title: "验证未通过",
        description: "请先测试连接，确保服务器可用",
        variant: "destructive"
      });
      return;
    }
    
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
    
    // Save to local storage for persistence
    const savedServers = JSON.parse(localStorage.getItem('servers') || '[]');
    savedServers.unshift(newServer);
    localStorage.setItem('servers', JSON.stringify(savedServers));
    
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
    setTestPassed(false);
    
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
            <div className="flex justify-end items-center mt-2">
              <div className="flex items-center space-x-2">
                {testPassed && (
                  <span className="text-sm text-green-500">连接成功</span>
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleTestConnection}
                  disabled={isTesting || !serverData.host || !serverData.port}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      测试中
                    </>
                  ) : (
                    '测试连接'
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!testPassed}>添加服务器</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
