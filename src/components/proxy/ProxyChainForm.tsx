
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { ProxyNode } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { ProxyNodeCard } from './ProxyNodeCard';
import { Plus, Save, Trash, TestTube2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockServers } from '@/lib/mockData';
import { Loader2 } from 'lucide-react';

interface ProxyChainFormProps {
  initialName: string;
  initialNodes: ProxyNode[];
  initialStatus?: 'active' | 'inactive' | 'error';
  onSubmit: (name: string, nodes: ProxyNode[], status: 'active' | 'inactive' | 'error') => boolean;
  submitButtonText: string;
}

export const ProxyChainForm = ({ 
  initialName, 
  initialNodes, 
  initialStatus = 'inactive',
  onSubmit, 
  submitButtonText 
}: ProxyChainFormProps) => {
  const [name, setName] = useState(initialName);
  const [nodes, setNodes] = useState<ProxyNode[]>(initialNodes);
  const [status, setStatus] = useState<'active' | 'inactive' | 'error'>(initialStatus);
  const [isTesting, setIsTesting] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const { toast } = useToast();
  
  // 添加新节点
  const handleAddNode = () => {
    const lastNode = nodes[nodes.length - 1];
    const newPosition = lastNode ? lastNode.position + 1 : 0;
    
    const newNode: ProxyNode = {
      id: Date.now().toString(),
      name: `节点 ${newPosition + 1}`,
      serverId: '',
      protocol: 'tcp',
      listenPort: 0,
      targetHost: '',
      targetPort: 0,
      encrypted: false,
      methods: [],
      position: newPosition
    };
    
    setNodes([...nodes, newNode]);
    // Reset test status when nodes change
    setTestPassed(false);
  };
  
  // 更新节点
  const handleUpdateNode = (updatedNode: ProxyNode) => {
    setNodes(nodes.map(node => node.id === updatedNode.id ? updatedNode : node));
    // Reset test status when nodes change
    setTestPassed(false);
  };
  
  // 删除节点
  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    // Reset test status when nodes change
    setTestPassed(false);
  };
  
  // 处理表单提交
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "名称不能为空",
        description: "请为代理链提供一个名称",
        variant: "destructive"
      });
      return;
    }
    
    if (nodes.length === 0) {
      toast({
        title: "代理节点为空",
        description: "请至少添加一个代理节点",
        variant: "destructive"
      });
      return;
    }

    if (!testPassed) {
      toast({
        title: "连接测试未通过",
        description: "请先测试代理链连通性",
        variant: "destructive"
      });
      return;
    }
    
    // 检查节点配置
    for (const node of nodes) {
      if (!node.serverId) {
        toast({
          title: "服务器未选择",
          description: `节点 ${node.name} 未选择服务器`,
          variant: "destructive"
        });
        return;
      }
      
      if (!node.listenPort) {
        toast({
          title: "监听端口未设置",
          description: `节点 ${node.name} 未设置监听端口`,
          variant: "destructive"
        });
        return;
      }
      
      // 如果不是最后一个节点，需要有目标地址和端口
      if (node.position < nodes.length - 1 && (!node.targetHost || !node.targetPort)) {
        toast({
          title: "目标未设置",
          description: `节点 ${node.name} 未设置目标地址和端口`,
          variant: "destructive"
        });
        return;
      }
    }
    
    // 保存数据
    const result = onSubmit(name, nodes, status);
    
    // 将配置保存到本地存储
    if (result) {
      try {
        const proxyChains = JSON.parse(localStorage.getItem('proxyChains') || '[]');
        const existingChainIndex = proxyChains.findIndex((chain: any) => chain.name === name);
        
        if (existingChainIndex !== -1) {
          proxyChains[existingChainIndex] = { name, nodes, status, updatedAt: new Date() };
        } else {
          proxyChains.push({ name, nodes, status, createdAt: new Date(), updatedAt: new Date() });
        }
        
        localStorage.setItem('proxyChains', JSON.stringify(proxyChains));
      } catch (error) {
        console.error('保存到本地存储失败', error);
      }
    }
  };

  const handleTestConnection = async () => {
    if (nodes.length === 0) {
      toast({
        title: "代理节点为空",
        description: "请至少添加一个代理节点",
        variant: "destructive"
      });
      return;
    }

    // 检查节点配置
    for (const node of nodes) {
      if (!node.serverId) {
        toast({
          title: "服务器未选择",
          description: `节点 ${node.name} 未选择服务器`,
          variant: "destructive"
        });
        return;
      }
      
      if (!node.listenPort) {
        toast({
          title: "监听端口未设置",
          description: `节点 ${node.name} 未设置监听端口`,
          variant: "destructive"
        });
        return;
      }
      
      // 如果不是最后一个节点，需要有目标地址和端口
      if (node.position < nodes.length - 1 && (!node.targetHost || !node.targetPort)) {
        toast({
          title: "目标未设置",
          description: `节点 ${node.name} 未设置目标地址和端口`,
          variant: "destructive"
        });
        return;
      }
    }

    setIsTesting(true);
    
    try {
      // 模拟连接测试过程，在真实应用中，这应该是一个API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟70%的成功率
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        setTestPassed(true);
        toast({
          title: "代理链测试成功",
          description: `代理链 ${name || '未命名'} 连接测试通过`,
        });
      } else {
        setTestPassed(false);
        toast({
          title: "代理链测试失败",
          description: "代理链连接失败，请检查配置",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "测试过程中发生错误",
        description: "请检查网络连接和服务器状态",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  // 获取服务器选项
  const serverOptions = mockServers.map(server => ({
    value: server.id,
    label: `${server.name} (${server.host}:${server.port})`
  }));
  
  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            代理链名称
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="我的代理链"
            className="col-span-3"
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="status" className="text-right">
            状态
          </Label>
          <Select
            value={status}
            onValueChange={(value: 'active' | 'inactive' | 'error') => setStatus(value)}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">活跃</SelectItem>
              <SelectItem value="inactive">不活跃</SelectItem>
              <SelectItem value="error">错误</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">代理节点</h3>
            <Button type="button" variant="outline" size="sm" onClick={handleAddNode}>
              <Plus className="h-4 w-4 mr-1" /> 添加节点
            </Button>
          </div>
          
          {nodes.map((node, index) => (
            <ProxyNodeCard
              key={node.id}
              node={node}
              isLastNode={index === nodes.length - 1}
              servers={serverOptions}
              onUpdate={handleUpdateNode}
              onDelete={() => handleDeleteNode(node.id)}
            />
          ))}
          
          {nodes.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              尚未添加代理节点。点击"添加节点"按钮来创建。
            </p>
          )}
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center space-x-2">
            {testPassed && (
              <span className="text-sm text-green-500">连接测试成功</span>
            )}
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={isTesting || nodes.length === 0}
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  测试中
                </>
              ) : (
                <>
                  <TestTube2 className="mr-2 h-4 w-4" />
                  测试连接
                </>
              )}
            </Button>
          </div>
          <Button type="submit" disabled={!testPassed}>
            <Save className="mr-2 h-4 w-4" /> {submitButtonText}
          </Button>
        </div>
      </div>
    </form>
  );
};
