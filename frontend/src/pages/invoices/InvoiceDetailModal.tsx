import React from 'react';
import { Modal } from '../../components/common/Modal';
import { Invoice } from '../../types';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate, formatDateTime } from '../../utils';
import { Receipt, Printer, Building2, User, Calendar, CreditCard, CheckCircle2 } from 'lucide-react';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onPay?: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  isOpen,
  invoice,
  onClose,
  onPay,
}) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi Tiết Hóa Đơn" maxWidth="3xl">
      <div className="space-y-6 print:p-0">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md">
              <Receipt className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                Hóa Đơn Tiền Phòng & Dịch Vụ
              </span>
              <h4 className="text-xl font-bold font-mono">{invoice.invoiceCode}</h4>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge status={invoice.status} size="md" />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Phòng thuê:</span>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{invoice.roomNumber}</p>
            <p className="text-slate-500">{invoice.buildingName}</p>
          </div>

          <div>
            <span className="text-slate-400 font-medium">Khách thuê:</span>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{invoice.tenantName}</p>
            <p className="text-slate-500">{invoice.tenantPhone}</p>
          </div>

          <div>
            <span className="text-slate-400 font-medium">Tháng thu tiền:</span>
            <p className="font-bold text-indigo-600 text-sm mt-0.5">{invoice.billingMonth}</p>
          </div>

          <div>
            <span className="text-slate-400 font-medium">Hạn thanh toán:</span>
            <p className="font-bold text-rose-600 text-sm mt-0.5">{formatDate(invoice.dueDate)}</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Khoản Mục</th>
                <th className="px-4 py-3 text-center">Số Lượng</th>
                <th className="px-4 py-3 text-right">Đơn Giá</th>
                <th className="px-4 py-3 text-right">Thành Tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items?.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.description}</td>
                  <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
              <tr>
                <td colSpan={3} className="px-4 py-3.5 text-right text-sm">
                  TỔNG TIỀN PHẢI THANH TOÁN:
                </td>
                <td className="px-4 py-3.5 text-right text-base text-indigo-700">
                  {formatCurrency(invoice.totalAmount)}
                </td>
              </tr>
              {invoice.paidAmount > 0 && (
                <>
                  <tr className="text-emerald-700 bg-emerald-50/30">
                    <td colSpan={3} className="px-4 py-2 text-right text-xs">
                      Đã thanh toán:
                    </td>
                    <td className="px-4 py-2 text-right text-xs">
                      -{formatCurrency(invoice.paidAmount)}
                    </td>
                  </tr>
                  <tr className="text-rose-700 bg-rose-50/30">
                    <td colSpan={3} className="px-4 py-2 text-right text-xs">
                      Còn lại phải đóng:
                    </td>
                    <td className="px-4 py-2 text-right text-xs font-bold">
                      {formatCurrency(invoice.remainingAmount)}
                    </td>
                  </tr>
                </>
              )}
            </tfoot>
          </table>
        </div>

        {/* Payment History */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Lịch Sử Giao Dịch Thanh Toán
            </h5>
            <div className="space-y-2">
              {invoice.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-semibold text-slate-800">
                        {p.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' : 'Tiền mặt'}
                      </span>
                      <p className="text-slate-400 font-mono">{p.transactionCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600">{formatCurrency(p.amount)}</span>
                    <p className="text-slate-400">{formatDateTime(p.paymentDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            In Hóa Đơn
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Đóng
            </button>
            {invoice.status !== 'PAID' && onPay && (
              <button
                type="button"
                onClick={onPay}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                Thanh Toán Ngay
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
