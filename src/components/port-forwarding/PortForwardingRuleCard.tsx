
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Play, 
  Pause, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  BarChart3, 
  Network, 
  ChevronDown, 
  Link, 
  Clock, 
  Layers, 
  DownloadCloud, 
  UploadCloud 
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { PortForwardingRuleDialog } from './PortForwardingRuleDialog';
import { PortForwardingRule } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface PortForwardingRuleCardProps {
  rule: PortForwardingRule;
  onStatusChange: () => void;
}

export const PortForwardingRuleCard = ({ rule, onStatusChange }: PortForwardingRuleCardProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isTestingLatency, setIsTestingLatency] = useState(false);
  
  // 格式化流量数据
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // 获取状态标签颜色
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">活跃</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">停用</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">错误</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">警告</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };
  
  // 获取延迟标签颜色
  const getLatencyBadge = (latency?: number) => {
    if (!latency) return <Badge variant="outline">未测试</Badge>;
    
    if (latency < 100) {
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">{latency}ms</Badge>;
    } else if (latency < 300) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">{latency}ms</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">{latency}ms</Badge>;
    }
  };
  
  // 测试延迟
  const testLatency = () => {
    setIsTestingLatency(true);
    toast({
      title: "测试开始",
      description: `正在测试 "${rule.name}" 的连接延迟`,
    });
    
    // 模拟测试延迟
    setTimeout(() => {
      // 获取所有规则
      try {
        const rulesJson = localStorage.getItem('portForwardingRules');
        if (rulesJson) {
          let rules = JSON.parse(rulesJson);
          
          // 更新当前规则的延迟
          rules = rules.map((r: PortForwardingRule) => {
            if (r.id === rule.id) {
              const newLatency = Math.floor(Math.random() * 500) + 50;
              const newStatus = newLatency > 300 ? 'warning' : r.status;
              return { ...r, latency: newLatency, status: newStatus };
            }
            return r;
          });
          
          // 保存更新后的规则
          localStorage.setItem('portForwardingRules', JSON.stringify(rules));
          
          // 通知父组件状态已更改
          onStatusChange();
          
          toast({
            title: "测试完成",
            description: `"${rule.name}" 的连接延迟测试已完成`,
          });
        }
      } catch (error) {
        console.error('测试延迟时出错', error);
        toast({
          title: "测试失败",
          description: "无法完成延迟测试",
          variant: "destructive"
        });
      }
      
      setIsTestingLatency(false);
    }, 2000);
  };
  
  // 切换规则状态
  const toggleStatus = () => {
    try {
      const rulesJson = localStorage.getItem('portForwardingRules');
      if (rulesJson) {
        let rules = JSON.parse(rulesJson);
        
        // 更新规则状态
        rules = rules.map((r: PortForwardingRule) => {
          if (r.id === rule.id) {
            const newStatus = r.status === 'active' ? 'inactive' : 'active';
            return { ...r, status: newStatus };
          }
          return r;
        });
        
        // 保存更新后的规则
        localStorage.setItem('portForwardingRules', JSON.stringify(rules));
        
        // 通知父组件状态已更改
        onStatusChange();
        
        toast({
          title: rule.status === 'active' ? "规则已停用" : "规则已启用",
          description: `端口转发规则 "${rule.name}" ${rule.status === 'active' ? '已停用' : '已启用'}`,
        });
      }
    } catch (error) {
      console.error('切换规则状态时出错', error);
      toast({
        title: "操作失败",
        description: "无法更改规则状态",
        variant: "destructive"
      });
    }
  };
  
  // 删除规则
  const deleteRule = () => {
    try {
      const rulesJson = localStorage.getItem('portForwardingRules');
      if (rulesJson) {
        let rules = JSON.parse(rulesJson);
        
        // 过滤掉当前规则
        rules = rules.filter((r: PortForwardingRule) => r.id !== rule.id);
        
        // 保存更新后的规则
        localStorage.setItem('portForwardingRules', JSON.stringify(rules));
        
        // 通知父组件状态已更改
        onStatusChange();
        
        toast({
          title: "规则已删除",
          description: `端口转发规则 "${rule.name}" 已被删除`,
        });
      }
    } catch (error) {
      console.error('删除规则时出错', error);
      toast({
        title: "删除失败",
        description: "无法删除规则",
        variant: "destructive"
      });
    }
  };
  
  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                {rule.name}
                {getStatusBadge(rule.status)}
              </CardTitle>
              <CardDescription className="mt-1">
                从 {rule.entryServer.name} 转发到 {rule.exitServer.name}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className={isTestingLatency ? "pointer-events-none" : ""}
                onClick={testLatency}
              >
                <Network className={`h-4 w-4 ${isTestingLatency ? 'animate-pulse' : ''}`} />
              </Button>
              <Button 
                variant={rule.status === 'active' ? "destructive" : "default"}
                size="icon"
                onClick={toggleStatus}
              >
                {rule.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" /> 编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsDeleteOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" /> 删除
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={testLatency} disabled={isTestingLatency}>
                    <Network className="mr-2 h-4 w-4" /> 测试延迟
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" /> 延迟
              </span>
              <span className="font-medium">{getLatencyBadge(rule.latency)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Layers className="h-4 w-4" /> 协议
              </span>
              <span className="font-medium">
                {rule.protocols.map((p) => p.toUpperCase()).join('/')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <DownloadCloud className="h-4 w-4" /> 下载
              </span>
              <span className="font-medium">{formatBytes(rule.trafficIn)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <UploadCloud className="h-4 w-4" /> 上传
              </span>
              <span className="font-medium">{formatBytes(rule.trafficOut)}</span>
            </div>
          </div>
          
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex items-center justify-center w-full p-2 text-sm text-muted-foreground hover:bg-accent rounded-md">
              详细信息
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isOpen ? "transform rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 入口信息 */}
                  <div className="space-y-2">
                    <h4 className="font-medium">入口配置</h4>
                    <div className="bg-muted/30 p-3 rounded-md space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">服务器:</span>
                        <span className="text-sm font-medium">{rule.entryServer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">监听端口:</span>
                        <span className="text-sm font-medium">{rule.entryPort}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">入口协议:</span>
                        <span className="text-sm font-medium">
                          {rule.entryProtocols.map(p => p.toUpperCase()).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 出口信息 */}
                  <div className="space-y-2">
                    <h4 className="font-medium">出口配置</h4>
                    <div className="bg-muted/30 p-3 rounded-md space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">服务器:</span>
                        <span className="text-sm font-medium">{rule.exitServer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">WS隧道:</span>
                        <span className="text-sm font-medium">{rule.exitEncryption ? '开启' : '关闭'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">延迟优化:</span>
                        <span className="text-sm font-medium">{rule.exitCompression ? '开启' : '关闭'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 目标主机 */}
                <div className="space-y-2">
                  <h4 className="font-medium">目标地址</h4>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="space-y-1">
                      {rule.targetHosts.map((target, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <Link className="h-4 w-4 mr-2 text-muted-foreground" />
                          {target.host}:{target.port}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
          创建于 {rule.createdAt.toLocaleDateString()} · 最后更新 {rule.updatedAt.toLocaleDateString()}
        </CardFooter>
      </Card>
      
      {/* 编辑对话框 */}
      <PortForwardingRuleDialog 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        editRule={rule} 
      />
      
      {/* 删除确认对话框 */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除端口转发规则 "{rule.name}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={deleteRule} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
