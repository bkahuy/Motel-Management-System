import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  type = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex flex-col items-center text-center">
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
            type === 'danger'
              ? 'bg-rose-100 text-rose-600'
              : type === 'warning'
              ? 'bg-amber-100 text-amber-600'
              : 'bg-indigo-100 text-indigo-600'
          }`}
        >
          {type === 'danger' && <AlertTriangle className="h-7 w-7" />}
          {type === 'warning' && <AlertCircle className="h-7 w-7" />}
          {type === 'info' && <AlertCircle className="h-7 w-7" />}
        </div>

        <p className="text-sm text-slate-600 mb-6">{message}</p>

        <div className="flex w-full justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500/20 disabled:opacity-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 transition-colors ${
              type === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/30'
                : type === 'warning'
                ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/30'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500/30'
            }`}
          >
            {isLoading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
