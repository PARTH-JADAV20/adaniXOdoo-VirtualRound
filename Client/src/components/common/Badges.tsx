import React from 'react';
import { cn } from '@/lib/utils';
import { RequestStatus, RequestPriority, EquipmentStatus } from '@/types';

interface StatusBadgeProps {
  status: RequestStatus | EquipmentStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'new':
        return 'bg-info/10 text-info border-info/30';
      case 'in_progress':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'repaired':
      case 'operational':
        return 'bg-success/10 text-success border-success/30';
      case 'scrap':
      case 'scrapped':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'maintenance':
        return 'bg-warning/10 text-warning border-warning/30';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const formatStatus = (s: string) => {
    return s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getStatusStyles(),
        className
      )}
    >
      {formatStatus(status)}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: RequestPriority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className }) => {
  const getPriorityStyles = () => {
    switch (priority) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-warning text-warning-foreground';
      case 'medium':
        return 'bg-info text-info-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase',
        getPriorityStyles(),
        className
      )}
    >
      {priority}
    </span>
  );
};

interface TypeBadgeProps {
  type: 'corrective' | 'preventive';
  className?: string;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, className }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        type === 'preventive'
          ? 'bg-accent/10 text-accent border-accent/30'
          : 'bg-primary/10 text-primary border-primary/30',
        className
      )}
    >
      {type === 'preventive' ? 'Preventive' : 'Corrective'}
    </span>
  );
};

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    xs: 'h-4 w-4 text-[10px]',
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorFromName = (name: string) => {
    const colors = [
      'bg-primary',
      'bg-accent',
      'bg-success',
      'bg-warning',
      'bg-info',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium text-white',
        sizeClasses[size],
        getColorFromName(name),
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
};

interface CountBadgeProps {
  count: number;
  className?: string;
  variant?: 'default' | 'warning' | 'destructive';
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  className,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'bg-primary text-primary-foreground',
    warning: 'bg-warning text-warning-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold',
        variantStyles[variant],
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};
