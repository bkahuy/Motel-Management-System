import React, { useEffect, useState } from 'react';
import { buildingApi, roomApi, serviceApi } from '../../services/api';
import { Building, Room, RoomRequest, RoomStatus, ServiceItem } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { Modal } from '../../components/common/Modal';

interface RoomFormModalProps {
  isOpen: boolean;
  room?: Room | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const RoomFormModal: React.FC<RoomFormModalProps> = ({
  isOpen,
  room,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!room;
  const toast = useToast();

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);

  const [buildingId, setBuildingId] = useState<number | ''>('');
  const [roomNumber, setRoomNumber] = useState('');
  const [price, setPrice] = useState<number | ''>(3000000);
  const [area, setArea] = useState<number | ''>(25);
  const [maxOccupants, setMaxOccupants] = useState<number | ''>(2);
  const [deposit, setDeposit] = useState<number | ''>(3000000);
  const [status, setStatus] = useState<RoomStatus>('AVAILABLE');
  const [description, setDescription] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, sRes] = await Promise.all([
          buildingApi.getAll(),
          serviceApi.getAllActive(),
        ]);
        if (bRes.data.success) setBuildings(bRes.data.data);
        if (sRes.data.success) setServices(sRes.data.data);
      } catch (err) {
        console.error('Failed to load buildings or services', err);
      }
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (room) {
      setBuildingId(room.buildingId);
      setRoomNumber(room.roomNumber);
      setPrice(room.price);
      setArea(room.area);
      setMaxOccupants(room.maxOccupants);
      setDeposit(room.deposit);
      setStatus(room.status);
      setDescription(room.description || '');
      setSelectedServiceIds(room.services ? room.services.map((s) => s.id) : []);
    } else {
      setBuildingId(buildings.length > 0 ? buildings[0].id : '');
      setRoomNumber('');
      setPrice(3000000);
      setArea(25);
      setMaxOccupants(2);
      setDeposit(3000000);
      setStatus('AVAILABLE');
      setDescription('');
      setSelectedServiceIds([]);
    }
  }, [room, isOpen, buildings]);

  const toggleService = (id: number) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildingId) {
      toast.error('Vui lòng chọn tòa nhà');
      return;
    }

    setIsLoading(true);
    const payload: RoomRequest = {
      buildingId: Number(buildingId),
      roomNumber,
      price: Number(price),
      area: Number(area),
      maxOccupants: Number(maxOccupants),
      deposit: Number(deposit),
      status,
      description,
      serviceIds: selectedServiceIds,
    };

    try {
      if (isEditing) {
        await roomApi.update(room.id, payload);
        toast.success('Cập nhật phòng thành công');
      } else {
        await roomApi.create(payload);
        toast.success('Tạo phòng mới thành công');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu phòng');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Chỉnh Sửa Phòng ${room.roomNumber}` : 'Thêm Phòng Mới'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Thuộc Tòa Nhà / Khu Trọ <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={buildingId}
              onChange={(e) => setBuildingId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
            >
              <option value="">-- Chọn tòa nhà --</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.address})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Số Phòng <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="Ví dụ: P101, P202, A301..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Giá Thuê (VNĐ / Tháng) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min={0}
              step={50000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="3500000"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Tiền Cọc (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min={0}
              step={50000}
              value={deposit}
              onChange={(e) => setDeposit(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="3500000"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Diện Tích (m²) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              step={0.5}
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="25"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Số Người Tối Đa
            </label>
            <input
              type="number"
              min={1}
              value={maxOccupants}
              onChange={(e) => setMaxOccupants(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Trạng Thái Ban Đầu
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RoomStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
            >
              <option value="AVAILABLE">Trống (AVAILABLE)</option>
              <option value="OCCUPIED">Đang thuê (OCCUPIED)</option>
              <option value="MAINTENANCE">Bảo trì (MAINTENANCE)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Mô Tả & Nội Thất Đi Kèm
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            placeholder="Điều hòa, nóng lạnh, giường tủ, ban công..."
          />
        </div>

        {/* Services Checkboxes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            Gói Dịch Vụ Áp Dụng Cho Phòng
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-36 overflow-y-auto p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            {services.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200/80 cursor-pointer hover:border-indigo-300 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedServiceIds.includes(s.id)}
                  onChange={() => toggleService(s.id)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800">{s.name}</span>
                </div>
              </label>
            ))}
          </div>
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
            {isLoading ? 'Đang lưu...' : isEditing ? 'Lưu Thay Đổi' : 'Tạo Phòng'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
