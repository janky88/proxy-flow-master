
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, AlertTriangle, Network } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PortForwardingRuleDialog } from '@/components/port-forwarding/PortForwardingRuleDialog';
import { PortForwardingRuleCard } from '@/components/port-forwarding/PortForwardingRuleCard';
import { PortForwardingRule } from '@/lib/types';

// 初始化模拟数据
const initialRule: PortForwardingRule = {
  id: '1',
  name: '香港转发',
  entryServer: {
    id: '1',
    name: '广州移动 (倍率 1.5)',
    host: '123.123.123.123',
    port: 22,
  },
  entryPort: 10000,
  entryProtocols: ['tcp'],
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
};

const PortForwardingPage = () => {
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [rules, setRules] = useState<PortForwardingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  
  // 从本地存储加载规则
  const loadRules = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      const savedRules = localStorage.getItem('portForwardingRules');
      if (savedRules) {
        const parsedRules = JSON.parse(savedRules);
        // 将字符串日期转换为Date对象
        const rulesWithDates = parsedRules.map((rule: any) => ({
          ...rule,
          createdAt: new Date(rule.createdAt),
          updatedAt: new Date(rule.updatedAt),
          // 确保状态是有效的枚举值
          status: rule.status as 'active' | 'inactive' | 'error' | 'warning'
        }));
        setRules(rulesWithDates);
      } else if (rules.length === 0) {
        // 如果本地存储中没有规则且当前规则列表为空，则初始化一个示例规则
        localStorage.setItem('portForwardingRules', JSON.stringify([initialRule]));
        setRules([initialRule]);
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
  }, [toast, rules.length]);
  
  // 初始加载
  useEffect(() => {
    loadRules();
  }, [loadRules]);
  
  // 当对话框关闭时触发刷新
  const handleDialogChange = (open: boolean) => {
    setIsAddRuleOpen(open);
    if (!open) {
      loadRules();
    }
  };

  // 处理规则状态变化
  const handleRuleStatusChange = () => {
    loadRules();
  };

  // 手动刷新页面
  const handleRefresh = () => {
    loadRules();
    toast({
      title: "刷新成功",
      description: "端口转发规则配置数据已刷新",
    });
  };

  // 测试所有规则的延迟
  const testAllLatency = () => {
    if (isTestingAll || rules.length === 0) return;
    
    setIsTestingAll(true);
    toast({
      title: "测试开始",
      description: "正在测试所有端口转发规则的连接延迟",
    });

    // 模拟测试延迟操作
    setTimeout(() => {
      try {
        // 获取当前规则
        const currentRules = [...rules];
        
        // 随机更新每个规则的延迟
        const updatedRules = currentRules.map(rule => {
          const newLatency = Math.floor(Math.random() * 500) + 50;
          // Fix type error: ensure status is one of the allowed values
          const newStatus = newLatency > 300 
            ? 'warning' as const
            : (rule.status === 'inactive' ? 'inactive' as const : 'active' as const);
          
          return {
            ...rule,
            latency: newLatency,
            status: newStatus,
            updatedAt: new Date()
          };
        });
        
        // 保存更新后的规则
        localStorage.setItem('portForwardingRules', JSON.stringify(updatedRules));
        setRules(updatedRules);
        
        toast({
          title: "测试完成",
          description: "所有端口转发规则的连接延迟测试已完成",
        });
      } catch (error) {
        console.error('测试延迟时出错', error);
        toast({
          title: "测试失败",
          description: "无法完成延迟测试",
          variant: "destructive"
        });
      } finally {
        setIsTestingAll(false);
      }
    }, 2000);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ehco转发管理</h1>
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
            disabled={isLoading || rules.length === 0 || isTestingAll}
          >
            <Network className={`mr-2 h-4 w-4 ${isTestingAll ? 'animate-pulse' : ''}`} /> 测试延迟
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
      ) : rules.length === 0 ? (
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
          {rules.map(rule => (
            <PortForwardingRuleCard 
              key={rule.id} 
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
