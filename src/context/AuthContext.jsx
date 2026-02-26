// ============================================
// FILE: src/context/AuthContext.jsx
// ============================================
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // ✅ NEW — initial auth check
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const API_URL = 'http://localhost:7000/admin';

  // ✅ Refresh பண்ணும்போது localStorage check — authLoading false ஆனதும் மட்டும் render
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const adminData = localStorage.getItem('adminData');

    if (token && adminData) {
      setAdmin(JSON.parse(adminData));
      setIsAuthenticated(true);
    }

    setAuthLoading(false); // ✅ check முடிந்தது
  }, []);

  // Login
  const login = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('adminData', JSON.stringify(data.admin));

      setAdmin(data.admin);
      setIsAuthenticated(true);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  // Logout
  const logout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('adminData');
      setAdmin(null);
      setIsAuthenticated(false);
    }
  };

  // Get profile
  const getProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch profile');

      setAdmin(data.admin);
      localStorage.setItem('adminData', JSON.stringify(data.admin));
      return data.admin;
    } catch (err) {
      console.error('Get profile error:', err);
      return null;
    }
  };

  // Change password
  const changePassword = async ({ currentPassword, newPassword }) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to change password');
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Refresh token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await fetch(`${API_URL}/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error('Token refresh failed');
      localStorage.setItem('accessToken', data.accessToken);
      return data.accessToken;
    } catch (err) {
      logout();
      return null;
    }
  };

  // Update admin state + localStorage
  const updateAdmin = (fields) => {
    setAdmin((prev) => {
      const updated = { ...prev, ...fields };
      localStorage.setItem('adminData', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    admin,
    isAuthenticated,
    authLoading, // ✅ export
    loading,
    error,
    login,
    logout,
    getProfile,
    changePassword,
    refreshAccessToken,
    updateAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};