import React, { useEffect, useState } from 'react';
import { meterReadingApi, roomApi } from '../../services/api';
import { MeterReading, Room } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { MeterReadingFormModal } from './MeterReadingFormModal';
import {
  Gauge,
  Plus,
  Zap,
  Droplets,
  Edit2,
  Trash2,
  Calendar,
} from 'lucide-react';

export const MeterReadingListPage: React.FC = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_STAFF';
  const toast = useToast();

  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<number | ''>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedReadingForEdit, setSelectedReadingForEdit] = useState<MeterReading | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState<MeterReading | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await roomApi.getRooms({ size: 100 });
        if (res.data.success) setRooms(res.data.data.content);
      } catch (err) {
        console.error('Failed to load rooms', err);
      }
    };
    fetchRooms();
  }, []);

  const fetchReadings = async () => {
    setIsLoading(true);
    try {
      const res = await meterReadingApi.getMeterReadings({
        readingMonth: selectedMonth || undefined,
        roomId: selectedRoomId ? Number(selectedRoomId) : undefined,
        page,
        size: 10,
      });
      if (res.data.success) {
        setReadings(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
        setTotalElements(res.data.data.totalElements);
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách chỉ số điện nước');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, [page, selectedMonth, selectedRoomId]);

  const handleDelete = async () => {
    if (!readingToDelete) return;
    setIsDeleting(true);
    try {
      await meterReadingApi.delete(readingToDelete.id);
      toast.success('Đã xóa bản ghi chỉ số điện nước');
      setDeleteConfirmOpen(false);
      setReadingToDelete(null);
      fetchReadings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể xóa bản ghi này');
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
            Chỉ Số Điện & Nước
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ghi chép và theo dõi công tơ điện nước hàng tháng cho từng phòng đang thuê.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setSelectedReadingForEdit(null);
              setFormModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Ghi Chỉ Số Mới
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        {/* Month Filter */}
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

        {/* Room Filter */}
        <div>
          <select
            value={selectedRoomId}
            onChange={(e) => {
              setSelectedRoomId(e.target.value ? Number(e.target.value) : '');
              setPage(0);
            }}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
          >
            <option value="">Tất cả phòng</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                Phòng {r.roomNumber} ({r.buildingName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : readings.length === 0 ? (
          <EmptyState
            title="Chưa có chỉ số điện nước nào"
            description="Hãy ghi nhận số công tơ điện nước định kỳ hàng tháng để tính tiền hóa đơn chính xác."
            actionText={canManage ? "Ghi Chỉ Số Mới" : undefined}
            onAction={() => setFormModalOpen(true)}
            icon={<Gauge className="w-8 h-8" />}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Phòng / Tòa Nhà</th>
                    <th className="px-6 py-4">Khách Thuê</th>
                    <th className="px-6 py-4">Tháng Ghi</th>
                    <th className="px-6 py-4">Chỉ Số Điện (Cũ → Mới)</th>
                    <th className="px-6 py-4">Chỉ Số Nước (Cũ → Mới)</th>
                    <th className="px-6 py-4">Ngày Chốt</th>
                    {canManage && <th className="px-6 py-4 text-right">Thao Tác</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {readings.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">Phòng {r.roomNumber}</span>
                        <p className="text-xs text-slate-400">{r.buildingName}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{r.tenantName}</td>
                      <td className="px-6 py-4 font-semibold text-indigo-600">{r.readingMonth}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-xs text-slate-500">{r.electricityPrevious} → {r.electricityCurrent}</span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-xs">
                            +{r.electricityUsage} kWh
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-xs text-slate-500">{r.waterPrevious} → {r.waterCurrent}</span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-xs">
                            +{r.waterUsage} m³
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{formatDate(r.readingDate)}</td>
                      {canManage && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedReadingForEdit(r);
                                setFormModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setReadingToDelete(r);
                                setDeleteConfirmOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
      <MeterReadingFormModal
        isOpen={formModalOpen}
        reading={selectedReadingForEdit}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedReadingForEdit(null);
        }}
        onSuccess={fetchReadings}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Xác nhận xóa chỉ số"
        message={`Bạn có chắc chắn muốn xóa bản ghi chỉ số tháng ${readingToDelete?.readingMonth} phòng ${readingToDelete?.roomNumber}?`}
        confirmText="Xóa Bản Ghi"
        isLoading={isDeleting}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setReadingToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};
