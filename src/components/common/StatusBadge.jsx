// ============================================
// FILE: src/components/common/StatusBadge.jsx
// ============================================
import React from 'react';
import { getStatusColor } from '../../utils/helpers';

export default function StatusBadge({ status, className = '' }) {
  const { bg, text, dot } = getStatusColor(status);

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${bg} ${text} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${dot}`} aria-hidden="true"></span>
      <span>
        {status
          ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          : 'Unknown'}
      </span>
    </span>
  );
}