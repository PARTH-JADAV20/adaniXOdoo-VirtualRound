import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  ClipboardList,
  Calendar,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      roles: ['admin', 'manager', 'technician', 'employee'] as const,
    },
    {
      title: 'Equipment',
      icon: Wrench,
      href: '/equipment',
      roles: ['admin', 'manager', 'technician', 'employee'] as const,
    },
    {
      title: 'Requests',
      icon: ClipboardList,
      href: '/requests',
      roles: ['admin', 'manager', 'technician', 'employee'] as const,
    },
    {
      title: 'Calendar',
      icon: Calendar,
      href: '/calendar',
      roles: ['admin', 'manager', 'technician'] as const,
    },
    {
      title: 'Teams',
      icon: Users,
      href: '/teams',
      roles: ['admin', 'manager'] as const,
    },
    {
      title: 'Admin',
      icon: Shield,
      href: '/admin',
      roles: ['admin'] as const,
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.some((role) => hasRole(role))
  );

  const isActive = (href: string) => location.pathname === href;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Wrench className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-sidebar-foreground">GearGuard</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                        active
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <Icon className={cn('h-5 w-5 flex-shrink-0')} />
                      {!collapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        {/* Settings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/settings"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-2',
                'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">Settings</span>}
            </Link>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">
              <p>Settings</p>
            </TooltipContent>
          )}
        </Tooltip>

        {/* User info & Logout */}
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-muted',
            collapsed && 'justify-center'
          )}
        >
          {user && (
            <>
              <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-medium text-sm flex-shrink-0">
                {user.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                  : user.email
                      ? user.email[0].toUpperCase()
                      : 'U'}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user.name || user.email || 'User'}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 capitalize truncate">
                    {user.role || 'user'}
                  </p>
                </div>
              )}
            </>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive flex-shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={collapsed ? 'right' : 'top'}>
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
