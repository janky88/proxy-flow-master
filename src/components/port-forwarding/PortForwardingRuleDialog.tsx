
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PortForwardingRule } from '@/lib/types';

// 模拟服务器数据
const mockServers = [
  { id: '1', name: '广州移动 (倍率 1.5)', host: '123.123.123.123', port: 22 },
  { id: '2', name: '香港CMI (倍率 0)', host: '45.45.45.45', port: 22 },
  { id: '3', name: '东京服务器', host: '78.78.78.78', port: 22 },
  { id: '4', name: '美国服务器', host: '90.90.90.90', port: 22 },
];

// 表单验证schema
const formSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  entryServerId: z.string().min(1, "请选择入口服务器"),
  entryPort: z.coerce.number().int().min(1, "端口必须是正整数").max(65535, "端口必须小于等于65535"),
  entryProtocols: z.array(z.string()).min(1, "至少选择一种协议"),
  exitServerId: z.string().min(1, "请选择出口服务器"),
  exitEncryption: z.boolean().default(true),
  exitCompression: z.boolean().default(true),
  targetHosts: z.string().min(1, "目标地址不能为空"),
  protocols: z.array(z.string()).min(1, "至少选择一种转发协议"),
  advancedOptions: z.boolean().default(false),
  timeout: z.coerce.number().int().min(1).max(300).default(60),
  retries: z.coerce.number().int().min(0).max(10).default(3),
});

type FormValues = z.infer<typeof formSchema>;

interface PortForwardingRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRule?: PortForwardingRule;
}

export const PortForwardingRuleDialog = ({ 
  open, 
  onOpenChange,
  editRule 
}: PortForwardingRuleDialogProps) => {
  const { toast } = useToast();
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false);
  
  // 设置默认值
  const defaultValues: Partial<FormValues> = {
    name: editRule?.name || '',
    entryServerId: editRule?.entryServer.id || '',
    entryPort: editRule?.entryPort || 10000,
    entryProtocols: editRule?.entryProtocols || ['tcp'],
    exitServerId: editRule?.exitServer.id || '',
    exitEncryption: editRule?.exitEncryption || true,
    exitCompression: editRule?.exitCompression || true,
    targetHosts: editRule ? editRule.targetHosts.map(th => `${th.host}:${th.port}`).join('\n') : '',
    protocols: editRule?.protocols || ['tcp'],
    advancedOptions: false,
    timeout: 60,
    retries: 3,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // 表单提交处理
  const onSubmit = (values: FormValues) => {
    try {
      // 解析目标主机列表
      const targetHostLines = values.targetHosts.split('\n').filter(line => line.trim() !== '');
      const parsedTargetHosts = targetHostLines.map(line => {
        const [host, portStr] = line.split(':');
        const port = parseInt(portStr, 10);
        return { host, port: isNaN(port) ? 80 : port };
      });

      // 获取选中的入口和出口服务器
      const entryServer = mockServers.find(s => s.id === values.entryServerId);
      const exitServer = mockServers.find(s => s.id === values.exitServerId);

      if (!entryServer || !exitServer) {
        toast({
          title: "服务器选择错误",
          description: "无法找到所选服务器",
          variant: "destructive"
        });
        return;
      }

      // 构建新规则或更新现有规则
      const newRule: PortForwardingRule = {
        id: editRule?.id || `rule-${Date.now()}`,
        name: values.name,
        entryServer: {
          id: entryServer.id,
          name: entryServer.name,
          host: entryServer.host,
          port: entryServer.port
        },
        entryPort: values.entryPort,
        entryProtocols: values.entryProtocols as ('tcp' | 'udp')[],
        exitServer: {
          id: exitServer.id,
          name: exitServer.name,
          host: exitServer.host,
          port: exitServer.port
        },
        exitEncryption: values.exitEncryption,
        exitCompression: values.exitCompression,
        targetHosts: parsedTargetHosts,
        protocols: values.protocols as ('tcp' | 'udp')[],
        status: editRule?.status || 'inactive',
        latency: editRule?.latency || 0,
        trafficIn: editRule?.trafficIn || 0,
        trafficOut: editRule?.trafficOut || 0,
        createdAt: editRule?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      // 获取现有规则
      const existingRulesJson = localStorage.getItem('portForwardingRules');
      let existingRules = existingRulesJson ? JSON.parse(existingRulesJson) : [];

      if (editRule) {
        // 更新现有规则
        existingRules = existingRules.map((rule: PortForwardingRule) => 
          rule.id === editRule.id ? newRule : rule
        );
      } else {
        // 添加新规则
        existingRules.push(newRule);
      }

      // 保存到localStorage
      localStorage.setItem('portForwardingRules', JSON.stringify(existingRules));

      toast({
        title: editRule ? "规则已更新" : "规则已创建",
        description: `端口转发规则 "${values.name}" ${editRule ? '已更新' : '已创建'}`,
      });

      // 关闭对话框
      onOpenChange(false);
    } catch (error) {
      console.error('保存规则失败', error);
      toast({
        title: "保存失败",
        description: "保存端口转发规则时出错",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editRule ? '编辑规则' : '添加规则'}</DialogTitle>
          <DialogDescription>
            配置端口转发规则，支持TCP和UDP协议
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 规则名称 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>名称</FormLabel>
                  <FormControl>
                    <Input placeholder="输入规则名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 入口配置 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">入口</h3>
              
              {/* 入口服务器 */}
              <FormField
                control={form.control}
                name="entryServerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>入口服务器</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择入口服务器" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockServers.map(server => (
                          <SelectItem key={server.id} value={server.id}>
                            {server.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 入口协议 - 简化为仅TCP和UDP */}
              <FormField
                control={form.control}
                name="entryProtocols"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>入口协议</FormLabel>
                    <FormControl>
                      <ToggleGroup 
                        type="multiple" 
                        className="justify-start flex-wrap"
                        value={field.value}
                        onValueChange={(value) => {
                          if (value.length > 0) {
                            field.onChange(value);
                          }
                        }}
                      >
                        <ToggleGroupItem value="tcp">TCP</ToggleGroupItem>
                        <ToggleGroupItem value="udp">UDP</ToggleGroupItem>
                      </ToggleGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 监听端口 */}
              <FormField
                control={form.control}
                name="entryPort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>监听端口</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="可用端口: 10000-60000" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 出口配置 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">出口</h3>
              
              {/* 出口服务器 */}
              <FormField
                control={form.control}
                name="exitServerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>出口服务器</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择出口服务器" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockServers.map(server => (
                          <SelectItem key={server.id} value={server.id}>
                            {server.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 连接信息 */}
              <div className="space-y-2">
                <FormLabel>连接信息</FormLabel>
                <div className="flex flex-col space-y-2 border rounded-md p-3">
                  {/* 加密 */}
                  <FormField
                    control={form.control}
                    name="exitEncryption"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>WS 隧道</FormLabel>
                        </div>
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {/* 压缩 */}
                  <FormField
                    control={form.control}
                    name="exitCompression"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>延迟优化</FormLabel>
                        </div>
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* 目标地址 */}
              <FormField
                control={form.control}
                name="targetHosts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>目标地址</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="一行一个，全行会被逐路由，格式如下:
1.2.3.4:5678
[2001::db8]:80
example.com:443" 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 转发协议 */}
              <FormField
                control={form.control}
                name="protocols"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>转发协议</FormLabel>
                    <FormControl>
                      <ToggleGroup 
                        type="multiple" 
                        className="justify-start"
                        value={field.value}
                        onValueChange={(value) => {
                          if (value.length > 0) {
                            field.onChange(value);
                          }
                        }}
                      >
                        <ToggleGroupItem value="tcp">TCP</ToggleGroupItem>
                        <ToggleGroupItem value="udp">UDP</ToggleGroupItem>
                      </ToggleGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 高级选项 */}
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen} className="border rounded-md p-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <span className="font-medium">高级选项</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? "transform rotate-180" : ""}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4">
                {/* 超时时间 */}
                <FormField
                  control={form.control}
                  name="timeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>连接超时 (秒)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="默认: 60" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 重试次数 */}
                <FormField
                  control={form.control}
                  name="retries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>重试次数</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="默认: 3" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button type="submit">
                确定
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
