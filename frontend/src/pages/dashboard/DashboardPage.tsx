import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardApi, invoiceApi } from '../../services/api';
import {
  DashboardStatistics,
  RevenueStatistics,
  RoomStatusDistribution,
  Invoice,
} from '../../types';
import { formatCurrency, formatDate } from '../../utils';
import { Badge } from '../../components/common/Badge';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Home,
  Users,
  FileCheck2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PayInvoiceModal } from '../invoices/PayInvoiceModal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isTenant = user?.role === 'ROLE_TENANT';

  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueStatistics | null>(null);
  const [statusDistribution, setStatusDistribution] = useState<RoomStatusDistribution | null>(null);
  const [tenantInvoices, setTenantInvoices] = useState<Invoice[]>([]);
  const [revenueMonths, setRevenueMonths] = useState<number>(6);
  const [isLoading, setIsLoading] = useState(true);

  // Selected invoice for payment
  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState<Invoice | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      if (isTenant) {
        // Fetch tenant-specific data
        const invRes = await invoiceApi.getInvoices({ size: 10 });
        if (invRes.data.success) {
          setTenantInvoices(invRes.data.data.content);
        }
      } else {
        // Fetch admin/staff overview
        const [statsRes, revRes, distRes] = await Promise.all([
          dashboardApi.getStatistics(),
          dashboardApi.getRevenue(revenueMonths),
          dashboardApi.getRoomStatus(),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (revRes.data.success) setRevenueData(revRes.data.data);
        if (distRes.data.success) setStatusDistribution(distRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [revenueMonths, isTenant]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <CardSkeleton count={4} />
      </div>
    );
  }

  // -------------------------------------------------------------
  // TENANT DASHBOARD VIEW
  // -------------------------------------------------------------
  if (isTenant) {
    const unpaidInvoices = tenantInvoices.filter((i) => i.status !== 'PAID');
    const paidInvoices = tenantInvoices.filter((i) => i.status === 'PAID');

    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 sm:p-8 text-white shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Xin chào, {user?.fullName}! 👋
          </h1>
          <p className="mt-1 text-indigo-100 text-sm">
            Đây là cổng thông tin cá nhân dành cho khách thuê. Bạn có thể theo dõi hợp đồng, hóa đơn và lịch sử thanh toán tại đây.
          </p>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Hóa đơn cần thanh toán
              </p>
              <h3 className="text-2xl font-bold text-slate-800">{unpaidInvoices.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Hóa đơn đã hoàn tất
              </p>
              <h3 className="text-2xl font-bold text-slate-800">{paidInvoices.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Tổng tiền cần thanh toán
              </p>
              <h3 className="text-xl font-bold text-rose-600">
                {formatCurrency(
                  unpaidInvoices.reduce((acc, curr) => acc + (curr.remainingAmount || curr.totalAmount), 0)
                )}
              </h3>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">Danh Sách Hóa Đơn Của Bạn</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Mã Hóa Đơn</th>
                  <th className="px-6 py-4">Phòng</th>
                  <th className="px-6 py-4">Tháng</th>
                  <th className="px-6 py-4">Tổng Tiền</th>
                  <th className="px-6 py-4">Hạn Đóng</th>
                  <th className="px-6 py-4">Trạng Thái</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenantInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      Bạn chưa có hóa đơn nào trong hệ thống.
                    </td>
                  </tr>
                ) : (
                  tenantInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">{inv.invoiceCode}</td>
                      <td className="px-6 py-4 text-slate-600">{inv.roomNumber}</td>
                      <td className="px-6 py-4 font-medium text-slate-700">{inv.billingMonth}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(inv.totalAmount)}</td>
                      <td className="px-6 py-4 text-slate-500">{formatDate(inv.dueDate)}</td>
                      <td className="px-6 py-4">
                        <Badge status={inv.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {inv.status !== 'PAID' ? (
                          <button
                            onClick={() => setSelectedInvoiceForPay(inv)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-all"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Thanh toán
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-medium">Đã thanh toán</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedInvoiceForPay && (
          <PayInvoiceModal
            isOpen={!!selectedInvoiceForPay}
            invoice={selectedInvoiceForPay}
            onClose={() => setSelectedInvoiceForPay(null)}
            onSuccess={() => {
              setSelectedInvoiceForPay(null);
              fetchDashboardData();
            }}
          />
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // ADMIN / STAFF DASHBOARD VIEW
  // -------------------------------------------------------------
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Tổng Quan Hệ Thống
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi hiệu suất vận hành khu trọ, tình trạng phòng và doanh thu thời gian thực.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tổng Số Phòng
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats?.totalRooms || 0}</span>
            <span className="text-xs font-medium text-emerald-600">
              {stats?.occupiedRooms || 0} đang thuê
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {stats?.availableRooms || 0} phòng trống sẵn sàng đón khách
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Khách Thuê
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats?.totalTenants || 0}</span>
            <span className="text-xs font-medium text-blue-600">người</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {stats?.activeContracts || 0} hợp đồng đang có hiệu lực
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Doanh Thu Tháng Này
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {formatCurrency(stats?.monthlyRevenue || 0)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Đã thu từ các hóa đơn đã thanh toán</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Chưa Thu Tiền
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">
              {formatCurrency(stats?.totalUnpaidAmount || 0)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {stats?.unpaidInvoices || 0} hóa đơn chưa thu ({stats?.overdueInvoices || 0} quá hạn)
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart (2 cols) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">Biểu Đồ Doanh Thu</h2>
              <p className="text-xs text-slate-500">Doanh thu thực tế theo các tháng</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRevenueMonths(6)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  revenueMonths === 6
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                6 Tháng
              </button>
              <button
                onClick={() => setRevenueMonths(12)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  revenueMonths === 12
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                12 Tháng
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData?.items || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="monthLabel" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}Tr`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Doanh thu']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Status Donut Chart (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-1">Tỷ Lệ Trạng Thái Phòng</h2>
            <p className="text-xs text-slate-500 mb-4">Phân bổ tình trạng phòng thực tế</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution?.distribution || []}
                  dataKey="count"
                  nameKey="statusLabel"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                >
                  {statusDistribution?.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} phòng`, name]}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-2">
            {statusDistribution?.distribution.map((item) => (
              <div key={item.status} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-700">{item.statusLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{item.count} phòng</span>
                  <span className="text-slate-400">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Invoices & Unpaid Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Hóa Đơn Mới Tạo Gần Đây</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Mã Hóa Đơn</th>
                  <th className="px-6 py-3.5">Phòng</th>
                  <th className="px-6 py-3.5">Tổng Tiền</th>
                  <th className="px-6 py-3.5">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.recentInvoices?.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-slate-800">{inv.invoiceCode}</td>
                    <td className="px-6 py-3.5 text-slate-600">{inv.roomNumber}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-6 py-3.5">
                      <Badge status={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Urgent Unpaid Invoices */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Hóa Đơn Cần Thu Tiền
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Phòng</th>
                  <th className="px-6 py-3.5">Khách Thuê</th>
                  <th className="px-6 py-3.5">Số Tiền</th>
                  <th className="px-6 py-3.5">Hạn Đóng</th>
                  <th className="px-6 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.unpaidInvoiceList?.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-slate-800">{inv.roomNumber}</td>
                    <td className="px-6 py-3.5 text-slate-600">{inv.tenantName}</td>
                    <td className="px-6 py-3.5 font-bold text-rose-600">{formatCurrency(inv.totalAmount)}</td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">{formatDate(inv.dueDate)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedInvoiceForPay(inv)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                      >
                        Thu tiền
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedInvoiceForPay && (
        <PayInvoiceModal
          isOpen={!!selectedInvoiceForPay}
          invoice={selectedInvoiceForPay}
          onClose={() => setSelectedInvoiceForPay(null)}
          onSuccess={() => {
            setSelectedInvoiceForPay(null);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};
