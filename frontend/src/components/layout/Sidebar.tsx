import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  FileText,
  Gauge,
  Sparkles,
  Receipt,
  CreditCard,
  UserCog,
  User,
  X,
  Home,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role;

  const navigation = [
    {
      name: 'Tổng Quan',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_TENANT'],
    },
    {
      name: 'Hồ Sơ Cá Nhân',
      href: '/profile',
      icon: User,
      roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_TENANT'],
    },
    {
      name: 'Tòa Nhà / Khu Trọ',
      href: '/buildings',
      icon: Building2,
      roles: ['ROLE_ADMIN', 'ROLE_STAFF'],
    },
    {
      name: 'Phòng Trọ',
      href: '/rooms',
      icon: DoorOpen,
      roles: ['ROLE_ADMIN', 'ROLE_STAFF'],
    },
    {
      name: 'Khách Thuê',
      href: '/tenants',
      icon: Users,
      roles: ['ROLE_ADMIN', 'ROLE_STAFF'],
    },
    {
      name: 'Hợp Đồng Thuê',
      href: '/contracts',
      icon: FileText,
      roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_TENANT'],
    },
    {
      name: 'Chỉ Số Điện Nước',
      href: '/meter-readings',
      icon: Gauge,
      roles: ['ROLE_ADMIN', 'ROLE_STAFF'],
    },
    {
      name: 'Dịch Vụ',
      href: '/services',
      icon: Sparkles,
      roles: ['ROLE_ADMIN', 'ROLE_STAFF'],
    },
    {
      name: 'Hóa Đơn',
      href: '/invoices',
      icon: Receipt,
      roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_TENANT'],
    },
    {
      name: 'Lịch Sử Thanh Toán',
      href: '/payments',
      icon: CreditCard,
      roles: ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_TENANT'],
    },
    {
      name: 'Tài Khoản Hệ Thống',
      href: '/users',
      icon: UserCog,
      roles: ['ROLE_ADMIN'],
    },
  ];

  const filteredNav = navigation.filter((item) => role && item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20">
              <Home className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 tracking-tight text-lg">MotelManager</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                PRO EDITION
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 mb-3">
            Menu Quản Trị
          </div>
          <nav className="space-y-1.5">
            {filteredNav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Phiên bản v1.0.0</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Trực tuyến
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
