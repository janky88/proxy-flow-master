
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { mockServers } from '@/lib/mockData';
import { Server } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [scriptMode, setScriptMode] = useState(false);
  const [scriptContent, setScriptContent] = useState('');
  const [scriptType, setScriptType] = useState<'install' | 'configure'>('install');
  const [isRunningScript, setIsRunningScript] = useState(false);
  
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
    
    // Switch to script mode if server added successfully
    setScriptMode(true);
  };

  const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setScriptContent(e.target.value);
  };

  const handleRunScript = async () => {
    setIsRunningScript(true);
    
    try {
      // 模拟脚本执行过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "脚本执行成功",
        description: `${scriptType === 'install' ? '安装' : '配置'}脚本已成功在服务器上执行`,
      });
      
      // 重置表单并关闭对话框
      setServerData({
        name: '',
        host: '',
        port: '',
        username: '',
        password: ''
      });
      setScriptContent('');
      setTestPassed(false);
      setScriptMode(false);
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "脚本执行失败",
        description: "执行脚本时发生错误，请检查脚本内容",
        variant: "destructive"
      });
    } finally {
      setIsRunningScript(false);
    }
  };

  const handleBack = () => {
    setScriptMode(false);
  };

  // Predefined script templates
  const installScriptTemplate = `#!/bin/bash
# Ehco 安装脚本
echo "开始安装 Ehco..."
wget -N --no-check-certificate https://github.com/Ehco1996/ehco/releases/download/v1.1.1/ehco_1.1.1_linux_amd64 -O /usr/local/bin/ehco
chmod +x /usr/local/bin/ehco
echo "Ehco 安装完成！"`;

  const configureScriptTemplate = `#!/bin/bash
# Ehco 配置脚本
echo "配置 Ehco 转发..."
cat > /etc/ehco.json << EOF
{
  "web_host": "0.0.0.0",
  "web_port": 9000,
  "enable_ping": true,
  "relay_configs": [
    {
      "listen": "0.0.0.0:1234",
      "listen_type": "raw",
      "transport_type": "ws",
      "tcp_remotes": ["example.com:5678"],
      "udp_remotes": ["example.com:5678"]
    }
  ]
}
EOF
echo "Ehco 配置完成！"
echo "启动 Ehco..."
ehco -c /etc/ehco.json
echo "Ehco 已启动！"`;

  const handleUseTemplate = () => {
    if (scriptType === 'install') {
      setScriptContent(installScriptTemplate);
    } else {
      setScriptContent(configureScriptTemplate);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        {!scriptMode ? (
          <>
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
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>执行服务器脚本</DialogTitle>
              <DialogDescription>
                在新添加的服务器上执行 Ehco 安装或配置脚本。
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="install" value={scriptType} onValueChange={(value) => setScriptType(value as 'install' | 'configure')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="install">安装脚本</TabsTrigger>
                <TabsTrigger value="configure">配置脚本</TabsTrigger>
              </TabsList>
              <TabsContent value="install" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="install-script">Ehco 安装脚本</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleUseTemplate}
                    >
                      使用模板
                    </Button>
                  </div>
                  <Textarea
                    id="install-script"
                    placeholder="输入安装 Ehco 的 shell 脚本..."
                    rows={12}
                    value={scriptContent}
                    onChange={handleScriptChange}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    此脚本将通过 SSH 在远程服务器上执行，用于安装 Ehco。
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="configure" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="configure-script">Ehco 配置脚本</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleUseTemplate}
                    >
                      使用模板
                    </Button>
                  </div>
                  <Textarea
                    id="configure-script"
                    placeholder="输入配置 Ehco 的 shell 脚本..."
                    rows={12}
                    value={scriptContent}
                    onChange={handleScriptChange}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    此脚本将配置 Ehco 的转发规则并启动服务。
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
              >
                返回
              </Button>
              <Button 
                type="button"
                onClick={handleRunScript}
                disabled={isRunningScript || !scriptContent}
              >
                {isRunningScript ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    执行中
                  </>
                ) : (
                  '执行脚本'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
