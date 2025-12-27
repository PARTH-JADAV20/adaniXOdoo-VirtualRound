import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ClipboardList } from 'lucide-react';
import { requestsApi, equipmentApi, teamsApi } from '@/services/api';
import { CreateRequestForm, RequestType, RequestPriority, Equipment, Team } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const requestSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  type: z.enum(['corrective', 'preventive']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  equipmentId: z.string().min(1, 'Equipment is required'),
  scheduledDate: z.string().optional(),
});

interface CreateRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: Date | null;
  initialType?: RequestType;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  open,
  onClose,
  onSuccess,
  initialDate,
  initialType = 'corrective',
}) => {
  const { user } = useAuth();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateRequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      type: initialType,
      priority: 'medium',
      scheduledDate: initialDate ? initialDate.toISOString().split('T')[0] : undefined,
    },
  });

  const type = watch('type');
  const equipmentId = watch('equipmentId');

  useEffect(() => {
    if (open) {
      loadEquipment();
      reset({
        type: initialType,
        priority: 'medium',
        scheduledDate: initialDate ? initialDate.toISOString().split('T')[0] : undefined,
      });
    }
  }, [open, initialType, initialDate]);

  useEffect(() => {
    if (equipmentId) {
      const equipment = equipmentList.find((e) => e.id === equipmentId);
      setSelectedEquipment(equipment || null);
    }
  }, [equipmentId, equipmentList]);

  const loadEquipment = async () => {
    try {
      const data = await equipmentApi.getAll();
      // Filter out scrapped equipment
      const availableEquipment = (data || []).filter((e) => e.status !== 'scrapped');
      setEquipmentList(availableEquipment);
    } catch (error: any) {
      console.error('Error loading equipment:', error);
      setEquipmentList([]);
      if (error.code !== 'ERR_NETWORK' && error.code !== 'ECONNREFUSED') {
        toast({
          title: 'Error loading equipment',
          description: error.response?.data?.message || 'Failed to load equipment list',
          variant: 'destructive',
        });
      }
    }
  };

  const onSubmit = async (data: CreateRequestForm) => {
    try {
      setIsLoading(true);
      await requestsApi.create(data);
      toast({
        title: 'Request created',
        description: 'Maintenance request has been created successfully',
      });
      onSuccess();
      onClose();
      reset();
    } catch (error: any) {
      toast({
        title: 'Error creating request',
        description: error.response?.data?.message || 'Failed to create request',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Create Maintenance Request
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-base font-semibold">
                  Subject <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="subject"
                  {...register('subject')}
                  placeholder="Brief description of the maintenance needed"
                  className="h-11"
                />
                {errors.subject && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span>⚠</span> {errors.subject.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-base font-semibold">
                    Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={type}
                    onValueChange={(value) => setValue('type', value as RequestType)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corrective">Corrective</SelectItem>
                      <SelectItem value="preventive">Preventive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-base font-semibold">
                    Priority <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={watch('priority')}
                    onValueChange={(value) => setValue('priority', value as RequestPriority)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="equipmentId" className="text-base font-semibold">
                  Equipment <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={equipmentId || undefined}
                  onValueChange={(value) => setValue('equipmentId', value)}
                  disabled={equipmentList.length === 0}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={equipmentList.length === 0 ? "No equipment available" : "Select equipment"} />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentList.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.name} - {eq.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.equipmentId && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span>⚠</span> {errors.equipmentId.message}
                  </p>
                )}
                {selectedEquipment && (
                  <div className="mt-2 p-2 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Team:</span> {selectedEquipment.team?.name || 'Unassigned'}
                    </p>
                  </div>
                )}
              </div>

              {type === 'preventive' && (
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate" className="text-base font-semibold">
                    Scheduled Date
                  </Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    {...register('scheduledDate')}
                    min={new Date().toISOString().split('T')[0]}
                    className="h-11"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Provide additional details about the maintenance request..."
                  rows={5}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} size="lg">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} size="lg" className="shadow-lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Create Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

