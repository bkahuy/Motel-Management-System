import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Home, Lock, User, ArrowRight, Shield, UserCheck, KeyRound } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await authApi.login({ usernameOrEmail, password });
      if (res.data.success) {
        toast.success('Đăng nhập thành công! Chào mừng ' + res.data.data.user.fullName);
        login(res.data.data.token, res.data.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsernameOrEmail(user);
    setPassword(pass);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Decorative blurred glow circles */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl p-8 shadow-2xl ring-1 ring-white/20 sm:p-10">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 mb-4">
              <Home className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Motel Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Hệ thống quản lý phòng trọ & tòa nhà cho thuê
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Tài khoản hoặc Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-sm text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-sm text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-600">Ghi nhớ đăng nhập</span>
              </label>
              <span className="text-xs text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium">
                Quên mật khẩu?
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60 transition-all duration-150"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Đăng nhập hệ thống</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-xs font-semibold text-center uppercase tracking-wider text-slate-400 mb-3">
              Tài Khoản Dùng Thử (1-Click)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@example.com', 'Admin@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 transition-all group"
              >
                <Shield className="w-4 h-4 mb-1 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('staff@example.com', 'Staff@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 transition-all group"
              >
                <UserCheck className="w-4 h-4 mb-1 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Nhân viên</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('tenant1@example.com', 'Tenant@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 transition-all group"
              >
                <KeyRound className="w-4 h-4 mb-1 text-teal-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Khách thuê</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
