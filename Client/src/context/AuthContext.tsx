import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, LoginCredentials, AuthState } from '@/types';
import { authApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  canManageTeam: (teamId: string) => boolean;
  canEditRequest: (request: { assignedToId?: string; teamId: string }) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Verify token by fetching current user
          const user = await authApi.getMe();
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      
      // Demo credentials for testing
      const demoUsers: Record<string, { user: User; token: string }> = {
        'admin@demo.com': {
          user: {
            id: '1',
            email: 'admin@demo.com',
            name: 'Admin User',
            role: 'admin',
            createdAt: new Date().toISOString(),
          },
          token: 'demo-token-admin',
        },
        'manager@demo.com': {
          user: {
            id: '2',
            email: 'manager@demo.com',
            name: 'Manager User',
            role: 'manager',
            teamId: 'team-1',
            createdAt: new Date().toISOString(),
          },
          token: 'demo-token-manager',
        },
        'technician@demo.com': {
          user: {
            id: '3',
            email: 'technician@demo.com',
            name: 'Technician User',
            role: 'technician',
            teamId: 'team-1',
            createdAt: new Date().toISOString(),
          },
          token: 'demo-token-technician',
        },
        'employee@demo.com': {
          user: {
            id: '4',
            email: 'employee@demo.com',
            name: 'Employee User',
            role: 'employee',
            createdAt: new Date().toISOString(),
          },
          token: 'demo-token-employee',
        },
      };

      // Check demo credentials first
      if (credentials.password === 'demo123' && demoUsers[credentials.email]) {
        const { user, token } = demoUsers[credentials.email];
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        toast({
          title: 'Welcome back!',
          description: `Logged in as ${user.name}`,
        });

        return true;
      }

      // Try API login if not demo
      const { user, token } = await authApi.login(credentials);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      toast({
        title: 'Welcome back!',
        description: `Logged in as ${user.name}`,
      });

      return true;
    } catch (error: any) {
      setState((prev) => ({ ...prev, isLoading: false }));
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'Invalid credentials',
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  }, []);

  // Check if user has one of the specified roles
  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!state.user) return false;
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(state.user.role);
    },
    [state.user]
  );

  // Check if user can manage a specific team
  const canManageTeam = useCallback(
    (teamId: string): boolean => {
      if (!state.user) return false;
      if (hasRole('admin')) return true;
      if (hasRole('manager') && state.user.teamId === teamId) return true;
      return false;
    },
    [state.user, hasRole]
  );

  // Check if user can edit a specific request
  const canEditRequest = useCallback(
    (request: { assignedToId?: string; teamId: string }): boolean => {
      if (!state.user) return false;
      if (hasRole('admin')) return true;
      if (hasRole('manager') && state.user.teamId === request.teamId) return true;
      if (hasRole('technician') && state.user.id === request.assignedToId) return true;
      return false;
    },
    [state.user, hasRole]
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        hasRole,
        canManageTeam,
        canEditRequest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
