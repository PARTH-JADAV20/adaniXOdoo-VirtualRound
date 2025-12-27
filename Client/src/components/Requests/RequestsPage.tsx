import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit, ClipboardList, CheckCircle } from 'lucide-react';
import { requestsApi } from '@/services/api';
import { MaintenanceRequest, RequestFilters, RequestStatus, RequestType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge, PriorityBadge, Avatar } from '@/components/common/Badges';
import { CreateRequestModal } from './CreateRequestModal';
import { RequestDetailsModal } from './RequestDetailsModal';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { KanbanBoard } from '@/components/KanbanBoard';

const RequestsPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>(
    (searchParams.get('view') as 'list' | 'kanban') || 'list'
  );
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [filters, setFilters] = useState<RequestFilters>({
    status: (searchParams.get('status') as RequestStatus) || undefined,
    type: (searchParams.get('type') as RequestType) || undefined,
    search: searchParams.get('search') || undefined,
  });

  useEffect(() => {
    loadRequests();
  }, [filters]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      // Apply role-based filters
      const roleFilters: RequestFilters = { ...filters };
      if (hasRole('technician')) {
        roleFilters.assignedToId = user?.id;
      } else if (hasRole('manager') && user?.teamId) {
        roleFilters.teamId = user.teamId;
      } else if (hasRole('employee')) {
        roleFilters.requestedById = user?.id;
      }

      const data = await requestsApi.getAll(roleFilters);
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error loading requests:', error);
      // Set empty array on error so page still renders
      setRequests([]);
      // Only show toast if it's not a network error (backend might not be running)
      if (error.code !== 'ERR_NETWORK' && error.code !== 'ECONNREFUSED') {
        toast({
          title: 'Error loading requests',
          description: error.response?.data?.message || 'Failed to load requests',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof RequestFilters, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v.toString());
    });
    setSearchParams(params);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Maintenance Requests
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Manage and track all maintenance requests
          </p>
        </div>
        {hasRole(['admin', 'manager', 'technician']) && (
          <Button onClick={() => setIsCreateModalOpen(true)} size="lg" className="shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold mt-1">{requests.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-info/20 bg-gradient-to-br from-info/5 to-info/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New</p>
                <p className="text-2xl font-bold mt-1">
                  {requests.filter((r) => r.status === 'new').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-info/20 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-info"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold mt-1">
                  {requests.filter((r) => r.status === 'in_progress').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-warning animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold mt-1">
                  {requests.filter((r) => r.status === 'repaired').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                handleFilterChange('status', value === 'all' ? undefined : (value as RequestStatus))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="repaired">Repaired</SelectItem>
                <SelectItem value="scrap">Scrap</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) =>
                handleFilterChange('type', value === 'all' ? undefined : (value as RequestType))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="corrective">Corrective</SelectItem>
                <SelectItem value="preventive">Preventive</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className="flex-1"
              >
                List
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                onClick={() => setViewMode('kanban')}
                className="flex-1"
              >
                Kanban
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === 'kanban' ? (
        <KanbanBoard filters={filters} />
      ) : (
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Subject</TableHead>
                    <TableHead className="font-semibold">Equipment</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Priority</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Assigned To</TableHead>
                    <TableHead className="font-semibold">Scheduled</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <ClipboardList className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground font-medium">No requests found</p>
                          <p className="text-sm text-muted-foreground">
                            {hasRole(['admin', 'manager', 'technician'])
                              ? 'Create your first request to get started'
                              : 'No requests available'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request, index) => (
                      <TableRow
                        key={request.id}
                        className="hover:bg-muted/50 transition-colors cursor-pointer"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-semibold">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary"></div>
                            {request.subject}
                          </div>
                        </TableCell>
                        <TableCell>{request.equipment?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize font-medium">
                            {request.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <PriorityBadge priority={request.priority} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={request.status} />
                        </TableCell>
                        <TableCell>
                          {request.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <Avatar name={request.assignedTo.name} size="sm" />
                              <span className="text-sm">{request.assignedTo.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></span>
                              Unassigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {request.scheduledDate ? (
                            <span className="text-sm">
                              {new Date(request.scheduledDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                            className="hover:bg-primary hover:text-primary-foreground"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateRequestModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            loadRequests();
            setIsCreateModalOpen(false);
          }}
        />
      )}

      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          open={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdate={loadRequests}
        />
      )}
    </div>
  );
};

export default RequestsPage;

