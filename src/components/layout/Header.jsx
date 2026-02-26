import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, LogOut, User, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const getInitials = (name) => {
  if (!name) return 'A';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

export default function Header({ setSidebarOpen }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ FIX 1: profilePhoto மாறும்போதும் _id மாறும்போதும் reset
  useEffect(() => {
    setImgError(false);
  }, [admin?.profilePhoto, admin?._id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  // ✅ FIX 2: Cache bust — browser பழைய image serve பண்ணாம fresh fetch பண்ணும்
  const profileImageUrl = admin?.profilePhoto
    ? `${admin.profilePhoto}?t=${admin.profilePhoto.split('/').pop()}`
    : null;

  const showImage = profileImageUrl && !imgError;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden text-gray-500 hover:text-gray-700 p-2"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center space-x-2 sm:space-x-4">
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B1A] rounded-full" />
        </button>

        <div className="h-8 w-px bg-gray-300 hidden sm:block" />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-2 sm:space-x-3 p-1 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {/* ✅ FIX 3: profileImageUrl use பண்றோம் */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#FF6B1A] flex items-center justify-center text-white font-semibold text-sm shadow flex-shrink-0">
              {showImage ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span>{getInitials(admin?.fullName)}</span>
              )}
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 leading-tight">
                {admin?.fullName || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {admin?.role || 'Administrator'}
              </p>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
              <button
                onClick={handleProfileClick}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#FF6B1A] transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>View Profile</span>
                </div>
                <ChevronRight className="w-3 h-3" />
              </button>

              <div className="border-t border-gray-100 my-1" />

              <button
                onClick={() => { setDropdownOpen(false); logout(); }}
                className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}