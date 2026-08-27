import React from 'react';
import { Modal } from '../../components/common/Modal';
import { Tenant } from '../../types';
import { formatDate } from '../../utils';
import { User, Phone, Mail, MapPin, Briefcase, Calendar, CreditCard, DoorOpen } from 'lucide-react';

interface TenantDetailModalProps {
  isOpen: boolean;
  tenant: Tenant | null;
  onClose: () => void;
}

export const TenantDetailModal: React.FC<TenantDetailModalProps> = ({
  isOpen,
  tenant,
  onClose,
}) => {
  if (!tenant) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hồ Sơ Khách Thuê" maxWidth="2xl">
      <div className="space-y-6">
        {/* Header summary */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-md">
            {tenant.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900">{tenant.fullName}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>CMND/CCCD: <b className="text-slate-700">{tenant.identityNumber}</b></span>
              <span>•</span>
              <span>Giới tính: <b className="text-slate-700">{tenant.gender || '—'}</b></span>
            </div>
          </div>
        </div>

        {/* Current Rental Info */}
        {tenant.currentRoomNumber ? (
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
                <DoorOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Đang thuê phòng
                </p>
                <h5 className="font-bold text-slate-900 text-base">
                  Phòng {tenant.currentRoomNumber} ({tenant.currentBuildingName})
                </h5>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-slate-400" />
            Hiện tại khách chưa có hợp đồng thuê phòng nào đang hoạt động.
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50">
            <Phone className="w-4 h-4 text-indigo-600 mt-0.5" />
            <div>
              <span className="text-xs text-slate-400 font-medium">Số điện thoại</span>
              <p className="text-sm font-semibold text-slate-800">{tenant.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50">
            <Mail className="w-4 h-4 text-indigo-600 mt-0.5" />
            <div>
              <span className="text-xs text-slate-400 font-medium">Email</span>
              <p className="text-sm font-semibold text-slate-800">{tenant.email || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50">
            <Calendar className="w-4 h-4 text-indigo-600 mt-0.5" />
            <div>
              <span className="text-xs text-slate-400 font-medium">Ngày sinh</span>
              <p className="text-sm font-semibold text-slate-800">{formatDate(tenant.dateOfBirth)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50">
            <Briefcase className="w-4 h-4 text-indigo-600 mt-0.5" />
            <div>
              <span className="text-xs text-slate-400 font-medium">Nghề nghiệp</span>
              <p className="text-sm font-semibold text-slate-800">{tenant.occupation || '—'}</p>
            </div>
          </div>
        </div>

        {tenant.address && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50">
            <MapPin className="w-4 h-4 text-indigo-600 mt-0.5" />
            <div>
              <span className="text-xs text-slate-400 font-medium">Quê quán / Hộ khẩu thường trú</span>
              <p className="text-sm font-semibold text-slate-800">{tenant.address}</p>
            </div>
          </div>
        )}

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
