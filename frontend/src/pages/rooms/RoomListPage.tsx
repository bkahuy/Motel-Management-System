import React, { useEffect, useState } from 'react';
import { buildingApi, roomApi } from '../../services/api';
import { Building, Room, RoomStatus } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { RoomFormModal } from './RoomFormModal';
import { RoomDetailModal } from './RoomDetailModal';
import { RoomServiceAssignModal } from './RoomServiceAssignModal';
import {
  DoorOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Sparkles,
  UserCheck,
} from 'lucide-react';

export const RoomListPage: React.FC = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_STAFF';
  const toast = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);

  const [search, setSearch] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<RoomStatus | ''>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<Room | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRoomForDetail, setSelectedRoomForDetail] = useState<Room | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedRoomForAssign, setSelectedRoomForAssign] = useState<Room | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await buildingApi.getAll();
        if (res.data.success) setBuildings(res.data.data);
      } catch (err) {
        console.error('Failed to load buildings', err);
      }
    };
    fetchBuildings();
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const res = await roomApi.getRooms({
        search: search || undefined,
        buildingId: selectedBuildingId ? Number(selectedBuildingId) : undefined,
        status: selectedStatus || undefined,
        page,
        size: 10,
      });
      if (res.data.success) {
        setRooms(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
        setTotalElements(res.data.data.totalElements);
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách phòng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [page, search, selectedBuildingId, selectedStatus]);

  const handleDelete = async () => {
    if (!roomToDelete) return;
    setIsDeleting(true);
    try {
      await roomApi.delete(roomToDelete.id);
      toast.success(`Đã xóa phòng ${roomToDelete.roomNumber}`);
      setDeleteConfirmOpen(false);
      setRoomToDelete(null);
      fetchRooms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xóa phòng này');
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
            Quản Lý Phòng Trọ
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Danh sách phòng, trạng thái cho thuê, giá phòng và các dịch vụ gán kèm.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setSelectedRoomForEdit(null);
              setFormModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Thêm Phòng Mới
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm theo số phòng, mô tả..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        {/* Building Filter */}
        <div>
          <select
            value={selectedBuildingId}
            onChange={(e) => {
              setSelectedBuildingId(e.target.value ? Number(e.target.value) : '');
              setPage(0);
            }}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
          >
            <option value="">Tất cả tòa nhà / khu trọ</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as RoomStatus | '');
              setPage(0);
            }}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="AVAILABLE">Trống (AVAILABLE)</option>
            <option value="OCCUPIED">Đang thuê (OCCUPIED)</option>
            <option value="MAINTENANCE">Bảo trì (MAINTENANCE)</option>
          </select>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : rooms.length === 0 ? (
          <EmptyState
            title="Không tìm thấy phòng nào"
            description="Chưa có phòng nào hoặc không có kết quả phù hợp với bộ lọc hiện tại."
            actionText={canManage ? "Thêm Phòng Mới" : undefined}
            onAction={() => setFormModalOpen(true)}
            icon={<DoorOpen className="w-8 h-8" />}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Phòng</th>
                    <th className="px-6 py-4">Tòa Nhà</th>
                    <th className="px-6 py-4">Giá Thuê</th>
                    <th className="px-6 py-4">Diện Tích</th>
                    <th className="px-6 py-4">Trạng Thái</th>
                    <th className="px-6 py-4">Khách Thuê</th>
                    <th className="px-6 py-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{room.roomNumber}</td>
                      <td className="px-6 py-4 text-slate-600">{room.buildingName}</td>
                      <td className="px-6 py-4 font-semibold text-indigo-600">
                        {formatCurrency(room.price)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{room.area} m²</td>
                      <td className="px-6 py-4">
                        <Badge status={room.status} />
                      </td>
                      <td className="px-6 py-4">
                        {room.status === 'OCCUPIED' && room.currentTenantName ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{room.currentTenantName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedRoomForDetail(room);
                              setDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canManage && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedRoomForAssign(room);
                                  setAssignModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                title="Gán dịch vụ"
                              >
                                <Sparkles className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedRoomForEdit(room);
                                  setFormModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setRoomToDelete(room);
                                  setDeleteConfirmOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
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
      <RoomFormModal
        isOpen={formModalOpen}
        room={selectedRoomForEdit}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedRoomForEdit(null);
        }}
        onSuccess={fetchRooms}
      />

      <RoomDetailModal
        isOpen={detailModalOpen}
        room={selectedRoomForDetail}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedRoomForDetail(null);
        }}
      />

      <RoomServiceAssignModal
        isOpen={assignModalOpen}
        room={selectedRoomForAssign}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedRoomForAssign(null);
        }}
        onSuccess={fetchRooms}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Xác nhận xóa phòng"
        message={`Bạn có chắc chắn muốn xóa phòng "${roomToDelete?.roomNumber}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa Phòng"
        isLoading={isDeleting}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setRoomToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};
