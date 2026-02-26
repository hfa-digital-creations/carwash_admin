// ============================================
// FILE: src/components/common/Input.jsx
// ============================================
import React from 'react';

export default function Input({ 
  label, 
  error, 
  icon: Icon,
  className = '',
  ...props 
}) {
  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        )}
        <input
          className={`
            w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2 
            border rounded-lg 
            focus:ring-2 focus:ring-primary-500 focus:border-transparent 
            outline-none transition-colors
            ${error ? 'border-red-500' : 'border-gray-300'}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}