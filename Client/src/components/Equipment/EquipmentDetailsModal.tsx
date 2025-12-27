import React, { useState, useEffect } from 'react';
import { Equipment, MaintenanceRequest } from '@/types';
import { equipmentApi, requestsApi } from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/Badges';
import { format } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateScheduleModal } from '@/components/Equipment/CreateScheduleModal';
import { AssignTeamModal } from '@/components/Equipment/AssignTeamModal';

interface EquipmentDetailsModalProps {
  equipment: Equipment;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const EquipmentDetailsModal: React.FC<EquipmentDetailsModalProps> = ({
  equipment: initialEquipment,
  open,
  onClose,
  onUpdate,
}) => {
  const [equipment, setEquipment] = useState(initialEquipment);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isAssignTeamOpen, setIsAssignTeamOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setEquipment(initialEquipment);
      loadMaintenanceHistory();
    }
  }, [open, initialEquipment]);

  const loadMaintenanceHistory = async () => {
    try {
      setIsLoading(true);
      const requests = await requestsApi.getByEquipment(equipment.id);
      // Sort by date, most recent first
      const sorted = (requests || []).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setMaintenanceHistory(sorted);
    } catch (error: any) {
      console.error('Failed to load maintenance history:', error);
      setMaintenanceHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const isScrapped = equipment.status === 'scrapped';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{equipment.name}</DialogTitle>
            <Badge
              className={cn(
                'capitalize text-sm font-semibold px-3 py-1',
                equipment.status === 'operational' && 'bg-success/10 text-success border-success/20',
                equipment.status === 'maintenance' && 'bg-warning/10 text-warning border-warning/20',
                equipment.status === 'scrapped' && 'bg-destructive/10 text-destructive border-destructive/20'
              )}
            >
              {equipment.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" onClick={() => setIsScheduleOpen(true)}>
              Add Schedule
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsAssignTeamOpen(true)}>
              Assign Team
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          {isScrapped && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border-2 border-destructive/20 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive font-semibold">
                This equipment has been marked as scrapped. No new maintenance requests can be created.
              </p>
            </div>
          )}

          {/* Equipment Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Location</p>
                <p className="text-base font-bold">{equipment.location}</p>
              </CardContent>
            </Card>
            <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Team</p>
                <p className="text-base font-bold">{equipment.team?.name || 'Unassigned'}</p>
              </CardContent>
            </Card>
            {equipment.serialNumber && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Serial Number</p>
                  <p className="text-base font-semibold">{equipment.serialNumber}</p>
                </CardContent>
              </Card>
            )}
            {equipment.manufacturer && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Manufacturer</p>
                  <p className="text-base font-semibold">{equipment.manufacturer}</p>
                </CardContent>
              </Card>
            )}
            {equipment.model && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Model</p>
                  <p className="text-base font-semibold">{equipment.model}</p>
                </CardContent>
              </Card>
            )}
            {equipment.purchaseDate && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Purchase Date</p>
                  <p className="text-base font-semibold">
                    {format(new Date(equipment.purchaseDate), 'PPP')}
                  </p>
                </CardContent>
              </Card>
            )}
            {equipment.lastMaintenanceDate && (
              <Card className="border-success/20 bg-gradient-to-br from-success/5 to-transparent">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Last Maintenance</p>
                  <p className="text-base font-bold">
                    {format(new Date(equipment.lastMaintenanceDate), 'PPP')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {equipment.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{equipment.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Maintenance History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span>Maintenance History</span>
                {maintenanceHistory.length > 0 && (
                  <Badge variant="secondary">{maintenanceHistory.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Loading history...</p>
                  </div>
                ) : maintenanceHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No maintenance history</p>
                  </div>
                ) : (
                  maintenanceHistory.map((request) => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-semibold text-base mb-2">{request.subject}</p>
                            <div className="flex items-center gap-3 flex-wrap">
                              <StatusBadge status={request.status} />
                              <span className="text-xs text-muted-foreground">
                                Created: {format(new Date(request.createdAt), 'PP')}
                              </span>
                              {request.completedDate && (
                                <span className="text-xs text-success font-medium">
                                  Completed: {format(new Date(request.completedDate), 'PP')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        {isScheduleOpen && (
          <CreateScheduleModal
            equipmentId={equipment.id}
            open={isScheduleOpen}
            onClose={() => setIsScheduleOpen(false)}
            onSuccess={() => {
              loadMaintenanceHistory();
              onUpdate();
            }}
          />
        )}
        {isAssignTeamOpen && (
          <AssignTeamModal
            equipmentId={equipment.id}
            open={isAssignTeamOpen}
            onClose={() => setIsAssignTeamOpen(false)}
            onSuccess={() => {
              onUpdate();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

