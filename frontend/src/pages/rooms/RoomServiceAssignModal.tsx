import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Room, ServiceItem } from '../../types';
import { roomApi, serviceApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils';
import { Sparkles } from 'lucide-react';

interface RoomServiceAssignModalProps {
  isOpen: boolean;
  room: Room | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const RoomServiceAssignModal: React.FC<RoomServiceAssignModalProps> = ({
  isOpen,
  room,
  onClose,
  onSuccess,
}) => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await serviceApi.getAllActive();
        if (res.data.success) {
          setServices(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load services', err);
      }
    };

    if (isOpen) {
      fetchServices();
      setSelectedIds(room?.services ? room.services.map((s) => s.id) : []);
    }
  }, [isOpen, room]);

  const toggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!room) return;
    setIsLoading(true);
    try {
      await roomApi.assignServices(room.id, selectedIds);
      toast.success(`Đã cập nhật dịch vụ cho phòng ${room.roomNumber}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật dịch vụ');
    } finally {
      setIsLoading(false);
    }
  };

  if (!room) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Gán Dịch Vụ - Phòng ${room.roomNumber}`} maxWidth="md">
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          Chọn các gói dịch vụ cố định được áp dụng hàng tháng cho phòng này khi tạo hóa đơn.
        </p>

        <div className="space-y-2 max-h-72 overflow-y-auto p-1">
          {services.map((s) => (
            <label
              key={s.id}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                selectedIds.includes(s.id)
                  ? 'border-indigo-600 bg-indigo-50/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(s.id)}
                  onChange={() => toggle(s.id)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <h5 className="text-sm font-semibold text-slate-800">{s.name}</h5>
                  <p className="text-xs text-slate-400">{s.unit}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-indigo-600">{formatCurrency(s.price)}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
