import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { tenantApi, authApi, contractApi } from '../../services/api';
import { Tenant, TenantRequest, Contract } from '../../types';
import { formatCurrency, formatDate } from '../../utils';
import { Badge } from '../../components/common/Badge';
import {
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Briefcase,
  Calendar,
  DoorOpen,
  Building2,
  Lock,
  Save,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Receipt,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const isTenant = user?.role === 'ROLE_TENANT';

  // Profile Form State
  const [profile, setProfile] = useState<Tenant | null>(null);
  const [fullName, setFullName] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Nam');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');

  // Active Contract State
  const [contract, setContract] = useState<Contract | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const fetchProfileData = async () => {
    setIsLoadingProfile(true);
    try {
      const res = await tenantApi.getMyProfile();
      if (res.data.success && res.data.data) {
        const data = res.data.data;
        setProfile(data);
        setFullName(data.fullName || user?.fullName || '');
        setIdentityNumber(data.identityNumber || '');
        setPhone(data.phone || user?.phone || '');
        setEmail(data.email || user?.email || '');
        setDateOfBirth(data.dateOfBirth || '');
        setGender(data.gender || 'Nam');
        setAddress(data.address || '');
        setOccupation(data.occupation || '');

        // If tenant has current contract ID, fetch contract details
        if (data.currentContractId) {
          try {
            const cRes = await contractApi.getById(data.currentContractId);
            if (cRes.data.success) {
              setContract(cRes.data.data);
            }
          } catch {
            // Ignore if contract detail not accessible
          }
        }
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !identityNumber.trim() || !phone.trim()) {
      toast.error('Vui lòng điền họ tên, số CCCD và số điện thoại');
      return;
    }

    setIsSavingProfile(true);
    const payload: TenantRequest = {
      fullName,
      identityNumber,
      phone,
      email: email || undefined,
      dateOfBirth: dateOfBirth || undefined,
      gender,
      address: address || undefined,
      occupation: occupation || undefined,
    };

    try {
      const res = await tenantApi.updateMyProfile(payload);
      if (res.data.success) {
        toast.success('Cập nhật hồ sơ thông tin cá nhân thành công!');
        setProfile(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật thông tin cá nhân');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Xác nhận mật khẩu mới không khớp');
      return;
    }

    setIsSavingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Mật khẩu hiện tại không đúng');
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="h-36 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white font-extrabold text-2xl sm:text-3xl border border-white/30 shadow-inner">
              {fullName ? fullName.charAt(0).toUpperCase() : user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold">{fullName || user?.fullName}</h1>
                <Badge status={user?.role || 'ROLE_TENANT'} />
              </div>
              <p className="text-xs sm:text-sm text-indigo-100 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {email || user?.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {phone || user?.phone || 'Chưa cập nhật SĐT'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal Information Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isTenant ? 'Thông Tin Khách Thuê' : 'Thông Tin Cá Nhân'}
                </h2>
                <p className="text-xs text-slate-500">
                  Cập nhật thông tin định danh CCCD/CMND và thông tin liên hệ của bạn.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Họ Và Tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Số CMND / CCCD <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={identityNumber}
                    onChange={(e) => setIdentityNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono font-medium"
                    placeholder="001200001234"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Số Điện Thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                    placeholder="0987654321"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Địa Chỉ Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                    placeholder="khachthue@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Ngày Sinh
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Giới Tính
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white font-medium"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Nghề Nghiệp / Đơn Vị Công Tác
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                  placeholder="Kỹ sư phần mềm, Sinh viên ĐH Bách Khoa..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Hộ Khẩu Thường Trú / Quê Quán
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                  placeholder="Thôn/Xã, Quận/Huyện, Tỉnh/TP..."
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all"
                >
                  <Save className="w-4 h-4" />
                  {isSavingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Rental Room Info & Security */}
        <div className="space-y-6">
          {/* Active Rental Card */}
          {profile?.currentRoomNumber ? (
            <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6 overflow-hidden relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
                  <DoorOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Phòng Đang Thuê
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Phòng {profile.currentRoomNumber}
                  </h3>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2 text-slate-600">
                  <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Khu trọ: <b className="text-slate-800">{profile.currentBuildingName}</b></span>
                </div>

                {contract && (
                  <>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-500">Giá thuê thỏa thuận:</span>
                      <span className="font-bold text-indigo-600 text-sm">
                        {formatCurrency(contract.rentPrice)}/tháng
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-500">Tiền đặt cọc:</span>
                      <span className="font-bold text-slate-800">
                        {formatCurrency(contract.deposit)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-500">Thời hạn:</span>
                      <span className="font-medium text-slate-700">
                        {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-500">Mã hợp đồng:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {contract.contractCode}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to="/invoices"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  Xem hóa đơn tiền phòng
                </Link>
                <Link
                  to="/contracts"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Chi tiết hợp đồng
                </Link>
              </div>
            </div>
          ) : isTenant ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-center text-slate-500 space-y-2">
              <DoorOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">Chưa Có Hợp Đồng Thuê</h4>
              <p className="text-xs text-slate-400">
                Bạn hiện chưa có phòng trọ nào đang thuê trong hệ thống.
              </p>
            </div>
          ) : null}

          {/* Change Password Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Bảo Mật & Mật Khẩu</h3>
                <p className="text-xs text-slate-400">Thay đổi mật khẩu đăng nhập tài khoản</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Mật Khẩu Hiện Tại <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Mật Khẩu Mới <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Xác Nhận Mật Khẩu Mới <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 disabled:opacity-50 transition-all"
                >
                  {isSavingPassword ? 'Đang cập nhật...' : 'Đổi Mật Khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
