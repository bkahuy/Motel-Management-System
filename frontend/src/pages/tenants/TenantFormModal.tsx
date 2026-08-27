import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Tenant, TenantRequest } from '../../types';
import { tenantApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface TenantFormModalProps {
  isOpen: boolean;
  tenant?: Tenant | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const TenantFormModal: React.FC<TenantFormModalProps> = ({
  isOpen,
  tenant,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!tenant;
  const toast = useToast();

  const [fullName, setFullName] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Nam');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tenant) {
      setFullName(tenant.fullName);
      setIdentityNumber(tenant.identityNumber);
      setPhone(tenant.phone);
      setEmail(tenant.email || '');
      setDateOfBirth(tenant.dateOfBirth || '');
      setGender(tenant.gender || 'Nam');
      setAddress(tenant.address || '');
      setOccupation(tenant.occupation || '');
    } else {
      setFullName('');
      setIdentityNumber('');
      setPhone('');
      setEmail('');
      setDateOfBirth('');
      setGender('Nam');
      setAddress('');
      setOccupation('');
    }
  }, [tenant, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
      if (isEditing) {
        await tenantApi.update(tenant.id, payload);
        toast.success('Cập nhật thông tin khách thuê thành công');
      } else {
        await tenantApi.create(payload);
        toast.success('Thêm khách thuê mới thành công');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu thông tin khách thuê');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Chỉnh Sửa Khách Thuê' : 'Thêm Khách Thuê Mới'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="0987654321"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="tenant@example.com"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
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
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            placeholder="Kỹ sư phần mềm, Sinh viên ĐH Bách Khoa..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Địa Chỉ Thường Trú (Quê Quán)
          </label>
          <textarea
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            placeholder="Xã/Phường, Huyện/Quận, Tỉnh/TP..."
          />
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
            {isLoading ? 'Đang lưu...' : isEditing ? 'Lưu Thay Đổi' : 'Thêm Khách Thuê'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
