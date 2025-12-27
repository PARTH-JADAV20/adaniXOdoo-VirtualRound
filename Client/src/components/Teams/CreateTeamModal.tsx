import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Users } from 'lucide-react';
import { teamsApi, usersApi } from '@/services/api';
import { CreateTeamForm, User } from '@/types';
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

const teamSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  leaderId: z.string().optional(),
});

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateTeamForm>({
    resolver: zodResolver(teamSchema),
  });

  useEffect(() => {
    if (open) {
      loadUsers();
      reset();
    }
  }, [open]);

  const loadUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      setUsers([]);
      if (error.code !== 'ERR_NETWORK' && error.code !== 'ECONNREFUSED') {
        toast({
          title: 'Error loading users',
          description: error.response?.data?.message || 'Failed to load users',
          variant: 'destructive',
        });
      }
    }
  };

  const onSubmit = async (data: CreateTeamForm) => {
    try {
      setIsLoading(true);
      await teamsApi.create(data);
      toast({
        title: 'Team created',
        description: 'Team has been created successfully',
      });
      onSuccess();
      onClose();
      reset();
    } catch (error: any) {
      toast({
        title: 'Error creating team',
        description: error.response?.data?.message || 'Failed to create team',
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
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Create Team
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold">
                  Team Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter team name"
                  className="h-11"
                />
                {errors.name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span>⚠</span> {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaderId" className="text-base font-semibold">
                  Team Leader
                </Label>
                <Select
                  value={watch('leaderId') || 'none'}
                  onValueChange={(value) => {
                    if (value === 'none') {
                      setValue('leaderId', undefined);
                    } else {
                      setValue('leaderId', value);
                    }
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select team leader (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No leader</SelectItem>
                    {users.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No users available
                      </div>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Provide a description for the team..."
                  rows={4}
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
                  <Users className="mr-2 h-4 w-4" />
                  Create Team
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

