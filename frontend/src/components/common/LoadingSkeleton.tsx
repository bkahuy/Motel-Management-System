import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 5,
}) => {
  return (
    <div className="w-full animate-pulse">
      <div className="h-11 bg-slate-100 rounded-t-xl mb-2" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-4 px-6 border-b border-slate-100">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-4 bg-slate-200/70 rounded"
              style={{ width: `${Math.floor(100 / cols)}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="h-4 bg-slate-200/70 rounded w-1/3 mb-4" />
          <div className="h-8 bg-slate-200/70 rounded w-2/3 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
};
