
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Server } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface ServerScriptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server: Server;
}

export const ServerScriptDialog = ({ open, onOpenChange, server }: ServerScriptDialogProps) => {
  const { toast } = useToast();
  const [scriptType, setScriptType] = useState<'install' | 'configure' | 'custom'>('install');
  const [scriptContent, setScriptContent] = useState('');
  const [isRunningScript, setIsRunningScript] = useState(false);
  const [scriptOutput, setScriptOutput] = useState<string | null>(null);

  // Predefined script templates
  const scriptTemplates = {
    install: `#!/bin/bash
# Ehco 安装脚本
echo "开始安装 Ehco..."
wget -N --no-check-certificate https://github.com/Ehco1996/ehco/releases/download/v1.1.1/ehco_1.1.1_linux_amd64 -O /usr/local/bin/ehco
chmod +x /usr/local/bin/ehco
echo "Ehco 安装完成！"`,
    
    configure: `#!/bin/bash
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
echo "Ehco 已启动！"`,
    
    custom: ''
  };

  React.useEffect(() => {
    // Set the default script content when tab changes
    setScriptContent(scriptTemplates[scriptType]);
    // Reset script output when changing tabs
    setScriptOutput(null);
  }, [scriptType]);

  const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setScriptContent(e.target.value);
  };

  const handleRunScript = async () => {
    if (!scriptContent) {
      toast({
        title: "脚本内容为空",
        description: "请输入要执行的脚本内容",
        variant: "destructive"
      });
      return;
    }

    setIsRunningScript(true);
    setScriptOutput(null);
    
    try {
      // 模拟脚本执行过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 生成模拟输出
      let output = '';
      if (scriptType === 'install') {
        output = `正在连接到 ${server.host}:${server.port}...\n` +
                 `连接成功\n` +
                 `开始安装 Ehco...\n` +
                 `--2025-05-08 09:45:23--  https://github.com/Ehco1996/ehco/releases/download/v1.1.1/ehco_1.1.1_linux_amd64\n` +
                 `正在解析主机名 github.com... 20.205.243.166\n` +
                 `正在连接到 github.com|20.205.243.166|:443... 连接成功\n` +
                 `已发出 HTTP 请求，正在等待回应... 302 Found\n` +
                 `正在下载文件... 100%[===================>] 8.45M   5.21MB/s 用时 1.6s\n` +
                 `2025-05-08 09:45:26 (5.21 MB/s) - 已保存 "/usr/local/bin/ehco" [8858112]\n` +
                 `设置执行权限\n` +
                 `Ehco 安装完成！\n`;
      } else if (scriptType === 'configure') {
        output = `正在连接到 ${server.host}:${server.port}...\n` +
                 `连接成功\n` +
                 `配置 Ehco 转发...\n` +
                 `创建配置文件: /etc/ehco.json\n` +
                 `Ehco 配置完成！\n` +
                 `启动 Ehco...\n` +
                 `[INFO] 2025/05/08 09:45:30 config loaded: /etc/ehco.json\n` +
                 `[INFO] 2025/05/08 09:45:30 starting server at: 0.0.0.0:1234 remote: example.com:5678 type: raw -> ws\n` +
                 `[INFO] 2025/05/08 09:45:30 serving metrics on: 0.0.0.0:9000\n` +
                 `Ehco 已启动！\n`;
      } else {
        output = `正在连接到 ${server.host}:${server.port}...\n` +
                 `连接成功\n` +
                 `执行自定义脚本...\n` +
                 `脚本执行完成\n`;
      }
      
      setScriptOutput(output);
      
      toast({
        title: "脚本执行成功",
        description: `脚本已在服务器 ${server.name} 上成功执行`,
      });
      
    } catch (error) {
      toast({
        title: "脚本执行失败",
        description: "执行脚本时发生错误，请检查脚本内容",
        variant: "destructive"
      });
      setScriptOutput("执行失败: 连接到服务器时发生错误");
    } finally {
      setIsRunningScript(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>在 {server.name} 上执行脚本</DialogTitle>
          <DialogDescription>
            选择或编写要在服务器上执行的 Ehco 安装或配置脚本。
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="install" value={scriptType} onValueChange={(value) => setScriptType(value as 'install' | 'configure' | 'custom')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="install">安装脚本</TabsTrigger>
            <TabsTrigger value="configure">配置脚本</TabsTrigger>
            <TabsTrigger value="custom">自定义脚本</TabsTrigger>
          </TabsList>
          
          <TabsContent value="install" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="install-script">Ehco 安装脚本</Label>
              <Textarea
                id="install-script"
                placeholder="输入安装 Ehco 的 shell 脚本..."
                rows={8}
                value={scriptContent}
                onChange={handleScriptChange}
                className="font-mono text-sm mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                此脚本将通过 SSH 在远程服务器上执行，用于安装 Ehco。
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="configure" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="configure-script">Ehco 配置脚本</Label>
              <Textarea
                id="configure-script"
                placeholder="输入配置 Ehco 的 shell 脚本..."
                rows={8}
                value={scriptContent}
                onChange={handleScriptChange}
                className="font-mono text-sm mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                此脚本将配置 Ehco 的转发规则并启动服务。
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="custom-script">自定义脚本</Label>
              <Textarea
                id="custom-script"
                placeholder="输入要执行的自定义 shell 脚本..."
                rows={8}
                value={scriptContent}
                onChange={handleScriptChange}
                className="font-mono text-sm mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                此脚本将在远程服务器上执行您自定义的命令。
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        {scriptOutput && (
          <div className="mt-6">
            <Label>脚本执行输出</Label>
            <div className="bg-black text-green-400 font-mono p-4 rounded-md text-xs mt-2 overflow-auto max-h-[200px]">
              <pre>{scriptOutput}</pre>
            </div>
          </div>
        )}
        
        <DialogFooter className="mt-6">
          <Button 
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
      </DialogContent>
    </Dialog>
  );
};
