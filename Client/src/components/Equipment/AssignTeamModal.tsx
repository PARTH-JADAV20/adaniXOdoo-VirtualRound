import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { equipmentApi, teamsApi } from '@/services/api';
import { Team } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Loader2, Users } from 'lucide-react';

const schema = z.object({
  teamId: z.string().min(1, 'Team is required'),
});

type FormValues = z.infer<typeof schema>;

interface AssignTeamModalProps {
  equipmentId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignTeamModal: React.FC<AssignTeamModalProps> = ({ equipmentId, open, onClose, onSuccess }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      reset();
      loadTeams();
    }
  }, [open, reset]);

  const loadTeams = async () => {
    try {
      const data = await teamsApi.getAll();
      setTeams(data || []);
    } catch (error: any) {
      setTeams([]);
      toast({ title: 'Error loading teams', description: error?.response?.data?.message || 'Failed to load teams', variant: 'destructive' });
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      await equipmentApi.update(equipmentId, { teamId: values.teamId });
      toast({ title: 'Team assigned', description: 'Team has been assigned to equipment.' });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({ title: 'Error assigning team', description: error?.response?.data?.message || 'Failed to assign team', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Assign Team
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Team</Label>
            <Select value={watch('teamId') || ''} onValueChange={(v) => setValue('teamId', v)}>
              <SelectTrigger>
                <SelectValue placeholder={teams.length ? 'Select team' : 'No teams available'} />
              </SelectTrigger>
              <SelectContent>
                {teams.length === 0 ? (
                  <SelectItem value="" disabled>No teams available</SelectItem>
                ) : (
                  teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.teamId && <p className="text-sm text-destructive">{errors.teamId.message}</p>}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading || teams.length === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Team'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
