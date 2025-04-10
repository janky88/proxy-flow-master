
import { Bell, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header = ({ toggleSidebar }: HeaderProps) => {
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "已退出登录",
      description: "您已成功退出系统",
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

      {/* 账户设置侧边栏 */}
      <Sheet open={isAccountSettingsOpen} onOpenChange={setIsAccountSettingsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>账户设置</SheetTitle>
            <SheetDescription>
              修改您的个人信息和账户设置
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">用户名</Label>
              <Input id="name" defaultValue="管理员" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" type="email" defaultValue="admin@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input id="password" type="password" defaultValue="********" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input id="confirmPassword" type="password" defaultValue="********" />
            </div>
          </div>
          <SheetFooter>
            <Button onClick={() => {
              setIsAccountSettingsOpen(false);
              toast({
                title: "设置已保存",
                description: "您的账户设置已成功更新",
              });
            }}>
              保存更改
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </header>
  );
};
