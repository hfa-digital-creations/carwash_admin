// ============================================
// FILE: src/utils/apiHelper.js
// ============================================
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await fetch(`${API_BASE_URL}/admin/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new Error('Token refresh failed');

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  } catch (err) {
    localStorage.clear();
    window.location.href = '/login';
    return null;
  }
};

export const apiCall = async (endpoint, options = {}, retryCount = 0) => {
  const MAX_RETRIES = 1;

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (response.status === 401 && retryCount < MAX_RETRIES) {
      try {
        const data = await response.json();
        if (
          data.message?.toLowerCase().includes('token') ||
          data.message?.toLowerCase().includes('expired') ||
          data.message?.toLowerCase().includes('unauthorized')
        ) {
          const newToken = await refreshToken();
          if (newToken) return apiCall(endpoint, options, retryCount + 1);
        }
        const errMsg = data.message || 'Authentication failed';
        toast.error(errMsg);
        throw new Error(errMsg);
      } catch (parseError) {
        toast.error('Authentication failed');
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      let errorMessage = 'API request failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `${response.status} ${response.statusText}`;
      }
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (data.message && options.method && options.method !== 'GET') {
      toast.success(data.message);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// ==================== ADMIN APIs ====================
export const adminAPI = {
  login: (email, password) =>
    apiCall('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiCall('/admin/logout', { method: 'POST' }),

  getProfile: () =>
    apiCall('/admin/profile'),

  updateProfile: (data) =>
    apiCall('/admin/update-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (currentPassword, newPassword) =>
    apiCall('/admin/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  requestPasswordReset: (email) =>
    apiCall('/admin/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyResetOTP: (email, otp) =>
    apiCall('/admin/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  resetPassword: (email, otp, newPassword) =>
    apiCall('/admin/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    }),

  resendResetOTP: (email) =>
    apiCall('/admin/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};

// ==================== ADMIN REGISTER APIs ====================
export const adminRegisterAPI = {
  registerUser: (userData) =>
    apiCall('/admin/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  registerCustomer: (customerData) =>
    apiCall('/admin/register/customer', {
      method: 'POST',
      body: JSON.stringify(customerData),
    }),

  registerPartner: (partnerData) =>
    apiCall('/admin/register/partner', {
      method: 'POST',
      body: JSON.stringify(partnerData),
    }),

  completePartnerProfile: (partnerId, profileData) =>
    apiCall(`/admin/partner/complete-profile/${partnerId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  registerAndCompletePartner: (partnerData) =>
    apiCall('/admin/register/partner/complete', {
      method: 'POST',
      body: JSON.stringify(partnerData),
    }),
};

// ==================== CUSTOMER APIs ====================
export const customerAPI = {
  getAllCustomers: () => apiCall('/customer/getAllUsers'),

  getCustomerById: (id) => apiCall(`/customer/getUserById/${id}`),

  toggleCustomerStatus: (id, isActive) =>
    apiCall(`/customer/admin/${id}/toggle-status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    }),
};

// ==================== PARTNER APIs ====================
export const partnerAPI = {
  getAllPartners: (role = null) => {
    const endpoint = role
      ? `/partner/getAll?role=${encodeURIComponent(role)}`
      : '/partner/getAll';
    return apiCall(endpoint);
  },

  getPartnerById: (id) => apiCall(`/partner/getById/${id}`),

  togglePartnerStatus: (id, isActive) =>
    apiCall(`/partner/toggleStatus/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),
};

// ==================== SERVICE MANAGEMENT APIs ====================
export const serviceAPI = {
  uploadImage: (formData) => {
    const token = localStorage.getItem('accessToken');
    return fetch(`${API_BASE_URL}/admin/services/upload-image`, {
      method: 'POST',
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        const msg = error.message || 'Image upload failed';
        toast.error(msg);
        throw new Error(msg);
      }
      const data = await response.json();
      if (data.message) toast.success(data.message);
      return data;
    });
  },

  getAllServices: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.serviceType) params.append('serviceType', filters.serviceType);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    const queryString = params.toString();
    return apiCall(queryString ? `/admin/services/all?${queryString}` : '/admin/services/all');
  },

  getServicesByType: (serviceType) =>
    apiCall(`/admin/services/type/${serviceType}`),

  getServiceById: (id) => apiCall(`/admin/services/${id}`),

  createService: (serviceData) =>
    apiCall('/admin/services/create', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    }),

  updateService: (id, serviceData) =>
    apiCall(`/admin/services/${id}/update`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    }),

  toggleServiceStatus: (id, isActive) =>
    apiCall(`/admin/services/${id}/toggle-status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    }),

  deleteService: (id) =>
    apiCall(`/admin/services/${id}/delete`, { method: 'DELETE' }),
};

// ==================== VOUCHER MANAGEMENT APIs ====================
export const voucherAPI = {
  createVoucher: (voucherData) =>
    apiCall('/voucher', { method: 'POST', body: JSON.stringify(voucherData) }),

  getAllVouchers: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    if (filters.applicableFor) params.append('applicableFor', filters.applicableFor);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    const queryString = params.toString();
    return apiCall(queryString ? `/voucher?${queryString}` : '/voucher');
  },

  bulkCreateVouchers: (vouchers) =>
    apiCall('/voucher/bulk', { method: 'POST', body: JSON.stringify({ vouchers }) }),

  getVoucherStatistics: () => apiCall('/voucher/statistics'),

  getVoucherUsageHistory: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.voucherId) params.append('voucherId', filters.voucherId);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    const queryString = params.toString();
    return apiCall(queryString ? `/voucher/usage-history?${queryString}` : '/voucher/usage-history');
  },

  getVoucherById: (id) => apiCall(`/voucher/${id}`),

  updateVoucher: (id, voucherData) =>
    apiCall(`/voucher/${id}`, { method: 'PUT', body: JSON.stringify(voucherData) }),

  deleteVoucher: (id) =>
    apiCall(`/voucher/${id}`, { method: 'DELETE' }),

  toggleVoucherStatus: (id) =>
    apiCall(`/voucher/${id}/toggle-status`, { method: 'PATCH' }),

  notifyCustomers: (voucherId, targetCustomers) =>
    apiCall('/voucher/notify', {
      method: 'POST',
      body: JSON.stringify({ voucherId, targetCustomers }),
    }),

  getAvailableVouchers: (serviceType = null) => {
    const endpoint = serviceType
      ? `/voucher/available?serviceType=${encodeURIComponent(serviceType)}`
      : '/voucher/available';
    return apiCall(endpoint);
  },

  validateVoucher: (code, serviceType, orderAmount, customerId) =>
    apiCall('/voucher/validate', {
      method: 'POST',
      body: JSON.stringify({ code, serviceType, orderAmount, customerId }),
    }),
};

// ==================== BOOKING APIs ====================
export const bookingAPI = {
  getPendingBookings: () =>
    apiCall('/booking/admin/pending'),

  getAllBookings: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.page)   params.append('page',   filters.page);
    if (filters.limit)  params.append('limit',  filters.limit);
    const qs = params.toString();
    return apiCall(qs ? `/booking/admin/all?${qs}` : '/booking/admin/all');
  },

  getBookingById: (id) =>
    apiCall(`/booking/${id}`),

  // ⭐ Approve only — backend does NOT auto-assign anymore
  approveBooking: (id) =>
    apiCall(`/booking/admin/${id}/approve`, { method: 'PUT' }),

  // ⭐ Separate auto-assign trigger (admin manually clicks)
  autoAssignPartner: (id) =>
    apiCall(`/booking/admin/${id}/auto-assign`, { method: 'POST' }),

  // ⭐ Manual assign
  manuallyAssignPartner: (bookingId, partnerId) =>
    apiCall('/booking/admin/assign-partner', {
      method: 'POST',
      body: JSON.stringify({ bookingId, partnerId }),
    }),
};

// ==================== ORDER APIs ====================
export const orderAPI = {
  getAllOrders: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.page)   params.append('page',   filters.page);
    if (filters.limit)  params.append('limit',  filters.limit);
    const qs = params.toString();
    return apiCall(qs ? `/order/admin/all?${qs}` : '/order/admin/all');
  },

  getOrderById: (id) =>
    apiCall(`/order/${id}`),

  // ⭐ Confirm only — no auto-assign
  confirmOrder: (orderId) =>
    apiCall(`/order/admin/${orderId}/confirm`, { method: 'PUT' }),

  // ⭐ Separate auto-assign trigger
  autoAssignDeliveryPartner: (orderId) =>
    apiCall(`/order/admin/${orderId}/auto-assign`, { method: 'POST' }),

  // ⭐ Manual assign
  assignDeliveryPartner: (orderId, deliveryPartnerId) =>
    apiCall('/order/admin/assign-delivery', {
      method: 'POST',
      body: JSON.stringify({ orderId, deliveryPartnerId }),
    }),
};

// ==================== SERVICE REQUEST APIs ====================
export const serviceRequestAPI = {
  getPendingRequests: () =>
    apiCall('/service-booking/admin/pending'),

  getAllRequests: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.page)   params.append('page',   filters.page);
    if (filters.limit)  params.append('limit',  filters.limit);
    const qs = params.toString();
    // ⭐ Fixed: was '/service/admin/all' — now correct
    return apiCall(qs ? `/service-booking/admin/all?${qs}` : '/service-booking/admin/all');
  },

  getRequestById: (id) =>
    // ⭐ Fixed: was '/service-booking/${id}' inconsistent
    apiCall(`/service-booking/${id}`),

  // ⭐ Approve only — backend auto-notifies the technician chosen at booking time
  // No assignment needed for service (technician already selected by customer)
  approveRequest: (id) =>
    apiCall(`/service-booking/admin/${id}/approve`, { method: 'PUT' }),
};

// ==================== SETTINGS APIs ====================
export const settingsAPI = {
  getAllSettings: () => apiCall('/admin/settings/all'),

  getPaymentSettings: () => apiCall('/admin/settings/payment'),

  updateAdvancePaymentPercentage: (percentage) =>
    apiCall('/admin/settings/payment/advance-percentage', {
      method: 'PUT',
      body: JSON.stringify({ percentage }),
    }),

  updateCommissionPercentage: (percentage) =>
    apiCall('/admin/settings/payment/commission', {
      method: 'PUT',
      body: JSON.stringify({ percentage }),
    }),

  getPartnerSettings: () => apiCall('/admin/settings/partner'),

  updatePartnerSettings: (autoAssignmentRadius, maxPartnerDistance) =>
    apiCall('/admin/settings/partner/assignment', {
      method: 'PUT',
      body: JSON.stringify({ autoAssignmentRadius, maxPartnerDistance }),
    }),
};

// ==================== DASHBOARD APIs ====================
export const dashboardAPI = {
  getStatistics: () => apiCall('/admin/dashboard/statistics'),

  getAnalytics: (period = 'monthly') =>
    apiCall(`/admin/dashboard/analytics?period=${period}`),
};

export default {
  adminAPI,
  adminRegisterAPI,
  customerAPI,
  partnerAPI,
  serviceAPI,
  voucherAPI,
  dashboardAPI,
  bookingAPI,
  orderAPI,
  serviceRequestAPI,
  settingsAPI,
};