import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load — verify session via HttpOnly cookie
  useEffect(() => {
    const verifySession = async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });

      if (data.otpRequired) {
        // Admin account — don't set user yet, caller must call verifyOtp next.
        return { success: false, otpRequired: true, email: data.email };
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please verify credentials.'
      };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid or expired code.'
      };
    }
  };

  const register = async (nameOrFormData, email, password) => {
    try {
      let payload;
      if (typeof nameOrFormData === 'object' && nameOrFormData !== null) {
        payload = nameOrFormData;
      } else {
        payload = { name: nameOrFormData, email, password };
      }
      const { data } = await api.post('/auth/register', payload);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      const errorMsg = error.response?.data?.message ||
        (error.response?.data?.errors && error.response.data.errors[0]?.msg) ||
        'Registration unsuccessful. Please try again.';
      return {
        success: false,
        message: errorMsg
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
