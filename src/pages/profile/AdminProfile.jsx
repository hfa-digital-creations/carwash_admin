// ============================================
// FILE: src/pages/profile/AdminProfile.jsx
// ============================================
import React, { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Shield, Camera, Save, Eye, EyeOff,
  CheckCircle, AlertCircle, ArrowLeft, Edit3, Lock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

function Alert({ type, message, onClose }) {
  if (!message) return null;
  const ok = type === 'success';
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium mb-4 ${ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
      {ok ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 text-lg leading-none">&times;</button>
    </div>
  );
}

function AvatarUpload({ profilePhoto, fullName, onUpload, uploading }) {
  const fileRef = useRef();
  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-28 h-28 rounded-full bg-[#FF6B1A] flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden ring-4 ring-orange-100">
          {profilePhoto
            ? <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            : getInitials(fullName)}
        </div>
        <button
          onClick={() => fileRef.current.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 w-9 h-9 bg-[#FF6B1A] hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-60"
        >
          {uploading
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Camera className="w-4 h-4" />}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => onUpload(e.target.files[0])} />
      </div>
      <p className="text-xs text-gray-400">JPG, PNG · Max 5MB</p>
    </div>
  );
}

export default function AdminProfile() {
  const navigate = useNavigate();
  const { admin, updateAdmin, changePassword } = useAuth();

  const [profile, setProfile]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [profileAlert, setProfileAlert]   = useState({ type: '', message: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading]         = useState(false);
  const [fullName, setFullName]           = useState('');
  const [profilePhoto, setProfilePhoto]   = useState('');
  const [selectedFile, setSelectedFile]   = useState(null); // ✅ file object

  const [pwAlert, setPwAlert]         = useState({ type: '', message: '' });
  const [savingPw, setSavingPw]       = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/admin/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load profile');
        const a = data.admin || data;
        setProfile(a);
        setFullName(a.fullName || '');
        setProfilePhoto(a.profilePhoto || '');
      } catch (err) {
        setProfileAlert({ type: 'error', message: err.message });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ File select → preview only, file object save
  const handlePhotoUpload = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setProfileAlert({ type: 'error', message: 'File size must be under 5MB' });
      return;
    }
    setSelectedFile(file);
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result); // local preview
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // ✅ FormData use — Cloudinary URL return ஆகும்
  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      setProfileAlert({ type: 'error', message: 'Full name is required' });
      return;
    }
    setSavingProfile(true);
    setProfileAlert({ type: '', message: '' });
    try {
      const token = localStorage.getItem('accessToken');

      const formData = new FormData();
      formData.append('fullName', fullName);
      if (selectedFile) {
        formData.append('profilePhoto', selectedFile); // actual file
      }

      const response = await fetch(`${API_BASE_URL}/admin/update-profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type போடாதே — browser auto set பண்ணும்
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Update failed');

      const updated = data.admin;
      setProfile(updated);
      setSelectedFile(null);
      setProfilePhoto(updated.profilePhoto); // Cloudinary URL

      // ✅ Header உடனே update ஆகும்
      updateAdmin({
        fullName: updated.fullName,
        profilePhoto: updated.profilePhoto,
      });

      setProfileAlert({ type: 'success', message: 'Profile updated successfully' });
    } catch (err) {
      setProfileAlert({ type: 'error', message: err.message || 'Update failed' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = pwForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwAlert({ type: 'error', message: 'All fields are required' }); return;
    }
    if (newPassword.length < 6) {
      setPwAlert({ type: 'error', message: 'Password must be at least 6 characters' }); return;
    }
    if (newPassword !== confirmPassword) {
      setPwAlert({ type: 'error', message: 'Passwords do not match' }); return;
    }
    setSavingPw(true);
    setPwAlert({ type: '', message: '' });
    try {
      const result = await changePassword({ currentPassword, newPassword });
      if (!result.success) throw new Error(result.message);
      setPwAlert({ type: 'success', message: 'Password changed successfully' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwAlert({ type: 'error', message: err.message || 'Password change failed' });
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#FF6B1A] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500">Manage your account information</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-[#FF6B1A] to-orange-400" />
          <div className="px-6 pb-6">
            <div className="-mt-14 mb-6 flex justify-center">
              <AvatarUpload
                profilePhoto={profilePhoto}
                fullName={fullName}
                onUpload={handlePhotoUpload}
                uploading={uploading}
              />
            </div>

            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF6B1A] text-xs font-semibold capitalize border border-orange-100">
                <Shield className="w-3 h-3" />
                {profile?.role || 'Admin'}
              </span>
            </div>

            <Alert type={profileAlert.type} message={profileAlert.message}
              onClose={() => setProfileAlert({ type: '', message: '' })} />

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent outline-none transition"
                    placeholder="Enter full name" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={profile?.email || ''} readOnly
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text"
                    value={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''}
                    readOnly
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed outline-none capitalize" />
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-700">Member Since</p>
                  <p className="text-xs text-gray-400">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                      : '—'}
                  </p>
                </div>
              </div>
            </div>

            <button onClick={handleSaveProfile} disabled={savingProfile || uploading}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FF6B1A] hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors shadow-sm">
              {savingProfile
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Save className="w-4 h-4" />}
              {savingProfile ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* Password Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#FF6B1A]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
              <p className="text-xs text-gray-400">Update your login password</p>
            </div>
          </div>

          <Alert type={pwAlert.type} message={pwAlert.message}
            onClose={() => setPwAlert({ type: '', message: '' })} />

          <div className="space-y-4">
            {[
              { key: 'currentPassword', label: 'Current Password', show: showCurrent, setShow: setShowCurrent },
              { key: 'newPassword',     label: 'New Password',     show: showNew,     setShow: setShowNew     },
              { key: 'confirmPassword', label: 'Confirm New Password', show: showConfirm, setShow: setShowConfirm },
            ].map(({ key, label, show, setShow }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={show ? 'text' : 'password'}
                    value={pwForm[key]}
                    onChange={(e) => setPwForm((p) => ({ ...p, [key]: e.target.value }))}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B1A] focus:border-transparent outline-none transition"
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                  <button type="button" onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleChangePassword} disabled={savingPw}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors shadow-sm">
            {savingPw
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Edit3 className="w-4 h-4" />}
            {savingPw ? 'Updating…' : 'Update Password'}
          </button>
        </div>

      </div>
    </div>
  );
}