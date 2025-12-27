import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield } from 'lucide-react';
import { teamsApi } from '@/services/api';
import { Team } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { CreateTeamModal } from '@/components/Teams/CreateTeamModal';

const TeamsPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      const data = await teamsApi.getAll();
      setTeams(data || []);
    } catch (error: any) {
      console.error('Error loading teams:', error);
      // Set empty array on error so page still renders
      setTeams([]);
      // Only show toast if it's not a network error (backend might not be running)
      if (error.code !== 'ERR_NETWORK' && error.code !== 'ECONNREFUSED') {
        toast({
          title: 'Error loading teams',
          description: error.response?.data?.message || 'Failed to load teams',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground mt-1">View and manage maintenance teams</p>
        </div>
        {hasRole('admin') && (
          <Button onClick={() => setIsCreateModalOpen(true)} size="lg" className="shadow-lg">
            <UserPlus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        )}
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No teams found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {team.name}
                  </CardTitle>
                  {team.leader && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Leader
                    </Badge>
                  )}
                </div>
                {team.description && (
                  <CardDescription className="mt-2">{team.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {team.leader && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Team Leader</p>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarFallback>
                            {team.leader.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">{team.leader.name}</p>
                          <p className="text-xs text-muted-foreground">{team.leader.email}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {team.members && team.members.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Members ({team.members.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {team.members.slice(0, 5).map((member) => (
                          <Avatar key={member.id} className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {member.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {team.members.length > 5 && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              +{team.members.length - 5}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateTeamModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          loadTeams();
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
};

export default TeamsPage;

