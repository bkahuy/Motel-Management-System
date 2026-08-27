import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { ServiceItem, ServiceRequest } from '../../types';
import { serviceApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface ServiceFormModalProps {
  isOpen: boolean;
  service?: ServiceItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  service,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!service;
  const toast = useToast();

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>(100000);
  const [unit, setUnit] = useState('tháng');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (service) {
      setName(service.name);
      setPrice(service.price);
      setUnit(service.unit);
      setDescription(service.description || '');
      setActive(service.active);
    } else {
      setName('');
      setPrice(100000);
      setUnit('tháng');
      setDescription('');
      setActive(true);
    }
  }, [service, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload: ServiceRequest = {
      name,
      price: Number(price),
      unit,
      description,
      active,
    };

    try {
      if (isEditing) {
        await serviceApi.update(service.id, payload);
        toast.success('Cập nhật dịch vụ thành công');
      } else {
        await serviceApi.create(payload);
        toast.success('Thêm dịch vụ mới thành công');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu dịch vụ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Tên Dịch Vụ <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            placeholder="Ví dụ: WiFi Internet, Vệ sinh rác, Gửi xe..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Đơn Giá (VNĐ) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            required
            min={0}
            step={1000}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            placeholder="100000"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Đơn Vị Tính <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            placeholder="Ví dụ: phòng/tháng, người/tháng, xe/tháng, kWh, khối..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Mô Tả Chi Tiết
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            placeholder="Chi tiết về gói dịch vụ..."
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
          />
          <label htmlFor="active" className="text-xs font-medium text-slate-700 cursor-pointer">
            Kích hoạt dịch vụ này
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
            {isLoading ? 'Đang lưu...' : isEditing ? 'Lưu Thay Đổi' : 'Thêm Dịch Vụ'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
