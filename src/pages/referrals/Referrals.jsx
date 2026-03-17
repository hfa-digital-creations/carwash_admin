import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowLeft, Users, UserCheck } from 'lucide-react';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/PageLoader';
import { referralAPI } from '../../utils/apiHelper';

export default function Referrals() {
  const [referrals,     setReferrals]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [filterStatus,  setFilterStatus]  = useState('');
  const [filterType,    setFilterType]    = useState('');

  useEffect(() => { fetchReferrals(); }, [filterStatus, filterType]);

  const fetchReferrals = async () => {
    try {
      setLoading(true); setError(null);
      const res = await referralAPI.getAllReferrals({ status: filterStatus, type: filterType });
      setReferrals(res.referrals || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch referrals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ref) => {
    try {
      if (ref.type === 'customer') {
        await referralAPI.approveCustomer(ref._id, {
          couponDetails: { discountType: 'Fixed', discountValue: 100, validDays: 30 },
        });
      } else {
        await referralAPI.approvePartner(ref._id, { payoutAmount: 200 });
      }
      fetchReferrals();
    } catch (err) { console.error(err); }
  };

  const handleReject = async (id) => {
    try {
      await referralAPI.rejectReferral(id, 'Rejected by admin');
      fetchReferrals();
    } catch (err) { console.error(err); }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending:  'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100  text-green-700',
      rejected: 'bg-red-100    text-red-600',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type) => (
    <span className={`px-2 py-1 rounded text-xs font-medium capitalize flex items-center gap-1 w-fit
      ${type === 'customer' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
      {type === 'customer' ? <Users className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
      {type}
    </span>
  );

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Management</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage customer & partner referrals</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {[['', 'All Status'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterStatus(val)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === val ? 'bg-[#FF6B1A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {[['', 'All Types'], ['customer', 'Customer'], ['partner', 'Partner']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterType(val)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === val ? 'bg-[#FF6B1A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && <PageLoader text="Loading referrals..." />}
      {error   && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200">
          {referrals.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg font-medium">No referrals found</p>
              <p className="text-sm mt-2">Referrals will appear here once users start referring</p>
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="block sm:hidden divide-y divide-gray-200">
                {referrals.map((ref) => (
                  <div key={ref._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{ref.referredUser?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{ref.referredUser?.phone || ref.referredUser?.email || '—'}</p>
                      </div>
                      {getStatusBadge(ref.status)}
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm">
                      {getTypeBadge(ref.type)}
                      {ref.referredBy?.name && (
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          Referred by: <span className="font-medium text-gray-700">{ref.referredBy.name}</span>
                        </span>
                      )}
                    </div>

                    {ref.type === 'customer' && ref.couponDetails && (
                      <div className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded">
                        Coupon: ₹{ref.couponDetails.discountValue} off · {ref.couponDetails.validDays} days
                      </div>
                    )}
                    {ref.type === 'partner' && ref.payoutAmount && (
                      <div className="text-xs text-gray-500 bg-purple-50 px-2 py-1 rounded">
                        Payout: ₹{ref.payoutAmount}
                      </div>
                    )}

                    {ref.status === 'pending' && (
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => handleApprove(ref)}
                          className="flex-1 flex items-center justify-center gap-1 text-green-600 bg-green-50 hover:bg-green-100 py-2 rounded-lg text-sm font-medium transition-colors">
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => handleReject(ref._id)}
                          className="flex-1 flex items-center justify-center gap-1 text-red-500 bg-red-50 hover:bg-red-100 py-2 rounded-lg text-sm font-medium transition-colors">
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Referred User</th>
                      <th className="text-left px-4 py-3 font-medium">Referred By</th>
                      <th className="text-left px-4 py-3 font-medium">Type</th>
                      <th className="text-left px-4 py-3 font-medium">Reward</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium">Date</th>
                      <th className="text-left px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {referrals.map((ref) => (
                      <tr key={ref._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{ref.referredUser?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{ref.referredUser?.phone || ref.referredUser?.email || '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700">{ref.referredBy?.name || '—'}</p>
                          <p className="text-xs text-gray-500">{ref.referredBy?.phone || ''}</p>
                        </td>
                        <td className="px-4 py-3">{getTypeBadge(ref.type)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {ref.type === 'customer' && ref.couponDetails
                            ? <span className="text-green-700 font-medium">₹{ref.couponDetails.discountValue} coupon</span>
                            : ref.type === 'partner' && ref.payoutAmount
                            ? <span className="text-purple-700 font-medium">₹{ref.payoutAmount} payout</span>
                            : <span className="text-gray-400">—</span>
                          }
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(ref.status)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {ref.createdAt ? new Date(ref.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {ref.status === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => handleApprove(ref)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2 rounded-lg transition-colors" title="Approve">
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleReject(ref._id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Reject">
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}