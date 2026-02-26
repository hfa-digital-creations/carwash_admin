// ============================================
// FILE: src/utils/helpers.js
// ============================================

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (date, format = 'default') => {
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  
  return d.toLocaleDateString('en-US');
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone) => {
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
  }
  
  return phone;
};

/**
 * Generate random ID
 */
export const generateId = (prefix = '') => {
  return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Truncate text
 */
export const truncate = (text, length = 50) => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return ((value / total) * 100).toFixed(1);
};

/**
 * Get status color for Tailwind (bg + text + dot)
 */
export const getStatusColor = (status) => {
  if (!status) return { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-700' };

  const key = status.toLowerCase().replace(/\s+/g, '_'); // normalize

  const colors = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-700' },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-700' },
    active: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-700' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-700' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-700' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-700' },
    verified: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-700' },
    approved: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-700' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-700' },
  };

  return colors[key] || { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-700' };
};

/**
 * Download file
 */
export const downloadFile = (data, filename, type = 'text/csv') => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Export to CSV
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => 
        JSON.stringify(row[header] ?? '')
      ).join(',')
    )
  ].join('\n');
  
  downloadFile(csv, filename, 'text/csv');
};

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate phone
 */
export const isValidPhone = (phone) => {
  const re = /^\+?[\d\s\-()]+$/;
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
};