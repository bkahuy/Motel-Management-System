import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../common/Badge';
import { Menu, LogOut, KeyRound, ChevronDown, Bell, User } from 'lucide-react';
import { ChangePasswordModal } from '../modal/ChangePasswordModal';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 sm:px-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Hệ Thống Quản Lý
          </span>
          <span className="text-base font-bold text-slate-800">Phòng Trọ & Tòa Nhà</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification bell mock */}
        <button className="relative rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* User profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-slate-100 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-primary-400 text-white font-bold text-sm shadow-sm">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-800">{user?.fullName}</span>
              <span className="text-xs text-slate-500">{user?.email}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-900/5 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-sm font-semibold text-slate-800">{user?.fullName}</p>
                <div className="mt-1">
                  {user?.role && <Badge status={user.role} size="sm" />}
                </div>
              </div>

              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                Hồ sơ cá nhân
              </Link>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setPasswordModalOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <KeyRound className="w-4 h-4 text-slate-400" />
                Đổi mật khẩu
              </button>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>

      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </header>
  );
};
