// ============================================
// FILE: src/pages/orders/OrdersManagement.jsx
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, Filter, CheckCircle, UserPlus, Zap } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { PageLoader, PageError } from '../../components/common/PageLoader';
import { bookingAPI, orderAPI, serviceRequestAPI } from '../../utils/apiHelper';

const ITEMS_PER_PAGE = 10;

const TABS = [
  { id: 'washers',  label: 'Washers'         },
  { id: 'delivery', label: 'Product Orders'  },
  { id: 'repair',   label: 'Repair Services' },
];

const STATUS_OPTIONS = {
  washers: [
    { value: '', label: 'All Statuses' },
    { value: 'Pending Payment', label: 'Pending Payment' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Partner Assigned', label: 'Partner Assigned' },
    { value: 'Partner Accepted', label: 'Partner Accepted' },
    { value: 'Washer On The Way', label: 'Washer On The Way' },
    { value: 'Washer Arrived', label: 'Washer Arrived' },
    { value: 'Washing in Progress', label: 'Washing in Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' },
  ],
  delivery: [
    { value: '', label: 'All Statuses' },
    { value: 'Pending Payment', label: 'Pending Payment' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Assigned to Delivery Partner', label: 'Assigned to Delivery' },
    { value: 'Going to Pickup', label: 'Going to Pickup' },
    { value: 'Picked Up', label: 'Picked Up' },
    { value: 'Going to Customer', label: 'Going to Customer' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' },
  ],
  repair: [
    { value: '', label: 'All Statuses' },
    { value: 'Pending Payment', label: 'Pending Payment' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Request Placed', label: 'Request Placed' },
    { value: 'Service Accepted', label: 'Service Accepted' },
    { value: 'Service Ongoing', label: 'Service Ongoing' },
    { value: 'Service Completed', label: 'Service Completed' },
    { value: 'Cancelled', label: 'Cancelled' },
  ],
};

const normalizeStatus = (status) =>
  status?.toLowerCase().replace(/\s+/g, '_')
    .replace('pending_payment', 'pending').replace('request_placed', 'pending')
    .replace('service_accepted', 'active').replace('service_ongoing', 'active')
    .replace('partner_assigned', 'active').replace('partner_accepted', 'active')
    .replace('washer_on_the_way', 'active').replace('washer_arrived', 'active')
    .replace('washing_in_progress', 'active').replace('going_to_pickup', 'active')
    .replace('picked_up', 'active').replace('going_to_customer', 'active')
    .replace('assigned_to_delivery_partner', 'active');

export default function OrdersManagement() {
  const navigate = useNavigate();

  const [activeTab,    setActiveTab]    = useState('washers');
  const [currentPage,  setCurrentPage]  = useState(1);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [bookings,        setBookings]        = useState([]);
  const [orders,          setOrders]          = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [totalPages,      setTotalPages]      = useState(1);
  const [totalItems,      setTotalItems]      = useState(0);
  const [actionLoading,   setActionLoading]   = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const filters = { page: currentPage, limit: ITEMS_PER_PAGE, status: statusFilter || undefined };
      let response;
      if (activeTab === 'washers') {
        response = await bookingAPI.getAllBookings(filters);
        setBookings(response.bookings || []);
      } else if (activeTab === 'delivery') {
        response = await orderAPI.getAllOrders(filters);
        setOrders(response.orders || []);
      } else {
        response = await serviceRequestAPI.getAllRequests(filters);
        setServiceRequests(response.requests || []);
      }
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (itemId, type) => {
    setActionLoading(prev => ({ ...prev, [itemId]: 'approving' }));
    try {
      if (type === 'booking') await bookingAPI.approveBooking(itemId);
      else if (type === 'order') await orderAPI.confirmOrder(itemId);
      else if (type === 'service') await serviceRequestAPI.approveRequest(itemId);
      fetchData();
    } catch (err) { console.error(err); }
    finally { setActionLoading(prev => ({ ...prev, [itemId]: false })); }
  };

  const handleAutoAssign = async (itemId, type) => {
    setActionLoading(prev => ({ ...prev, [itemId]: 'auto-assigning' }));
    try {
      if (type === 'booking') await bookingAPI.autoAssignPartner(itemId);
      else if (type === 'order') await orderAPI.autoAssignDeliveryPartner(itemId);
      fetchData();
    } catch (err) { fetchData(); }
    finally { setActionLoading(prev => ({ ...prev, [itemId]: false })); }
  };

  const handleManualAssign = (itemId, type) => {
    if (type === 'booking') navigate(`/orders/assign/${itemId}?type=booking`);
    if (type === 'order')   navigate(`/orders/assign/${itemId}?type=delivery`);
  };

  const getCurrentData = () => {
    let data = [], type = '';
    if (activeTab === 'washers')  { data = bookings;        type = 'booking'; }
    if (activeTab === 'delivery') { data = orders;          type = 'order';   }
    if (activeTab === 'repair')   { data = serviceRequests; type = 'service'; }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(item =>
        item.customerName?.toLowerCase().includes(q) ||
        item.bookingId?.toLowerCase().includes(q) ||
        item.orderId?.toLowerCase().includes(q) ||
        item.requestId?.toLowerCase().includes(q)
      );
    }
    return { data, type };
  };

  const getItemFields = (item, type) => {
    if (type === 'booking') return {
      itemId: item.bookingId, customerName: item.customerName,
      col2: `${item.vehicleType} - ${item.vehicleNumber}`, col3: item.serviceName,
      status: item.status,
      assignedLabel: item.partnerName || (item.partnerId ? 'Assigned' : 'Unassigned'),
      showApprove: item.status === 'Pending',
      showAutoAssign: item.status === 'Confirmed' && !item.partnerId,
    };
    if (type === 'order') return {
      itemId: item.orderId, customerName: item.customerName,
      col2: `${item.items?.length || 0} item(s)`, col3: `₹${item.total}`,
      status: item.orderStatus,
      assignedLabel: item.deliveryPartnerName || (item.deliveryPartnerId ? 'Assigned' : 'Unassigned'),
      showApprove: item.orderStatus === 'Pending',
      showAutoAssign: item.orderStatus === 'Confirmed' && !item.deliveryPartnerId,
    };
    return {
      itemId: item.requestId, customerName: item.customerName,
      col2: item.service?.serviceName || 'N/A', col3: `₹${item.estimatedTotal || 0}`,
      status: item.status,
      assignedLabel: item.technicianName || (item.technicianId ? 'Assigned' : 'Unassigned'),
      showApprove: item.status === 'Pending',
      showAutoAssign: false,
    };
  };

  const { data, type } = getCurrentData();
  const statusOptions = STATUS_OPTIONS[activeTab] || [{ value: '', label: 'All Statuses' }];

  const ActionButtons = ({ item, type, isLoading, fields }) => (
    <div className="flex flex-wrap gap-2">
      {fields.showApprove && (
        <button onClick={() => handleApprove(item._id, type)} disabled={isLoading}
          className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs sm:text-sm font-medium disabled:opacity-40 transition-colors">
          <CheckCircle className="w-3.5 h-3.5" />
          {actionLoading[item._id] === 'approving' ? 'Approving…' : 'Approve'}
        </button>
      )}
      {fields.showAutoAssign && (
        <button onClick={() => handleAutoAssign(item._id, type)} disabled={isLoading}
          className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-xs sm:text-sm font-medium disabled:opacity-40 transition-colors">
          <Zap className="w-3.5 h-3.5" />
          {actionLoading[item._id] === 'auto-assigning' ? 'Assigning…' : 'Auto'}
        </button>
      )}
      {fields.showAutoAssign && (
        <button onClick={() => handleManualAssign(item._id, type)} disabled={isLoading}
          className="flex items-center gap-1 text-primary-500 hover:text-primary-600 text-xs sm:text-sm font-medium disabled:opacity-40 transition-colors">
          <UserPlus className="w-3.5 h-3.5" />
          Assign
        </button>
      )}
      <button onClick={() => navigate(`/orders/${item._id}?type=${type}`)}
        className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium transition-colors">
        View
      </button>
    </div>
  );

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm font-medium text-gray-700 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {loading && <PageLoader text="Loading orders..." />}

      {!loading && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Tabs - scrollable */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex min-w-max sm:min-w-0">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setCurrentPage(1); setStatusFilter(''); setSearchQuery(''); }}
                  className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 bg-primary-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Search by name or ID…" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white" />
              </div>
              <div className="relative sm:w-56">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white appearance-none cursor-pointer">
                  {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
            {totalItems > 0 && (
              <p className="text-xs text-gray-400 mt-2.5">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} results
              </p>
            )}
          </div>

          {error && <PageError message={error} onRetry={fetchData} />}

          {!error && (
            <>
              {/* ── Mobile Card View ── */}
              <div className="block sm:hidden divide-y divide-gray-100">
                {data.length === 0 ? (
                  <div className="p-10 text-center text-gray-500 text-sm">No data found</div>
                ) : (
                  data.map(item => {
                    const fields    = getItemFields(item, type);
                    const isLoading = !!actionLoading[item._id];
                    return (
                      <div key={item._id} className="p-4 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{fields.customerName}</p>
                            <p className="font-mono text-xs text-gray-400 mt-0.5">{fields.itemId}</p>
                          </div>
                          <StatusBadge status={normalizeStatus(fields.status)} />
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-600">
                          <span>{fields.col2}</span>
                          <span className="font-medium text-gray-800">{fields.col3}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Assigned: </span>{fields.assignedLabel}
                        </div>
                        <ActionButtons item={item} type={type} isLoading={isLoading} fields={fields} />
                      </div>
                    );
                  })
                )}
              </div>

              {/* ── Desktop Table View ── */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-6 py-3 font-semibold">Customer / ID</th>
                      <th className="text-left px-6 py-3 font-semibold">{activeTab === 'washers' ? 'Vehicle' : activeTab === 'delivery' ? 'Items' : 'Service'}</th>
                      <th className="text-left px-6 py-3 font-semibold">{activeTab === 'washers' ? 'Service Plan' : 'Amount'}</th>
                      <th className="text-left px-6 py-3 font-semibold">Status</th>
                      <th className="text-left px-6 py-3 font-semibold">{activeTab === 'washers' ? 'Washer' : activeTab === 'delivery' ? 'Delivery Partner' : 'Technician'}</th>
                      <th className="text-left px-6 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.length === 0 ? (
                      <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No data found</td></tr>
                    ) : (
                      data.map(item => {
                        const fields    = getItemFields(item, type);
                        const isLoading = !!actionLoading[item._id];
                        return (
                          <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{fields.customerName}</div>
                              <div className="text-xs text-gray-400 font-mono mt-0.5">{fields.itemId}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 text-sm">{fields.col2}</td>
                            <td className="px-6 py-4 text-gray-600 text-sm">{fields.col3}</td>
                            <td className="px-6 py-4"><StatusBadge status={normalizeStatus(fields.status)} /></td>
                            <td className="px-6 py-4 text-gray-600 text-sm">{fields.assignedLabel}</td>
                            <td className="px-6 py-4">
                              <ActionButtons item={item} type={type} isLoading={isLoading} fields={fields} />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-100">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}