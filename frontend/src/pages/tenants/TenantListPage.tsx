import React, { useEffect, useState } from 'react';
import { tenantApi } from '../../services/api';
import { Tenant } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { TenantFormModal } from './TenantFormModal';
import { TenantDetailModal } from './TenantDetailModal';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Phone,
  DoorOpen,
  Mail,
} from 'lucide-react';

export const TenantListPage: React.FC = () => {
  const toast = useToast();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedTenantForEdit, setSelectedTenantForEdit] = useState<Tenant | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTenantForDetail, setSelectedTenantForDetail] = useState<Tenant | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const res = await tenantApi.getTenants({
        search: search || undefined,
        page,
        size: 10,
      });
      if (res.data.success) {
        setTenants(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
        setTotalElements(res.data.data.totalElements);
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách khách thuê');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [page, search]);

  const handleDelete = async () => {
    if (!tenantToDelete) return;
    setIsDeleting(true);
    try {
      await tenantApi.delete(tenantToDelete.id);
      toast.success(`Đã xóa thông tin khách thuê ${tenantToDelete.fullName}`);
      setDeleteConfirmOpen(false);
      setTenantToDelete(null);
      fetchTenants();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xóa khách thuê này');
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
            Quản Lý Khách Thuê
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hồ sơ thông tin cá nhân, số CMND/CCCD, liên hệ và phòng đang thuê.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedTenantForEdit(null);
            setFormModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          Thêm Khách Thuê
        </button>
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
            placeholder="Tìm theo họ tên, CCCD, số điện thoại..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : tenants.length === 0 ? (
          <EmptyState
            title="Không có khách thuê nào"
            description="Chưa có khách thuê nào được thêm hoặc không có kết quả phù hợp với tìm kiếm."
            actionText="Thêm Khách Thuê Mới"
            onAction={() => setFormModalOpen(true)}
            icon={<Users className="w-8 h-8" />}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Họ Và Tên</th>
                    <th className="px-6 py-4">Số CCCD</th>
                    <th className="px-6 py-4">Điện Thoại</th>
                    <th className="px-6 py-4">Phòng Đang Thuê</th>
                    <th className="px-6 py-4">Quê Quán</th>
                    <th className="px-6 py-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm">
                            {t.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900">{t.fullName}</span>
                            {t.email && (
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {t.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-700">{t.identityNumber}</td>
                      <td className="px-6 py-4 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{t.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {t.currentRoomNumber ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                            <DoorOpen className="w-3.5 h-3.5" />
                            Phòng {t.currentRoomNumber} ({t.currentBuildingName})
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Chưa thuê phòng</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate">
                        {t.address || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedTenantForDetail(t);
                              setDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTenantForEdit(t);
                              setFormModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setTenantToDelete(t);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
      <TenantFormModal
        isOpen={formModalOpen}
        tenant={selectedTenantForEdit}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedTenantForEdit(null);
        }}
        onSuccess={fetchTenants}
      />

      <TenantDetailModal
        isOpen={detailModalOpen}
        tenant={selectedTenantForDetail}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedTenantForDetail(null);
        }}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Xác nhận xóa khách thuê"
        message={`Bạn có chắc chắn muốn xóa khách thuê "${tenantToDelete?.fullName}"? Chỉ có thể xóa nếu khách không có hợp đồng đang hoạt động.`}
        confirmText="Xóa Khách Thuê"
        isLoading={isDeleting}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setTenantToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};
