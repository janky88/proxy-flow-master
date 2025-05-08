
import { Bell, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface HeaderProps {
  toggleSidebar: () => void;
}

// Define form schema for account settings
const accountFormSchema = z.object({
  name: z.string().min(2, { message: "用户名至少需要2个字符" }),
  email: z.string().email({ message: "请输入有效的邮箱地址" }),
  password: z.string().min(8, { message: "密码至少需要8个字符" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "两次输入的密码不匹配",
  path: ["confirmPassword"]
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

// 默认表单值
const defaultAccountValues = {
  name: "管理员",
  email: "admin@example.com",
  password: "password123",
  confirmPassword: "password123"
};

export const Header = ({ toggleSidebar }: HeaderProps) => {
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: defaultAccountValues
  });

  // 修复：当侧边栏打开时重置表单状态
  useEffect(() => {
    if (isAccountSettingsOpen) {
      // 异步重置表单，避免状态更新冲突
      setTimeout(() => {
        form.reset(defaultAccountValues);
      }, 0);
    }
  }, [isAccountSettingsOpen, form]);

  const handleLogout = () => {
    toast({
      title: "已退出登录",
      description: "您已成功退出系统",
    });
  };

  const onSubmit = (data: AccountFormValues) => {
    // Process form data (in a real app, this would update the user profile)
    console.log("Account form submitted:", data);
    
    // Close the sheet and show success toast
    setIsAccountSettingsOpen(false);
    toast({
      title: "设置已保存",
      description: "您的账户设置已成功更新",
    });
  };

  return (
    <header className="h-16 px-6 border-b border-border flex items-center justify-between bg-background z-20">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="md:hidden" onClick={toggleSidebar}>
          <span className="sr-only">打开菜单</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">通知</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative rounded-full" size="icon">
              <UserCircle className="h-8 w-8" />
              <span className="sr-only">用户菜单</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsAccountSettingsOpen(true)}>账户设置</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>退出登录</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 账户设置侧边栏 - 使用react-hook-form来管理表单状态 */}
      <Sheet open={isAccountSettingsOpen} onOpenChange={setIsAccountSettingsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>账户设置</SheetTitle>
            <SheetDescription>
              修改您的个人信息和账户设置
            </SheetDescription>
          </SheetHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>确认密码</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <SheetFooter>
                <Button type="submit">保存更改</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </header>
  );
};
