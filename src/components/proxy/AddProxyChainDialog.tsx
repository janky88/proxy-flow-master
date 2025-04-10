
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mockProxyChains } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { ProxyNode } from '@/lib/types';
import { ProxyChainForm } from './ProxyChainForm';

interface AddProxyChainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddProxyChainDialog = ({ open, onOpenChange }: AddProxyChainDialogProps) => {
  const { toast } = useToast();
  const [formKey, setFormKey] = useState(0); // Used to reset the form
  
  // 初始节点
  const initialNodes: ProxyNode[] = [
    { 
      id: '1', 
      name: '', 
      serverId: '', 
      protocol: 'tcp', 
      listenPort: 0, 
      targetHost: '', 
      targetPort: 0, 
      encrypted: false,
      methods: [],
      position: 0
    }
  ];

  // 当对话框打开状态变化时
  const handleDialogOpenChange = (open: boolean) => {
    if (open) {
      // Reset the form when dialog opens by changing the key
      setFormKey(prevKey => prevKey + 1);
    }
    onOpenChange(open);
  };
  
  // 处理表单提交
  const handleSubmit = (name: string, nodes: ProxyNode[]) => {
    // 创建新的代理链
    const newProxyChain = {
      id: Date.now().toString(),
      name,
      nodes,
      status: 'inactive' as const,
      trafficIn: 0,
      trafficOut: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockProxyChains.push(newProxyChain);
    
    toast({
      title: "代理链创建成功",
      description: "新的代理链已成功添加到系统。",
    });
    
    onOpenChange(false);
    return true;
  };
  
  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建新的代理链</DialogTitle>
          <DialogDescription>
            设置您的多级代理转发链，可以包含多个节点。基于gost代理工具。
          </DialogDescription>
        </DialogHeader>
        
        <ProxyChainForm
          key={formKey}
          initialName=""
          initialNodes={initialNodes}
          onSubmit={handleSubmit}
          submitButtonText="创建代理链"
        />
      </DialogContent>
    </Dialog>
  );
};
