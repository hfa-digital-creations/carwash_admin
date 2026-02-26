// ============================================
// FILE: src/pages/services/Services.jsx - WITH INR AND INLINE EDIT
// ============================================
import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, X, Upload, Loader2, ArrowLeft, Save } from 'lucide-react';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/PageLoader';
import { serviceAPI } from '../../utils/apiHelper';

export default function Settings() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [filterType, setFilterType] = useState('');
  
  const [formData, setFormData] = useState({
    serviceType: 'Car Wash',
    serviceName: '',
    description: '',
    features: [''],
    duration: '',
    price: '',
    expressServiceAvailable: false,
    expressFee: '',
    imageUrl: '',
    imageFileName: '',
    imageFileId: '',
  });

  useEffect(() => {
    if (!showForm) {
      fetchServices();
    }
  }, [filterType, showForm]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (filterType) filters.serviceType = filterType;
      const response = await serviceAPI.getAllServices(filters);
      setServices(response.services || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;

    try {
      setUploadingImage(true);
      const formDataImg = new FormData();
      formDataImg.append('image', file);
      const response = await serviceAPI.uploadImage(formDataImg);
      setFormData(prev => ({
        ...prev,
        imageUrl: response.url,
        imageFileName: response.fileName,
        imageFileId: response.fileId,
      }));
    } catch (err) {
      console.error('Image upload error:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, features: newFeatures }));
    }
  };

  const openCreateForm = () => {
    setEditingService(null);
    setFormData({
      serviceType: 'Car Wash', serviceName: '', description: '', features: [''],
      duration: '', price: '', expressServiceAvailable: false, expressFee: '',
      imageUrl: '', imageFileName: '', imageFileId: '',
    });
    setShowForm(true);
  };

  const openEditForm = (service) => {
    setEditingService(service);
    setFormData({
      serviceType: service.serviceType, serviceName: service.serviceName,
      description: service.description,
      features: service.features.length > 0 ? service.features : [''],
      duration: service.duration.toString(), price: service.price.toString(),
      expressServiceAvailable: service.expressServiceAvailable,
      expressFee: service.expressFee?.toString() || '',
      imageUrl: service.image?.url || '', imageFileName: service.image?.fileName || '',
      imageFileId: service.image?.fileId || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => { setShowForm(false); setEditingService(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedFeatures = formData.features.filter(f => f.trim() !== '');

    try {
      const payload = {
        serviceType: formData.serviceType,
        serviceName: formData.serviceName.trim(),
        description: formData.description.trim(),
        features: cleanedFeatures,
        duration: parseInt(formData.duration),
        price: parseFloat(formData.price),
        expressServiceAvailable: formData.expressServiceAvailable,
        expressFee: formData.expressServiceAvailable ? parseFloat(formData.expressFee) : 0,
        imageUrl: formData.imageUrl,
        imageFileName: formData.imageFileName,
        imageFileId: formData.imageFileId,
      };

      if (editingService) {
        payload.deleteOldImage = formData.imageFileId !== editingService.image?.fileId;
        await serviceAPI.updateService(editingService._id, payload);
      } else {
        await serviceAPI.createService(payload);
      }

      setShowForm(false);
      fetchServices();
    } catch (err) {
      console.error('Error saving service:', err);
    }
  };

  const handleToggleStatus = async (serviceId, currentStatus) => {
    try {
      await serviceAPI.toggleServiceStatus(serviceId, !currentStatus);
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (serviceId) => {
    try {
      await serviceAPI.deleteService(serviceId);
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.serviceType]) acc[service.serviceType] = [];
    acc[service.serviceType].push(service);
    return acc;
  }, {});

  if (showForm) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button onClick={closeForm} className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors" type="button">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingService ? 'Edit Service' : 'Create New Service'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {editingService ? 'Update service details' : 'Add a new service to your catalog'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Type *</label>
              <select name="serviceType" value={formData.serviceType} onChange={handleInputChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent">
                <option value="Car Wash">Car Wash</option>
                <option value="Bike Wash">Bike Wash</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Name *</label>
              <input type="text" name="serviceName" value={formData.serviceName} onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent"
                placeholder="e.g., Premium Car Wash" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent"
                placeholder="Describe the service" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Features *</label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input type="text" value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent"
                    placeholder={`Feature ${index + 1}`} />
                  {formData.features.length > 1 && (
                    <button type="button" onClick={() => removeFeature(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addFeature}
                className="text-[#FF6B1A] hover:text-[#e55a0f] text-sm font-medium flex items-center">
                <Plus className="w-4 h-4 mr-1" /> Add Feature
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes) *</label>
                <input type="number" name="duration" value={formData.duration} onChange={handleInputChange}
                  min="1" placeholder="30" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange}
                  min="0" step="0.01" placeholder="500" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent" />
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <label className="flex items-center cursor-pointer mb-3">
                <input type="checkbox" name="expressServiceAvailable" checked={formData.expressServiceAvailable}
                  onChange={handleInputChange} className="w-5 h-5 text-[#FF6B1A] border-gray-300 rounded focus:ring-[#FF6B1A]" />
                <span className="ml-3 text-sm font-medium text-gray-700">Express Service Available</span>
              </label>
              {formData.expressServiceAvailable && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Express Fee (₹) *</label>
                  <input type="number" name="expressFee" value={formData.expressFee} onChange={handleInputChange}
                    min="0" step="0.01" placeholder="100" required={formData.expressServiceAvailable}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Image *</label>
              {formData.imageUrl ? (
                <div className="relative">
                  <img src={formData.imageUrl} alt="Service preview" className="w-full h-64 object-cover rounded-lg" />
                  <button type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: '', imageFileName: '', imageFileId: '' }))}
                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-[#FF6B1A] transition-colors">
                  <input type="file" id="imageUpload" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <label htmlFor="imageUpload" className="cursor-pointer flex flex-col items-center">
                    {uploadingImage ? (
                      <><Loader2 className="w-12 h-12 text-[#FF6B1A] animate-spin mb-3" /><span className="text-sm text-gray-600 font-medium">Uploading image...</span></>
                    ) : (
                      <><Upload className="w-12 h-12 text-gray-400 mb-3" /><span className="text-sm text-gray-600 font-medium">Click to upload image</span><span className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</span></>
                    )}
                  </label>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <Button type="submit" className="flex-1 flex items-center justify-center">
                <Save className="w-5 h-5 mr-2" />
                {editingService ? 'Update Service' : 'Create Service'}
              </Button>
              <Button type="button" variant="ghost" onClick={closeForm} className="flex-1">Cancel</Button>
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
          <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your car and bike wash services</p>
        </div>
        <Button onClick={openCreateForm}><Plus className="w-4 h-4 mr-2" />Add New Service</Button>
      </div>
      <div className="mb-6 flex gap-2 flex-wrap">
        {[['', 'All Services'], ['Car Wash', 'Car Wash'], ['Bike Wash', 'Bike Wash']].map(([val, label]) => (
          <button key={val} onClick={() => setFilterType(val)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterType === val ? 'bg-[#FF6B1A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {label}
          </button>
        ))}
      </div>
      {loading && <PageLoader text="Loading services..." />}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200">
          {Object.keys(groupedServices).length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg font-medium">No services found</p>
              <p className="text-sm mt-2">Click "Add New Service" to create your first service</p>
            </div>
          ) : (
            Object.entries(groupedServices).map(([type, typeServices]) => (
              <div key={type} className="p-4 sm:p-6 border-b border-gray-200 last:border-b-0">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">{type} Services</h3>
                <div className="block sm:hidden space-y-3">
                  {typeServices.map((service) => (
                    <div key={service._id} className="border border-gray-200 rounded-xl overflow-hidden">
                      {service.image?.url ? (
                        <img src={service.image.url} alt={service.serviceName} className="w-full h-40 object-cover" />
                      ) : (
                        <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No image</span>
                        </div>
                      )}
                      <div className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900">{service.serviceName}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{service.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                            <input type="checkbox" checked={service.isActive}
                              onChange={() => handleToggleStatus(service._id, service.isActive)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B1A]"></div>
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded font-medium">₹{service.price}</span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">{service.duration} mins</span>
                          {service.expressServiceAvailable && (
                            <span className="bg-green-50 text-green-700 px-2 py-1 rounded">Express +₹{service.expressFee}</span>
                          )}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => openEditForm(service)}
                            className="flex-1 flex items-center justify-center gap-1 text-blue-600 bg-blue-50 hover:bg-blue-100 py-2 rounded-lg text-sm font-medium transition-colors">
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                          <button onClick={() => handleDelete(service._id)}
                            className="flex-1 flex items-center justify-center gap-1 text-red-500 bg-red-50 hover:bg-red-100 py-2 rounded-lg text-sm font-medium transition-colors">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-gray-600 text-sm">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">Image</th>
                        <th className="text-left px-4 py-3 font-medium">Service Name</th>
                        <th className="text-left px-4 py-3 font-medium">Description</th>
                        <th className="text-left px-4 py-3 font-medium">Duration</th>
                        <th className="text-left px-4 py-3 font-medium">Price (₹)</th>
                        <th className="text-left px-4 py-3 font-medium">Express</th>
                        <th className="text-left px-4 py-3 font-medium">Status</th>
                        <th className="text-left px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {typeServices.map((service) => (
                        <tr key={service._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {service.image?.url ? (
                              <img src={service.image.url} alt={service.serviceName} className="w-16 h-16 object-cover rounded-lg" />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No image</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-900 font-medium">{service.serviceName}</td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{service.description}</td>
                          <td className="px-4 py-3 text-gray-600">{service.duration} mins</td>
                          <td className="px-4 py-3 text-gray-900 font-medium">₹{service.price}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {service.expressServiceAvailable
                              ? <span className="text-green-600 font-medium">+₹{service.expressFee}</span>
                              : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={service.isActive}
                                onChange={() => handleToggleStatus(service._id, service.isActive)} className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B1A]"></div>
                            </label>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => openEditForm(service)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleDelete(service._id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}