// ============================================
// FILE: src/pages/branch/BranchDetail.jsx
// ============================================
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

export default function BranchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Total Customers', value: '1,234' },
    { label: 'Total Washers', value: '567' },
    { label: 'Total Delivery Partners', value: '890' },
    { label: 'Total Repair Providers', value: '345' },
    { label: 'Total Sellers', value: '678' },
  ];

  const orders = [
    { customer: 'Sophia Clark', service: 'Car Wash', employee: 'Ethan Miller', status: 'completed' },
    { customer: 'Liam Davis', service: 'Bike Wash', employee: 'Olivia Wilson', status: 'in_progress' },
    { customer: 'Noah Martinez', service: 'Delivery', employee: 'Ava Brown', status: 'pending' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/branch')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Management</h1>
          <p className="text-gray-600">Downtown Laundry — Central District, Westside — Emily Carter</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {['Overview', 'Users', 'Orders', 'Inventory', 'Referrals'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-6 py-4 font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.toLowerCase()
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Order Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Active Orders (Car Wash)</div>
              <div className="text-3xl font-bold text-gray-900">123</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Active Orders (Bike Wash)</div>
              <div className="text-3xl font-bold text-gray-900">456</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Active Orders (Delivery)</div>
              <div className="text-3xl font-bold text-gray-900">789</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Active Orders (Repair)</div>
              <div className="text-3xl font-bold text-gray-900">101</div>
            </div>
          </div>

          {/* Revenue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Pending Verifications</div>
              <div className="text-3xl font-bold text-gray-900">234</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Total Revenue</div>
              <div className="text-3xl font-bold text-gray-900">$56,789</div>
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="mb-4">
                  <div className="text-sm text-gray-600">District-wise Analytics</div>
                  <div className="text-2xl font-bold text-gray-900">$12,345</div>
                  <div className="text-sm text-primary-500 flex items-center">
                    Last 6 Months <TrendingUp className="w-4 h-4 ml-1" /> +12%
                  </div>
                </div>
                <div className="flex items-end justify-between h-48 space-x-2">
                  {[60, 80, 70, 90, 100].map((height, i) => (
                    <div key={i} className="flex-1 bg-primary-500 rounded-t-lg" style={{ height: `${height}%` }}></div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <div className="text-sm text-gray-600">Service Growth Trend</div>
                  <div className="text-2xl font-bold text-gray-900">25%</div>
                  <div className="text-sm text-green-500 flex items-center">
                    Last 6 Months <TrendingUp className="w-4 h-4 ml-1" /> +5%
                  </div>
                </div>
                <div className="h-48">
                  <svg viewBox="0 0 300 150" className="w-full h-full">
                    <polyline
                      points="0,100 50,80 100,90 150,60 200,70 250,40 300,50"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-gray-600 text-sm">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium">Customer</th>
                    <th className="text-left px-6 py-3 font-medium">Service Type</th>
                    <th className="text-left px-6 py-3 font-medium">Assigned Employee</th>
                    <th className="text-left px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{order.customer}</td>
                      <td className="px-6 py-4">{order.service}</td>
                      <td className="px-6 py-4">{order.employee}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}