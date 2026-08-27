import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const start = currentPage * pageSize + 1;
  const end = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-slate-100 rounded-b-2xl">
      <div className="text-sm text-slate-500">
        Hiển thị <span className="font-semibold text-slate-700">{start}</span> -{' '}
        <span className="font-semibold text-slate-700">{end}</span> trên tổng số{' '}
        <span className="font-semibold text-slate-700">{totalElements}</span> bản ghi
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="flex items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i)
          .filter((page) => {
            // Show first, last, and current +/- 1
            return (
              page === 0 ||
              page === totalPages - 1 ||
              Math.abs(page - currentPage) <= 1
            );
          })
          .map((page, idx, arr) => {
            const showEllipsisBefore = idx > 0 && page - arr[idx - 1] > 1;

            return (
              <React.Fragment key={page}>
                {showEllipsisBefore && (
                  <span className="px-2 text-slate-400 text-sm">...</span>
                )}
                <button
                  onClick={() => onPageChange(page)}
                  className={`min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {page + 1}
                </button>
              </React.Fragment>
            );
          })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="flex items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
