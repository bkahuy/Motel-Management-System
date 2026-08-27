import React from 'react';
import { Modal } from '../../components/common/Modal';
import { Contract } from '../../types';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils';
import { FileText, Building2, DoorOpen, User, Calendar, CreditCard, DollarSign } from 'lucide-react';

interface ContractDetailModalProps {
  isOpen: boolean;
  contract: Contract | null;
  onClose: () => void;
}

export const ContractDetailModal: React.FC<ContractDetailModalProps> = ({
  isOpen,
  contract,
  onClose,
}) => {
  if (!contract) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi Tiết Hợp Đồng Thuê" maxWidth="2xl">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-md">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">{contract.contractCode}</h4>
              <p className="text-xs text-indigo-700 font-medium">
                Phòng {contract.roomNumber} • {contract.buildingName}
              </p>
            </div>
          </div>
          <div>
            <Badge status={contract.status} size="md" />
          </div>
        </div>

        {/* Parties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <User className="w-4 h-4 text-indigo-600" />
              Khách Thuê (Bên B)
            </div>
            <h5 className="text-base font-bold text-slate-900">{contract.tenantName}</h5>
            <p className="text-xs text-slate-600 mt-1">SĐT: {contract.tenantPhone}</p>
            <p className="text-xs text-slate-600">CCCD: {contract.tenantIdentityNumber}</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Địa Điểm Thuê
            </div>
            <h5 className="text-base font-bold text-slate-900">Phòng {contract.roomNumber}</h5>
            <p className="text-xs text-slate-600 mt-1">Tòa nhà: {contract.buildingName}</p>
            <p className="text-xs text-slate-600">Kỳ đóng tiền: {contract.paymentCycle === 'MONTHLY' ? 'Hàng tháng' : 'Hàng quý'}</p>
          </div>
        </div>

        {/* Financials & Duration */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-400 font-medium">Giá Thuê</span>
            <p className="text-base font-bold text-indigo-600 mt-1">{formatCurrency(contract.rentPrice)}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-400 font-medium">Tiền Đặt Cọc</span>
            <p className="text-base font-bold text-slate-900 mt-1">{formatCurrency(contract.deposit)}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-400 font-medium">Ngày Bắt Đầu</span>
            <p className="text-sm font-bold text-slate-800 mt-1">{formatDate(contract.startDate)}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-400 font-medium">Ngày Kết Thúc</span>
            <p className="text-sm font-bold text-slate-800 mt-1">{formatDate(contract.endDate)}</p>
          </div>
        </div>

        {/* Notes */}
        {contract.notes && (
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Ghi Chú & Điều Khoản
            </h5>
            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
              {contract.notes}
            </p>
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
