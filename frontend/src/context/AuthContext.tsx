// frontend/src/context/AuthContext.tsx

'use client'; 

import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { IUser } from '@/types';
import api from '@/lib/axios';
import { AxiosError } from 'axios';

type LoginData = { email: string; password: string; };
type RegisterData = LoginData & { fullName: string; };

interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUserFromToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/profile');
          setUser(data);
        } catch (error) {
          console.warn('Session expired or invalid token.');
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    loadUserFromToken();
  }, []);

  const login = async (data: LoginData) => {
    try {
      const response = await api.post('/auth/login', data);
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      const profileResponse = await api.get('/auth/profile');
      setUser(profileResponse.data);
      if (profileResponse.data.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    } catch (error) {

      if (error instanceof AxiosError && error.response?.status !== 401) {
        console.error('Unexpected login error:', error);
      }
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await api.post('/auth/register', data);
      await login({ email: data.email, password: data.password });
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status !== 409) {
          console.error('Unexpected registration error:', error);
      }
      throw error;
    }
  };

  const logout = () => {
    router.push('/');
    setTimeout(() => {
        setUser(null);
        localStorage.removeItem('token');
    }, 100);
  };

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
