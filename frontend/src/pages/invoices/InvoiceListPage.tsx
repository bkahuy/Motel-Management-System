import React, { useEffect, useState } from 'react';
import { invoiceApi, roomApi } from '../../services/api';
import { Invoice, InvoiceStatus, Room } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate } from '../../utils';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { InvoiceCreateModal } from './InvoiceCreateModal';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { PayInvoiceModal } from './PayInvoiceModal';
import {
  Receipt,
  Plus,
  Search,
  Calendar,
  CreditCard,
  Eye,
  Trash2,
  AlertCircle,
} from 'lucide-react';

export const InvoiceListPage: React.FC = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_STAFF';
  const toast = useToast();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | ''>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<Invoice | null>(null);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState<Invoice | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await invoiceApi.getInvoices({
        search: search || undefined,
        billingMonth: selectedMonth || undefined,
        status: selectedStatus || undefined,
        page,
        size: 10,
      });
      if (res.data.success) {
        setInvoices(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
        setTotalElements(res.data.data.totalElements);
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách hóa đơn');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, search, selectedMonth, selectedStatus]);

  const handleDelete = async () => {
    if (!invoiceToDelete) return;
    setIsDeleting(true);
    try {
      await invoiceApi.delete(invoiceToDelete.id);
      toast.success(`Đã xóa hóa đơn ${invoiceToDelete.invoiceCode}`);
      setDeleteConfirmOpen(false);
      setInvoiceToDelete(null);
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xóa hóa đơn này');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Quản Lý Hóa Đơn & Tiền Phòng
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lập hóa đơn tự động từ chỉ số điện nước, quản lý thu tiền và trạng thái thanh toán.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Lập Hóa Đơn Mới
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm theo mã HĐ, phòng, khách..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setPage(0);
            }}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as InvoiceStatus | '');
              setPage(0);
            }}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="UNPAID">Chưa thanh toán (UNPAID)</option>
            <option value="PAID">Đã thanh toán (PAID)</option>
            <option value="OVERDUE">Quá hạn (OVERDUE)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={8} />
        ) : invoices.length === 0 ? (
          <EmptyState
            title="Không tìm thấy hóa đơn nào"
            description="Chưa có hóa đơn nào được tạo hoặc không có kết quả phù hợp với tìm kiếm."
            actionText={canManage ? "Lập Hóa Đơn Mới" : undefined}
            onAction={() => setCreateModalOpen(true)}
            icon={<Receipt className="w-8 h-8" />}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Mã Hóa Đơn</th>
                    <th className="px-6 py-4">Phòng</th>
                    <th className="px-6 py-4">Khách Thuê</th>
                    <th className="px-6 py-4">Tháng</th>
                    <th className="px-6 py-4">Tổng Tiền</th>
                    <th className="px-6 py-4">Hạn Đóng</th>
                    <th className="px-6 py-4">Trạng Thái</th>
                    <th className="px-6 py-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{inv.invoiceCode}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">Phòng {inv.roomNumber}</span>
                        <p className="text-xs text-slate-400">{inv.buildingName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">{inv.tenantName}</span>
                        <p className="text-xs text-slate-400">{inv.tenantPhone}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{inv.billingMonth}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">{formatCurrency(inv.totalAmount)}</span>
                        {inv.paidAmount > 0 && inv.status !== 'PAID' && (
                          <p className="text-xs text-emerald-600">Đã trả: {formatCurrency(inv.paidAmount)}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{formatDate(inv.dueDate)}</td>
                      <td className="px-6 py-4">
                        <Badge status={inv.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedInvoiceForDetail(inv);
                              setDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Xem chi tiết & In"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {inv.status !== 'PAID' && (
                            <button
                              onClick={() => {
                                setSelectedInvoiceForPay(inv);
                                setPayModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-semibold text-xs shadow-sm hover:bg-indigo-700 transition-all"
                              title="Thanh toán"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Thu tiền</span>
                            </button>
                          )}

                          {canManage && inv.status !== 'PAID' && (
                            <button
                              onClick={() => {
                                setInvoiceToDelete(inv);
                                setDeleteConfirmOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Xóa hóa đơn"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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

      {/* Modals */}
      <InvoiceCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchInvoices}
      />

      <InvoiceDetailModal
        isOpen={detailModalOpen}
        invoice={selectedInvoiceForDetail}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedInvoiceForDetail(null);
        }}
        onPay={() => {
          setSelectedInvoiceForPay(selectedInvoiceForDetail);
          setDetailModalOpen(false);
          setPayModalOpen(true);
        }}
      />

      <PayInvoiceModal
        isOpen={payModalOpen}
        invoice={selectedInvoiceForPay}
        onClose={() => {
          setPayModalOpen(false);
          setSelectedInvoiceForPay(null);
        }}
        onSuccess={fetchInvoices}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Xác nhận xóa hóa đơn"
        message={`Bạn có chắc chắn muốn xóa hóa đơn "${invoiceToDelete?.invoiceCode}"?`}
        confirmText="Xóa Hóa Đơn"
        isLoading={isDeleting}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setInvoiceToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};
