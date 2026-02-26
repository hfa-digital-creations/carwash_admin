// ============================================
// FILE: src/pages/vouchers/Vouchers.jsx
// ============================================
import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, X, ArrowLeft, Save, Percent, IndianRupee, Bell, Send } from 'lucide-react';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/PageLoader';
import { voucherAPI } from '../../utils/apiHelper';

export default function Vouchers() {
  const [vouchers,       setVouchers]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState(null);
  const [showForm,       setShowForm]       = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [filterActive,   setFilterActive]   = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyingVoucher, setNotifyingVoucher] = useState(null);
  const [notifyTarget,    setNotifyTarget]    = useState('all');

  const [formData, setFormData] = useState({
    code: '', title: '', description: '',
    discountType: 'Percentage', discountValue: '',
    maxDiscount: '', minOrderValue: '', applicableFor: [],
    validFrom: '', validUntil: '', totalUsageLimit: '', maxUsagePerUser: '1',
  });

  const categories = ['Car Wash', 'Bike Wash', 'Repair Services', 'Product Order', 'All'];

  useEffect(() => { if (!showForm) fetchVouchers(); }, [filterActive, filterCategory, showForm]);

  const fetchVouchers = async () => {
    try {
      setLoading(true); setError(null);
      const filters = {};
      if (filterActive) filters.isActive = filterActive === 'true';
      if (filterCategory) filters.applicableFor = filterCategory;
      const response = await voucherAPI.getAllVouchers(filters);
      setVouchers(response.vouchers || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch vouchers');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCategoryToggle = category => {
    setFormData(prev => ({
      ...prev,
      applicableFor: prev.applicableFor.includes(category)
        ? prev.applicableFor.filter(c => c !== category)
        : [...prev.applicableFor, category],
    }));
  };

  const openCreateForm = () => {
    setEditingVoucher(null);
    setFormData({ code: '', title: '', description: '', discountType: 'Percentage', discountValue: '', maxDiscount: '', minOrderValue: '', applicableFor: [], validFrom: '', validUntil: '', totalUsageLimit: '', maxUsagePerUser: '1' });
    setShowForm(true);
  };

  const openEditForm = voucher => {
    setEditingVoucher(voucher);
    const fmt = date => {
      const d = new Date(date), pad = n => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    setFormData({
      code: voucher.code, title: voucher.title || '', description: voucher.description || '',
      discountType: voucher.discountType, discountValue: voucher.discountValue.toString(),
      maxDiscount: voucher.maxDiscount?.toString() || '', minOrderValue: voucher.minOrderValue?.toString() || '0',
      applicableFor: voucher.applicableFor || [], validFrom: fmt(voucher.validFrom), validUntil: fmt(voucher.validUntil),
      totalUsageLimit: voucher.totalUsageLimit?.toString() || '', maxUsagePerUser: voucher.maxUsagePerUser?.toString() || '1',
    });
    setShowForm(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        code: formData.code.toUpperCase().trim(), title: formData.title.trim(), description: formData.description.trim(),
        discountType: formData.discountType, discountValue: parseFloat(formData.discountValue),
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
        applicableFor: formData.applicableFor,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
        totalUsageLimit: formData.totalUsageLimit ? parseInt(formData.totalUsageLimit) : null,
        maxUsagePerUser: parseInt(formData.maxUsagePerUser),
      };
      if (editingVoucher) { await voucherAPI.updateVoucher(editingVoucher._id, payload); }
      else                { await voucherAPI.createVoucher(payload); }
      setShowForm(false); fetchVouchers();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async voucherId => {
    try { await voucherAPI.toggleVoucherStatus(voucherId); fetchVouchers(); }
    catch (err) { console.error(err); }
  };

  const handleDelete = async voucherId => {
    try { await voucherAPI.deleteVoucher(voucherId); fetchVouchers(); }
    catch (err) { console.error(err); }
  };

  const handleNotifyCustomers = async () => {
    try {
      setSaving(true);
      await voucherAPI.notifyCustomers(notifyingVoucher._id, notifyTarget);
      setShowNotifyModal(false); setNotifyingVoucher(null);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const isExpired = d => new Date() > new Date(d);
  const formatDate = d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  if (showNotifyModal && notifyingVoucher) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Notify Customers</h2>
            <button onClick={() => setShowNotifyModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
          </div>
          <div className="bg-[#FFF4ED] border border-orange-200 rounded-lg p-4 mb-4">
            <p className="font-mono font-bold text-[#FF6B1A] text-lg mb-1">{notifyingVoucher.code}</p>
            <p className="text-gray-700 font-medium">{notifyingVoucher.title}</p>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Send notification to:</label>
          <select value={notifyTarget} onChange={e => setNotifyTarget(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent mb-4">
            <option value="all">All Active Customers</option>
          </select>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleNotifyCustomers} disabled={saving} className="flex-1 flex items-center justify-center">
              {saving ? 'Sending...' : <><Send className="w-5 h-5 mr-2" />Send Notification</>}
            </Button>
            <Button variant="ghost" onClick={() => setShowNotifyModal(false)} className="flex-1" disabled={saving}>Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={() => { setShowForm(false); setEditingVoucher(null); }} className="mr-4 p-2 hover:bg-gray-100 rounded-lg" type="button">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{editingVoucher ? 'Edit Voucher' : 'Create New Voucher'}</h1>
            <p className="text-sm text-gray-500 mt-1">{editingVoucher ? 'Update voucher details' : 'Add a new discount voucher'}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { key: 'code',        label: 'Voucher Code *',  type: 'text',     placeholder: 'WASH20',              disabled: !!editingVoucher },
              { key: 'title',       label: 'Title *',         type: 'text',     placeholder: '20% Off Car Wash'    },
              { key: 'description', label: 'Description *',   type: 'textarea', placeholder: 'Describe the voucher' },
            ].map(({ key, label, type, placeholder, disabled }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                {type === 'textarea'
                  ? <textarea name={key} value={formData[key]} onChange={handleInputChange} rows="3" placeholder={placeholder} required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent" />
                  : <input type="text" name={key} value={formData[key]} onChange={handleInputChange} placeholder={placeholder} disabled={disabled} required
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent ${key === 'code' ? 'uppercase' : ''}`} />
                }
              </div>
            ))}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type *</label>
                <select name="discountType" value={formData.discountType} onChange={handleInputChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent">
                  <option value="Percentage">Percentage (%)</option>
                  <option value="Fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value *</label>
                <input type="number" name="discountValue" value={formData.discountValue} onChange={handleInputChange}
                  min="0" max={formData.discountType === 'Percentage' ? '100' : undefined} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent" />
              </div>
              {formData.discountType === 'Percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount (₹)</label>
                  <input type="number" name="maxDiscount" value={formData.maxDiscount} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Applicable For *</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button key={cat} type="button" onClick={() => handleCategoryToggle(cat)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${formData.applicableFor.includes(cat) ? 'bg-[#FF6B1A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valid From *</label>
                <input type="datetime-local" name="validFrom" value={formData.validFrom} onChange={handleInputChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until *</label>
                <input type="datetime-local" name="validUntil" value={formData.validUntil} onChange={handleInputChange} required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Usage Limit</label>
                <input type="number" name="totalUsageLimit" value={formData.totalUsageLimit} onChange={handleInputChange}
                  placeholder="Leave empty for unlimited"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Per User Limit *</label>
                <input type="number" name="maxUsagePerUser" value={formData.maxUsagePerUser} onChange={handleInputChange} min="1" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <Button type="submit" disabled={saving} className="flex-1 flex items-center justify-center">
                <Save className="w-5 h-5 mr-2" />
                {saving ? 'Saving...' : (editingVoucher ? 'Update Voucher' : 'Create Voucher')}
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditingVoucher(null); }} className="flex-1">Cancel</Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voucher Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage discount vouchers and promotional codes</p>
        </div>
        <Button onClick={openCreateForm}><Plus className="w-4 h-4 mr-2" />Create Voucher</Button>
      </div>
      <div className="mb-6 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {[['', 'All Status'], ['true', 'Active'], ['false', 'Inactive']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterActive(val)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterActive === val ? 'bg-[#FF6B1A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterCategory('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterCategory === '' ? 'bg-[#FF6B1A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            All Categories
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterCategory === cat ? 'bg-[#FF6B1A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      {loading && <PageLoader text="Loading vouchers..." />}
      {error   && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200">
          {vouchers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg font-medium">No vouchers found</p>
              <p className="text-sm mt-2">Click "Create Voucher" to add your first voucher</p>
            </div>
          ) : (
            <>
              <div className="block sm:hidden divide-y divide-gray-200">
                {vouchers.map(voucher => (
                  <div key={voucher._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono font-bold text-[#FF6B1A] text-lg">{voucher.code}</span>
                        <p className="font-medium text-gray-900 text-sm mt-0.5">{voucher.title || voucher.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-2 mt-1">
                        <input type="checkbox" checked={voucher.isActive} onChange={() => handleToggleStatus(voucher._id)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B1A]"></div>
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                        {voucher.discountType === 'Percentage'
                          ? <><Percent className="w-3.5 h-3.5 text-green-600" /><span className="font-medium text-green-600">{voucher.discountValue}%</span></>
                          : <><IndianRupee className="w-3.5 h-3.5 text-green-600" /><span className="font-medium text-green-600">₹{voucher.discountValue}</span></>
                        }
                        {voucher.maxDiscount && <span className="text-xs text-gray-500 ml-1">(Max ₹{voucher.maxDiscount})</span>}
                      </div>
                      <div className="bg-gray-50 px-2 py-1 rounded text-gray-600">
                        {voucher.usedCount} / {voucher.totalUsageLimit || '∞'} used
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {voucher.applicableFor.slice(0, 2).map(cat => (
                        <span key={cat} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">{cat}</span>
                      ))}
                      {voucher.applicableFor.length > 2 && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">+{voucher.applicableFor.length - 2}</span>}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(voucher.validFrom)} → {formatDate(voucher.validUntil)}
                      {isExpired(voucher.validUntil) && <span className="ml-2 text-red-600 font-medium">Expired</span>}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => { setNotifyingVoucher(voucher); setShowNotifyModal(true); }} className="flex-1 flex items-center justify-center gap-1 text-blue-600 bg-blue-50 hover:bg-blue-100 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Bell className="w-4 h-4" /> Notify
                      </button>
                      <button onClick={() => openEditForm(voucher)} className="flex-1 flex items-center justify-center gap-1 text-orange-600 bg-orange-50 hover:bg-orange-100 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={() => handleDelete(voucher._id)} className="flex-1 flex items-center justify-center gap-1 text-red-500 bg-red-50 hover:bg-red-100 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Code</th>
                      <th className="text-left px-4 py-3 font-medium">Title</th>
                      <th className="text-left px-4 py-3 font-medium">Discount</th>
                      <th className="text-left px-4 py-3 font-medium">Applicable For</th>
                      <th className="text-left px-4 py-3 font-medium">Valid Period</th>
                      <th className="text-left px-4 py-3 font-medium">Usage</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {vouchers.map(voucher => (
                      <tr key={voucher._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3"><span className="font-mono font-bold text-[#FF6B1A]">{voucher.code}</span></td>
                        <td className="px-4 py-3 font-medium text-gray-900">{voucher.title || voucher.description}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {voucher.discountType === 'Percentage'
                              ? <><Percent className="w-4 h-4 text-green-600" /><span className="font-medium text-green-600">{voucher.discountValue}</span></>
                              : <><IndianRupee className="w-4 h-4 text-green-600" /><span className="font-medium text-green-600">₹{voucher.discountValue}</span></>
                            }
                          </div>
                          {voucher.maxDiscount && <span className="text-xs text-gray-500">Max: ₹{voucher.maxDiscount}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {voucher.applicableFor.slice(0, 2).map(cat => (
                              <span key={cat} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{cat}</span>
                            ))}
                            {voucher.applicableFor.length > 2 && <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">+{voucher.applicableFor.length - 2}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div>{formatDate(voucher.validFrom)}</div>
                          <div>to {formatDate(voucher.validUntil)}</div>
                          {isExpired(voucher.validUntil) && <span className="text-xs text-red-600 font-medium">Expired</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{voucher.usedCount} / {voucher.totalUsageLimit || '∞'}</div>
                            <div className="text-xs text-gray-500">Per user: {voucher.maxUsagePerUser}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={voucher.isActive} onChange={() => handleToggleStatus(voucher._id)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B1A]"></div>
                          </label>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => { setNotifyingVoucher(voucher); setShowNotifyModal(true); }} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"><Bell className="w-5 h-5" /></button>
                            <button onClick={() => openEditForm(voucher)} className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-2 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
                            <button onClick={() => handleDelete(voucher._id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}