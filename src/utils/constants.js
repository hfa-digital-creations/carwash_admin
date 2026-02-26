// ============================================
// FILE: src/utils/constants.js
// ============================================

export const USER_ROLES = {
  CUSTOMER: 'customer',
  WASHER: 'washer',
  DELIVERY_PARTNER: 'delivery_partner',
  REPAIR_PROVIDER: 'repair_provider',
  SELLER: 'seller',
  ADMIN: 'admin',
  SUB_ADMIN: 'sub_admin'
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected'
};

export const SERVICE_TYPES = {
  CAR_WASH: 'car_wash',
  BIKE_WASH: 'bike_wash',
  DELIVERY: 'delivery',
  REPAIR: 'repair'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-700',
  verified: 'bg-green-100 text-green-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700'
};

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/' },
  { id: 'users', label: 'Users', path: '/users' },
  { id: 'orders', label: 'Orders', path: '/orders' },
  { id: 'inventory', label: 'Inventory', path: '/inventory' },
  { id: 'referrals', label: 'Referrals', path: '/referrals' },
  { id: 'branch', label: 'Branch Management', path: '/branch' },
  { id: 'settings', label: 'Settings', path: '/settings' }
];