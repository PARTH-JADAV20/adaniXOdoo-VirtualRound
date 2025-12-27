// User & Auth Types
export type UserRole = 'admin' | 'manager' | 'technician' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  teamId?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Equipment Types
export type EquipmentStatus = 'operational' | 'maintenance' | 'scrapped';

export interface Equipment {
  id: string;
  name: string;
  description?: string;
  location: string;
  status: EquipmentStatus;
  teamId: string;
  team?: Team;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: string;
  lastMaintenanceDate?: string;
  openRequestsCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Team Types
export interface Team {
  id: string;
  name: string;
  description?: string;
  leaderId?: string;
  leader?: User;
  members?: User[];
  createdAt: string;
}

// Maintenance Request Types
export type RequestStatus = 'new' | 'in_progress' | 'repaired' | 'scrap';
export type RequestType = 'corrective' | 'preventive';
export type RequestPriority = 'low' | 'medium' | 'high' | 'critical';

export interface MaintenanceRequest {
  id: string;
  subject: string;
  description?: string;
  type: RequestType;
  status: RequestStatus;
  priority: RequestPriority;
  equipmentId: string;
  equipment?: Equipment;
  teamId: string;
  team?: Team;
  assignedToId?: string;
  assignedTo?: User;
  requestedById: string;
  requestedBy?: User;
  scheduledDate?: string;
  completedDate?: string;
  duration?: number; // in minutes
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Calendar Event Types
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  type: RequestType;
  status: RequestStatus;
  equipmentId: string;
  equipmentName?: string;
  assignedToId?: string;
  assignedToName?: string;
}

// Notification Types
export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter Types
export interface RequestFilters {
  status?: RequestStatus;
  type?: RequestType;
  priority?: RequestPriority;
  equipmentId?: string;
  teamId?: string;
  assignedToId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface EquipmentFilters {
  status?: EquipmentStatus;
  teamId?: string;
  search?: string;
}

// Form Types
export interface CreateRequestForm {
  subject: string;
  description?: string;
  type: RequestType;
  priority: RequestPriority;
  equipmentId: string;
  scheduledDate?: string;
}

export interface CreateEquipmentForm {
  name: string;
  description?: string;
  location: string;
  teamId: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalEquipment: number;
  activeRequests: number;
  completedThisMonth: number;
  overdueRequests: number;
  requestsByStatus: {
    new: number;
    in_progress: number;
    repaired: number;
    scrap: number;
  };
  requestsByType: {
    corrective: number;
    preventive: number;
  };
  recentRequests: MaintenanceRequest[];
  upcomingMaintenance: MaintenanceRequest[];
}
