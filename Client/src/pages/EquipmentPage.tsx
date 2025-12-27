import React, { useState, useEffect } from 'react';
import { Plus, Search, Wrench, MapPin, Users, AlertTriangle } from 'lucide-react';
import { equipmentApi, requestsApi } from '@/services/api';
import { Equipment, EquipmentFilters, MaintenanceRequest } from '@/types';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreateEquipmentModal } from '@/components/Equipment/CreateEquipmentModal';
import { EquipmentDetailsModal } from '@/components/Equipment/EquipmentDetailsModal';
import { StatusBadge } from '@/components/common/Badges';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const EquipmentPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [equipmentRequests, setEquipmentRequests] = useState<MaintenanceRequest[]>([]);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [filters, setFilters] = useState<EquipmentFilters>({});

  useEffect(() => {
    loadEquipment();
  }, [filters]);

  const loadEquipment = async () => {
    try {
      setIsLoading(true);
      const data = await equipmentApi.getAll(filters);
      setEquipment(data || []);
    } catch (error: any) {
      console.error('Error loading equipment:', error);
      // Set empty array on error so page still renders
      setEquipment([]);
      // Only show toast if it's not a network error (backend might not be running)
      if (error.code !== 'ERR_NETWORK' && error.code !== 'ECONNREFUSED') {
        toast({
          title: 'Error loading equipment',
          description: error.response?.data?.message || 'Failed to load equipment',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRequests = async (equipmentId: string) => {
    try {
      const requests = await requestsApi.getByEquipment(equipmentId);
      setEquipmentRequests(requests || []);
      setIsRequestsModalOpen(true);
    } catch (error: any) {
      console.error('Error loading requests:', error);
      setEquipmentRequests([]);
      setIsRequestsModalOpen(true);
      if (error.code !== 'ERR_NETWORK' && error.code !== 'ECONNREFUSED') {
        toast({
          title: 'Error loading requests',
          description: error.response?.data?.message || 'Failed to load requests',
          variant: 'destructive',
        });
      }
    }
  };

  const getStatusColor = (status: Equipment['status']) => {
    switch (status) {
      case 'operational':
        return 'bg-success/10 text-success border-success/20';
      case 'maintenance':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'scrapped':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return '';
    }
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
            Equipment
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Manage all equipment and assets
          </p>
        </div>
        {hasRole(['admin', 'manager']) && (
          <Button onClick={() => setIsCreateModalOpen(true)} size="lg" className="shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Equipment
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Equipment</p>
                <p className="text-2xl font-bold mt-1">{equipment.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Operational</p>
                <p className="text-2xl font-bold mt-1">
                  {equipment.filter((e) => e.status === 'operational').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-success"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Maintenance</p>
                <p className="text-2xl font-bold mt-1">
                  {equipment.filter((e) => e.status === 'maintenance').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scrapped</p>
                <p className="text-2xl font-bold mt-1">
                  {equipment.filter((e) => e.status === 'scrapped').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search equipment..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  status: value === 'all' ? undefined : (value as Equipment['status']),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="scrapped">Scrapped</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Team</TableHead>
                  <TableHead className="font-semibold">Maintenance</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                          <Wrench className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">No equipment found</p>
                        <p className="text-sm text-muted-foreground">
                          {hasRole(['admin', 'manager'])
                            ? 'Add your first equipment to get started'
                            : 'No equipment available'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  equipment.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{item.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('capitalize font-medium', getStatusColor(item.status))}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{item.team?.name || 'Unassigned'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.openRequestsCount !== undefined && item.openRequestsCount > 0 ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRequests(item.id)}
                            className="hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Wrench className="mr-2 h-4 w-4" />
                            Maintenance ({item.openRequestsCount})
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
                            None
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEquipment(item)}
                          className="hover:bg-primary hover:text-primary-foreground"
                        >
                          View Details
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

      {/* Modals */}
      <CreateEquipmentModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          loadEquipment();
          setIsCreateModalOpen(false);
        }}
      />

      {selectedEquipment && (
        <EquipmentDetailsModal
          equipment={selectedEquipment}
          open={!!selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          onUpdate={loadEquipment}
        />
      )}

      {/* Equipment Requests Modal */}
      {isRequestsModalOpen && (
        <Dialog open={isRequestsModalOpen} onOpenChange={setIsRequestsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Wrench className="h-6 w-6 text-primary" />
                Maintenance Requests
                {equipmentRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {equipmentRequests.length}
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-6">
              {equipmentRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Wrench className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No requests found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This equipment has no maintenance requests
                  </p>
                </div>
              ) : (
                equipmentRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-bold text-base">{request.subject}</p>
                            <StatusBadge status={request.status} />
                            <Badge variant="outline" className="capitalize">
                              {request.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="font-medium">Priority: {request.priority}</span>
                            {request.scheduledDate && (
                              <span>
                                Scheduled: {new Date(request.scheduledDate).toLocaleDateString()}
                              </span>
                            )}
                            {request.assignedTo && (
                              <span>Assigned to: {request.assignedTo.name}</span>
                            )}
                          </div>
                          {request.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {request.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EquipmentPage;

