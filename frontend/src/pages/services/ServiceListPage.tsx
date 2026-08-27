import React, { useEffect, useState } from 'react';
import { serviceApi } from '../../services/api';
import { ServiceItem } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ServiceFormModal } from './ServiceFormModal';
import {
  Sparkles,
  Plus,
  Search,
  Edit2,
  PowerOff,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const ServiceListPage: React.FC = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_STAFF';
  const toast = useToast();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedServiceForEdit, setSelectedServiceForEdit] = useState<ServiceItem | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await serviceApi.getServices({
        search: search || undefined,
        page,
        size: 10,
      });
      if (res.data.success) {
        setServices(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
        setTotalElements(res.data.data.totalElements);
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách dịch vụ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [page, search]);

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    setIsDeleting(true);
    try {
      await serviceApi.delete(serviceToDelete.id);
      toast.success(`Đã vô hiệu hóa dịch vụ ${serviceToDelete.name}`);
      setDeleteConfirmOpen(false);
      setServiceToDelete(null);
      fetchServices();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể vô hiệu hóa dịch vụ này');
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
            Bảng Giá Dịch Vụ
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý các gói dịch vụ (Điện, Nước, WiFi cáp quang, Vệ sinh rác, Gửi xe...).
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setSelectedServiceForEdit(null);
              setFormModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Thêm Dịch Vụ Mới
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm theo tên dịch vụ, mô tả..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : services.length === 0 ? (
          <EmptyState
            title="Chưa có dịch vụ nào"
            description="Hãy tạo các gói dịch vụ để áp dụng cho phòng trọ khi tính tiền hóa đơn."
            actionText={canManage ? "Thêm Dịch Vụ Mới" : undefined}
            onAction={() => setFormModalOpen(true)}
            icon={<Sparkles className="w-8 h-8" />}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Tên Dịch Vụ</th>
                    <th className="px-6 py-4">Đơn Giá</th>
                    <th className="px-6 py-4">Đơn Vị Tính</th>
                    <th className="px-6 py-4">Trạng Thái</th>
                    <th className="px-6 py-4">Mô Tả</th>
                    {canManage && <th className="px-6 py-4 text-right">Thao Tác</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                      <td className="px-6 py-4 font-bold text-indigo-600">{formatCurrency(s.price)}</td>
                      <td className="px-6 py-4 text-slate-600">{s.unit}</td>
                      <td className="px-6 py-4">
                        {s.active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đang áp dụng
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                            <XCircle className="w-3.5 h-3.5" />
                            Tạm ngưng
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                        {s.description || '—'}
                      </td>
                      {canManage && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedServiceForEdit(s);
                                setFormModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {s.active && (
                              <button
                                onClick={() => {
                                  setServiceToDelete(s);
                                  setDeleteConfirmOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Tạm ngưng dịch vụ"
                              >
                                <PowerOff className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
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
      <ServiceFormModal
        isOpen={formModalOpen}
        service={selectedServiceForEdit}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedServiceForEdit(null);
        }}
        onSuccess={fetchServices}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Xác nhận tạm ngưng dịch vụ"
        message={`Bạn có muốn ngưng kích hoạt dịch vụ "${serviceToDelete?.name}"?`}
        confirmText="Tạm Ngưng"
        isLoading={isDeleting}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setServiceToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};
