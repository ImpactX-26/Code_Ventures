import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { authApi } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  applicantId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User, applicantId?: string) => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [applicantId, setApplicantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('edupath_token');
    if (!token) {
      setUser(null);
      setApplicantId(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await authApi.getMe();
      if (data && data.user) {
        setUser(data.user);
        setApplicantId(data.applicant?.id || localStorage.getItem('edupath_applicant_id'));
      }
    } catch (err) {
      // If server error or offline demo, restore saved user from localStorage
      const cachedUser = localStorage.getItem('edupath_user');
      const cachedAppId = localStorage.getItem('edupath_applicant_id');
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
          setApplicantId(cachedAppId);
        } catch {
          // ignore
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = (token: string, userData: User, appNodeId?: string) => {
    localStorage.setItem('edupath_token', token);
    localStorage.setItem('edupath_user', JSON.stringify(userData));
    if (appNodeId) {
      localStorage.setItem('edupath_applicant_id', appNodeId);
      setApplicantId(appNodeId);
    }
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('edupath_token');
    localStorage.removeItem('edupath_user');
    localStorage.removeItem('edupath_applicant_id');
    setUser(null);
    setApplicantId(null);
  };

  const refreshMe = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        applicantId,
        isAuthenticated: Boolean(user && user.emailVerified),
        isLoading,
        login,
        logout,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
