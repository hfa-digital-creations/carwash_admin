// ============================================
// FILE: src/pages/branch/BranchManagement.jsx
// ============================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';

export default function BranchManagement() {
  const navigate = useNavigate();
  
  const branches = [
    { id: 1, name: 'Downtown Laundry', districts: 'Central District, Westside', admin: 'Emily Carter', status: 'active' },
    { id: 2, name: 'Uptown Cleaners', districts: 'North District, Eastside', admin: 'David Lee', status: 'active' },
    { id: 3, name: 'Metro Wash & Fold', districts: 'South District, Midtown', admin: 'Olivia Chen', status: 'inactive' },
    { id: 4, name: 'Express Laundry', districts: 'Coastal District, Harborview', admin: 'Ethan Clark', status: 'active' },
    { id: 5, name: 'Quick Clean', districts: 'Mountain District, Hilltop', admin: 'Sophia Green', status: 'inactive' },
  ];

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Branch Management</h1>
        <Button>Add Branch</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Search */}
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search Branch"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Branches Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Branch Name</th>
                <th className="text-left px-6 py-3 font-medium">Districts Covered</th>
                <th className="text-left px-6 py-3 font-medium">Assigned Sub Admin</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {branches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{branch.name}</td>
                  <td className="px-6 py-4 text-gray-600">{branch.districts}</td>
                  <td className="px-6 py-4 text-gray-600">{branch.admin}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={branch.status} />
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => navigate(`/branch/${branch.id}`)}
                      className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                    >
                      View/Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
