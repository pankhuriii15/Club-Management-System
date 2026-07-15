import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  
  const { showSuccess, showError } = useToast();

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data.success) {
        setUser(res.data.data);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Fetch profile failed:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync profile on mount or token changes
  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token, fetchProfile]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.success) {
        const { token, ...userData } = res.data.data;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(userData);
        showSuccess(`Welcome back, ${userData.name}!`);
        return { success: true, role: userData.role };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      showError(errMsg);
      setLoading(false);
      return { success: false, message: errMsg };
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/register', userData);
      
      if (res.data.success) {
        const { token, ...newUserData } = res.data.data;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(newUserData);
        showSuccess('Account registered successfully!');
        return { success: true, role: newUserData.role };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed.';
      showError(errMsg);
      setLoading(false);
      return { success: false, message: errMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    showSuccess('Logged out successfully.');
  };

  // Helper roles verification flags
  const isStudent = user?.role === 'student';
  const isCoordinator = user?.role === 'coordinator';
  const isAdmin = user?.role === 'admin';
  const isSuperAdmin = user?.role === 'admin' && !user?.clubId;

  const updateProfileMock = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
    showSuccess('Profile updated successfully!');
    return true;
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loading, 
        login, 
        register, 
        logout, 
        isStudent, 
        isCoordinator, 
        isAdmin,
        isSuperAdmin,
        fetchProfile,
        updateProfileMock
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
