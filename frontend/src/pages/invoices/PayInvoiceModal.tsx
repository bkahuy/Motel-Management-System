import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Invoice, PaymentMethod, PaymentRequest } from '../../types';
import { invoiceApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils';
import { CreditCard, Banknote, QrCode, CheckCircle2 } from 'lucide-react';

interface PayInvoiceModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const PayInvoiceModal: React.FC<PayInvoiceModalProps> = ({
  isOpen,
  invoice,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [amount, setAmount] = useState<number>(
    invoice ? invoice.remainingAmount || invoice.totalAmount : 0
  );
  const [transactionCode, setTransactionCode] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (invoice) {
      setAmount(invoice.remainingAmount > 0 ? invoice.remainingAmount : invoice.totalAmount);
      setTransactionCode('');
      setNotes('Thanh toán tiền phòng ' + invoice.roomNumber + ' tháng ' + invoice.billingMonth);
    }
  }, [invoice, isOpen]);

  if (!invoice) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast.error('Số tiền thanh toán phải lớn hơn 0');
      return;
    }

    setIsLoading(true);
    const payload: PaymentRequest = {
      amount,
      paymentMethod,
      transactionCode: transactionCode || undefined,
      notes,
    };

    try {
      const res = await invoiceApi.pay(invoice.id, payload);
      if (res.data.success) {
        toast.success(`Đã ghi nhận thanh toán ${formatCurrency(amount)} thành công!`);
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi xử lý thanh toán');
    } finally {
      setIsLoading(false);
    }
  };

  // Simulated VietQR URL for bank transfer
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=2|99|0988888888|${invoice.tenantName}|${amount}|${invoice.invoiceCode}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thanh Toán Hóa Đơn" maxWidth="lg">
      <form onSubmit={handlePay} className="space-y-5">
        {/* Invoice Summary */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
          <div>
            <span className="text-xs text-indigo-700 font-semibold font-mono">
              {invoice.invoiceCode}
            </span>
            <h4 className="text-base font-bold text-slate-900">
              Phòng {invoice.roomNumber} • Tháng {invoice.billingMonth}
            </h4>
            <p className="text-xs text-slate-500">Khách thuê: {invoice.tenantName}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium">Cần thanh toán</span>
            <p className="text-lg font-extrabold text-indigo-600">
              {formatCurrency(invoice.remainingAmount || invoice.totalAmount)}
            </p>
          </div>
        </div>

        {/* Method Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            Phương Thức Thanh Toán
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('BANK_TRANSFER')}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                paymentMethod === 'BANK_TRANSFER'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900">Chuyển Khoản</span>
                <p className="text-xs text-slate-500">Quét mã VietQR</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                paymentMethod === 'CASH'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900">Tiền Mặt</span>
                <p className="text-xs text-slate-500">Thu trực tiếp</p>
              </div>
            </button>
          </div>
        </div>

        {/* Bank QR Code Preview */}
        {paymentMethod === 'BANK_TRANSFER' && (
          <div className="p-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-slate-50 flex flex-col items-center text-center space-y-3">
            <div className="bg-white p-2.5 rounded-xl shadow-md border border-slate-100">
              <img
                src={qrUrl}
                alt="Mã QR Chuyển Khoản"
                className="w-36 h-36 rounded-lg object-contain"
              />
            </div>
            <div className="text-xs text-slate-600 space-y-0.5">
              <p className="font-bold text-slate-800 text-sm">Ngân hàng MBBank (Quân Đội)</p>
              <p>STK: <b className="font-mono text-indigo-600">0988888888</b></p>
              <p>Chủ TK: <b>CHU NHA TRO SUNSHINE</b></p>
              <p>Nội dung: <b className="font-mono text-slate-900">{invoice.invoiceCode}</b></p>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Số Tiền Thanh Toán (VNĐ) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            required
            min={1000}
            step={50000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        {/* Transaction Code / Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Mã Giao Dịch (Nếu có)
            </label>
            <input
              type="text"
              value={transactionCode}
              onChange={(e) => setTransactionCode(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="FT24..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Ghi Chú
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
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
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Đang xử lý...' : 'Xác Nhận Thanh Toán'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
