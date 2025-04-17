
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Server, 
  Network, 
  BarChart3, 
  Settings, 
  Menu, 
  ChevronRight, 
  ChevronLeft,
  ArrowRightLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface NavItem {
  title: string;
  icon: React.ElementType;
  path: string;
}

export const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  
  const navItems: NavItem[] = [
    { title: '仪表盘', icon: BarChart3, path: '/' },
    { title: '服务器管理', icon: Server, path: '/servers' },
    { title: '代理配置', icon: Network, path: '/proxy' },
    { title: '端口转发', icon: ArrowRightLeft, path: '/port-forwarding' },
    { title: '系统设置', icon: Settings, path: '/settings' },
  ];

  return (
    <aside 
      className={cn(
        "bg-sidebar text-sidebar-foreground flex flex-col h-full z-30 transition-all duration-300",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 py-3 border-b border-sidebar-border">
        <h1 className={cn(
          "text-xl font-bold transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0 hidden"
        )}>
          Gost代理管理
        </h1>
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-sidebar-accent flex items-center justify-center"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 pt-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-2.5 rounded-lg transition-colors",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon size={20} className="shrink-0" />
                  {isOpen && (
                    <span className="ml-3 text-sm font-medium">{item.title}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border mt-auto">
        <div className={cn(
          "text-sm text-sidebar-foreground/70 transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0"
        )}>
          <p>Gost代理版本: v2.11.2</p>
        </div>
      </div>
    </aside>
  );
};
