// ============================================
// FILE: src/pages/branch/AddBranch.jsx
// ============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

export default function AddBranch() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    branchName: '',
    branchAddress: '',
    subAdminName: '',
    subAdminEmail: '',
    subAdminPhone: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => navigate('/branch')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Branch</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Branch Location Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Branch Location Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Name
                </label>
                <input
                  type="text"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleChange}
                  placeholder="Main Street Branch"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Address
                </label>
                <input
                  type="text"
                  name="branchAddress"
                  value={formData.branchAddress}
                  onChange={handleChange}
                  placeholder="123 Main St, Anytown, USA 12345"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sub-Admin Contact Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Sub-Admin Contact Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-Admin Name
                </label>
                <input
                  type="text"
                  name="subAdminName"
                  value={formData.subAdminName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-Admin Email ID
                </label>
                <input
                  type="email"
                  name="subAdminEmail"
                  value={formData.subAdminEmail}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-Admin Phone Number
                </label>
                <input
                  type="tel"
                  name="subAdminPhone"
                  value={formData.subAdminPhone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security & Credentials */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security & Credentials</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-8">
          <Button variant="secondary" onClick={() => navigate('/branch')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Branch and User
          </Button>
        </div>
      </form>
    </div>
  );
}