// ============================================
// FILE: src/pages/inventory/InventoryManagement.jsx
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Package, Store, RefreshCw,
  ChevronDown, Eye, TrendingUp, ShoppingCart, DollarSign, Users
} from 'lucide-react';
import { partnerAPI } from '../../utils/apiHelper';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import { PageLoader, PageError } from '../../components/common/PageLoader';

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default function InventoryManagement() {
  const navigate = useNavigate();

  const [sellers,          setSellers]          = useState([]);
  const [products,         setProducts]         = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');
  const [search,           setSearch]           = useState('');
  const [statusFilter,     setStatusFilter]     = useState('All');
  const [sellerFilter,     setSellerFilter]     = useState('All');

  const fetchInventory = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await partnerAPI.getAllPartners('Product Seller');
      const sellerList = data.partners || [];
      setSellers(sellerList);
      const allProducts = [];
      sellerList.forEach(seller => {
        (seller.products || []).forEach(product => {
          allProducts.push({
            productId: product._id, productTitle: product.productTitle,
            productDescription: product.productDescription, productImage: product.productImage,
            unitPrice: product.unitPrice, stockQuantity: product.stockQuantity,
            sellerId: seller._id, sellerName: seller.fullName,
            shopName: seller.shopDetails?.shopName || '—', sellerActive: seller.isActive,
          });
        });
      });
      setProducts(allProducts);
      setFilteredProducts(allProducts);
    } catch (err) {
      setError(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  useEffect(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.productTitle?.toLowerCase().includes(q) ||
        p.sellerName?.toLowerCase().includes(q) ||
        p.shopName?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') list = list.filter(p => statusFilter === 'Active' ? p.sellerActive : !p.sellerActive);
    if (sellerFilter !== 'All') list = list.filter(p => p.sellerId === sellerFilter);
    setFilteredProducts(list);
  }, [search, statusFilter, sellerFilter, products]);

  const totalProducts = products.length;
  const activeSellers = sellers.filter(s => s.isActive).length;
  const totalStock    = products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
  const avgPrice      = products.length ? Math.round(products.reduce((sum, p) => sum + (p.unitPrice || 0), 0) / products.length) : 0;

  if (loading) return <PageLoader text="Loading inventory..." />;
  if (error)   return <PageError message={error} onRetry={fetchInventory} />;

  const stockBadge = (qty) => {
    if (qty > 10)  return 'bg-green-50 text-green-700';
    if (qty > 0)   return 'bg-yellow-50 text-yellow-700';
    return 'bg-red-50 text-red-700';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Products listed by all sellers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={fetchInventory}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-gray-600">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => navigate('/users?tab=sellers')}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-gray-600">
            <Store className="w-4 h-4" /> View Sellers
          </button>
          <Button icon={Plus} onClick={() => navigate('/admin/register')}>Add Seller</Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Package}      label="Total Products"  value={totalProducts}  color="blue"   />
        <StatCard icon={Users}        label="Active Sellers"  value={activeSellers}  color="green"  />
        <StatCard icon={ShoppingCart} label="Total Stock"     value={totalStock}     color="purple" />
        <StatCard icon={DollarSign}   label="Avg. Price (₹)" value={`₹${avgPrice}`} color="orange" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search by product, seller, or shop name..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:flex-none">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 outline-none transition-all cursor-pointer">
                  <option value="All">All Status</option>
                  <option value="Active">Active Sellers</option>
                  <option value="Inactive">Inactive Sellers</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative flex-1 sm:flex-none">
                <select value={sellerFilter} onChange={e => setSellerFilter(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 outline-none transition-all cursor-pointer sm:max-w-[180px]">
                  <option value="All">All Sellers</option>
                  {sellers.map(s => <option key={s._id} value={s._id}>{s.fullName}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Showing <span className="font-semibold text-gray-600">{filteredProducts.length}</span> of <span className="font-semibold text-gray-600">{totalProducts}</span> products
          </p>
        </div>

        {/* ── Mobile Card View ── */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-500 text-sm">{search ? `No products match "${search}"` : 'No products found'}</p>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={`${product.sellerId}-${product.productId}`} className="p-4 space-y-3">
                <div className="flex gap-3">
                  {product.productImage
                    ? <img src={product.productImage} alt={product.productTitle} className="w-14 h-14 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                    : <div className="w-14 h-14 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0"><Package className="w-5 h-5 text-purple-400" /></div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{product.productTitle}</p>
                    {product.productDescription && <p className="text-xs text-gray-400 truncate">{product.productDescription}</p>}
                    <p className="text-sm font-bold text-gray-900 mt-1">₹{product.unitPrice?.toLocaleString('en-IN') || '—'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full ${stockBadge(product.stockQuantity)}`}>
                    {product.stockQuantity > 0 ? `${product.stockQuantity} units` : 'Out of stock'}
                  </span>
                  <StatusBadge status={product.sellerActive ? 'active' : 'inactive'} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-700">{product.sellerName}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Store className="w-3 h-3" />{product.shopName}</p>
                  </div>
                  <button onClick={() => navigate(`/users/${product.sellerId}?type=partner`)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Desktop Table View ── */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-6 py-3 font-semibold">Product</th>
                <th className="text-left px-6 py-3 font-semibold">Seller / Shop</th>
                <th className="text-left px-6 py-3 font-semibold">Unit Price</th>
                <th className="text-left px-6 py-3 font-semibold">Stock</th>
                <th className="text-left px-6 py-3 font-semibold">Seller Status</th>
                <th className="text-left px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="font-semibold text-gray-500 text-sm">{search ? `No products match "${search}"` : 'No products found'}</p>
                </td></tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={`${product.sellerId}-${product.productId}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.productImage
                          ? <img src={product.productImage} alt={product.productTitle} className="w-9 h-9 rounded-lg object-cover border border-gray-100" />
                          : <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0"><Package className="w-4 h-4 text-purple-400" /></div>
                        }
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{product.productTitle}</p>
                          {product.productDescription && <p className="text-xs text-gray-400 truncate max-w-[180px]">{product.productDescription}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">{product.sellerName}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><Store className="w-3 h-3" /> {product.shopName}</p>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm font-bold text-gray-900">₹{product.unitPrice?.toLocaleString('en-IN') || '—'}</span></td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${stockBadge(product.stockQuantity)}`}>
                        {product.stockQuantity > 0 ? `${product.stockQuantity} units` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={product.sellerActive ? 'active' : 'inactive'} /></td>
                    <td className="px-6 py-4">
                      <button onClick={() => navigate(`/users/${product.sellerId}?type=partner`)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                        <Eye className="w-3.5 h-3.5" /> View Seller
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}