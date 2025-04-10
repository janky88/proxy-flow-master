
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">系统设置</h1>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">基本设置</TabsTrigger>
          <TabsTrigger value="security">安全设置</TabsTrigger>
          <TabsTrigger value="logs">日志设置</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>基本设置</CardTitle>
              <CardDescription>配置系统的基本参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gost-path">Gost可执行文件路径</Label>
                <Input id="gost-path" defaultValue="/usr/local/bin/gost" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-port">管理端口</Label>
                <Input type="number" id="admin-port" defaultValue="8080" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lang">界面语言</Label>
                <Select defaultValue="zh-CN">
                  <SelectTrigger>
                    <SelectValue placeholder="选择语言" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-CN">中文 (简体)</SelectItem>
                    <SelectItem value="en-US">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch id="auto-start" defaultChecked />
                <Label htmlFor="auto-start">系统启动时自动启动</Label>
              </div>
              
              <Button>保存设置</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>安全设置</CardTitle>
              <CardDescription>配置系统的安全参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">管理员用户名</Label>
                <Input id="username" defaultValue="admin" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">管理员密码</Label>
                <Input type="password" id="password" defaultValue="********" />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch id="enable-tls" defaultChecked />
                <Label htmlFor="enable-tls">启用HTTPS访问</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="ip-restrict" />
                <Label htmlFor="ip-restrict">启用IP访问限制</Label>
              </div>
              
              <Button>保存安全设置</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>日志设置</CardTitle>
              <CardDescription>配置系统的日志参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="log-level">日志级别</Label>
                <Select defaultValue="info">
                  <SelectTrigger>
                    <SelectValue placeholder="选择日志级别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="log-path">日志文件路径</Label>
                <Input id="log-path" defaultValue="/var/log/gost/" />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch id="log-rotation" defaultChecked />
                <Label htmlFor="log-rotation">启用日志轮换</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="log-retention">日志保留天数</Label>
                <Input type="number" id="log-retention" defaultValue="30" />
              </div>
              
              <Button>保存日志设置</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
