// ============================================
// FILE: src/components/layout/Header.jsx
// ============================================
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bell, Menu, LogOut, User, ChevronRight,
  X, Check, CheckCheck, Trash2,
  Package, Wrench, ShoppingBag, AlertCircle, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../utils/apiHelper';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getInitials = (name) => {
  if (!name) return 'A';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const getNotifStyle = (type = '') => {
  const t = type.toLowerCase();
  if (t.includes('booking') || t.includes('washer'))
    return { icon: <Package className="w-4 h-4" />, bg: 'bg-blue-100', color: 'text-blue-600' };
  if (t.includes('service') || t.includes('technician'))
    return { icon: <Wrench className="w-4 h-4" />, bg: 'bg-purple-100', color: 'text-purple-600' };
  if (t.includes('order') || t.includes('delivery'))
    return { icon: <ShoppingBag className="w-4 h-4" />, bg: 'bg-green-100', color: 'text-green-600' };
  if (t.includes('cancel') || t.includes('declined') || t.includes('unavailable'))
    return { icon: <AlertCircle className="w-4 h-4" />, bg: 'bg-red-100', color: 'text-red-600' };
  return { icon: <Info className="w-4 h-4" />, bg: 'bg-orange-100', color: 'text-[#FF6B1A]' };
};

// ─── Notification Panel ───────────────────────────────────────────────────────

function NotificationPanel() {
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [unreadCount, setUnreadCount]     = useState(0);
  const panelRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationAPI.getAll();
      const list = data.notifications || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.isRead).length);
    } catch { /* silent — toast shown by apiCall */ }
    finally { setLoading(false); }
  }, []);

  // mount + 60s poll
  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 60000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  // refresh on open
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // outside click → close
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const deleteNotif = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationAPI.delete(id);
      const removed = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (removed && !removed.isRead) setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  return (
    <div className="relative" ref={panelRef}>

      {/* Bell Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-[#FF6B1A] rounded-full flex items-center justify-center">
            <span className="text-white text-[10px] font-bold leading-none px-0.5">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">

          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-[#FF6B1A]" />
              <span className="font-semibold text-gray-900 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-[#FF6B1A] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  title="Mark all as read"
                  className="p-1.5 text-gray-400 hover:text-[#FF6B1A] hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="w-6 h-6 border-2 border-[#FF6B1A] border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Bell className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs mt-1 opacity-70">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => {
                const { icon, bg, color } = getNotifStyle(n.type);
                return (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && markRead(n._id)}
                    className={`group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors
                      ${n.isRead ? 'hover:bg-gray-50' : 'bg-orange-50/60 hover:bg-orange-50'}`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full ${bg} ${color} flex items-center justify-center mt-0.5`}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${n.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                        {n.title && <span className="font-semibold">{n.title}: </span>}
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.isRead && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markRead(n._id); }}
                          title="Mark as read"
                          className="p-1 text-gray-400 hover:text-[#FF6B1A] rounded transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => deleteNotif(n._id, e)}
                        title="Delete"
                        className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {!n.isRead && (
                      <div className="flex-shrink-0 w-2 h-2 bg-[#FF6B1A] rounded-full mt-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-center text-gray-400">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'All notifications read ✓'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export default function Header({ setSidebarOpen }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imgError, setImgError]         = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => { setImgError(false); }, [admin?.profilePhoto, admin?._id]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

        {/* ⭐ Notification Panel (replaces old static Bell) */}
        <NotificationPanel />

        <div className="h-8 w-px bg-gray-300 hidden sm:block" />

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-2 sm:space-x-3 p-1 rounded-xl hover:bg-gray-50 transition-colors"
          >
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
                onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
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