
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, AlertTriangle, Network } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PortForwardingRuleDialog } from '@/components/port-forwarding/PortForwardingRuleDialog';
import { PortForwardingRuleCard } from '@/components/port-forwarding/PortForwardingRuleCard';
import { PortForwardingRule } from '@/lib/types';

// 模拟数据
let mockPortForwardingRules: PortForwardingRule[] = [
  {
    id: '1',
    name: '香港转发',
    entryServer: {
      id: '1',
      name: '广州移动 (倍率 1.5)',
      host: '123.123.123.123',
      port: 22,
    },
    entryPort: 10000,
    entryProtocols: ['tcp', 'socks'],
    exitServer: {
      id: '2',
      name: '香港CMI (倍率 0)',
      host: '45.45.45.45',
      port: 22,
    },
    exitEncryption: true,
    exitCompression: true,
    targetHosts: [
      { host: '1.2.3.4', port: 5678 },
      { host: '2001::db8', port: 80 },
      { host: 'example.com', port: 443 }
    ],
    protocols: ['tcp', 'udp'],
    status: 'active',
    latency: 120,
    trafficIn: 1024000,
    trafficOut: 2048000,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const PortForwardingPage = () => {
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  
  // 从本地存储加载规则
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      const savedRules = localStorage.getItem('portForwardingRules');
      if (savedRules) {
        const parsedRules = JSON.parse(savedRules);
        // 转换日期字符串为Date对象
        const rulesWithDates = parsedRules.map((rule: any) => ({
          ...rule,
          createdAt: new Date(rule.createdAt),
          updatedAt: new Date(rule.updatedAt),
        }));
        // 更新mockPortForwardingRules，但保持引用不变
        mockPortForwardingRules.length = 0;
        mockPortForwardingRules.push(...rulesWithDates);
      }
    } catch (error) {
      console.error('加载端口转发规则数据失败', error);
      setHasError(true);
      toast({
        title: "加载数据失败",
        description: "无法加载端口转发规则配置数据，请刷新页面重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [refresh, toast]);
  
  // 当对话框关闭时触发刷新
  const handleDialogChange = (open: boolean) => {
    setIsAddRuleOpen(open);
    if (!open) {
      // 对话框关闭时刷新页面
      setRefresh(prev => prev + 1);
    }
  };

  // 处理规则状态变化
  const handleRuleStatusChange = () => {
    // 更新本地存储
    try {
      localStorage.setItem('portForwardingRules', JSON.stringify(mockPortForwardingRules));
    } catch (error) {
      console.error('保存到本地存储失败', error);
      toast({
        title: "保存失败",
        description: "无法保存端口转发规则配置更改",
        variant: "destructive"
      });
    }
    setRefresh(prev => prev + 1);
  };

  // 手动刷新页面
  const handleRefresh = () => {
    setRefresh(prev => prev + 1);
    toast({
      title: "刷新成功",
      description: "端口转发规则配置数据已刷新",
    });
  };

  // 测试所有规则的延迟
  const testAllLatency = () => {
    toast({
      title: "测试开始",
      description: "正在测试所有端口转发规则的连接延迟",
    });

    // 模拟测试延迟操作
    setTimeout(() => {
      // 随机更新每个规则的延迟
      mockPortForwardingRules.forEach(rule => {
        rule.latency = Math.floor(Math.random() * 500) + 50;
        rule.status = rule.latency > 300 ? 'warning' : 'active';
      });
      
      localStorage.setItem('portForwardingRules', JSON.stringify(mockPortForwardingRules));
      setRefresh(prev => prev + 1);
      
      toast({
        title: "测试完成",
        description: "所有端口转发规则的连接延迟测试已完成",
      });
    }, 2000);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">端口转发管理</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="outline"
            onClick={testAllLatency}
            disabled={isLoading || mockPortForwardingRules.length === 0}
          >
            <Network className="mr-2 h-4 w-4" /> 测试延迟
          </Button>
          <Button onClick={() => setIsAddRuleOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> 添加转发规则
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-32 border rounded-lg bg-muted/10">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">加载端口转发规则配置...</p>
          </div>
        </div>
      ) : hasError ? (
        <div className="flex items-center justify-center h-32 border rounded-lg bg-destructive/10">
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <p className="text-sm text-destructive">加载数据失败，请刷新页面重试</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> 重试
            </Button>
          </div>
        </div>
      ) : mockPortForwardingRules.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
          <h3 className="text-lg font-medium mb-2">尚未创建转发规则</h3>
          <p className="text-muted-foreground mb-4">创建您的第一个端口转发规则</p>
          <Button onClick={() => setIsAddRuleOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> 添加转发规则
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {mockPortForwardingRules.map(rule => (
            <PortForwardingRuleCard 
              key={`${rule.id}-${refresh}`} 
              rule={rule} 
              onStatusChange={handleRuleStatusChange}
            />
          ))}
        </div>
      )}
      
      <PortForwardingRuleDialog open={isAddRuleOpen} onOpenChange={handleDialogChange} />
    </div>
  );
};

export default PortForwardingPage;
