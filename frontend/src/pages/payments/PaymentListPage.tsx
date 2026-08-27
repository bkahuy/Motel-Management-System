import React, { useEffect, useState } from 'react';
import { paymentApi } from '../../services/api';
import { Payment } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency, formatDateTime } from '../../utils';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import {
  CreditCard,
  Banknote,
  Calendar,
  CheckCircle2,
  Receipt,
  DoorOpen,
} from 'lucide-react';

export const PaymentListPage: React.FC = () => {
  const toast = useToast();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await paymentApi.getPayments({
        page,
        size: 10,
      });
      if (res.data.success) {
        setPayments(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
        setTotalElements(res.data.data.totalElements);
      }
    } catch (err) {
      toast.error('Lỗi khi tải lịch sử thanh toán');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Lịch Sử Giao Dịch Thanh Toán
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Nhật ký tất cả các giao dịch thu tiền phòng qua chuyển khoản ngân hàng và tiền mặt.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : payments.length === 0 ? (
          <EmptyState
            title="Chưa có giao dịch thanh toán nào"
            description="Lịch sử các lần thu tiền phòng sẽ tự động xuất hiện tại đây khi khách hoặc chủ nhà xác nhận thanh toán."
            icon={<CreditCard className="w-8 h-8" />}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Mã Giao Dịch</th>
                    <th className="px-6 py-4">Mã Hóa Đơn</th>
                    <th className="px-6 py-4">Phòng / Khách Thuê</th>
                    <th className="px-6 py-4">Số Tiền</th>
                    <th className="px-6 py-4">Hình Thức</th>
                    <th className="px-6 py-4">Thời Gian Giao Dịch</th>
                    <th className="px-6 py-4">Ghi Chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 text-xs">
                        {p.transactionCode || `TXN-${p.id}`}
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-indigo-600">
                        {p.invoiceCode}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">Phòng {p.roomNumber}</span>
                        <p className="text-xs text-slate-500">{p.tenantName}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600 text-base">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-6 py-4">
                        {p.paymentMethod === 'BANK_TRANSFER' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <CreditCard className="w-3.5 h-3.5" />
                            Chuyển khoản
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Banknote className="w-3.5 h-3.5" />
                            Tiền mặt
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {formatDateTime(p.paymentDate)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                        {p.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={10}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
};
