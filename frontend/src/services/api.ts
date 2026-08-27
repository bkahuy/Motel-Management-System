import axios, { AxiosError, AxiosResponse } from 'axios';
import {
  ApiResponse,
  AuthResponse,
  Building,
  BuildingRequest,
  Contract,
  ContractRequest,
  DashboardStatistics,
  Invoice,
  InvoiceCalculateRequest,
  InvoiceCalculateResponse,
  InvoiceCreateRequest,
  MeterReading,
  MeterReadingRequest,
  PageResponse,
  Payment,
  PaymentRequest,
  RevenueStatistics,
  Room,
  RoomRequest,
  RoomStatus,
  RoomStatusDistribution,
  ServiceItem,
  ServiceRequest,
  Tenant,
  TenantRequest,
  User,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => response,
  (error: AxiosError<ApiResponse<any>>) => {
    if (error.response?.status === 401) {
      // Clear credentials if token expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 1. Auth API
export const authApi = {
  login: (data: { usernameOrEmail: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),
  register: (data: any) =>
    api.post<ApiResponse<User>>('/auth/register', data),
  getMe: () =>
    api.get<ApiResponse<User>>('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<ApiResponse<void>>('/auth/change-password', data),
};

// 2. Building API
export const buildingApi = {
  getBuildings: (params?: { search?: string; page?: number; size?: number; sort?: string }) =>
    api.get<ApiResponse<PageResponse<Building>>>('/buildings', { params }),
  getAll: () =>
    api.get<ApiResponse<Building[]>>('/buildings/all'),
  getById: (id: number) =>
    api.get<ApiResponse<Building>>(`/buildings/${id}`),
  create: (data: BuildingRequest) =>
    api.post<ApiResponse<Building>>('/buildings', data),
  update: (id: number, data: BuildingRequest) =>
    api.put<ApiResponse<Building>>(`/buildings/${id}`, data),
  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/buildings/${id}`),
};

// 3. Room API
export const roomApi = {
  getRooms: (params?: { search?: string; buildingId?: number; status?: RoomStatus; page?: number; size?: number; sort?: string }) =>
    api.get<ApiResponse<PageResponse<Room>>>('/rooms', { params }),
  getAvailable: () =>
    api.get<ApiResponse<Room[]>>('/rooms/available'),
  getById: (id: number) =>
    api.get<ApiResponse<Room>>(`/rooms/${id}`),
  create: (data: RoomRequest) =>
    api.post<ApiResponse<Room>>('/rooms', data),
  update: (id: number, data: RoomRequest) =>
    api.put<ApiResponse<Room>>(`/rooms/${id}`, data),
  assignServices: (roomId: number, serviceIds: number[]) =>
    api.post<ApiResponse<Room>>(`/rooms/${roomId}/services`, { serviceIds }),
  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/rooms/${id}`),
};

// 4. Tenant API
export const tenantApi = {
  getTenants: (params?: { search?: string; page?: number; size?: number; sort?: string }) =>
    api.get<ApiResponse<PageResponse<Tenant>>>('/tenants', { params }),
  getAll: () =>
    api.get<ApiResponse<Tenant[]>>('/tenants/all'),
  getById: (id: number) =>
    api.get<ApiResponse<Tenant>>(`/tenants/${id}`),
  getMyProfile: () =>
    api.get<ApiResponse<Tenant>>('/tenants/me'),
  updateMyProfile: (data: TenantRequest) =>
    api.put<ApiResponse<Tenant>>('/tenants/me', data),
  create: (data: TenantRequest) =>
    api.post<ApiResponse<Tenant>>('/tenants', data),
  update: (id: number, data: TenantRequest) =>
    api.put<ApiResponse<Tenant>>(`/tenants/${id}`, data),
  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/tenants/${id}`),
};

// 5. Contract API
export const contractApi = {
  getContracts: (params?: { search?: string; roomId?: number; tenantId?: number; buildingId?: number; status?: string; page?: number; size?: number; sort?: string }) =>
    api.get<ApiResponse<PageResponse<Contract>>>('/contracts', { params }),
  getActive: () =>
    api.get<ApiResponse<Contract[]>>('/contracts/active'),
  getById: (id: number) =>
    api.get<ApiResponse<Contract>>(`/contracts/${id}`),
  create: (data: ContractRequest) =>
    api.post<ApiResponse<Contract>>('/contracts', data),
  update: (id: number, data: ContractRequest) =>
    api.put<ApiResponse<Contract>>(`/contracts/${id}`, data),
  terminate: (id: number, data?: { reason?: string }) =>
    api.patch<ApiResponse<Contract>>(`/contracts/${id}/terminate`, data),
};

// 6. Meter Reading API
export const meterReadingApi = {
  getMeterReadings: (params?: { readingMonth?: string; roomId?: number; page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<MeterReading>>>('/meter-readings', { params }),
  getById: (id: number) =>
    api.get<ApiResponse<MeterReading>>(`/meter-readings/${id}`),
  getLatest: (contractId: number) =>
    api.get<ApiResponse<MeterReading>>(`/meter-readings/latest/${contractId}`),
  create: (data: MeterReadingRequest) =>
    api.post<ApiResponse<MeterReading>>('/meter-readings', data),
  update: (id: number, data: MeterReadingRequest) =>
    api.put<ApiResponse<MeterReading>>(`/meter-readings/${id}`, data),
  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/meter-readings/${id}`),
};

// 7. Service API
export const serviceApi = {
  getServices: (params?: { search?: string; page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<ServiceItem>>>('/services', { params }),
  getAllActive: () =>
    api.get<ApiResponse<ServiceItem[]>>('/services/all'),
  getById: (id: number) =>
    api.get<ApiResponse<ServiceItem>>(`/services/${id}`),
  create: (data: ServiceRequest) =>
    api.post<ApiResponse<ServiceItem>>('/services', data),
  update: (id: number, data: ServiceRequest) =>
    api.put<ApiResponse<ServiceItem>>(`/services/${id}`, data),
  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/services/${id}`),
};

// 8. Invoice API
export const invoiceApi = {
  getInvoices: (params?: { search?: string; billingMonth?: string; status?: string; roomId?: number; page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Invoice>>>('/invoices', { params }),
  getById: (id: number) =>
    api.get<ApiResponse<Invoice>>(`/invoices/${id}`),
  calculatePreview: (data: InvoiceCalculateRequest) =>
    api.post<ApiResponse<InvoiceCalculateResponse>>('/invoices/calculate-preview', data),
  create: (data: InvoiceCreateRequest) =>
    api.post<ApiResponse<Invoice>>('/invoices', data),
  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/invoices/${id}`),
  pay: (id: number, data: PaymentRequest) =>
    api.post<ApiResponse<Payment>>(`/invoices/${id}/pay`, data),
  getPayments: (id: number) =>
    api.get<ApiResponse<Payment[]>>(`/invoices/${id}/payments`),
};

// 9. Payment API
export const paymentApi = {
  getPayments: (params?: { page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<Payment>>>('/payments', { params }),
};

// 10. Dashboard API
export const dashboardApi = {
  getStatistics: () =>
    api.get<ApiResponse<DashboardStatistics>>('/dashboard/statistics'),
  getRevenue: (months = 6) =>
    api.get<ApiResponse<RevenueStatistics>>('/dashboard/revenue', { params: { months } }),
  getRoomStatus: () =>
    api.get<ApiResponse<RoomStatusDistribution>>('/dashboard/room-status'),
};

// 11. User API (Admin)
export const userApi = {
  getUsers: (params?: { search?: string; page?: number; size?: number }) =>
    api.get<ApiResponse<PageResponse<User>>>('/users', { params }),
  getAll: () =>
    api.get<ApiResponse<User[]>>('/users/all'),
  getById: (id: number) =>
    api.get<ApiResponse<User>>(`/users/${id}`),
  create: (data: any) =>
    api.post<ApiResponse<User>>('/users', data),
  update: (id: number, data: any) =>
    api.put<ApiResponse<User>>(`/users/${id}`, data),
  toggleStatus: (id: number) =>
    api.patch<ApiResponse<void>>(`/users/${id}/toggle-status`),
  delete: (id: number) =>
    api.delete<ApiResponse<void>>(`/users/${id}`),
};

export default api;
