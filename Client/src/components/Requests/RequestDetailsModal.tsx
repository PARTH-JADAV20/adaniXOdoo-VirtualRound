import React from 'react';
import { MaintenanceRequest } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, PriorityBadge, Avatar } from '@/components/common/Badges';
import { format } from 'date-fns';

interface RequestDetailsModalProps {
  request: MaintenanceRequest;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  open,
  onClose,
  onUpdate,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{request.subject}</DialogTitle>
            <StatusBadge status={request.status} />
          </div>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          {/* Main Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Equipment</p>
                <p className="text-base font-bold">{request.equipment?.name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground mt-1">{request.equipment?.location}</p>
              </CardContent>
            </Card>
            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Type</p>
                <Badge variant="outline" className="capitalize text-sm font-semibold mt-1">
                  {request.type}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Priority</p>
                <div className="mt-1">
                  <PriorityBadge priority={request.priority} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Status</p>
                <div className="mt-1">
                  <StatusBadge status={request.status} />
                </div>
              </CardContent>
            </Card>
            {request.scheduledDate && (
              <Card className="border-info/20 bg-gradient-to-br from-info/5 to-transparent">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Scheduled Date</p>
                  <p className="text-base font-bold">
                    {format(new Date(request.scheduledDate), 'PPP')}
                  </p>
                </CardContent>
              </Card>
            )}
            {request.completedDate && (
              <Card className="border-success/20 bg-gradient-to-br from-success/5 to-transparent">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Completed Date</p>
                  <p className="text-base font-bold">
                    {format(new Date(request.completedDate), 'PPP')}
                  </p>
                </CardContent>
              </Card>
            )}
            {request.assignedTo && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Assigned To</p>
                  <div className="flex items-center gap-3">
                    <Avatar name={request.assignedTo.name} size="md" />
                    <div>
                      <p className="text-sm font-bold">{request.assignedTo.name}</p>
                      <p className="text-xs text-muted-foreground">{request.assignedTo.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {request.requestedBy && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Requested By</p>
                  <div className="flex items-center gap-3">
                    <Avatar name={request.requestedBy.name} size="md" />
                    <div>
                      <p className="text-sm font-bold">{request.requestedBy.name}</p>
                      <p className="text-xs text-muted-foreground">{request.requestedBy.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {request.duration && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Duration</p>
                  <p className="text-base font-bold">{request.duration} minutes</p>
                </CardContent>
              </Card>
            )}
          </div>

          {request.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{request.description}</p>
              </CardContent>
            </Card>
          )}

          {request.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{request.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

