import React, { useEffect, useState } from 'react';
import { contractApi } from '../../services/api';
import { Contract, ContractStatus } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate } from '../../utils';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { ContractFormModal } from './ContractFormModal';
import { ContractDetailModal } from './ContractDetailModal';
import { TerminateContractModal } from './TerminateContractModal';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit2,
  XCircle,
  DoorOpen,
  User,
  Calendar,
} from 'lucide-react';

export const ContractListPage: React.FC = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_STAFF';
  const toast = useToast();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ContractStatus | ''>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedContractForEdit, setSelectedContractForEdit] = useState<Contract | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedContractForDetail, setSelectedContractForDetail] = useState<Contract | null>(null);

  const [terminateModalOpen, setTerminateModalOpen] = useState(false);
  const [contractToTerminate, setContractToTerminate] = useState<Contract | null>(null);

  const fetchContracts = async () => {
    setIsLoading(true);
    try {
      const res = await contractApi.getContracts({
        search: search || undefined,
        status: selectedStatus || undefined,
        page,
        size: 10,
      });
      if (res.data.success) {
        setContracts(res.data.data.content);
        setTotalPages(res.data.data.totalPages);
        setTotalElements(res.data.data.totalElements);
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách hợp đồng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [page, search, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Quản Lý Hợp Đồng Thuê
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi hợp đồng thuê phòng, thời hạn, giá thuê, tiền cọc và thanh lý hợp đồng.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setSelectedContractForEdit(null);
              setFormModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tạo Hợp Đồng Mới
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm theo mã HĐ, số phòng, tên khách thuê..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as ContractStatus | '');
              setPage(0);
            }}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all bg-white"
          >
            <option value="">Tất cả trạng thái hợp đồng</option>
            <option value="ACTIVE">Đang hiệu lực (ACTIVE)</option>
            <option value="EXPIRED">Hết hạn (EXPIRED)</option>
            <option value="TERMINATED">Đã thanh lý (TERMINATED)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : contracts.length === 0 ? (
          <EmptyState
            title="Không có hợp đồng nào"
            description="Chưa có hợp đồng nào được tạo hoặc không có kết quả phù hợp với tìm kiếm."
            actionText={canManage ? "Tạo Hợp Đồng Mới" : undefined}
            onAction={() => setFormModalOpen(true)}
            icon={<FileText className="w-8 h-8" />}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Mã Hợp Đồng</th>
                    <th className="px-6 py-4">Phòng</th>
                    <th className="px-6 py-4">Khách Thuê</th>
                    <th className="px-6 py-4">Thời Hạn</th>
                    <th className="px-6 py-4">Giá Thuê</th>
                    <th className="px-6 py-4">Trạng Thái</th>
                    <th className="px-6 py-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contracts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{c.contractCode}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">Phòng {c.roomNumber}</span>
                        <p className="text-xs text-slate-400">{c.buildingName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900">{c.tenantName}</span>
                        <p className="text-xs text-slate-500">{c.tenantPhone}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <span>{formatDate(c.startDate)}</span>
                        <span className="mx-1 text-slate-400">→</span>
                        <span>{formatDate(c.endDate)}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-600">
                        {formatCurrency(c.rentPrice)}
                        <span className="text-xs text-slate-400 font-normal">/tháng</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={c.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedContractForDetail(c);
                              setDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canManage && (
                            <>
                              {c.status === 'ACTIVE' && (
                                <button
                                  onClick={() => {
                                    setContractToTerminate(c);
                                    setTerminateModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Thanh lý hợp đồng"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}

                              {c.status !== 'TERMINATED' && (
                                <button
                                  onClick={() => {
                                    setSelectedContractForEdit(c);
                                    setFormModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Chỉnh sửa"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
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
      <ContractFormModal
        isOpen={formModalOpen}
        contract={selectedContractForEdit}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedContractForEdit(null);
        }}
        onSuccess={fetchContracts}
      />

      <ContractDetailModal
        isOpen={detailModalOpen}
        contract={selectedContractForDetail}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedContractForDetail(null);
        }}
      />

      <TerminateContractModal
        isOpen={terminateModalOpen}
        contract={contractToTerminate}
        onClose={() => {
          setTerminateModalOpen(false);
          setContractToTerminate(null);
        }}
        onSuccess={fetchContracts}
      />
    </div>
  );
};
