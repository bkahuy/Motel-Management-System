// Roles
export type RoleName = 'ROLE_ADMIN' | 'ROLE_STAFF' | 'ROLE_TENANT';

// Enums
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
export type ContractStatus = 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
export type PaymentCycle = 'MONTHLY' | 'QUARTERLY';
export type InvoiceStatus = 'UNPAID' | 'PAID' | 'OVERDUE';
export type InvoiceItemType = 'ROOM_FEE' | 'ELECTRICITY' | 'WATER' | 'SERVICE' | 'OTHER';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER';
export type PaymentStatus = 'COMPLETED' | 'PENDING' | 'FAILED';

// Generic API Responses
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// User & Auth
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  role: RoleName;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}

// Building
export interface Building {
  id: number;
  name: string;
  address: string;
  description?: string;
  totalFloors?: number;
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BuildingRequest {
  name: string;
  address: string;
  description?: string;
  totalFloors?: number;
}

// Service
export interface ServiceItem {
  id: number;
  name: string;
  price: number;
  unit: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceRequest {
  name: string;
  price: number;
  unit: string;
  description?: string;
  active?: boolean;
}

// Room
export interface Room {
  id: number;
  buildingId: number;
  buildingName: string;
  roomNumber: string;
  price: number;
  area: number;
  maxOccupants: number;
  deposit: number;
  status: RoomStatus;
  description?: string;
  services: ServiceItem[];
  currentTenantName?: string;
  currentTenantPhone?: string;
  currentContractId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface RoomRequest {
  buildingId: number;
  roomNumber: string;
  price: number;
  area: number;
  maxOccupants: number;
  deposit: number;
  status?: RoomStatus;
  description?: string;
  serviceIds?: number[];
}

// Tenant
export interface Tenant {
  id: number;
  fullName: string;
  identityNumber: string;
  dateOfBirth?: string;
  gender?: string;
  phone: string;
  email?: string;
  address?: string;
  occupation?: string;
  userId?: number;
  username?: string;
  currentRoomId?: number;
  currentRoomNumber?: string;
  currentBuildingName?: string;
  currentContractId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TenantRequest {
  fullName: string;
  identityNumber: string;
  dateOfBirth?: string;
  gender?: string;
  phone: string;
  email?: string;
  address?: string;
  occupation?: string;
  userId?: number;
}

// Contract
export interface Contract {
  id: number;
  contractCode: string;
  roomId: number;
  roomNumber: string;
  buildingId: number;
  buildingName: string;
  tenantId: number;
  tenantName: string;
  tenantPhone: string;
  tenantIdentityNumber: string;
  startDate: string;
  endDate: string;
  rentPrice: number;
  deposit: number;
  paymentCycle: PaymentCycle;
  status: ContractStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ContractRequest {
  roomId: number;
  tenantId: number;
  startDate: string;
  endDate: string;
  rentPrice: number;
  deposit: number;
  paymentCycle: PaymentCycle;
  notes?: string;
}

// Meter Reading
export interface MeterReading {
  id: number;
  contractId: number;
  contractCode: string;
  roomId: number;
  roomNumber: string;
  buildingName: string;
  tenantName: string;
  readingMonth: string;
  electricityPrevious: number;
  electricityCurrent: number;
  electricityUsage: number;
  waterPrevious: number;
  waterCurrent: number;
  waterUsage: number;
  readingDate: string;
  notes?: string;
  createdAt: string;
}

export interface MeterReadingRequest {
  contractId: number;
  readingMonth: string;
  electricityPrevious: number;
  electricityCurrent: number;
  waterPrevious: number;
  waterCurrent: number;
  readingDate: string;
  notes?: string;
}

// Invoice & InvoiceItem
export interface InvoiceItem {
  id: number;
  itemType: InvoiceItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: number;
  invoiceCode: string;
  contractId: number;
  contractCode: string;
  roomId: number;
  roomNumber: string;
  buildingName: string;
  tenantId: number;
  tenantName: string;
  tenantPhone: string;
  billingMonth: string;
  roomFee: number;
  electricityFee: number;
  waterFee: number;
  serviceFee: number;
  otherFee: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: InvoiceStatus;
  notes?: string;
  items?: InvoiceItem[];
  payments?: Payment[];
  createdAt: string;
  updatedAt?: string;
}

export interface InvoiceCalculateRequest {
  contractId: number;
  billingMonth: string;
  electricityUnitPrice?: number;
  waterUnitPrice?: number;
  otherFee?: number;
}

export interface InvoiceCalculateResponse {
  contractId: number;
  contractCode: string;
  roomNumber: string;
  tenantName: string;
  billingMonth: string;
  roomFee: number;
  electricityPrevious: number;
  electricityCurrent: number;
  electricityUsage: number;
  electricityUnitPrice: number;
  electricityFee: number;
  waterPrevious: number;
  waterCurrent: number;
  waterUsage: number;
  waterUnitPrice: number;
  waterFee: number;
  serviceFee: number;
  serviceItems: InvoiceItem[];
  otherFee: number;
  totalAmount: number;
}

export interface InvoiceCreateRequest {
  contractId: number;
  billingMonth: string;
  dueDate: string;
  electricityUnitPrice?: number;
  waterUnitPrice?: number;
  otherFee?: number;
  otherFeeDescription?: string;
  notes?: string;
}

// Payment
export interface Payment {
  id: number;
  invoiceId: number;
  invoiceCode: string;
  roomNumber?: string;
  tenantName?: string;
  billingMonth?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  transactionCode?: string;
  status: PaymentStatus;
  notes?: string;
  createdAt: string;
}

export interface PaymentRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate?: string;
  transactionCode?: string;
  notes?: string;
}

// Dashboard
export interface DashboardStatistics {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  totalTenants: number;
  activeContracts: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  monthlyRevenue: number;
  totalUnpaidAmount: number;
  recentInvoices: Invoice[];
  unpaidInvoiceList: Invoice[];
}

export interface MonthlyRevenueItem {
  month: string;
  monthLabel: string;
  revenue: number;
  invoiceCount: number;
}

export interface RevenueStatistics {
  items: MonthlyRevenueItem[];
  totalRevenue: number;
}

export interface RoomStatusDistribution {
  distribution: {
    status: string;
    statusLabel: string;
    count: number;
    percentage: number;
    color: string;
  }[];
}
