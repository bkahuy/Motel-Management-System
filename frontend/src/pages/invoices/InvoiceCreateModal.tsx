import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Contract, InvoiceCalculateResponse, InvoiceCreateRequest } from '../../types';
import { contractApi, invoiceApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils';
import { Calculator, Receipt, Zap, Droplets, Sparkles, AlertCircle } from 'lucide-react';

interface InvoiceCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InvoiceCreateModal: React.FC<InvoiceCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();

  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);
  const [contractId, setContractId] = useState<number | ''>('');
  const [billingMonth, setBillingMonth] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [electricityUnitPrice, setElectricityUnitPrice] = useState<number | ''>(3500);
  const [waterUnitPrice, setWaterUnitPrice] = useState<number | ''>(25000);
  const [otherFee, setOtherFee] = useState<number | ''>(0);
  const [otherFeeDescription, setOtherFeeDescription] = useState('');
  const [notes, setNotes] = useState('');

  // Preview breakdown
  const [preview, setPreview] = useState<InvoiceCalculateResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
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
    if (isOpen) {
      fetchContracts();
      const currentMonth = new Date().toISOString().substring(0, 7);
      setBillingMonth(currentMonth);
      // Default due date: 10th of this month or 10 days from now
      const next10Days = new Date();
      next10Days.setDate(next10Days.getDate() + 10);
      setDueDate(next10Days.toISOString().split('T')[0]);
      setElectricityUnitPrice(3500);
      setWaterUnitPrice(25000);
      setOtherFee(0);
      setOtherFeeDescription('');
      setNotes('');
      setPreview(null);
    }
  }, [isOpen]);

  // Trigger preview calculation
  useEffect(() => {
    const calc = async () => {
      if (!contractId || !billingMonth) {
        setPreview(null);
        return;
      }
      setIsCalculating(true);
      try {
        const res = await invoiceApi.calculatePreview({
          contractId: Number(contractId),
          billingMonth,
          electricityUnitPrice: electricityUnitPrice ? Number(electricityUnitPrice) : undefined,
          waterUnitPrice: waterUnitPrice ? Number(waterUnitPrice) : undefined,
          otherFee: otherFee ? Number(otherFee) : 0,
        });
        if (res.data.success) {
          setPreview(res.data.data);
        }
      } catch (err) {
        console.error('Failed to calculate invoice preview', err);
      } finally {
        setIsCalculating(false);
      }
    };

    calc();
  }, [contractId, billingMonth, electricityUnitPrice, waterUnitPrice, otherFee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId || !billingMonth || !dueDate) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    setIsLoading(true);
    const payload: InvoiceCreateRequest = {
      contractId: Number(contractId),
      billingMonth,
      dueDate,
      electricityUnitPrice: electricityUnitPrice ? Number(electricityUnitPrice) : undefined,
      waterUnitPrice: waterUnitPrice ? Number(waterUnitPrice) : undefined,
      otherFee: otherFee ? Number(otherFee) : 0,
      otherFeeDescription: otherFeeDescription || undefined,
      notes,
    };

    try {
      const res = await invoiceApi.create(payload);
      if (res.data.success) {
        toast.success(`Đã tạo hóa đơn ${res.data.data.invoiceCode} thành công!`);
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo hóa đơn');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lập Hóa Đơn Tiền Phòng Mới" maxWidth="3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Chọn Phòng / Khách Thuê <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={contractId}
              onChange={(e) => setContractId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
            >
              <option value="">-- Chọn phòng cần lập hóa đơn --</option>
              {activeContracts.map((c) => (
                <option key={c.id} value={c.id}>
                  Phòng {c.roomNumber} ({c.buildingName}) - Khách: {c.tenantName} ({formatCurrency(c.rentPrice)}/tháng)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Tháng Thu Tiền (YYYY-MM) <span className="text-rose-500">*</span>
            </label>
            <input
              type="month"
              required
              value={billingMonth}
              onChange={(e) => setBillingMonth(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Hạn Đóng Tiền <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Đơn Giá Điện (VNĐ/kWh)
            </label>
            <input
              type="number"
              min={0}
              step={100}
              value={electricityUnitPrice}
              onChange={(e) => setElectricityUnitPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Đơn Giá Nước (VNĐ/m³)
            </label>
            <input
              type="number"
              min={0}
              step={500}
              value={waterUnitPrice}
              onChange={(e) => setWaterUnitPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Phụ Phí / Giảm Trừ (VNĐ)
            </label>
            <input
              type="number"
              step={10000}
              value={otherFee}
              onChange={(e) => setOtherFee(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="0 (hoặc số âm nếu giảm giá)"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Nội Dung Phụ Phí
            </label>
            <input
              type="text"
              value={otherFeeDescription}
              onChange={(e) => setOtherFeeDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="Hỏng hóc bóng đèn, khuyến mãi..."
            />
          </div>
        </div>

        {/* Live Calculation Preview Card */}
        {contractId && preview && (
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <Calculator className="w-4 h-4 text-indigo-600" />
                Bảng Tính Chi Phí Dự Kiến (Preview)
              </div>
              <span className="text-xs text-indigo-600 font-semibold">
                Tháng {preview.billingMonth}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100/60">
                <span>Tiền thuê phòng:</span>
                <span className="font-bold text-slate-900">{formatCurrency(preview.roomFee)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100/60">
                <span>
                  Tiền điện ({preview.electricityUsage} kWh x {formatCurrency(preview.electricityUnitPrice)}):
                </span>
                <span className="font-bold text-amber-700">{formatCurrency(preview.electricityFee)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100/60">
                <span>
                  Tiền nước ({preview.waterUsage} m³ x {formatCurrency(preview.waterUnitPrice)}):
                </span>
                <span className="font-bold text-blue-700">{formatCurrency(preview.waterFee)}</span>
              </div>

              {preview.serviceItems?.map((s, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-slate-100/60">
                  <span>Dịch vụ: {s.description}</span>
                  <span className="font-bold text-slate-900">{formatCurrency(s.amount)}</span>
                </div>
              ))}

              {Number(preview.otherFee) !== 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100/60">
                  <span>Phụ phí / Khác:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(preview.otherFee)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 text-sm font-bold border-t border-indigo-200">
              <span className="text-indigo-950">TỔNG CỘNG HÓA ĐƠN:</span>
              <span className="text-xl font-extrabold text-indigo-700">
                {formatCurrency(preview.totalAmount)}
              </span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Ghi Chú Trên Hóa Đơn
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            placeholder="Ghi chú thêm cho khách thuê..."
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
            disabled={isLoading || isCalculating}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Đang tạo hóa đơn...' : 'Phát Hành Hóa Đơn'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
