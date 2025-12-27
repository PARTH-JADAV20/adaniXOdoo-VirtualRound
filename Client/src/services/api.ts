import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  User,
  LoginCredentials,
  Equipment,
  Team,
  MaintenanceRequest,
  CalendarEvent,
  CreateRequestForm,
  CreateEquipmentForm,
  RequestFilters,
  EquipmentFilters,
  RequestStatus,
} from '@/types';

// API Base URL - Change this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login', credentials);
    // Backend returns { success, user, token }, extract user and token
    return {
      user: response.data.user,
      token: response.data.token,
    };
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    // Backend returns { success, user }, extract user
    return response.data.user;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Equipment API
export const equipmentApi = {
  getAll: async (filters?: EquipmentFilters): Promise<Equipment[]> => {
    const response = await api.get('/equipment', { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<Equipment> => {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },

  create: async (data: CreateEquipmentForm): Promise<Equipment> => {
    const response = await api.post('/equipment', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Equipment>): Promise<Equipment> => {
    const response = await api.patch(`/equipment/${id}`, data);
    return response.data;
  },
};

// Teams API
export const teamsApi = {
  getAll: async (): Promise<Team[]> => {
    const response = await api.get('/teams');
    return response.data;
  },

  getById: async (id: string): Promise<Team> => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },
};

// Maintenance Requests API
export const requestsApi = {
  getAll: async (filters?: RequestFilters): Promise<MaintenanceRequest[]> => {
    const response = await api.get('/requests', { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<MaintenanceRequest> => {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },

  create: async (data: CreateRequestForm): Promise<MaintenanceRequest> => {
    const response = await api.post('/requests', data);
    return response.data;
  },

  update: async (id: string, data: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> => {
    const response = await api.patch(`/requests/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: RequestStatus): Promise<MaintenanceRequest> => {
    const response = await api.patch(`/requests/${id}`, { status });
    return response.data;
  },

  getCalendarEvents: async (): Promise<CalendarEvent[]> => {
    const response = await api.get('/requests/calendar');
    return response.data;
  },

  getByEquipment: async (equipmentId: string): Promise<MaintenanceRequest[]> => {
    const response = await api.get(`/requests/by-equipment/${equipmentId}`);
    return response.data;
  },
};

export default api;
