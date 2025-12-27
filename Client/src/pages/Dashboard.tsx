import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, PriorityBadge, Avatar } from '@/components/common/Badges';

const Dashboard: React.FC = () => {
  const { user, hasRole } = useAuth();

  // Mock stats - in production, fetch from API
  const stats = {
    totalEquipment: 48,
    activeRequests: 12,
    completedThisMonth: 34,
    overdueRequests: 3,
  };

  const recentRequests = [
    { id: '1', subject: 'CNC Machine Calibration', status: 'in_progress' as const, priority: 'high' as const, assignee: 'John Doe', equipment: 'CNC Machine #1' },
    { id: '2', subject: 'Conveyor Belt Repair', status: 'new' as const, priority: 'critical' as const, assignee: 'Jane Smith', equipment: 'Conveyor Belt B' },
    { id: '3', subject: 'Pump Maintenance', status: 'repaired' as const, priority: 'medium' as const, assignee: 'Mike Johnson', equipment: 'Water Pump Station' },
  ];

  const upcomingMaintenance = [
    { id: '1', subject: 'Quarterly Inspection', date: '2024-01-15', equipment: 'Generator A' },
    { id: '2', subject: 'Oil Change', date: '2024-01-18', equipment: 'Hydraulic Press #2' },
    { id: '3', subject: 'Safety Check', date: '2024-01-20', equipment: 'Assembly Line 1' },
  ];

  const getRoleGreeting = () => {
    switch (user?.role) {
      case 'admin':
        return 'System Overview';
      case 'manager':
        return 'Team Performance';
      case 'technician':
        return 'My Assignments';
      case 'employee':
        return 'My Requests';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome back, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            {getRoleGreeting()}
          </p>
        </div>
        {hasRole(['admin', 'manager', 'technician']) && (
          <Button asChild size="lg" className="shadow-lg">
            <Link to="/requests">
              <ClipboardList className="mr-2 h-4 w-4" />
              New Request
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Equipment
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEquipment}</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <span className="text-success font-semibold">+2</span>
              <span>added this month</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Requests
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-warning/20 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeRequests}</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <span className="text-warning font-semibold">{stats.overdueRequests}</span>
              <span>overdue</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completedThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-2">This month</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats.overdueRequests}</div>
            <p className="text-xs text-muted-foreground mt-2">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Requests */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
            <div>
              <CardTitle className="text-lg font-bold">Recent Requests</CardTitle>
              <CardDescription className="mt-1">Latest maintenance activities</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/requests" className="flex items-center gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all cursor-pointer border border-transparent hover:border-primary/20"
                >
                  <Avatar name={request.assignee} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{request.subject}</p>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {request.equipment}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PriorityBadge priority={request.priority} />
                    <StatusBadge status={request.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Maintenance */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
            <div>
              <CardTitle className="text-lg font-bold">Upcoming Maintenance</CardTitle>
              <CardDescription className="mt-1">Scheduled preventive maintenance</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/calendar" className="flex items-center gap-1">
                View calendar <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {upcomingMaintenance.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all cursor-pointer border border-transparent hover:border-accent/20"
                >
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{item.subject}</p>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {item.equipment}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-muted-foreground flex-shrink-0">
                    {new Date(item.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for different roles */}
      {hasRole('technician') && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild className="hover:bg-primary hover:text-primary-foreground">
                <Link to="/requests?status=new">View New Requests</Link>
              </Button>
              <Button variant="outline" asChild className="hover:bg-primary hover:text-primary-foreground">
                <Link to="/requests?assigned=me">My Assignments</Link>
              </Button>
              <Button variant="outline" asChild className="hover:bg-primary hover:text-primary-foreground">
                <Link to="/calendar">Today's Schedule</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
