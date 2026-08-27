import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Contract, ContractRequest, PaymentCycle, Room, Tenant } from '../../types';
import { contractApi, roomApi, tenantApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils';
import { TenantFormModal } from '../tenants/TenantFormModal';
import { Plus } from 'lucide-react';

interface ContractFormModalProps {
  isOpen: boolean;
  contract?: Contract | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ContractFormModal: React.FC<ContractFormModalProps> = ({
  isOpen,
  contract,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!contract;
  const toast = useToast();

  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const [roomId, setRoomId] = useState<number | ''>('');
  const [tenantId, setTenantId] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rentPrice, setRentPrice] = useState<number | ''>(3500000);
  const [deposit, setDeposit] = useState<number | ''>(3500000);
  const [paymentCycle, setPaymentCycle] = useState<PaymentCycle>('MONTHLY');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Quick Add Tenant Modal
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);

  const fetchTenants = async () => {
    try {
      const res = await tenantApi.getAll();
      if (res.data.success) {
        setTenants(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load tenants', err);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const res = await roomApi.getAvailable();
      if (res.data.success) {
        setAvailableRooms(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load available rooms', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAvailableRooms();
      fetchTenants();
    }
  }, [isOpen]);

  useEffect(() => {
    if (contract) {
      setRoomId(contract.roomId);
      setTenantId(contract.tenantId);
      setStartDate(contract.startDate);
      setEndDate(contract.endDate);
      setRentPrice(contract.rentPrice);
      setDeposit(contract.deposit);
      setPaymentCycle(contract.paymentCycle);
      setNotes(contract.notes || '');
    } else {
      setRoomId('');
      setTenantId('');
      const today = new Date().toISOString().split('T')[0];
      const oneYearLater = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split('T')[0];
      setStartDate(today);
      setEndDate(oneYearLater);
      setRentPrice(3500000);
      setDeposit(3500000);
      setPaymentCycle('MONTHLY');
      setNotes('');
    }
  }, [contract, isOpen]);

  // When room is selected, auto fill rent price and deposit from room default
  const handleRoomChange = (selectedId: number) => {
    setRoomId(selectedId);
    const room = availableRooms.find((r) => r.id === selectedId);
    if (room) {
      setRentPrice(room.price);
      setDeposit(room.deposit || room.price);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !tenantId) {
      toast.error('Vui lòng chọn phòng và khách thuê');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('Ngày kết thúc hợp đồng phải sau ngày bắt đầu');
      return;
    }

    setIsLoading(true);
    const payload: ContractRequest = {
      roomId: Number(roomId),
      tenantId: Number(tenantId),
      startDate,
      endDate,
      rentPrice: Number(rentPrice),
      deposit: Number(deposit),
      paymentCycle,
      notes,
    };

    try {
      if (isEditing) {
        await contractApi.update(contract.id, payload);
        toast.success('Cập nhật hợp đồng thành công');
      } else {
        await contractApi.create(payload);
        toast.success('Tạo hợp đồng thuê mới thành công! Phòng đã chuyển sang Đang Thuê.');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu hợp đồng');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditing ? `Chỉnh Sửa Hợp Đồng ${contract.contractCode}` : 'Tạo Hợp Đồng Thuê Phòng Mới'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Chọn Phòng Trống <span className="text-rose-500">*</span>
              </label>
              <select
                required
                disabled={isEditing}
                value={roomId}
                onChange={(e) => handleRoomChange(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white disabled:bg-slate-100"
              >
                <option value="">-- Chọn phòng khả dụng --</option>
                {isEditing && contract && (
                  <option value={contract.roomId}>
                    Phòng {contract.roomNumber} ({contract.buildingName})
                  </option>
                )}
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Phòng {r.roomNumber} - {r.buildingName} ({formatCurrency(r.price)}/tháng)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Chọn Khách Thuê <span className="text-rose-500">*</span>
                </label>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsTenantModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm Khách
                  </button>
                )}
              </div>
              <select
                required
                disabled={isEditing}
                value={tenantId}
                onChange={(e) => setTenantId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white disabled:bg-slate-100"
              >
                <option value="">-- Chọn khách thuê --</option>
                {isEditing && contract && (
                  <option value={contract.tenantId}>{contract.tenantName}</option>
                )}
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} (SĐT: {t.phone} - CCCD: {t.identityNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Ngày Bắt Đầu Thuê <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Ngày Kết Thúc Hợp Đồng <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Giá Thuê Thỏa Thuận (VNĐ/Tháng) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                step={50000}
                value={rentPrice}
                onChange={(e) => setRentPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Tiền Đặt Cọc (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                step={50000}
                value={deposit}
                onChange={(e) => setDeposit(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Kỳ Thanh Toán
              </label>
              <select
                value={paymentCycle}
                onChange={(e) => setPaymentCycle(e.target.value as PaymentCycle)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
              >
                <option value="MONTHLY">Hàng tháng (MONTHLY)</option>
                <option value="QUARTERLY">Hàng quý (3 tháng/lần)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Ghi Chú & Điều Khoản Đặc Biệt
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="Đóng tiền từ ngày 1 đến ngày 5 hàng tháng, cam kết ở tối thiểu..."
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
              {isLoading ? 'Đang tạo hợp đồng...' : isEditing ? 'Lưu Thay Đổi' : 'Ký & Kích Hoạt Hợp Đồng'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Add Tenant Modal */}
      <TenantFormModal
        isOpen={isTenantModalOpen}
        onClose={() => setIsTenantModalOpen(false)}
        onSuccess={() => {
          setIsTenantModalOpen(false);
          fetchTenants();
        }}
      />
    </>
  );
};
