import React from 'react';
import { Modal } from '../../components/common/Modal';
import { Room } from '../../types';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils';
import { Building2, DoorOpen, Maximize2, Users, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';

interface RoomDetailModalProps {
  isOpen: boolean;
  room: Room | null;
  onClose: () => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  isOpen,
  room,
  onClose,
}) => {
  if (!room) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Chi Tiết Phòng ${room.roomNumber}`} maxWidth="2xl">
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-md">
              <DoorOpen className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">Phòng {room.roomNumber}</h4>
              <p className="text-xs text-indigo-700 font-medium">{room.buildingName}</p>
            </div>
          </div>
          <div>
            <Badge status={room.status} size="md" />
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-400 font-medium">Giá Thuê</span>
            <p className="text-base font-bold text-slate-900 mt-1">{formatCurrency(room.price)}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-400 font-medium">Tiền Cọc</span>
            <p className="text-base font-bold text-slate-900 mt-1">{formatCurrency(room.deposit)}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-400 font-medium">Diện Tích</span>
            <p className="text-base font-bold text-slate-900 mt-1">{room.area} m²</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-400 font-medium">Người Tối Đa</span>
            <p className="text-base font-bold text-slate-900 mt-1">{room.maxOccupants} người</p>
          </div>
        </div>

        {/* Current Tenant & Contract */}
        {room.status === 'OCCUPIED' && room.currentTenantName && (
          <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-2">
              <UserCheck className="w-4 h-4" />
              Thông Tin Khách Thuê Hiện Tại
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500">Khách thuê:</span>
                <p className="font-bold text-slate-800 text-sm">{room.currentTenantName}</p>
              </div>
              <div>
                <span className="text-slate-500">Số điện thoại:</span>
                <p className="font-bold text-slate-800 text-sm">{room.currentTenantPhone || '—'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {room.description && (
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Mô Tả & Nội Thất
            </h5>
            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {room.description}
            </p>
          </div>
        )}

        {/* Services List */}
        <div>
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Dịch Vụ Đi Kèm ({room.services?.length || 0})
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {room.services && room.services.length > 0 ? (
              room.services.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-white text-xs"
                >
                  <span className="font-medium text-slate-800">{s.name}</span>
                  <span className="font-bold text-indigo-600">
                    {formatCurrency(s.price)} / {s.unit}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 col-span-2">Chưa gán dịch vụ nào.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};
