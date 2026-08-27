import React, { useEffect, useState } from 'react';
import { buildingApi } from '../../services/api';
import { Building } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { BuildingModal } from './BuildingModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Layers,
  Edit2,
  Trash2,
  Home,
  DoorOpen,
} from 'lucide-react';

export const BuildingListPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const toast = useToast();

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState<Building | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBuildings = async () => {
    setIsLoading(true);
    try {
      const res = await buildingApi.getBuildings({
        search: search || undefined,
        page,
        size: 10,
      });
      if (res.data.success) {
        setBuildings(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
        setTotalElements(res.data.data.totalElements);
      }
    } catch (err: any) {
      toast.error('Lỗi khi tải danh sách tòa nhà');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, [page, search]);

  const handleDelete = async () => {
    if (!buildingToDelete) return;
    setIsDeleting(true);
    try {
      await buildingApi.delete(buildingToDelete.id);
      toast.success(`Đã xóa tòa nhà ${buildingToDelete.name}`);
      setDeleteConfirmOpen(false);
      setBuildingToDelete(null);
      fetchBuildings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xóa tòa nhà này');
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
            Quản Lý Tòa Nhà / Khu Trọ
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Danh sách các tòa nhà, chung cư mini, khu phòng trọ đang quản lý.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setSelectedBuilding(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Thêm Tòa Nhà
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
            placeholder="Tìm theo tên tòa nhà hoặc địa chỉ..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>
      </div>

      {/* Buildings Cards / Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : buildings.length === 0 ? (
        <EmptyState
          title="Không tìm thấy tòa nhà nào"
          description="Chưa có tòa nhà nào được tạo hoặc không có kết quả phù hợp với tìm kiếm."
          actionText={isAdmin ? "Thêm Tòa Nhà Mới" : undefined}
          onAction={() => setIsModalOpen(true)}
          icon={<Building2 className="w-8 h-8" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-snug">{b.name}</h3>
                      {b.totalFloors && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <Layers className="w-3.5 h-3.5" />
                          {b.totalFloors} Tầng
                        </span>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedBuilding(b);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setBuildingToDelete(b);
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-600 mb-4">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>{b.address}</span>
                </div>

                {b.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 bg-slate-50 p-2.5 rounded-xl">
                    {b.description}
                  </p>
                )}
              </div>

              {/* Room Stats */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <DoorOpen className="w-4 h-4 text-indigo-500" />
                  <span>Tổng: <b className="text-slate-900">{b.totalRooms}</b> phòng</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-600 font-medium">{b.availableRooms} trống</span>
                  <span className="text-amber-600 font-medium">{b.occupiedRooms} đang thuê</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={10}
        onPageChange={setPage}
      />

      {/* Add / Edit Modal */}
      <BuildingModal
        isOpen={isModalOpen}
        building={selectedBuilding}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBuilding(null);
        }}
        onSuccess={fetchBuildings}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Xác nhận xóa tòa nhà"
        message={`Bạn có chắc chắn muốn xóa tòa nhà "${buildingToDelete?.name}"? Hành động này không thể hoàn tác nếu không còn phòng nào.`}
        confirmText="Xóa Tòa Nhà"
        isLoading={isDeleting}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setBuildingToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};
