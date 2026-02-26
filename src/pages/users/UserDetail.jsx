// ============================================
// FILE: src/pages/users/UserDetail.jsx
// ============================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, MapPin, Calendar,
  ShoppingBag, Star, Truck, Store, Shield, CreditCard,
  User, Wrench, Package, X
} from 'lucide-react';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { PageLoader, PageError } from '../../components/common/PageLoader';
import { customerAPI, partnerAPI } from '../../utils/apiHelper';

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// ── Image Viewer Modal ──
function ImageModal({ src, title, onClose }) {
  if (!src) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="relative bg-white rounded-xl overflow-hidden max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <span className="font-semibold text-gray-900 text-sm">{title}</span>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <img src={src} alt={title} className="w-full max-h-[70vh] object-contain p-2" />
      </div>
    </div>
  );
}

// ── Section Card wrapper ──
const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-orange-500" />
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</h3>
    </div>
    {children}
  </div>
);

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type') || 'customer';

  const [loading,    setLoading]    = useState(true);
  const [user,       setUser]       = useState(null);
  const [error,      setError]      = useState(null);
  const [userType,   setUserType]   = useState(typeFromUrl);
  const [imgError,   setImgError]   = useState(false);
  const [modalImg,   setModalImg]   = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  const openModal  = (src, title) => { setModalImg(src); setModalTitle(title); };
  const closeModal = ()           => { setModalImg(null); setModalTitle(''); };

  useEffect(() => { fetchUserData(); }, [id, typeFromUrl]);

  const fetchUserData = async () => {
    setLoading(true); setError(null); setImgError(false);
    try {
      if (typeFromUrl === 'partner') {
        const res = await partnerAPI.getPartnerById(id);
        setUser(res.partner); setUserType('partner');
      } else {
        const res = await customerAPI.getCustomerById(id);
        setUser(res.user); setUserType('customer');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      if (userType === 'customer') await customerAPI.toggleCustomerStatus(id, !user.isActive);
      else await partnerAPI.togglePartnerStatus(id, !user.isActive);
      fetchUserData();
    } catch (err) {
      alert(`Failed to toggle status: ${err.message}`);
    }
  };

  if (loading) return <PageLoader text="Loading user details..." />;
  if (error || !user) return (
    <div className="p-6 text-center">
      <p className="text-red-600 mb-4">Error: {error || 'User not found'}</p>
      <Button variant="secondary" onClick={() => navigate('/users')}>Back to Users</Button>
    </div>
  );

  const showProfileImage = user.profilePhoto && !imgError;

  return (
    <>
      <ImageModal src={modalImg} title={modalTitle} onClose={closeModal} />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/users')} className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {userType === 'customer' ? 'Customer' : 'Partner'} Details
          </h1>
        </div>

        <div className="max-w-3xl space-y-4 sm:space-y-6">

          {/* ── Profile Card ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            {/* Top: avatar + info + button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">
                  {showProfileImage
                    ? <img src={user.profilePhoto} alt={user.fullName} className="w-full h-full object-cover" onError={() => setImgError(true)} />
                    : <span>{getInitials(user.fullName)}</span>
                  }
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">{user.fullName}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <StatusBadge status={user.isActive ? 'active' : 'pending'} />
                    <span className="text-sm text-gray-600">{userType === 'partner' ? user.role : 'Customer'}</span>
                    {userType === 'partner' && user.isVerified && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button variant={user.isActive ? 'danger' : 'primary'} size="sm" onClick={handleToggleStatus}>
                {user.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </div>

            {/* Personal Info + Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Personal Info</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 text-sm">{user.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 text-sm break-all">{user.email}</span>
                  </div>
                  {user.dateOfBirth && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-900 text-sm">{new Date(user.dateOfBirth).toLocaleDateString('en-IN')}</span>
                    </div>
                  )}
                  {user.gender && (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-900 text-sm">{user.gender}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-500 text-sm">Referral:</span>
                    <span className="text-gray-900 font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{user.referralCode}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-500 text-sm">Joined:</span>
                    <span className="text-gray-900 text-sm">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Address</h3>
                {user.address && (user.address.street || user.address.city) ? (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="text-sm space-y-0.5">
                      {user.address.street   && <p className="text-gray-900">{user.address.street}</p>}
                      {user.address.landmark && <p className="text-gray-500">{user.address.landmark}</p>}
                      <p className="text-gray-600">{[user.address.city, user.address.state].filter(Boolean).join(', ')}</p>
                      <p className="text-gray-600">{user.address.postalCode || user.address.pincode}</p>
                      {user.address.country  && <p className="text-gray-500">{user.address.country}</p>}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No address provided</p>
                )}
              </div>
            </div>
          </div>

          {/* ── PARTNER SECTIONS ── */}
          {userType === 'partner' && (
            <>
              {/* Partner Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Partner Info</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {user.yearsOfExperience > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Experience</p>
                      <p className="text-lg font-bold text-gray-900">{user.yearsOfExperience} yrs</p>
                    </div>
                  )}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Rating</p>
                    <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                      {user.avgRating?.toFixed(1) || '0.0'} <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </p>
                    <p className="text-xs text-gray-400">{user.ratingCount} reviews</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Verified</p>
                    <p className="text-sm font-semibold">{user.isVerified ? '✅ Yes' : '⏳ Pending'}</p>
                  </div>
                </div>

                {user.specializations?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2">Specializations</p>
                    <div className="flex flex-wrap gap-2">
                      {user.specializations.map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs capitalize">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {user.certifications?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-2">
                      {user.certifications.map((c, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {user.serviceCategories?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2">Service Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {user.serviceCategories.map((cat, i) => (
                        <span key={i} className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs">{cat}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Shop Details */}
              {user.shopDetails?.shopName && (
                <SectionCard icon={Store} title="Shop Details">
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500 flex-shrink-0">Shop Name</span>
                      <span className="font-medium text-gray-900 text-right">{user.shopDetails.shopName}</span>
                    </div>
                    {user.shopDetails.shopType && (
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500 flex-shrink-0">Type</span>
                        <span className="font-medium text-gray-900 text-right">{user.shopDetails.shopType}</span>
                      </div>
                    )}
                    {user.shopDetails.shopAddress && (
                      <div className="flex justify-between gap-2">
                        <span className="text-gray-500 flex-shrink-0">Address</span>
                        <span className="font-medium text-gray-900 text-right">{user.shopDetails.shopAddress}</span>
                      </div>
                    )}
                  </div>
                  {user.shopDetails.shopImages?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Shop Images</p>
                      <div className="grid grid-cols-3 gap-2">
                        {user.shopDetails.shopImages.map((img, i) => (
                          <img key={i} src={img} alt={`Shop ${i + 1}`}
                            onClick={() => openModal(img, `Shop Image ${i + 1}`)}
                            className="w-full h-20 sm:h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" />
                        ))}
                      </div>
                    </div>
                  )}
                </SectionCard>
              )}

              {/* Services */}
              {user.services?.length > 0 && (
                <SectionCard icon={Wrench} title="Services Offered">
                  <div className="space-y-3">
                    {user.services.map(service => (
                      <div key={service._id} className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                        {service.serviceImage ? (
                          <img src={service.serviceImage} alt={service.serviceName}
                            onClick={() => openModal(service.serviceImage, service.serviceName)}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover flex-shrink-0 border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" />
                        ) : (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Wrench className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{service.serviceName}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{service.description}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 flex-shrink-0 whitespace-nowrap">₹{service.minPrice}–₹{service.maxPrice}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Products */}
              {user.products?.length > 0 && (
                <SectionCard icon={Package} title="Products">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {user.products.map(product => (
                      <div key={product._id} className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                        {product.productImage ? (
                          <img src={product.productImage} alt={product.productTitle}
                            onClick={() => openModal(product.productImage, product.productTitle)}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover flex-shrink-0 border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" />
                        ) : (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{product.productTitle}</p>
                          <p className="text-sm text-orange-600 font-semibold">₹{product.unitPrice}</p>
                          <p className="text-xs text-gray-500">Stock: {product.stockQuantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Vehicle Details */}
              {user.vehicleDetails?.vehicleType && (
                <SectionCard icon={Truck} title="Vehicle Details">
                  <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                    <div><p className="text-gray-500">Type</p><p className="font-medium text-gray-900">{user.vehicleDetails.vehicleType}</p></div>
                    <div><p className="text-gray-500">Model</p><p className="font-medium text-gray-900">{user.vehicleDetails.vehicleModel}</p></div>
                    <div><p className="text-gray-500">License Plate</p><p className="font-medium text-gray-900 font-mono">{user.vehicleDetails.licensePlate}</p></div>
                    <div>
                      <p className="text-gray-500">Doc Verified</p>
                      <p className={`font-medium ${user.vehicleDetails.documentVerified ? 'text-green-600' : 'text-red-500'}`}>
                        {user.vehicleDetails.documentVerified ? '✅ Verified' : '❌ Pending'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.vehicleDetails.registrationCertificate?.startsWith('http') && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">RC (Registration Certificate)</p>
                        <img src={user.vehicleDetails.registrationCertificate} alt="RC"
                          onClick={() => openModal(user.vehicleDetails.registrationCertificate, 'Registration Certificate')}
                          className="w-full h-32 sm:h-36 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" />
                      </div>
                    )}
                    {user.vehicleDetails.drivingLicense?.startsWith('http') && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">DL (Driving License)</p>
                        <img src={user.vehicleDetails.drivingLicense} alt="DL"
                          onClick={() => openModal(user.vehicleDetails.drivingLicense, 'Driving License')}
                          className="w-full h-32 sm:h-36 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" />
                      </div>
                    )}
                  </div>
                </SectionCard>
              )}

              {/* Payout Details */}
              {user.payoutDetails?.accountNumber && (
                <SectionCard icon={CreditCard} title="Payout Details">
                  <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                    {user.payoutDetails.accountHolderName && (
                      <div><p className="text-gray-500">Account Holder</p><p className="font-medium text-gray-900">{user.payoutDetails.accountHolderName}</p></div>
                    )}
                    <div>
                      <p className="text-gray-500">Account Number</p>
                      <p className="font-medium text-gray-900 font-mono">
                        {'•'.repeat(Math.max(0, user.payoutDetails.accountNumber.length - 4))}
                        {user.payoutDetails.accountNumber.slice(-4)}
                      </p>
                    </div>
                    <div><p className="text-gray-500">IFSC Code</p><p className="font-medium text-gray-900 font-mono">{user.payoutDetails.ifscCode}</p></div>
                    <div>
                      <p className="text-gray-500">Terms Accepted</p>
                      <p className={`font-medium ${user.payoutDetails.termsAccepted ? 'text-green-600' : 'text-red-500'}`}>
                        {user.payoutDetails.termsAccepted ? '✅ Yes' : '❌ No'}
                      </p>
                    </div>
                  </div>
                  {user.payoutDetails.idProof?.startsWith('http') && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">ID Proof</p>
                      <img src={user.payoutDetails.idProof} alt="ID Proof"
                        onClick={() => openModal(user.payoutDetails.idProof, 'ID Proof')}
                        className="w-full max-w-xs h-32 sm:h-36 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" />
                    </div>
                  )}
                </SectionCard>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}