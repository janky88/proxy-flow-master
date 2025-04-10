
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { mockServers } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { ProxyChain, ProxyNode } from '@/lib/types';

interface ProxyChainFormProps {
  initialName: string;
  initialStatus?: 'active' | 'inactive' | 'error';
  initialNodes: ProxyNode[];
  onSubmit: (name: string, nodes: ProxyNode[], status?: 'active' | 'inactive' | 'error') => void;
  submitButtonText: string;
}

export const ProxyChainForm = ({ 
  initialName, 
  initialStatus, 
  initialNodes, 
  onSubmit,
  submitButtonText 
}: ProxyChainFormProps) => {
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState(initialStatus || 'inactive');
  const [nodes, setNodes] = useState<ProxyNode[]>(initialNodes);

  // Reset form when initialNodes change
  useEffect(() => {
    setName(initialName);
    setStatus(initialStatus || 'inactive');
    setNodes(JSON.parse(JSON.stringify(initialNodes))); // Deep copy to avoid modifying original
  }, [initialName, initialStatus, initialNodes]);
  
  const handleAddNode = () => {
    const newPosition = nodes.length;
    setNodes([
      ...nodes,
      { 
        id: Math.random().toString(), 
        name: '', 
        serverId: '', 
        protocol: 'tcp', 
        listenPort: 0, 
        targetHost: nodes.length > 0 ? 'localhost' : '', 
        targetPort: nodes.length > 0 ? nodes[nodes.length-1].listenPort : 0, 
        encrypted: false,
        methods: [],
        position: newPosition
      }
    ]);
  };
  
  const handleRemoveNode = (index: number) => {
    if (nodes.length > 1) {
      const newNodes = [...nodes];
      newNodes.splice(index, 1);
      
      // 重新计算位置
      newNodes.forEach((node, idx) => {
        node.position = idx;
      });
      
      // 更新目标主机和端口
      for (let i = 1; i < newNodes.length; i++) {
        const prevNode = newNodes[i - 1];
        newNodes[i].targetHost = 'localhost';
        newNodes[i].targetPort = prevNode.listenPort;
      }
      
      setNodes(newNodes);
    }
  };
  
  const handleNodeChange = (index: number, field: string, value: any) => {
    const newNodes = [...nodes];
    newNodes[index] = { ...newNodes[index], [field]: value };
    
    // 如果修改的是监听端口，则更新下一个节点的目标端口
    if (field === 'listenPort' && index < newNodes.length - 1) {
      newNodes[index + 1].targetPort = value;
    }
    
    setNodes(newNodes);
  };
  
  const validateNodes = () => {
    // 检查每个节点是否都填写了必要的信息
    for (const node of nodes) {
      if (!node.name || !node.serverId || !node.listenPort) {
        return false;
      }
      
      // 对于非第一个节点，检查目标主机和端口
      if (node.position > 0 && (!node.targetHost || !node.targetPort)) {
        return false;
      }
    }
    return true;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !validateNodes()) {
      return false;
    }
    
    onSubmit(name, nodes, status);
    return true;
  };
  
  return (
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        {initialStatus !== undefined && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              状态
            </Label>
            <Select value={status} onValueChange={(value: 'active' | 'inactive' | 'error') => setStatus(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">活跃</SelectItem>
                <SelectItem value="inactive">未启用</SelectItem>
                <SelectItem value="error">错误</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
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
                    onValueChange={(value: 'tcp' | 'udp' | 'ws' | 'wss' | 'tls') => handleNodeChange(index, 'protocol', value)}
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
                    value={node.listenPort ? node.listenPort.toString() : ''}
                    onChange={(e) => handleNodeChange(index, 'listenPort', parseInt(e.target.value, 10) || 0)}
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
                        value={node.targetPort ? node.targetPort.toString() : ''}
                        onChange={(e) => handleNodeChange(index, 'targetPort', parseInt(e.target.value, 10) || 0)}
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
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`node-${index}-methods`} className="text-right">
                    加密方法
                  </Label>
                  <Select
                    value={node.methods?.[0] || ''}
                    onValueChange={(value) => handleNodeChange(index, 'methods', [value])}
                    disabled={!node.encrypted}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="选择加密方法" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aes-128-cfb">AES-128-CFB</SelectItem>
                      <SelectItem value="aes-256-cfb">AES-256-CFB</SelectItem>
                      <SelectItem value="chacha20">ChaCha20</SelectItem>
                      <SelectItem value="chacha20-ietf">ChaCha20-IETF</SelectItem>
                      <SelectItem value="chacha20-ietf-poly1305">ChaCha20-IETF-Poly1305</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Button type="button" variant="outline" onClick={handleAddNode} className="w-full">
            添加节点
          </Button>
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button type="submit">{submitButtonText}</Button>
      </div>
    </form>
  );
};
