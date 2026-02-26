// ============================================
// FILE: src/pages/orders/OrderDetail.jsx
// ============================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, User, Phone, Mail, UserPlus, CheckCircle, Zap } from 'lucide-react';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { PageLoader, PageError } from '../../components/common/PageLoader';
import { bookingAPI, orderAPI, serviceRequestAPI } from '../../utils/apiHelper';

function Row({ label, value, bold, green }) {
  return (
    <div className={`flex justify-between gap-2 ${bold ? 'pt-2 border-t border-gray-100' : ''}`}>
      <span className={`text-sm ${bold ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>{label}</span>
      <span className={`text-sm text-right ${bold ? 'font-bold text-gray-900' : green ? 'font-medium text-green-600' : 'font-medium text-gray-700'}`}>{value}</span>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');

  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [data,          setData]          = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchDetails(); }, [id, type]);

  const fetchDetails = async () => {
    setLoading(true); setError(null);
    try {
      let response;
      if (type === 'booking')      { response = await bookingAPI.getBookingById(id);        setData(response.booking || response); }
      else if (type === 'order')   { response = await orderAPI.getOrderById(id);            setData(response.order   || response); }
      else if (type === 'service') { response = await serviceRequestAPI.getRequestById(id); setData(response.booking || response); }
      else throw new Error('Invalid type parameter');
    } catch (err) {
      setError(err.message || 'Failed to fetch details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading('approving');
    try {
      if (type === 'booking')      await bookingAPI.approveBooking(id);
      else if (type === 'order')   await orderAPI.confirmOrder(id);
      else if (type === 'service') await serviceRequestAPI.approveRequest(id);
      fetchDetails();
    } catch (err) { console.error(err); }
    finally { setActionLoading(false); }
  };

  const handleAutoAssign = async () => {
    setActionLoading('auto-assigning');
    try {
      if (type === 'booking') await bookingAPI.autoAssignPartner(id);
      else if (type === 'order') await orderAPI.autoAssignDeliveryPartner(id);
      fetchDetails();
    } catch (err) { fetchDetails(); }
    finally { setActionLoading(false); }
  };

  const handleManualAssign = () => {
    if (type === 'booking') navigate(`/orders/assign/${id}?type=booking`);
    if (type === 'order')   navigate(`/orders/assign/${id}?type=delivery`);
  };

  if (loading) return <PageLoader text="Loading order details..." />;
  if (error)   return <PageError message={error} onRetry={fetchDetails} />;
  if (!data)   return <div className="p-6 text-center mt-24"><p className="text-gray-500 text-sm">No data found</p></div>;

  const orderId          = data.bookingId  || data.orderId  || data.requestId;
  const status           = data.status     || data.orderStatus;
  const timeline         = data.statusTimeline || [];
  const address          = data.address    || data.shippingAddress || data.serviceAddress;
  const customer         = { name: data.customerName, phone: data.customerPhone, email: data.customerId?.email || data.customerEmail };
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '_').replace('pending_payment', 'pending').replace('request_placed', 'pending');

  const showApprove      = status === 'Pending';
  const showAutoAssign   = (type === 'booking' && status === 'Confirmed' && !data.partnerId) ||
                           (type === 'order'   && status === 'Confirmed' && !data.deliveryPartnerId);
  const showManualAssign = showAutoAssign;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/orders')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              {type === 'booking' ? 'Booking' : type === 'order' ? 'Order' : 'Service Request'} Details
            </h1>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              {orderId} · {new Date(data.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap ml-11 sm:ml-0">
          {showApprove && (
            <Button variant="success" size="sm" onClick={handleApprove} disabled={!!actionLoading}>
              <CheckCircle className="w-3.5 h-3.5 mr-1.5 inline" />
              {actionLoading === 'approving' ? 'Approving…' : 'Approve'}
            </Button>
          )}
          {showAutoAssign && (
            <Button variant="secondary" size="sm" onClick={handleAutoAssign} disabled={!!actionLoading}>
              <Zap className="w-3.5 h-3.5 mr-1.5 inline" />
              {actionLoading === 'auto-assigning' ? 'Assigning…' : 'Auto Assign'}
            </Button>
          )}
          {showManualAssign && (
            <Button variant="primary" size="sm" onClick={handleManualAssign} disabled={!!actionLoading}>
              <UserPlus className="w-3.5 h-3.5 mr-1.5 inline" />
              {type === 'order' ? 'Assign Delivery' : 'Assign Washer'}
            </Button>
          )}
        </div>
      </div>

      {/* Main grid: content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* ── Left: main content ── */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          {/* Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div><div className="text-xs text-gray-400 mb-0.5">Order ID</div><div className="font-mono font-semibold text-xs sm:text-sm text-gray-900 break-all">{orderId}</div></div>
              <div><div className="text-xs text-gray-400 mb-0.5">Date</div><div className="font-semibold text-sm text-gray-900">{new Date(data.createdAt).toLocaleDateString()}</div></div>
              <div><div className="text-xs text-gray-400 mb-0.5">Status</div><StatusBadge status={normalizedStatus} /></div>
              <div><div className="text-xs text-gray-400 mb-0.5">Payment</div>
                <div className={`font-semibold text-sm ${data.paymentStatus === 'Paid' ? 'text-green-600' : data.paymentStatus === 'Partially Paid' ? 'text-orange-600' : 'text-gray-500'}`}>
                  {data.paymentStatus || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Customer</h2>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5"><User className="w-4 h-4 text-gray-300 flex-shrink-0" /><span className="text-gray-900 text-sm">{customer.name}</span></div>
              <div className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-gray-300 flex-shrink-0" /><span className="text-gray-900 text-sm">{customer.phone}</span></div>
              {customer.email && <div className="flex items-center gap-2.5"><Mail className="w-4 h-4 text-gray-300 flex-shrink-0" /><span className="text-gray-900 text-sm break-all">{customer.email}</span></div>}
              {address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                  <div className="text-gray-900 text-sm">
                    {address.street && <div>{address.street}</div>}
                    <div>{address.city}, {address.pincode}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Type-specific details */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              {type === 'booking' ? 'Booking Details' : type === 'order' ? 'Order Items' : 'Service Details'}
            </h2>

            {type === 'booking' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div><div className="text-xs text-gray-400">Service Type</div><div className="font-semibold text-sm text-gray-900">{data.serviceType}</div></div>
                  <div><div className="text-xs text-gray-400">Service Name</div><div className="font-semibold text-sm text-gray-900">{data.serviceName}</div></div>
                  <div><div className="text-xs text-gray-400">Vehicle</div><div className="font-semibold text-sm text-gray-900">{data.vehicleType} – {data.vehicleNumber}</div></div>
                  {data.scheduledDate && <div><div className="text-xs text-gray-400">Scheduled</div><div className="font-semibold text-sm text-gray-900">{new Date(data.scheduledDate).toLocaleDateString()} {data.scheduledTime}</div></div>}
                </div>
                <div className="pt-3 border-t border-gray-100 space-y-1.5">
                  <Row label="Subtotal" value={`₹${data.subtotal}`} />
                  {data.expressFee > 0 && <Row label="Express Fee" value={`₹${data.expressFee}`} />}
                  {data.discount > 0  && <Row label="Discount" value={`-₹${data.discount}`} green />}
                  <Row label="Total" value={`₹${data.total}`} bold />
                </div>
              </div>
            )}

            {type === 'order' && (
              <div className="space-y-4">
                <div className="space-y-2.5">
                  {data.items?.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      {item.productImage && (
                        <img src={item.productImage} alt={item.productTitle}
                          className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded flex-shrink-0"
                          onError={e => e.target.style.display='none'} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900">{item.productTitle}</div>
                        <div className="text-xs text-gray-600 mt-1">{item.quantity} × ₹{item.unitPrice} = <span className="font-semibold text-gray-900">₹{item.subtotal}</span></div>
                        <div className="text-xs text-gray-400 mt-0.5">Seller: {item.sellerName}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-gray-100 space-y-1.5">
                  <Row label="Subtotal" value={`₹${data.subtotal}`} />
                  <Row label="Shipping" value={`₹${data.shippingCharges || 0}`} />
                  {data.discount > 0 && <Row label="Discount" value={`-₹${data.discount}`} green />}
                  <Row label="Total" value={`₹${data.total}`} bold />
                </div>
              </div>
            )}

            {type === 'service' && data.service && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div><div className="text-xs text-gray-400">Service</div><div className="font-semibold text-sm text-gray-900">{data.service.serviceName}</div></div>
                  {data.scheduledDate && <div><div className="text-xs text-gray-400">Scheduled</div><div className="font-semibold text-sm text-gray-900">{new Date(data.scheduledDate).toLocaleDateString()} {data.scheduledTime}</div></div>}
                </div>
                <div className="pt-3 border-t border-gray-100 space-y-1.5">
                  <Row label="Estimated Total" value={`₹${data.estimatedTotal}`} />
                  {data.discount > 0 && <Row label="Discount" value={`-₹${data.discount}`} green />}
                  {data.actualTotal  && <Row label="Actual Total" value={`₹${data.actualTotal}`} bold />}
                </div>
              </div>
            )}
          </div>

          {/* Assigned partner */}
          {(data.partnerId || data.deliveryPartnerId || data.technicianId) && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                {type === 'booking' ? 'Assigned Washer' : type === 'order' ? 'Delivery Partner' : 'Assigned Technician'}
              </h2>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-300" /><span className="font-semibold text-sm text-gray-900">{data.partnerName || data.deliveryPartnerName || data.technicianName || 'Not Assigned'}</span></div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-300" /><span className="text-sm text-gray-700">{data.partnerPhone || data.deliveryPartnerPhone || data.technicianPhone || 'N/A'}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar: Timeline + Payment ── */}
        <div className="space-y-4 sm:space-y-5">
          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Timeline</h2>
            {timeline.length === 0 ? (
              <p className="text-xs text-gray-400">No timeline yet</p>
            ) : (
              <div className="space-y-3">
                {timeline.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${i === timeline.length - 1 ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="font-medium text-xs text-gray-900">{item.status}</div>
                      <div className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleString()}</div>
                      {item.note && <div className="text-xs text-gray-400 italic mt-0.5">{item.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Payment</h2>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Method</span>
                <span className="text-xs font-medium text-gray-700">{data.paymentMethod || 'Not Selected'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Status</span>
                <span className={`text-xs font-bold ${data.paymentStatus === 'Paid' ? 'text-green-600' : data.paymentStatus === 'Partially Paid' ? 'text-orange-600' : 'text-gray-500'}`}>
                  {data.paymentStatus || '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}