
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { ProxyNode } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { ProxyNodeCard } from './ProxyNodeCard';
import { Plus, Save, Trash, TestTube2, Check, AlertCircle, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockServers } from '@/lib/mockData';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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
  const [testProgress, setTestProgress] = useState(0);
  const [testingNode, setTestingNode] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<{[key: string]: 'success' | 'error' | 'pending' | 'untested'}>({});
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
    // Initialize test result for the new node
    setTestResults(prev => ({
      ...prev,
      [newNode.id]: 'untested'
    }));
  };
  
  // 更新节点
  const handleUpdateNode = (updatedNode: ProxyNode) => {
    setNodes(nodes.map(node => node.id === updatedNode.id ? updatedNode : node));
    // Reset test status when nodes change
    setTestPassed(false);
    // Reset test result for the updated node
    setTestResults(prev => ({
      ...prev,
      [updatedNode.id]: 'untested'
    }));
  };
  
  // 删除节点
  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    // Reset test status when nodes change
    setTestPassed(false);
    // Remove test result for the deleted node
    setTestResults(prev => {
      const newResults = {...prev};
      delete newResults[nodeId];
      return newResults;
    });
  };
  
  // 初始化测试结果
  const initializeTestResults = () => {
    const results: {[key: string]: 'success' | 'error' | 'pending' | 'untested'} = {};
    nodes.forEach(node => {
      results[node.id] = 'pending';
    });
    return results;
  };

  // 验证节点配置
  const validateNodeConfig = (node: ProxyNode, isLastNode: boolean): string | null => {
    if (!node.serverId) {
      return `节点 ${node.name} 未选择服务器`;
    }
    
    if (!node.listenPort) {
      return `节点 ${node.name} 未设置监听端口`;
    }
    
    // 如果不是最后一个节点，需要有目标地址和端口
    if (!isLastNode && (!node.targetHost || !node.targetPort)) {
      return `节点 ${node.name} 未设置目标地址和端口`;
    }
    
    return null;
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
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const isLastNode = i === nodes.length - 1;
      const error = validateNodeConfig(node, isLastNode);
      
      if (error) {
        toast({
          title: "节点配置错误",
          description: error,
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
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const isLastNode = i === nodes.length - 1;
      const error = validateNodeConfig(node, isLastNode);
      
      if (error) {
        toast({
          title: "节点配置错误",
          description: error,
          variant: "destructive"
        });
        return;
      }
    }

    setIsTesting(true);
    setTestProgress(0);
    setTestingNode(0);
    setTestResults(initializeTestResults());
    
    try {
      let allPassed = true;
      const progressStep = 100 / nodes.length;
      
      // 依次测试每个节点
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        setTestingNode(i);
        
        // 更新当前节点状态为测试中
        setTestResults(prev => ({
          ...prev,
          [node.id]: 'pending'
        }));
        
        // 模拟节点测试
        await new Promise<void>((resolve, reject) => {
          setTimeout(() => {
            // 模拟70%的成功率
            const isSuccess = Math.random() > 0.3;
            
            if (isSuccess) {
              setTestResults(prev => ({
                ...prev,
                [node.id]: 'success'
              }));
              setTestProgress((i + 1) * progressStep);
              resolve();
            } else {
              setTestResults(prev => ({
                ...prev,
                [node.id]: 'error'
              }));
              allPassed = false;
              reject(new Error(`节点 ${node.name} 连接失败`));
            }
          }, 1000);
        });
      }
      
      // 全部节点测试成功
      setTestPassed(allPassed);
      setTestProgress(100);
      
      if (allPassed) {
        toast({
          title: "代理链测试成功",
          description: `代理链 ${name || '未命名'} 连接测试通过`,
        });
      }
    } catch (error: any) {
      setTestPassed(false);
      toast({
        title: "代理链测试失败",
        description: error.message || "连接测试失败，请检查配置",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
      setTestingNode(null);
    }
  };
  
  // 获取服务器选项
  const serverOptions = mockServers.map(server => ({
    value: server.id,
    label: `${server.name} (${server.host}:${server.port})`
  }));

  // 获取节点测试状态图标
  const getTestStatusIcon = (nodeId: string) => {
    const status = testResults[nodeId];
    
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return null;
    }
  };
  
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
          
          {isTesting && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">测试进度</span>
                <span className="text-sm">{Math.round(testProgress)}%</span>
              </div>
              <Progress value={testProgress} className="h-2" />
            </div>
          )}
          
          {nodes.map((node, index) => (
            <div key={node.id} className="relative">
              {getTestStatusIcon(node.id) && (
                <div className="absolute -right-2 -top-2 z-10 bg-background rounded-full w-6 h-6 flex items-center justify-center border">
                  {getTestStatusIcon(node.id)}
                </div>
              )}
              <ProxyNodeCard
                node={node}
                isLastNode={index === nodes.length - 1}
                servers={serverOptions}
                onUpdate={handleUpdateNode}
                onDelete={() => handleDeleteNode(node.id)}
              />
              {testingNode === index && isTesting && (
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center rounded-lg">
                  <div className="bg-white/90 px-4 py-2 rounded-md flex items-center gap-2 shadow-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">测试连接中...</span>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {nodes.length === 0 && (
            <div className="text-center text-muted-foreground py-8 border rounded-lg bg-muted/10">
              <Server className="h-10 w-10 mx-auto mb-2 text-muted-foreground/60" />
              <p className="text-center text-muted-foreground pb-2">
                尚未添加代理节点。点击"添加节点"按钮来创建。
              </p>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleAddNode}
              >
                <Plus className="h-4 w-4 mr-1" /> 添加节点
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center space-x-2">
            {testPassed && (
              <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-md text-sm">
                <Check className="h-4 w-4" />
                <span>连接测试成功</span>
              </div>
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
