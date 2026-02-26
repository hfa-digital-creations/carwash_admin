// ============================================
// FILE: src/pages/settings/Settings.jsx
// ============================================
import React, { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon, DollarSign, Users, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/PageLoader';
import { settingsAPI } from '../../utils/apiHelper';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [advancePaymentPercentage, setAdvancePaymentPercentage] = useState(30);
  const [commissionPercentage,     setCommissionPercentage]     = useState(15);
  const [autoAssignmentRadius,     setAutoAssignmentRadius]     = useState(10);
  const [maxPartnerDistance,       setMaxPartnerDistance]       = useState(15);

  useEffect(() => { fetchAllSettings(); }, []);

  const fetchAllSettings = async () => {
    try {
      setLoading(true); setError(null);
      const response = await settingsAPI.getAllSettings();
      if (response.settings) {
        if (response.settings.payment) {
          setAdvancePaymentPercentage(response.settings.payment.advancePaymentPercentage || 30);
          setCommissionPercentage(response.settings.payment.commissionPercentage || 15);
        }
        if (response.settings.partner) {
          setAutoAssignmentRadius(response.settings.partner.autoAssignmentRadius || 10);
          setMaxPartnerDistance(response.settings.partner.maxPartnerDistance || 15);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePaymentSettings = async () => {
    try {
      setSaving(true); setError(null); setSuccess(null);
      await settingsAPI.updateAdvancePaymentPercentage(advancePaymentPercentage);
      await settingsAPI.updateCommissionPercentage(commissionPercentage);
      setSuccess('Payment settings updated successfully! ✅');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update payment settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePartnerSettings = async () => {
    try {
      setSaving(true); setError(null); setSuccess(null);
      await settingsAPI.updatePartnerSettings(autoAssignmentRadius, maxPartnerDistance);
      setSuccess('Partner settings updated successfully! ✅');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update partner settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader text="Loading settings..." />;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <SettingsIcon className="w-8 h-8 text-[#FF6B1A]" />
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        </div>
        <p className="text-gray-600">Manage payment and partner assignment settings</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{success}</p>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-[#FFF4ED] px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-[#FF6B1A]" />
              <h2 className="text-lg font-semibold text-gray-900">Payment Settings</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Advance Payment Percentage for COD Orders</label>
              <div className="flex items-center space-x-4">
                <input type="number" min="10" max="100" step="1" value={advancePaymentPercentage}
                  onChange={e => setAdvancePaymentPercentage(Number(e.target.value))}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent outline-none" />
                <span className="text-lg font-semibold text-gray-700">%</span>
                <div className="flex-1">
                  <input type="range" min="10" max="100" step="1" value={advancePaymentPercentage}
                    onChange={e => setAdvancePaymentPercentage(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform Commission Percentage</label>
              <div className="flex items-center space-x-4">
                <input type="number" min="0" max="50" step="1" value={commissionPercentage}
                  onChange={e => setCommissionPercentage(Number(e.target.value))}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent outline-none" />
                <span className="text-lg font-semibold text-gray-700">%</span>
                <div className="flex-1">
                  <input type="range" min="0" max="50" step="1" value={commissionPercentage}
                    onChange={e => setCommissionPercentage(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <Button onClick={handleSavePaymentSettings} disabled={saving || advancePaymentPercentage < 10 || advancePaymentPercentage > 100 || commissionPercentage < 0 || commissionPercentage > 50}>
                <Save className="w-4 h-4 mr-2 inline" />
                {saving ? 'Saving...' : 'Save Payment Settings'}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-[#FFF4ED] px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#FF6B1A]" />
              <h2 className="text-lg font-semibold text-gray-900">Partner Assignment Settings</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Assignment Radius (km)</label>
              <div className="flex items-center space-x-4">
                <input type="number" min="1" max="50" step="1" value={autoAssignmentRadius}
                  onChange={e => setAutoAssignmentRadius(Number(e.target.value))}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent outline-none" />
                <span className="text-lg font-semibold text-gray-700">km</span>
                <div className="flex-1">
                  <input type="range" min="1" max="50" step="1" value={autoAssignmentRadius}
                    onChange={e => setAutoAssignmentRadius(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Partner Distance (km)</label>
              <div className="flex items-center space-x-4">
                <input type="number" min="1" max="50" step="1" value={maxPartnerDistance}
                  onChange={e => setMaxPartnerDistance(Number(e.target.value))}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent outline-none" />
                <span className="text-lg font-semibold text-gray-700">km</span>
                <div className="flex-1">
                  <input type="range" min="1" max="50" step="1" value={maxPartnerDistance}
                    onChange={e => setMaxPartnerDistance(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <Button onClick={handleSavePartnerSettings} disabled={saving || autoAssignmentRadius < 1 || autoAssignmentRadius > 50 || maxPartnerDistance < 1 || maxPartnerDistance > 50}>
                <Save className="w-4 h-4 mr-2 inline" />
                {saving ? 'Saving...' : 'Save Partner Settings'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium mb-1">Important Notes:</p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Payment settings apply to all new bookings and orders</li>
              <li>Partner settings affect automatic partner allocation</li>
              <li>Only Super Admin can modify these settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}