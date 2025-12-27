import React, { useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Notification } from '@/types';
import { cn } from '@/lib/utils';

// Mock notifications for demo - in production, these would come from API
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Overdue Request',
    message: 'Maintenance request for CNC Machine #1 is overdue',
    type: 'warning',
    read: false,
    createdAt: new Date().toISOString(),
    link: '/requests',
  },
  {
    id: '2',
    title: 'New Assignment',
    message: 'You have been assigned to repair Conveyor Belt B',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    link: '/requests',
  },
  {
    id: '3',
    title: 'Maintenance Complete',
    message: 'Pump Station maintenance has been completed',
    type: 'success',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    link: '/equipment',
  },
];

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-warning/10 border-warning/30 text-warning';
      case 'success':
        return 'bg-success/10 border-success/30 text-success';
      case 'error':
        return 'bg-destructive/10 border-destructive/30 text-destructive';
      default:
        return 'bg-info/10 border-info/30 text-info';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium animate-scale-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 shadow-xl border-0" align="end">
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <span className="h-5 px-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center animate-scale-in">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={markAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 opacity-50" />
              </div>
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 hover:bg-muted/50 transition-all cursor-pointer group relative',
                    !notification.read && 'bg-primary/5 border-l-2 border-l-primary'
                  )}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.link) {
                      window.location.href = notification.link;
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full mt-2 flex-shrink-0 ring-2 ring-background',
                        getTypeStyles(notification.type),
                        !notification.read && 'animate-pulse'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p
                          className={cn(
                            'text-sm font-semibold',
                            !notification.read ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
                          {formatTime(notification.createdAt)}
                        </p>
                        {!notification.read && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="border-t bg-muted/30 p-3">
            <Button variant="ghost" className="w-full text-sm font-medium" size="sm">
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
