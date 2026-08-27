import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Contract } from '../../types';
import { contractApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { AlertTriangle } from 'lucide-react';

interface TerminateContractModalProps {
  isOpen: boolean;
  contract: Contract | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const TerminateContractModal: React.FC<TerminateContractModalProps> = ({
  isOpen,
  contract,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  if (!contract) return null;

  const handleTerminate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await contractApi.terminate(contract.id, { reason });
      toast.success(`Đã thanh lý hợp đồng ${contract.contractCode}. Phòng đã chuyển về trạng thái Trống (AVAILABLE).`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể thanh lý hợp đồng');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thanh Lý Hợp Đồng Thuê" maxWidth="md">
      <form onSubmit={handleTerminate} className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Lưu ý quan trọng:</p>
            <p className="mt-0.5 text-amber-800">
              Sau khi thanh lý, hợp đồng <b>{contract.contractCode}</b> sẽ chuyển sang trạng thái <b>TERMINATED</b> và phòng <b>{contract.roomNumber}</b> sẽ tự động chuyển về trạng thái <b>Trống (AVAILABLE)</b>.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
            Lý do thanh lý / Biên bản trả phòng
          </label>
          <textarea
            rows={3}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all"
            placeholder="Ví dụ: Hết hạn hợp đồng, khách chuyển công tác, đã hoàn trả đủ tiền cọc..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Đang thanh lý...' : 'Xác Nhận Thanh Lý'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
