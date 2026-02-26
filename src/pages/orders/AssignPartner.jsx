// ============================================
// FILE: src/pages/orders/AssignPartner.jsx
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, User, Star, MapPin } from 'lucide-react';
import Button from '../../components/common/Button';
import { PageLoader, PageError } from '../../components/common/PageLoader';
import { partnerAPI, bookingAPI, orderAPI } from '../../utils/apiHelper';

const ROLE_MAPPING = {
  'booking':  'Washing Personnel',
  'delivery': 'Delivery Person',
};

export default function AssignPartner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');

  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [partners,         setPartners]         = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [selectedPartner,  setSelectedPartner]  = useState(null);
  const [assigning,        setAssigning]        = useState(false);
  const [orderStatus,      setOrderStatus]      = useState(null);

  const fetchPartners = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const backendRole = ROLE_MAPPING[type];
      if (!backendRole) throw new Error(`Invalid assignment type: ${type}`);

      const [partnerResponse, detailResponse] = await Promise.all([
        partnerAPI.getAllPartners(backendRole),
        type === 'delivery' ? orderAPI.getOrderById(id) : bookingAPI.getBookingById(id),
      ]);

      const detail = detailResponse.order || detailResponse.booking || detailResponse;
      setOrderStatus(detail?.orderStatus || detail?.status || null);

      const allPartners = partnerResponse.partners || partnerResponse.data || [];
      const active = allPartners.filter(p => p.isActive === true);
      setPartners(active);
      setFilteredPartners(active);
    } catch (err) {
      setError(err.message || 'Failed to load partners');
    } finally {
      setLoading(false);
    }
  }, [type, id]);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredPartners(partners.filter(p =>
        p.fullName?.toLowerCase().includes(q) || p.phoneNumber?.includes(searchQuery)
      ));
    } else {
      setFilteredPartners(partners);
    }
  }, [searchQuery, partners]);

  const handleAssign = async () => {
    if (!selectedPartner) return;
    setAssigning(true);
    try {
      if (type === 'booking') {
        if (orderStatus === 'Pending') await bookingAPI.approveBooking(id);
        await bookingAPI.manuallyAssignPartner(id, selectedPartner._id);
      } else if (type === 'delivery') {
        if (orderStatus === 'Pending') await orderAPI.confirmOrder(id);
        await orderAPI.assignDeliveryPartner(id, selectedPartner._id);
      }
      navigate(`/orders/${id}?type=${type === 'delivery' ? 'order' : 'booking'}`);
    } catch (err) {
      console.error('Assign error:', err);
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <PageLoader text="Loading available partners..." />;
  if (error)   return <PageError message={error} onRetry={fetchPartners} />;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Assign {type === 'delivery' ? 'Delivery Partner' : 'Washer'}
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Select a partner to assign to this {type === 'delivery' ? 'order' : 'booking'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search by name or phone..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
        </div>
      </div>

      {/* Partner list */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Available Partners ({filteredPartners.length})</h2>
        </div>

        {filteredPartners.length === 0 ? (
          <div className="p-10 sm:p-12 text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="font-medium">No partners available</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPartners.map(partner => {
              const isSelected = selectedPartner?._id === partner._id;
              return (
                <div key={partner._id} onClick={() => setSelectedPartner(partner)}
                  className={`p-4 sm:p-6 cursor-pointer transition-colors hover:bg-gray-50 ${isSelected ? 'bg-primary-50 border-l-4 border-primary-500' : ''}`}>
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Avatar */}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      <User className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{partner.fullName}</h3>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {partner.rating !== undefined && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{partner.rating.toFixed(1)}</span>
                            </div>
                          )}
                          {isSelected && (
                            <span className="px-2 py-0.5 bg-primary-500 text-white text-xs font-medium rounded">Selected</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-1.5 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>📞</span>
                          <span>{partner.phoneNumber}</span>
                        </div>
                        {partner.address?.city && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{partner.address.city}{partner.address.pincode ? `, ${partner.address.pincode}` : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)} disabled={assigning} className="sm:w-auto">Cancel</Button>
        <Button variant="primary" onClick={handleAssign} disabled={!selectedPartner || assigning} className="sm:w-auto">
          {assigning ? 'Assigning...' : 'Assign Partner'}
        </Button>
      </div>
    </div>
  );
}