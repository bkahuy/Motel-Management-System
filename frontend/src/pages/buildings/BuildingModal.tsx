import React, { useEffect, useState } from 'react';
import { buildingApi } from '../../services/api';
import { Building, BuildingRequest } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Modal } from '../../components/common/Modal';

interface BuildingModalProps {
  isOpen: boolean;
  building?: Building | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const BuildingModal: React.FC<BuildingModalProps> = ({
  isOpen,
  building,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!building;
  const toast = useToast();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [totalFloors, setTotalFloors] = useState<number | ''>(1);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (building) {
      setName(building.name);
      setAddress(building.address);
      setTotalFloors(building.totalFloors || 1);
      setDescription(building.description || '');
    } else {
      setName('');
      setAddress('');
      setTotalFloors(1);
      setDescription('');
    }
  }, [building, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload: BuildingRequest = {
      name,
      address,
      totalFloors: totalFloors ? Number(totalFloors) : undefined,
      description,
    };

    try {
      if (isEditing) {
        await buildingApi.update(building.id, payload);
        toast.success('Cập nhật tòa nhà thành công');
      } else {
        await buildingApi.create(payload);
        toast.success('Thêm tòa nhà mới thành công');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Chỉnh Sửa Tòa Nhà' : 'Thêm Tòa Nhà / Khu Trọ Mới'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Tên Tòa Nhà / Khu Trọ <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            placeholder="Ví dụ: Sunshine Tower, Khu Trọ Xanh..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Địa Chỉ <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            placeholder="Ví dụ: Số 123 Đường Cầu Giấy, Cầu Giấy, Hà Nội"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Tổng Số Tầng
          </label>
          <input
            type="number"
            min={1}
            value={totalFloors}
            onChange={(e) => setTotalFloors(e.target.value ? Number(e.target.value) : '')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            placeholder="5"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Mô Tả & Tiện Ích Chung
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            placeholder="Thang máy, camera an ninh, khóa cổng vân tay..."
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
            {isLoading ? 'Đang lưu...' : isEditing ? 'Lưu Thay Đổi' : 'Tạo Mới'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
