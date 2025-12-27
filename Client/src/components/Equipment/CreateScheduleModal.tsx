import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { requestsApi } from '@/services/api';
import { CreateRequestForm, RequestPriority, RequestType } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { CalendarDays, Loader2, Wrench } from 'lucide-react';

const scheduleSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  type: z.custom<RequestType>(),
  priority: z.custom<RequestPriority>(),
  scheduledDate: z.string().optional(),
});

interface CreateScheduleModalProps {
  equipmentId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateScheduleModal: React.FC<CreateScheduleModalProps> = ({ equipmentId, open, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<Pick<CreateRequestForm, 'subject' | 'description' | 'type' | 'priority' | 'scheduledDate'>>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      type: 'preventive',
      priority: 'medium',
    },
  });

  useEffect(() => {
    if (open) {
      reset({ type: 'preventive', priority: 'medium', subject: '', description: '', scheduledDate: undefined });
    }
  }, [open, reset]);

  const onSubmit = async (values: Pick<CreateRequestForm, 'subject' | 'description' | 'type' | 'priority' | 'scheduledDate'>) => {
    try {
      setIsLoading(true);
      await requestsApi.create({ ...values, equipmentId });
      toast({ title: 'Schedule created', description: 'Maintenance schedule has been created.' });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({ title: 'Error creating schedule', description: error?.response?.data?.message || 'Failed to create schedule', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Add Schedule
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="E.g. Quarterly preventive maintenance" {...register('subject')} />
            {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={watch('type') || ''} onValueChange={(v) => setValue('type', v as RequestType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrective">Corrective</SelectItem>
                  <SelectItem value="preventive">Preventive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={watch('priority') || ''} onValueChange={(v) => setValue('priority', v as RequestPriority)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
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

          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Scheduled Date</Label>
            <Input id="scheduledDate" type="date" {...register('scheduledDate')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} placeholder="Additional details (optional)" {...register('description')} />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Wrench className="mr-2 h-4 w-4" />
                  Create Schedule
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
