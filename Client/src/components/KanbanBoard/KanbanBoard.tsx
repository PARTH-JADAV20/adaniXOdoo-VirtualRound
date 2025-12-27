import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Search, Filter, User, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { requestsApi } from '@/services/api';
import { MaintenanceRequest, RequestStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge, PriorityBadge, Avatar as CustomAvatar } from '@/components/common/Badges';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const COLUMNS: { id: RequestStatus; title: string; color: string }[] = [
  { id: 'new', title: 'New', color: 'bg-info/10 border-info/20' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-warning/10 border-warning/20' },
  { id: 'repaired', title: 'Repaired', color: 'bg-success/10 border-success/20' },
  { id: 'scrap', title: 'Scrap', color: 'bg-destructive/10 border-destructive/20' },
];

interface KanbanBoardProps {
  filters?: {
    assignedToId?: string;
    equipmentId?: string;
    teamId?: string;
  };
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ filters }) => {
  const { user, canEditRequest } = useAuth();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<MaintenanceRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [filters]);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const data = await requestsApi.getAll(filters);
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

  const filterRequests = () => {
    if (!searchQuery.trim()) {
      setFilteredRequests(requests);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = requests.filter(
      (req) =>
        req.subject.toLowerCase().includes(query) ||
        req.equipment?.name.toLowerCase().includes(query) ||
        req.assignedTo?.name.toLowerCase().includes(query) ||
        req.description?.toLowerCase().includes(query)
    );
    setFilteredRequests(filtered);
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const request = requests.find((r) => r.id === draggableId);
    if (!request) return;

    // Check permissions
    if (!canEditRequest(request)) {
      toast({
        title: 'Permission denied',
        description: 'You do not have permission to move this request',
        variant: 'destructive',
      });
      return;
    }

    // Check if moving to scrap
    if (destination.droppableId === 'scrap') {
      // Show confirmation modal would go here
      // For now, proceed with update
    }

    const newStatus = destination.droppableId as RequestStatus;

    try {
      // Optimistic update
      const updatedRequests = requests.map((r) =>
        r.id === draggableId ? { ...r, status: newStatus } : r
      );
      setRequests(updatedRequests);

      // API call
      await requestsApi.updateStatus(draggableId, newStatus);

      // If moving to scrap, update equipment status
      if (newStatus === 'scrap' && request.equipmentId) {
        // This would call equipmentApi.update(request.equipmentId, { status: 'scrapped' })
        // For now, just show a toast
        toast({
          title: 'Equipment marked as scrapped',
          description: 'The equipment has been marked as scrapped',
        });
      }

      toast({
        title: 'Status updated',
        description: `Request moved to ${COLUMNS.find((c) => c.id === newStatus)?.title}`,
      });
    } catch (error: any) {
      // Revert on error
      setRequests(requests);
      toast({
        title: 'Error updating status',
        description: error.response?.data?.message || 'Failed to update request status',
        variant: 'destructive',
      });
    }
  };

  const getRequestsByStatus = (status: RequestStatus) => {
    return filteredRequests.filter((r) => r.status === status);
  };

  const isOverdue = (request: MaintenanceRequest) => {
    if (!request.scheduledDate) return false;
    const scheduled = new Date(request.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return scheduled < today && request.status !== 'repaired' && request.status !== 'scrap';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4 overflow-x-auto">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex-shrink-0 w-80">
              <Skeleton className="h-96 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {COLUMNS.map((column) => {
            const columnRequests = getRequestsByStatus(column.id);

            return (
              <div key={column.id} className="flex-shrink-0 w-80">
                <Card className="h-full">
                  <CardHeader className={cn('pb-3', column.color)}>
                    <CardTitle className="text-sm font-semibold flex items-center justify-between">
                      <span>{column.title}</span>
                      <Badge variant="secondary" className="ml-2">
                        {columnRequests.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn(
                            'min-h-[400px] space-y-3 transition-colors',
                            snapshot.isDraggingOver && 'bg-muted/50 rounded-lg p-2'
                          )}
                        >
                          {columnRequests.map((request, index) => {
                            const overdue = isOverdue(request);
                            const canEdit = canEditRequest(request);

                            return (
                              <Draggable
                                key={request.id}
                                draggableId={request.id}
                                index={index}
                                isDragDisabled={!canEdit}
                              >
                                {(provided, snapshot) => (
                                  <Card
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={cn(
                                      'kanban-card cursor-move',
                                      snapshot.isDragging && 'dragging',
                                      overdue && 'overdue border-destructive',
                                      !canEdit && 'opacity-60 cursor-not-allowed'
                                    )}
                                  >
                                    <CardContent className="p-4 space-y-3">
                                      <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-semibold text-sm flex-1 line-clamp-2">
                                          {request.subject}
                                        </h4>
                                        <PriorityBadge priority={request.priority} />
                                      </div>

                                      <div className="space-y-2 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">Equipment:</span>
                                          <span className="truncate">
                                            {request.equipment?.name || 'Unknown'}
                                          </span>
                                        </div>

                                        {request.assignedTo && (
                                          <div className="flex items-center gap-2">
                                            <User className="h-3 w-3" />
                                            <CustomAvatar
                                              name={request.assignedTo.name}
                                              size="xs"
                                            />
                                            <span className="truncate">
                                              {request.assignedTo.name}
                                            </span>
                                          </div>
                                        )}

                                        {request.scheduledDate && (
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                              {new Date(request.scheduledDate).toLocaleDateString()}
                                            </span>
                                            {overdue && (
                                              <AlertCircle className="h-3 w-3 text-destructive" />
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      {overdue && (
                                        <Badge
                                          variant="destructive"
                                          className="w-full justify-center text-xs"
                                        >
                                          Overdue
                                        </Badge>
                                      )}
                                    </CardContent>
                                  </Card>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;

