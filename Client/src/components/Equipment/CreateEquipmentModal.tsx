import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Wrench } from 'lucide-react';
import { equipmentApi, teamsApi } from '@/services/api';
import { CreateEquipmentForm, Team } from '@/types';
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

const equipmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  teamId: z.string().min(1, 'Team is required'),
  serialNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  purchaseDate: z.string().optional(),
});

interface CreateEquipmentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateEquipmentModal: React.FC<CreateEquipmentModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateEquipmentForm>({
    resolver: zodResolver(equipmentSchema),
  });

  useEffect(() => {
    if (open) {
      loadTeams();
      reset();
    }
  }, [open]);

  const loadTeams = async () => {
    try {
      const data = await teamsApi.getAll();
      setTeams(data || []);
    } catch (error: any) {
      console.error('Error loading teams:', error);
      setTeams([]);
      if (error.code !== 'ERR_NETWORK' && error.code !== 'ECONNREFUSED') {
        toast({
          title: 'Error loading teams',
          description: error.response?.data?.message || 'Failed to load teams',
          variant: 'destructive',
        });
      }
    }
  };

  const onSubmit = async (data: CreateEquipmentForm) => {
    try {
      setIsLoading(true);
      await equipmentApi.create(data);
      toast({
        title: 'Equipment created',
        description: 'Equipment has been added successfully',
      });
      onSuccess();
      onClose();
      reset();
    } catch (error: any) {
      toast({
        title: 'Error creating equipment',
        description: error.response?.data?.message || 'Failed to create equipment',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Add Equipment
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold">
                  Equipment Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter equipment name"
                  className="h-11"
                />
                {errors.name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span>⚠</span> {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base font-semibold">
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="Building, Floor, etc."
                    className="h-11"
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <span>⚠</span> {errors.location.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamId" className="text-base font-semibold">
                    Team <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={watch('teamId') || ''}
                    onValueChange={(value) => setValue('teamId', value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.length === 0 ? (
                        <SelectItem value="" disabled>No teams available</SelectItem>
                      ) : (
                        teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.teamId && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <span>⚠</span> {errors.teamId.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serialNumber" className="text-base font-semibold">
                    Serial Number
                  </Label>
                  <Input id="serialNumber" {...register('serialNumber')} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manufacturer" className="text-base font-semibold">
                    Manufacturer
                  </Label>
                  <Input id="manufacturer" {...register('manufacturer')} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-base font-semibold">
                    Model
                  </Label>
                  <Input id="model" {...register('model')} className="h-11" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseDate" className="text-base font-semibold">
                  Purchase Date
                </Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  {...register('purchaseDate')}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Provide additional details about the equipment..."
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
                  <Wrench className="mr-2 h-4 w-4" />
                  Create Equipment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

