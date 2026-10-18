import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check existing session via httpOnly cookie on mount
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res?.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 / unauthorized is expected when visiting as guest
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Log in with email and password
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res?.data?.user) {
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      const message = error.message || error.details?.[0]?.message || 'Invalid email or password';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  // Register new account (Volunteer or Organization)
  const register = async (payload) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/register', payload);
      if (res?.data?.user) {
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      const message = error.message || error.details?.[0]?.message || 'Registration failed';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  // Sign out and clear session cookie
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout warning:', err);
    } finally {
      setUser(null);
    }
  };

  // Update volunteer profile
  const updateVolunteerProfile = async (profileData) => {
    try {
      const res = await api.patch('/volunteers/profile', profileData);
      if (res?.data) {
        setUser((prev) => ({
          ...prev,
          ...res.data,
          profile: res.data.profile || prev?.profile
        }));
        return { success: true, data: res.data };
      }
      return { success: false, error: 'Failed to update profile' };
    } catch (error) {
      return {
        success: false,
        error: error.message || error.details?.[0]?.message || 'Update failed'
      };
    }
  };

  // Update organization profile
  const updateOrganizationProfile = async (orgId, orgData) => {
    try {
      const res = await api.patch(`/organizations/${orgId}`, orgData);
      if (res?.data) {
        setUser((prev) => ({
          ...prev,
          organization: {
            ...(prev?.organization || {}),
            ...res.data
          }
        }));
        return { success: true, data: res.data };
      }
      return { success: false, error: 'Failed to update organization' };
    } catch (error) {
      return {
        success: false,
        error: error.message || error.details?.[0]?.message || 'Update failed'
      };
    }
  };

  const value = {
    user,
    loading,
    authError,
    isAuthenticated: !!user,
    role: user?.role || null,
    login,
    register,
    logout,
    checkAuth,
    updateVolunteerProfile,
    updateOrganizationProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
