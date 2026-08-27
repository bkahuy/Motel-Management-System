import React, { useEffect, useState } from 'react';
import { userApi } from '../../services/api';
import { User } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { UserFormModal } from './UserFormModal';
import {
  UserCog,
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  Power,
  Mail,
  Phone,
} from 'lucide-react';

export const UserListPage: React.FC = () => {
  const toast = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await userApi.getUsers({
        search: search || undefined,
        page,
        size: 10,
      });
      if (res.data.success) {
        setUsers(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
        setTotalElements(res.data.data.totalElements);
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleToggleStatus = async (u: User) => {
    try {
      await userApi.toggleStatus(u.id);
      toast.success(`Đã ${u.active ? 'khóa' : 'kích hoạt'} tài khoản ${u.username}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể đổi trạng thái');
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await userApi.delete(userToDelete.id);
      toast.success(`Đã xóa tài khoản ${userToDelete.username}`);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xóa tài khoản này');
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
            Quản Lý Tài Khoản Hệ Thống
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Phân quyền tài khoản Quản trị viên (ADMIN), Nhân viên (STAFF) và Khách thuê (TENANT).
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedUserForEdit(null);
            setFormModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          Thêm Tài Khoản Mới
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
            placeholder="Tìm theo username, họ tên, email..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : users.length === 0 ? (
          <EmptyState
            title="Không tìm thấy người dùng nào"
            description="Chưa có tài khoản nào hoặc không có kết quả phù hợp với tìm kiếm."
            actionText="Thêm Tài Khoản Mới"
            onAction={() => setFormModalOpen(true)}
            icon={<UserCog className="w-8 h-8" />}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Tài Khoản</th>
                    <th className="px-6 py-4">Họ Và Tên</th>
                    <th className="px-6 py-4">Vai Trò</th>
                    <th className="px-6 py-4">Liên Hệ</th>
                    <th className="px-6 py-4">Trạng Thái</th>
                    <th className="px-6 py-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{u.username}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{u.fullName}</td>
                      <td className="px-6 py-4">
                        <Badge status={u.role} />
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 space-y-0.5">
                        <p className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.email}</span>
                        </p>
                        {u.phone && (
                          <p className="flex items-center gap-1.5 text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{u.phone}</span>
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {u.active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.active
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.active ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedUserForEdit(u);
                              setFormModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {u.username !== 'admin' && (
                            <button
                              onClick={() => {
                                setUserToDelete(u);
                                setDeleteConfirmOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Xóa"
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
      <UserFormModal
        isOpen={formModalOpen}
        user={selectedUserForEdit}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedUserForEdit(null);
        }}
        onSuccess={fetchUsers}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Xác nhận xóa người dùng"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${userToDelete?.username}" (${userToDelete?.fullName})?`}
        confirmText="Xóa Tài Khoản"
        isLoading={isDeleting}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};
