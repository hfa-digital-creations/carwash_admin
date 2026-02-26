// ============================================
// FILE: src/pages/admin/AdminRegister.jsx
// ============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, ChevronLeft, ChevronRight, Check,
  User, Mail, Phone, Lock, Car, Wrench, Package,
  Droplets, MapPin, CreditCard, Store, Plus, Trash2,
  AlertCircle, CheckCircle2, Loader2
} from 'lucide-react';
import { adminRegisterAPI } from '../../utils/apiHelper';

// ── Role config ──
const ROLES = [
  { value: 'customer',                  label: 'Customer',           icon: User,     color: 'blue',   desc: 'App user who books services' },
  { value: 'Washing Personnel',         label: 'Washing Personnel',  icon: Droplets, color: 'cyan',   desc: 'Handles car/bike wash bookings' },
  { value: 'Delivery Person',           label: 'Delivery Person',    icon: Car,      color: 'green',  desc: 'Delivers products to customers' },
  { value: 'Repair Service Technician', label: 'Repair Technician',  icon: Wrench,   color: 'orange', desc: 'Provides repair & maintenance' },
  { value: 'Product Seller',            label: 'Product Seller',     icon: Package,  color: 'purple', desc: 'Sells products via the app' },
];

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-400',   text: 'text-blue-700',   icon: 'text-blue-500',   ring: 'ring-blue-300'   },
  cyan:   { bg: 'bg-cyan-50',   border: 'border-cyan-400',   text: 'text-cyan-700',   icon: 'text-cyan-500',   ring: 'ring-cyan-300'   },
  green:  { bg: 'bg-green-50',  border: 'border-green-400',  text: 'text-green-700',  icon: 'text-green-500',  ring: 'ring-green-300'  },
  orange: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-700', icon: 'text-orange-500', ring: 'ring-orange-300' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-700', icon: 'text-purple-500', ring: 'ring-purple-300' },
};

// ── Reusable field components ──
const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

const Input = ({ icon: Icon, ...props }) => (
  <div className="relative">
    {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
    <input
      {...props}
      className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all ${props.className || ''}`}
    />
  </div>
);

const Select = ({ children, ...props }) => (
  <select {...props}
    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all">
    {children}
  </select>
);

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
    <Icon className="w-4 h-4 text-blue-500" />
    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
  </div>
);

// ── Step indicator ──
const StepBar = ({ steps, current }) => (
  <div className="flex items-center gap-0 overflow-x-auto pb-1">
    {steps.map((step, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center flex-shrink-0">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
            ${i < current ? 'bg-blue-500 text-white' : i === current ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-400'}`}>
            {i < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </div>
          <span className={`text-xs mt-1 font-medium whitespace-nowrap ${i === current ? 'text-blue-600' : 'text-gray-400'}`}>{step}</span>
        </div>
        {i < steps.length - 1 && (
          <div className={`flex-1 h-0.5 mx-1 sm:mx-2 mb-4 min-w-[16px] ${i < current ? 'bg-blue-400' : 'bg-gray-200'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ══════════════════════════════════════════
//  SECTION COMPONENTS
// ══════════════════════════════════════════

const BasicInfoSection = ({ form, setForm, errors }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <Field label="Full Name" required error={errors.fullName}>
      <Input icon={User} placeholder="e.g. Ravi Kumar" value={form.fullName}
        onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} />
    </Field>
    <Field label="Email" required error={errors.email}>
      <Input icon={Mail} type="email" placeholder="email@example.com" value={form.email}
        onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
    </Field>
    <Field label="Phone Number" required error={errors.phoneNumber}>
      <Input icon={Phone} placeholder="9876543210" value={form.phoneNumber}
        onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))} />
    </Field>
    <Field label="Password" required error={errors.password}>
      <Input icon={Lock} type="password" placeholder="Min 6 characters" value={form.password}
        onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
    </Field>
    <Field label="Gender">
      <Select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
        <option value="">Select gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </Select>
    </Field>
    <Field label="Date of Birth">
      <Input type="date" value={form.dateOfBirth}
        onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))} />
    </Field>
    <Field label="Referral Code">
      <Input placeholder="Optional referral code" value={form.referredBy}
        onChange={e => setForm(p => ({ ...p, referredBy: e.target.value }))} />
    </Field>
  </div>
);

const AddressSection = ({ form, setForm }) => (
  <div>
    <SectionTitle icon={MapPin} title="Address" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {['street', 'city', 'state', 'pincode'].map(field => (
        <Field key={field} label={field.charAt(0).toUpperCase() + field.slice(1)}>
          <Input placeholder={field} value={form.address?.[field] || ''}
            onChange={e => setForm(p => ({ ...p, address: { ...p.address, [field]: e.target.value } }))} />
        </Field>
      ))}
    </div>
  </div>
);

const VehicleSection = ({ form, setForm }) => (
  <div>
    <SectionTitle icon={Car} title="Vehicle Details" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Vehicle Type">
        <Select value={form.vehicleDetails?.vehicleType || ''}
          onChange={e => setForm(p => ({ ...p, vehicleDetails: { ...p.vehicleDetails, vehicleType: e.target.value } }))}>
          <option value="">Select type</option>
          {['Bike', 'Scooter', 'Car', 'Van', 'Auto'].map(v => <option key={v}>{v}</option>)}
        </Select>
      </Field>
      <Field label="Vehicle Number">
        <Input placeholder="TN01AB1234" value={form.vehicleDetails?.vehicleNumber || ''}
          onChange={e => setForm(p => ({ ...p, vehicleDetails: { ...p.vehicleDetails, vehicleNumber: e.target.value } }))} />
      </Field>
    </div>
  </div>
);

const PayoutSection = ({ form, setForm }) => (
  <div>
    <SectionTitle icon={CreditCard} title="Payout Details" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[
        { key: 'accountNumber', label: 'Account Number', placeholder: '123456789' },
        { key: 'ifscCode',      label: 'IFSC Code',      placeholder: 'HDFC0001234' },
        { key: 'bankName',      label: 'Bank Name',      placeholder: 'HDFC Bank' },
      ].map(({ key, label, placeholder }) => (
        <Field key={key} label={label}>
          <Input placeholder={placeholder} value={form.payoutDetails?.[key] || ''}
            onChange={e => setForm(p => ({ ...p, payoutDetails: { ...p.payoutDetails, [key]: e.target.value } }))} />
        </Field>
      ))}
    </div>
  </div>
);

const ShopSection = ({ form, setForm }) => (
  <div>
    <SectionTitle icon={Store} title="Shop Details" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Shop Name">
        <Input placeholder="e.g. Murugan Auto Care" value={form.shopDetails?.shopName || ''}
          onChange={e => setForm(p => ({ ...p, shopDetails: { ...p.shopDetails, shopName: e.target.value } }))} />
      </Field>
      <Field label="Shop Address">
        <Input placeholder="123 Main St, Chennai" value={form.shopDetails?.shopAddress || ''}
          onChange={e => setForm(p => ({ ...p, shopDetails: { ...p.shopDetails, shopAddress: e.target.value } }))} />
      </Field>
    </div>
  </div>
);

const ServicesSection = ({ form, setForm }) => {
  const services = form.services || [];
  const add    = ()           => setForm(p => ({ ...p, services: [...(p.services || []), { serviceName: '', description: '', minPrice: '', maxPrice: '' }] }));
  const remove = (i)          => setForm(p => ({ ...p, services: p.services.filter((_, idx) => idx !== i) }));
  const update = (i, field, val) => setForm(p => ({ ...p, services: p.services.map((s, idx) => idx === i ? { ...s, [field]: val } : s) }));
  return (
    <div>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Services Offered</h3>
        </div>
        <button onClick={add} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all">
          <Plus className="w-3 h-3" /> Add Service
        </button>
      </div>
      {services.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">No services added yet. Click "Add Service" to begin.</div>
      )}
      <div className="space-y-3">
        {services.map((s, i) => (
          <div key={i} className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-orange-600 uppercase">Service {i + 1}</span>
              <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Service Name"><Input placeholder="e.g. Engine Check" value={s.serviceName} onChange={e => update(i, 'serviceName', e.target.value)} /></Field>
              <Field label="Description"><Input placeholder="Short description" value={s.description} onChange={e => update(i, 'description', e.target.value)} /></Field>
              <Field label="Min Price (₹)"><Input type="number" placeholder="500" value={s.minPrice} onChange={e => update(i, 'minPrice', e.target.value)} /></Field>
              <Field label="Max Price (₹)"><Input type="number" placeholder="2000" value={s.maxPrice} onChange={e => update(i, 'maxPrice', e.target.value)} /></Field>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductsSection = ({ form, setForm }) => {
  const products = form.products || [];
  const add    = ()              => setForm(p => ({ ...p, products: [...(p.products || []), { productTitle: '', productDescription: '', unitPrice: '', stockQuantity: '' }] }));
  const remove = (i)             => setForm(p => ({ ...p, products: p.products.filter((_, idx) => idx !== i) }));
  const update = (i, field, val) => setForm(p => ({ ...p, products: p.products.map((pr, idx) => idx === i ? { ...pr, [field]: val } : pr) }));
  return (
    <div>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Products</h3>
        </div>
        <button onClick={add} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all">
          <Plus className="w-3 h-3" /> Add Product
        </button>
      </div>
      {products.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">No products added yet. Click "Add Product" to begin.</div>
      )}
      <div className="space-y-3">
        {products.map((pr, i) => (
          <div key={i} className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-purple-600 uppercase">Product {i + 1}</span>
              <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Product Title"><Input placeholder="e.g. Car Shampoo" value={pr.productTitle} onChange={e => update(i, 'productTitle', e.target.value)} /></Field>
              <Field label="Description"><Input placeholder="Short description" value={pr.productDescription} onChange={e => update(i, 'productDescription', e.target.value)} /></Field>
              <Field label="Unit Price (₹)"><Input type="number" placeholder="299" value={pr.unitPrice} onChange={e => update(i, 'unitPrice', e.target.value)} /></Field>
              <Field label="Stock Quantity"><Input type="number" placeholder="100" value={pr.stockQuantity} onChange={e => update(i, 'stockQuantity', e.target.value)} /></Field>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WashingCategorySection = ({ form, setForm }) => {
  const cats     = ['Car Wash', 'Bike Wash', 'SUV Wash', 'Interior Cleaning', 'Detailing'];
  const selected = form.serviceCategories || [];
  const toggle   = (cat) => setForm(p => ({
    ...p,
    serviceCategories: selected.includes(cat) ? selected.filter(c => c !== cat) : [...selected, cat],
  }));
  return (
    <div>
      <SectionTitle icon={Droplets} title="Service Categories" />
      <div className="flex flex-wrap gap-2">
        {cats.map(cat => (
          <button key={cat} onClick={() => toggle(cat)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all
              ${selected.includes(cat) ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-cyan-400 hover:text-cyan-600'}`}>
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

const TechnicianExtrasSection = ({ form, setForm }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <Field label="Years of Experience">
      <Input type="number" placeholder="5" value={form.yearsOfExperience || ''}
        onChange={e => setForm(p => ({ ...p, yearsOfExperience: e.target.value }))} />
    </Field>
    <Field label="Specializations (comma separated)">
      <Input placeholder="Engine, AC, Brakes" value={form.specializations || ''}
        onChange={e => setForm(p => ({ ...p, specializations: e.target.value }))} />
    </Field>
  </div>
);

// ══════════════════════════════════════════
//  BUILD API PAYLOAD
// ══════════════════════════════════════════
const buildPayload = (role, form) => {
  const base = {
    fullName: form.fullName, email: form.email,
    phoneNumber: form.phoneNumber, password: form.password,
    gender: form.gender || undefined, dateOfBirth: form.dateOfBirth || undefined,
    referredBy: form.referredBy || undefined,
  };
  if (role === 'customer') return base;
  const partnerBase = { ...base, role, userType: role };
  const profile = { address: form.address, payoutDetails: form.payoutDetails };
  switch (role) {
    case 'Washing Personnel':
      return { ...partnerBase, ...profile, serviceCategories: form.serviceCategories, vehicleDetails: form.vehicleDetails };
    case 'Delivery Person':
      return { ...partnerBase, ...profile, vehicleDetails: form.vehicleDetails };
    case 'Repair Service Technician':
      return {
        ...partnerBase, ...profile, shopDetails: form.shopDetails,
        yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : undefined,
        specializations: form.specializations ? form.specializations.split(',').map(s => s.trim()) : undefined,
        services: form.services,
      };
    case 'Product Seller':
      return { ...partnerBase, ...profile, shopDetails: form.shopDetails, products: form.products };
    default:
      return partnerBase;
  }
};

const getSteps = (role) => {
  if (role === 'customer')                  return ['Basic Info', 'Review'];
  if (role === 'Delivery Person')           return ['Basic Info', 'Vehicle & Payout', 'Review'];
  if (role === 'Washing Personnel')         return ['Basic Info', 'Categories & Vehicle', 'Review'];
  if (role === 'Repair Service Technician') return ['Basic Info', 'Shop & Services', 'Review'];
  if (role === 'Product Seller')            return ['Basic Info', 'Shop & Products', 'Review'];
  return ['Basic Info', 'Review'];
};

const EMPTY_FORM = {
  fullName: '', email: '', phoneNumber: '', password: '',
  gender: '', dateOfBirth: '', referredBy: '',
  address: {}, vehicleDetails: {}, payoutDetails: {},
  shopDetails: {}, services: [], products: [], serviceCategories: [],
};

// ══════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════
export default function AdminRegister() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [step,         setStep]         = useState(0);
  const [form,         setForm]         = useState({ ...EMPTY_FORM });
  const [errors,       setErrors]       = useState({});
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState(null);
  const [apiError,     setApiError]     = useState('');

  const steps    = selectedRole ? getSteps(selectedRole) : [];
  const formStep = step - 1;

  const validateBasic = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phoneNumber.trim()) e.phoneNumber = 'Phone number is required';
    if (!form.password.trim()) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    return e;
  };

  const handleNext = () => {
    if (formStep === 0) {
      const e = validateBasic();
      if (Object.keys(e).length) { setErrors(e); return; }
      setErrors({});
    }
    setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step === 1) { setSelectedRole(null); setStep(0); }
    else setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setLoading(true); setApiError('');
    try {
      const payload = buildPayload(selectedRole, form);
      const result = selectedRole === 'customer'
        ? await adminRegisterAPI.registerCustomer(payload)
        : await adminRegisterAPI.registerAndCompletePartner(payload);
      setSuccess(result);
      setStep(s => s + 1);
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isReviewStep   = formStep === steps.length - 1;
  const isSuccessStep  = step === steps.length + 1;

  // ── Role Picker ──
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Register New User</h1>
                <p className="text-sm text-gray-500">Select a user type to begin registration</p>
              </div>
            </div>
          </div>

          {/* Role Cards - 2 cols mobile, 3 cols lg */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {ROLES.map(({ value, label, icon: Icon, color, desc }) => {
              const c = COLOR_MAP[color];
              return (
                <button key={value} onClick={() => { setSelectedRole(value); setStep(1); }}
                  className="p-4 sm:p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] hover:shadow-md active:scale-100 bg-white border-gray-200 group">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${c.icon}`} />
                  </div>
                  <p className="font-bold text-gray-800 text-sm mb-1">{label}</p>
                  <p className="text-xs text-gray-500 hidden sm:block">{desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const roleConfig = ROLES.find(r => r.value === selectedRole);
  const RoleIcon   = roleConfig.icon;
  const roleColor  = COLOR_MAP[roleConfig.color];

  // ── Success Screen ──
  if (isSuccessStep && success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-500 text-sm mb-6">{success.message || `${roleConfig.label} has been registered successfully.`}</p>

          <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-2">
            {(success.partner || success.customer) && <>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">ID</span>
                <span className="font-mono text-gray-800 text-right break-all">{(success.partner || success.customer)?.id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Name</span>
                <span className="text-gray-800">{(success.partner || success.customer)?.fullName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Referral Code</span>
                <span className="font-mono text-blue-600">{(success.partner || success.customer)?.referralCode}</span>
              </div>
            </>}
            {success.summary && (
              <div className="flex justify-between text-xs pt-1 border-t border-gray-200">
                <span className="text-gray-500 font-medium">{success.summary.totalProducts != null ? 'Products Added' : 'Services Added'}</span>
                <span className="text-gray-800">{success.summary.totalProducts ?? success.summary.totalServices}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => { setSelectedRole(null); setStep(0); setSuccess(null); setForm({ ...EMPTY_FORM }); }}
              className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
              Register Another
            </button>
            <button onClick={() => {
                const tabMap = { customer: 'customers', 'Washing Personnel': 'washers', 'Delivery Person': 'delivery', 'Repair Service Technician': 'repair', 'Product Seller': 'sellers' };
                navigate(`/users?tab=${tabMap[selectedRole] || 'customers'}&registered=1`);
              }}
              className="flex-1 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
              View Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form Steps ──
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-xl ${roleColor.bg} flex items-center justify-center flex-shrink-0`}>
              <RoleIcon className={`w-5 h-5 ${roleColor.icon}`} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Register {roleConfig.label}</h1>
              <p className="text-xs text-gray-500">Step {formStep + 1} of {steps.length}</p>
            </div>
          </div>
          <StepBar steps={steps} current={formStep} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          {apiError && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {apiError}
            </div>
          )}

          {formStep === 0 && <BasicInfoSection form={form} setForm={setForm} errors={errors} />}

          {formStep === 1 && selectedRole !== 'customer' && (
            <div className="space-y-6">
              {selectedRole === 'Delivery Person'           && <><VehicleSection form={form} setForm={setForm} /><PayoutSection form={form} setForm={setForm} /></>}
              {selectedRole === 'Washing Personnel'         && <><WashingCategorySection form={form} setForm={setForm} /><VehicleSection form={form} setForm={setForm} /><AddressSection form={form} setForm={setForm} /></>}
              {selectedRole === 'Repair Service Technician' && <><ShopSection form={form} setForm={setForm} /><TechnicianExtrasSection form={form} setForm={setForm} /><ServicesSection form={form} setForm={setForm} /><PayoutSection form={form} setForm={setForm} /></>}
              {selectedRole === 'Product Seller'            && <><ShopSection form={form} setForm={setForm} /><ProductsSection form={form} setForm={setForm} /><PayoutSection form={form} setForm={setForm} /></>}
            </div>
          )}

          {isReviewStep && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-3">Review Details</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                {[['Role', roleConfig.label], ['Name', form.fullName], ['Email', form.email], ['Phone', form.phoneNumber], ['Gender', form.gender]]
                  .filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-500 font-medium">{k}</span>
                    <span className="text-gray-800">{v}</span>
                  </div>
                ))}
                {selectedRole === 'Repair Service Technician' && form.services?.length > 0 && (
                  <div className="flex justify-between pt-1 border-t border-gray-200">
                    <span className="text-gray-500 font-medium">Services</span>
                    <span className="text-gray-800">{form.services.length} added</span>
                  </div>
                )}
                {selectedRole === 'Product Seller' && form.products?.length > 0 && (
                  <div className="flex justify-between pt-1 border-t border-gray-200">
                    <span className="text-gray-500 font-medium">Products</span>
                    <span className="text-gray-800">{form.products.length} added</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 text-center">Please review before submitting. The account will be created and activated immediately.</p>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 mt-4">
          <button onClick={handleBack}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          {isReviewStep ? (
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</> : <><Check className="w-4 h-4" /> Confirm & Register</>}
            </button>
          ) : (
            <button onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}