import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { RoleName, User } from '../../types';
import { userApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface UserFormModalProps {
  isOpen: boolean;
  user?: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!user;
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<RoleName>('ROLE_STAFF');
  const [active, setActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setPassword('');
      setFullName(user.fullName);
      setPhone(user.phone || '');
      setRole(user.role);
      setActive(user.active);
    } else {
      setUsername('');
      setEmail('');
      setPassword('');
      setFullName('');
      setPhone('');
      setRole('ROLE_STAFF');
      setActive(true);
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing) {
        await userApi.update(user.id, {
          email,
          fullName,
          phone,
          password: password || undefined,
          role,
          active,
        });
        toast.success('Cập nhật tài khoản người dùng thành công');
      } else {
        await userApi.create({
          username,
          email,
          password,
          fullName,
          phone,
          role,
          active,
        });
        toast.success('Tạo tài khoản người dùng mới thành công');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu tài khoản');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Chỉnh Sửa Tài Khoản ${user.username}` : 'Thêm Tài Khoản Mới'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEditing && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Tên Đăng Nhập <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="nhanvien1"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            placeholder="nhanvien@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            {isEditing ? 'Mật Khẩu Mới (Để trống nếu không đổi)' : 'Mật Khẩu Khởi Tạo'} {!isEditing && <span className="text-rose-500">*</span>}
          </label>
          <input
            type="password"
            required={!isEditing}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            placeholder={isEditing ? '••••••••' : 'Tối thiểu 6 ký tự'}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Họ Và Tên <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            placeholder="Nguyễn Văn A"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Số Điện Thoại
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            placeholder="0987654321"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Phân Quyền Vai Trò (Role) <span className="text-rose-500">*</span>
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as RoleName)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
          >
            <option value="ROLE_STAFF">Nhân Viên Quản Lý (ROLE_STAFF)</option>
            <option value="ROLE_ADMIN">Quản Trị Viên Toàn Quyền (ROLE_ADMIN)</option>
            <option value="ROLE_TENANT">Khách Thuê (ROLE_TENANT)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="userActive"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
          />
          <label htmlFor="userActive" className="text-xs font-medium text-slate-700 cursor-pointer">
            Kích hoạt tài khoản này
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Đang lưu...' : isEditing ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
