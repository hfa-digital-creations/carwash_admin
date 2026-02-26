// ============================================
// FILE: src/pages/dashboard/Dashboard.jsx
// ============================================
import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, RefreshCw } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import { PageLoader, PageError } from '../../components/common/PageLoader';
import { dashboardAPI } from '../../utils/apiHelper';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [stats,   setStats]   = useState(null);

  useEffect(() => { fetchDashboardData(); }, []);

 const fetchDashboardData = async () => {
  setLoading(true); setError(null);
  try {
    const data = await dashboardAPI.getStatistics();
    setStats(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  if (loading) return <PageLoader text="Loading dashboard..." />;
  if (error)   return <PageError message={error} onRetry={fetchDashboardData} />;

  const userStats      = stats?.userStats      || {};
  const orderStats     = stats?.orderStats     || {};
  const financialStats = stats?.financialStats || {};
  const otherStats     = stats?.otherStats     || {};
  const recentOrders   = stats?.recentOrders   || [];
  const analytics      = stats?.analytics      || {};

  const userStatsCards = [
    { label: 'Total Customers',         value: userStats.totalCustomers        || 0 },
    { label: 'Total Washers',            value: userStats.totalWashers           || 0 },
    { label: 'Total Delivery Partners',  value: userStats.totalDeliveryPartners  || 0 },
    { label: 'Total Repair Providers',   value: userStats.totalRepairProviders   || 0 },
    { label: 'Total Sellers',            value: userStats.totalSellers           || 0 },
  ];

  const orderStatsCards = [
    { label: 'Active Orders (Car Wash)',  value: orderStats.activeCarWashOrders  || 0 },
    { label: 'Active Orders (Bike Wash)', value: orderStats.activeBikeWashOrders || 0 },
    { label: 'Active Orders (Delivery)',  value: orderStats.activeDeliveryOrders || 0 },
    { label: 'Active Orders (Repair)',    value: orderStats.activeRepairOrders   || 0 },
  ];

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const getMonthName = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    return new Date(year, month - 1).toLocaleString('en-US', { month: 'short' });
  };

  const mapStatus = (status) => {
    const statusMap = {
      'Completed': 'completed', 'Service Completed': 'completed', 'Delivered': 'completed',
      'Washing in Progress': 'in_progress', 'Service Ongoing': 'in_progress', 'Out for Delivery': 'in_progress',
      'Pending': 'pending', 'Pending Payment': 'pending',
      'Partner Assigned': 'active', 'Confirmed': 'active',
      'Cancelled': 'cancelled',
    };
    return statusMap[status] || 'pending';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <Button variant="secondary" icon={RefreshCw} onClick={fetchDashboardData} disabled={loading}>
          Refresh
        </Button>
      </div>

      {/* User Stats - 2 cols mobile, 5 cols lg */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {userStatsCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs sm:text-sm text-gray-600 leading-tight">{stat.label}</div>
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0 ml-1" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Order Stats - 2 cols mobile, 4 cols lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {orderStatsCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-600 mb-2 leading-tight">{stat.label}</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Revenue + Verifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Pending Verifications</div>
          <div className="text-3xl font-bold text-gray-900">{otherStats.pendingVerifications || 0}</div>
          <div className="text-sm text-orange-600 mt-2">Partners awaiting approval</div>
        </div>
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Total Revenue</div>
          <div className="text-3xl font-bold text-gray-900">{formatCurrency(financialStats.totalRevenue || 0)}</div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            <div><span className="text-gray-600">Car Wash: </span><span className="font-semibold">{formatCurrency(financialStats.carWashRevenue || 0)}</span></div>
            <div><span className="text-gray-600">Bike Wash: </span><span className="font-semibold">{formatCurrency(financialStats.bikeWashRevenue || 0)}</span></div>
            <div><span className="text-gray-600">Repair: </span><span className="font-semibold">{formatCurrency(financialStats.repairRevenue || 0)}</span></div>
            <div><span className="text-gray-600">Products: </span><span className="font-semibold">{formatCurrency(financialStats.productRevenue || 0)}</span></div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Analytics (Last 6 Months)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Bar Chart */}
          <div>
            <div className="mb-4">
              <div className="text-sm text-gray-600">Monthly Revenue Trend</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(financialStats.totalRevenue || 0)}</div>
              <div className="text-sm text-primary-500 flex items-center">Last 6 Months <TrendingUp className="w-4 h-4 ml-1" /></div>
            </div>
            <div className="flex items-end justify-between h-40 sm:h-48 space-x-1 sm:space-x-2">
              {analytics.monthlyRevenue?.slice(-6).map((item, i) => {
                const maxRevenue = Math.max(...analytics.monthlyRevenue.slice(-6).map(m => m.revenue));
                const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-primary-500 rounded-t-lg transition-all hover:bg-primary-600 cursor-pointer relative group"
                      style={{ height: `${Math.max(height, 5)}%` }}>
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        {formatCurrency(item.revenue)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              {analytics.monthlyRevenue?.slice(-6).map((item, i) => (
                <span key={i} className="flex-1 text-center">{getMonthName(item.month)}</span>
              ))}
            </div>
          </div>

          {/* Orders Line Chart */}
          <div>
            <div className="mb-4">
              <div className="text-sm text-gray-600">Order Growth Trend</div>
              <div className="text-2xl font-bold text-gray-900">{orderStats.totalActiveOrders || 0}</div>
              <div className="text-sm text-green-500 flex items-center">Active Orders <TrendingUp className="w-4 h-4 ml-1" /></div>
            </div>
            <div className="h-40 sm:h-48 relative">
              {analytics.monthlyOrders?.length > 0 ? (
                <svg viewBox="0 0 300 150" className="w-full h-full">
                  <polyline
                    points={analytics.monthlyOrders.slice(-6).map((item, i) => {
                      const maxCount = Math.max(...analytics.monthlyOrders.slice(-6).map(m => m.count));
                      return `${(i / 5) * 300},${150 - ((item.count / maxCount) * 120)}`;
                    }).join(' ')}
                    fill="none" stroke="#f97316" strokeWidth="3" />
                  {analytics.monthlyOrders.slice(-6).map((item, i) => {
                    const maxCount = Math.max(...analytics.monthlyOrders.slice(-6).map(m => m.count));
                    return (
                      <circle key={i} cx={(i / 5) * 300} cy={150 - ((item.count / maxCount) * 120)} r="4" fill="#f97316">
                        <title>{`${getMonthName(item.month)}: ${item.count} orders`}</title>
                      </circle>
                    );
                  })}
                </svg>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data available</div>
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              {analytics.monthlyOrders?.slice(-6).map((item, i) => (
                <span key={i}>{getMonthName(item.month)}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No recent orders</div>
        ) : (
          <>
            {/* ── Mobile Card View ── */}
            <div className="block sm:hidden divide-y divide-gray-100">
              {recentOrders.map((order, i) => (
                <div key={i} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs text-gray-500">{order.orderId}</p>
                      <p className="font-semibold text-gray-900 text-sm mt-0.5">{order.customer}</p>
                    </div>
                    <StatusBadge status={mapStatus(order.status)} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                    <span><span className="font-medium">Type:</span> {order.serviceType}</span>
                    <span><span className="font-medium">Assigned:</span> {order.assignedEmployee}</span>
                    <span><span className="font-medium">Date:</span> {new Date(order.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Desktop Table View ── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-gray-600 text-sm">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium">Order ID</th>
                    <th className="text-left px-6 py-3 font-medium">Customer</th>
                    <th className="text-left px-6 py-3 font-medium">Service Type</th>
                    <th className="text-left px-6 py-3 font-medium">Assigned Employee</th>
                    <th className="text-left px-6 py-3 font-medium">Status</th>
                    <th className="text-left px-6 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-sm">{order.orderId}</td>
                      <td className="px-6 py-4">{order.customer}</td>
                      <td className="px-6 py-4">{order.serviceType}</td>
                      <td className="px-6 py-4">{order.assignedEmployee}</td>
                      <td className="px-6 py-4"><StatusBadge status={mapStatus(order.status)} /></td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(order.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}