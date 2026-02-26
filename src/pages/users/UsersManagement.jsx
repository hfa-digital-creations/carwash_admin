// ============================================
// FILE: src/pages/users/UsersManagement.jsx
// ============================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { PageLoader, PageError } from '../../components/common/PageLoader';
import { customerAPI, partnerAPI } from '../../utils/apiHelper';

export default function UsersManagement() {
  const navigate = useNavigate();
  const [activeTab,    setActiveTab]    = useState('customers');
  const [currentPage,  setCurrentPage]  = useState(1);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [customers,    setCustomers]    = useState([]);
  const [partners,     setPartners]     = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const tabs = [
    { id: 'customers', label: 'Customers',        role: null },
    { id: 'washers',   label: 'Washers',           role: 'Washing Personnel' },
    { id: 'delivery',  label: 'Delivery',          role: 'Delivery Person' },
    { id: 'repair',    label: 'Repair',            role: 'Repair Service Technician' },
    { id: 'sellers',   label: 'Sellers',           role: 'Product Seller' },
  ];

  useEffect(() => { fetchData(); }, [activeTab]);

  useEffect(() => {
    const source = activeTab === 'customers' ? customers : partners;
    const q = searchQuery.toLowerCase();
    setFilteredData(source.filter(u =>
      u.fullName?.toLowerCase().includes(q) ||
      u.phoneNumber?.includes(searchQuery) ||
      u.email?.toLowerCase().includes(q)
    ));
    setCurrentPage(1);
  }, [searchQuery, customers, partners, activeTab]);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      if (activeTab === 'customers') {
        const res = await customerAPI.getAllCustomers();
        const list = res.users || [];
        setCustomers(list); setFilteredData(list);
      } else {
        const currentTab = tabs.find(t => t.id === activeTab);
        const res = await partnerAPI.getAllPartners(currentTab.role);
        const list = res.partners || [];
        setPartners(list); setFilteredData(list);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId); setSearchQuery(''); setCurrentPage(1);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      if (activeTab === 'customers') await customerAPI.toggleCustomerStatus(userId, !currentStatus);
      else await partnerAPI.togglePartnerStatus(userId, !currentStatus);
      fetchData();
    } catch (err) {
      alert(`Failed to toggle status: ${err.message}`);
    }
  };

  const handleViewUser = (user) => {
    const type = activeTab === 'customers' ? 'customer' : 'partner';
    navigate(`/users/${user._id}?type=${type}`);
  };

  const itemsPerPage = 10;
  const totalPages   = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex   = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <div className="flex space-x-2">
          <Button variant="secondary" icon={RefreshCw} onClick={fetchData} disabled={loading}>Refresh</Button>
          <Button icon={Plus} onClick={() => navigate('/admin/register')}>Add User</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tabs - scrollable on mobile */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex min-w-max sm:min-w-0">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                className={`px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="p-4 sm:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search by name, phone, or email"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
          </div>
        </div>

        {loading && <PageLoader text="Loading users..." />}
        {!loading && error && <PageError message={error} onRetry={fetchData} />}

        {!loading && !error && (
          <>
            {/* ── Mobile Card View ── */}
            <div className="block sm:hidden divide-y divide-gray-100">
              {paginatedData.length === 0 ? (
                <div className="px-4 py-10 text-center text-gray-500 text-sm">No users found</div>
              ) : (
                paginatedData.map(user => (
                  <div key={user._id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{user.fullName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {activeTab === 'customers' ? user.phoneNumber : user.role}
                        </p>
                      </div>
                      <StatusBadge status={user.isActive ? 'active' : 'pending'} />
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                      {user.email && <span>{user.email}</span>}
                      {!user.email && user.phoneNumber && <span>{user.phoneNumber}</span>}
                      {user.address?.city && <span>📍 {user.address.city}</span>}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => handleViewUser(user)}
                        className="flex-1 py-1.5 text-xs font-semibold text-primary-500 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                        View
                      </button>
                      <button onClick={() => handleToggleStatus(user._id, user.isActive)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                          user.isActive
                            ? 'text-red-600 bg-red-50 hover:bg-red-100'
                            : 'text-green-600 bg-green-50 hover:bg-green-100'
                        }`}>
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── Desktop Table View ── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-gray-600 text-sm">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium">Name</th>
                    <th className="text-left px-6 py-3 font-medium">{activeTab === 'customers' ? 'Phone' : 'Role'}</th>
                    <th className="text-left px-6 py-3 font-medium">Contact</th>
                    <th className="text-left px-6 py-3 font-medium">Location</th>
                    <th className="text-left px-6 py-3 font-medium">Status</th>
                    <th className="text-left px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedData.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No users found</td></tr>
                  ) : (
                    paginatedData.map(user => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{user.fullName}</td>
                        <td className="px-6 py-4 text-gray-600">{activeTab === 'customers' ? user.phoneNumber : user.role}</td>
                        <td className="px-6 py-4 text-gray-600">{user.email || user.phoneNumber}</td>
                        <td className="px-6 py-4 text-gray-600">{user.address?.city || 'N/A'}</td>
                        <td className="px-6 py-4"><StatusBadge status={user.isActive ? 'active' : 'pending'} /></td>
                        <td className="px-6 py-4 space-x-2">
                          <button onClick={() => handleViewUser(user)} className="text-primary-500 hover:text-primary-600 text-sm font-medium">View</button>
                          <button onClick={() => handleToggleStatus(user._id, user.isActive)}
                            className={`text-sm font-medium ${user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}>
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}