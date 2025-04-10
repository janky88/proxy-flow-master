
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { mockServers } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

interface AddProxyChainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddProxyChainDialog = ({ open, onOpenChange }: AddProxyChainDialogProps) => {
  const { toast } = useToast();
  const [nodes, setNodes] = useState([
    { id: '1', name: '', serverId: '', protocol: 'tcp', port: '', targetHost: '', targetPort: '', encrypted: false }
  ]);
  
  const handleAddNode = () => {
    setNodes([
      ...nodes,
      { 
        id: Math.random().toString(), 
        name: '', 
        serverId: '', 
        protocol: 'tcp', 
        port: '', 
        targetHost: nodes.length > 0 ? 'localhost' : '', 
        targetPort: nodes.length > 0 ? nodes[nodes.length-1].port : '', 
        encrypted: false 
      }
    ]);
  };
  
  const handleRemoveNode = (index: number) => {
    if (nodes.length > 1) {
      const newNodes = [...nodes];
      newNodes.splice(index, 1);
      setNodes(newNodes);
    }
  };
  
  const handleNodeChange = (index: number, field: string, value: string | boolean) => {
    const newNodes = [...nodes];
    newNodes[index] = { ...newNodes[index], [field]: value };
    setNodes(newNodes);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "代理链创建成功",
      description: "新的代理链已成功添加到系统。",
    });
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建新的代理链</DialogTitle>
          <DialogDescription>
            设置您的多级代理转发链，可以包含多个节点。
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                代理链名称
              </Label>
              <Input
                id="name"
                placeholder="我的代理链"
                className="col-span-3"
                required
              />
            </div>
            
            <div className="pt-2">
              <h3 className="text-sm font-medium mb-2">代理链节点配置</h3>
              <p className="text-sm text-muted-foreground mb-4">
                按从入口到出口的顺序配置代理链中的节点。
              </p>
              
              {nodes.map((node, index) => (
                <Card key={node.id} className="mb-6">
                  <CardHeader className="py-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">
                        节点 {index + 1}
                        {index === 0 ? ' (入口)' : 
                         index === nodes.length - 1 ? ' (出口)' : ' (中继)'}
                      </CardTitle>
                      {nodes.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveNode(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="py-2 space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`node-${index}-name`} className="text-right">
                        节点名称
                      </Label>
                      <Input
                        id={`node-${index}-name`}
                        placeholder="香港入口"
                        className="col-span-3"
                        value={node.name}
                        onChange={(e) => handleNodeChange(index, 'name', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`node-${index}-server`} className="text-right">
                        服务器
                      </Label>
                      <Select 
                        value={node.serverId}
                        onValueChange={(value) => handleNodeChange(index, 'serverId', value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="选择服务器" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockServers.map(server => (
                            <SelectItem key={server.id} value={server.id}>
                              {server.name} ({server.host})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`node-${index}-protocol`} className="text-right">
                        协议
                      </Label>
                      <Select
                        value={node.protocol}
                        onValueChange={(value) => handleNodeChange(index, 'protocol', value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="选择协议" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tcp">TCP</SelectItem>
                          <SelectItem value="udp">UDP</SelectItem>
                          <SelectItem value="ws">WebSocket</SelectItem>
                          <SelectItem value="wss">WebSocket (SSL)</SelectItem>
                          <SelectItem value="tls">TLS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`node-${index}-port`} className="text-right">
                        监听端口
                      </Label>
                      <Input
                        id={`node-${index}-port`}
                        placeholder="10000"
                        type="number"
                        min="1"
                        max="65535"
                        className="col-span-3"
                        value={node.port}
                        onChange={(e) => handleNodeChange(index, 'port', e.target.value)}
                        required
                      />
                    </div>
                    
                    {index > 0 && (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor={`node-${index}-target-host`} className="text-right">
                            目标主机
                          </Label>
                          <Input
                            id={`node-${index}-target-host`}
                            placeholder="192.168.1.1"
                            className="col-span-3"
                            value={node.targetHost}
                            onChange={(e) => handleNodeChange(index, 'targetHost', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor={`node-${index}-target-port`} className="text-right">
                            目标端口
                          </Label>
                          <Input
                            id={`node-${index}-target-port`}
                            placeholder="10001"
                            type="number"
                            min="1"
                            max="65535"
                            className="col-span-3"
                            value={node.targetPort}
                            onChange={(e) => handleNodeChange(index, 'targetPort', e.target.value)}
                            required
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`node-${index}-encrypted`} className="text-right">
                        加密传输
                      </Label>
                      <div className="flex items-center space-x-2 col-span-3">
                        <Switch
                          id={`node-${index}-encrypted`}
                          checked={node.encrypted}
                          onCheckedChange={(checked) => handleNodeChange(index, 'encrypted', checked)}
                        />
                        <Label htmlFor={`node-${index}-encrypted`}>
                          启用数据加密
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button type="button" variant="outline" onClick={handleAddNode} className="w-full">
                添加节点
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit">创建代理链</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
