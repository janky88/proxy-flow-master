
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AddServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddServerDialog = ({ open, onOpenChange }: AddServerDialogProps) => {
  const { toast } = useToast();
  
  const handleAddServer = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would send data to an API
    // For the prototype, we'll just show a success message
    toast({
      title: "服务器添加成功",
      description: "新的服务器已成功添加到系统。",
    });
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加新服务器</DialogTitle>
          <DialogDescription>
            添加一个新的代理服务器到系统。请填写服务器详细信息。
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleAddServer}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                名称
              </Label>
              <Input
                id="name"
                placeholder="香港服务器"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="host" className="text-right">
                主机
              </Label>
              <Input
                id="host"
                placeholder="192.168.1.1 或 hostname"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="port" className="text-right">
                端口
              </Label>
              <Input
                id="port"
                placeholder="8080"
                type="number"
                min="1"
                max="65535"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                用户名
              </Label>
              <Input
                id="username"
                placeholder="可选"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                密码
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="可选"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">添加服务器</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
