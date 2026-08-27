import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function getStatusBadge(status: string): { label: string; bg: string; text: string; dot: string } {
  switch (status) {
    case 'AVAILABLE':
      return { label: 'Trống', bg: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20', text: 'text-emerald-700', dot: 'bg-emerald-500' };
    case 'OCCUPIED':
      return { label: 'Đang thuê', bg: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20', text: 'text-amber-700', dot: 'bg-amber-500' };
    case 'MAINTENANCE':
      return { label: 'Bảo trì', bg: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20', text: 'text-rose-700', dot: 'bg-rose-500' };
    case 'ACTIVE':
      return { label: 'Đang hiệu lực', bg: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20', text: 'text-emerald-700', dot: 'bg-emerald-500' };
    case 'EXPIRED':
      return { label: 'Hết hạn', bg: 'bg-slate-100 text-slate-700 ring-1 ring-slate-600/20', text: 'text-slate-700', dot: 'bg-slate-500' };
    case 'TERMINATED':
      return { label: 'Đã thanh lý', bg: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20', text: 'text-rose-700', dot: 'bg-rose-500' };
    case 'PAID':
      return { label: 'Đã thanh toán', bg: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20', text: 'text-emerald-700', dot: 'bg-emerald-500' };
    case 'UNPAID':
      return { label: 'Chưa thanh toán', bg: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20', text: 'text-amber-700', dot: 'bg-amber-500' };
    case 'OVERDUE':
      return { label: 'Quá hạn', bg: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20', text: 'text-rose-700', dot: 'bg-rose-500' };
    case 'ROLE_ADMIN':
      return { label: 'Quản trị viên', bg: 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20', text: 'text-purple-700', dot: 'bg-purple-500' };
    case 'ROLE_STAFF':
      return { label: 'Nhân viên', bg: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20', text: 'text-blue-700', dot: 'bg-blue-500' };
    case 'ROLE_TENANT':
      return { label: 'Khách thuê', bg: 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20', text: 'text-teal-700', dot: 'bg-teal-500' };
    default:
      return { label: status, bg: 'bg-gray-100 text-gray-700 ring-1 ring-gray-600/20', text: 'text-gray-700', dot: 'bg-gray-500' };
  }
}
