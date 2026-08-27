import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Contract, MeterReading, MeterReadingRequest } from '../../types';
import { contractApi, meterReadingApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Zap, Droplets, ArrowRight } from 'lucide-react';

interface MeterReadingFormModalProps {
  isOpen: boolean;
  reading?: MeterReading | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const MeterReadingFormModal: React.FC<MeterReadingFormModalProps> = ({
  isOpen,
  reading,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!reading;
  const toast = useToast();

  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);

  const [contractId, setContractId] = useState<number | ''>('');
  const [readingMonth, setReadingMonth] = useState('');
  const [readingDate, setReadingDate] = useState('');
  const [electricityPrevious, setElectricityPrevious] = useState<number | ''>(0);
  const [electricityCurrent, setElectricityCurrent] = useState<number | ''>(0);
  const [waterPrevious, setWaterPrevious] = useState<number | ''>(0);
  const [waterCurrent, setWaterCurrent] = useState<number | ''>(0);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await contractApi.getActive();
        if (res.data.success) {
          setActiveContracts(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load active contracts', err);
      }
    };
    if (isOpen) fetchContracts();
  }, [isOpen]);

  useEffect(() => {
    if (reading) {
      setContractId(reading.contractId);
      setReadingMonth(reading.readingMonth);
      setReadingDate(reading.readingDate);
      setElectricityPrevious(reading.electricityPrevious);
      setElectricityCurrent(reading.electricityCurrent);
      setWaterPrevious(reading.waterPrevious);
      setWaterCurrent(reading.waterCurrent);
      setNotes(reading.notes || '');
    } else {
      setContractId('');
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      const today = new Date().toISOString().split('T')[0];
      setReadingMonth(currentMonth);
      setReadingDate(today);
      setElectricityPrevious(0);
      setElectricityCurrent(0);
      setWaterPrevious(0);
      setWaterCurrent(0);
      setNotes('');
    }
  }, [reading, isOpen]);

  // Auto fetch previous readings when contract changes
  const handleContractChange = async (selectedContractId: number) => {
    setContractId(selectedContractId);
    try {
      const res = await meterReadingApi.getLatest(selectedContractId);
      if (res.data.success && res.data.data) {
        const latest = res.data.data;
        setElectricityPrevious(latest.electricityCurrent);
        setElectricityCurrent(latest.electricityCurrent);
        setWaterPrevious(latest.waterCurrent);
        setWaterCurrent(latest.waterCurrent);
      }
    } catch {
      // Ignore if no previous reading exists
    }
  };

  // Real-time usage calculations
  const elecUsage =
    typeof electricityCurrent === 'number' && typeof electricityPrevious === 'number'
      ? Math.max(0, electricityCurrent - electricityPrevious)
      : 0;

  const waterUsage =
    typeof waterCurrent === 'number' && typeof waterPrevious === 'number'
      ? Math.max(0, waterCurrent - waterPrevious)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId) {
      toast.error('Vui lòng chọn phòng / hợp đồng');
      return;
    }

    if (Number(electricityCurrent) < Number(electricityPrevious)) {
      toast.error('Chỉ số điện mới không được nhỏ hơn chỉ số điện cũ');
      return;
    }

    if (Number(waterCurrent) < Number(waterPrevious)) {
      toast.error('Chỉ số nước mới không được nhỏ hơn chỉ số nước cũ');
      return;
    }

    setIsLoading(true);
    const payload: MeterReadingRequest = {
      contractId: Number(contractId),
      readingMonth,
      readingDate,
      electricityPrevious: Number(electricityPrevious),
      electricityCurrent: Number(electricityCurrent),
      waterPrevious: Number(waterPrevious),
      waterCurrent: Number(waterCurrent),
      notes,
    };

    try {
      if (isEditing) {
        await meterReadingApi.update(reading.id, payload);
        toast.success('Cập nhật chỉ số điện nước thành công');
      } else {
        await meterReadingApi.create(payload);
        toast.success('Ghi nhận chỉ số điện nước thành công');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi lưu chỉ số');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Chỉnh Sửa Chỉ Số Điện Nước' : 'Ghi Chỉ Số Điện Nước Hàng Tháng'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Chọn Hợp Đồng / Phòng Đang Thuê <span className="text-rose-500">*</span>
            </label>
            <select
              required
              disabled={isEditing}
              value={contractId}
              onChange={(e) => handleContractChange(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white disabled:bg-slate-100"
            >
              <option value="">-- Chọn phòng cần ghi chỉ số --</option>
              {isEditing && reading && (
                <option value={reading.contractId}>
                  Phòng {reading.roomNumber} ({reading.buildingName}) - {reading.tenantName}
                </option>
              )}
              {activeContracts.map((c) => (
                <option key={c.id} value={c.id}>
                  Phòng {c.roomNumber} ({c.buildingName}) - Khách: {c.tenantName} ({c.contractCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Tháng Ghi Chỉ Số (YYYY-MM) <span className="text-rose-500">*</span>
            </label>
            <input
              type="month"
              required
              disabled={isEditing}
              value={readingMonth}
              onChange={(e) => setReadingMonth(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Ngày Ghi Số <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={readingDate}
              onChange={(e) => setReadingDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
            />
          </div>
        </div>

        {/* Electricity Section */}
        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Zap className="w-4 h-4 text-amber-600" />
              Chỉ Số Điện (kWh)
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-lg">
              <span>Tiêu thụ:</span>
              <span className="text-sm">{elecUsage} kWh</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Số điện cũ (kWh)
              </label>
              <input
                type="number"
                min={0}
                required
                value={electricityPrevious}
                onChange={(e) => setElectricityPrevious(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Số điện mới (kWh)
              </label>
              <input
                type="number"
                min={0}
                required
                value={electricityCurrent}
                onChange={(e) => setElectricityCurrent(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Water Section */}
        <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
              <Droplets className="w-4 h-4 text-blue-600" />
              Chỉ Số Nước (m³ / Khối)
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-lg">
              <span>Tiêu thụ:</span>
              <span className="text-sm">{waterUsage} m³</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Số nước cũ (m³)
              </label>
              <input
                type="number"
                min={0}
                required
                value={waterPrevious}
                onChange={(e) => setWaterPrevious(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Số nước mới (m³)
              </label>
              <input
                type="number"
                min={0}
                required
                value={waterCurrent}
                onChange={(e) => setWaterCurrent(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Ghi Chú
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            placeholder="Chỉ số công tơ chính xác ngày..."
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
            {isLoading ? 'Đang lưu...' : isEditing ? 'Lưu Thay Đổi' : 'Lưu Chỉ Số'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
