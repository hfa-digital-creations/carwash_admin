
// ============================================
// FILE: src/components/common/Table.jsx
// ============================================
import React from 'react';

export function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead className="bg-gray-50 text-gray-600 text-sm">
      {children}
    </thead>
  );
}

export function TableBody({ children }) {
  return (
    <tbody className="divide-y divide-gray-200">
      {children}
    </tbody>
  );
}

export function TableRow({ children, onClick, className = '' }) {
  return (
    <tr 
      onClick={onClick}
      className={`
        hover:bg-gray-50 transition-colors
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </tr>
  );
}

export function TableHeader({ children, className = '' }) {
  return (
    <th className={`text-left px-6 py-3 font-medium ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={`px-6 py-4 ${className}`}>
      {children}
    </td>
  );
}
