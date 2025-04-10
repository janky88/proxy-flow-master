
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mockProxyChains } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { ProxyChain, ProxyNode } from '@/lib/types';
import { ProxyChainForm } from './ProxyChainForm';

interface EditProxyChainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proxyChain: ProxyChain;
}

export const EditProxyChainDialog = ({ open, onOpenChange, proxyChain }: EditProxyChainDialogProps) => {
  const { toast } = useToast();
  
  // 处理表单提交
  const handleSubmit = (name: string, nodes: ProxyNode[], status: 'active' | 'inactive' | 'error') => {
    // 更新代理链数据
    const index = mockProxyChains.findIndex(chain => chain.id === proxyChain.id);
    if (index !== -1) {
      mockProxyChains[index] = {
        ...mockProxyChains[index],
        name,
        status,
        nodes,
        updatedAt: new Date()
      };
      
      toast({
        title: "代理链更新成功",
        description: `代理链 ${name} 已成功更新。`,
      });
      
      onOpenChange(false);
      return true;
    }
    return false;
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑代理链</DialogTitle>
          <DialogDescription>
            修改代理链的配置信息。
          </DialogDescription>
        </DialogHeader>
        
        <ProxyChainForm
          initialName={proxyChain.name}
          initialStatus={proxyChain.status}
          initialNodes={proxyChain.nodes}
          onSubmit={handleSubmit}
          submitButtonText="保存更改"
        />
      </DialogContent>
    </Dialog>
  );
};
