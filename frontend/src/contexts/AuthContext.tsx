'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthState, LoginResponse } from '@/types';
import { ConversionLimitService } from '@/lib/conversionLimits';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  googleLogin: (idToken: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const clearAuthData = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3002'}/api/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include', // Use HTTP-only cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Tokens are refreshed via HTTP-only cookies automatically
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }, []);

  const verifyTokenAndSetUser = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3002'}/api/auth/me`, {
        credentials: 'include', // Use HTTP-only cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAuthState({
            user: data.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          throw new Error('Invalid token');
        }
      } else if (response.status === 401) {
        // Try to refresh token
        const refreshed = await refreshToken();
        if (!refreshed) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, [refreshToken]);

  useEffect(() => {
    // Check authentication status using HTTP-only cookies
    verifyTokenAndSetUser();
  }, [verifyTokenAndSetUser]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3002'}/api/auth/login`, {
        method: 'POST',
        credentials: 'include', // Use HTTP-only cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.data && data.data.user) {
        // No more localStorage - cookies are set automatically by the server
        setAuthState({
          user: data.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Reset conversion count when user logs in
        ConversionLimitService.resetAnonymousConversionCount();
        
        return { success: true, user: data.data.user };
      }
      
      return { success: false, message: data.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3002'}/api/auth/signup`, {
        method: 'POST',
        credentials: 'include', // Use HTTP-only cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data: LoginResponse = await response.json();

      if (data.success) {
        // Don't auto-login after signup - just return success
        return { success: true, message: 'Account created successfully!' };
      }
      
      return { success: false, message: data.message || 'Signup failed' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  const googleLogin = async (idToken: string): Promise<{ success: boolean; message?: string; user?: User }> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3002'}/api/auth/google`, {
        method: 'POST',
        credentials: 'include', // Use HTTP-only cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.data) {
        const user = data.data.user;
        
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Reset conversion count when user logs in with Google
        ConversionLimitService.resetAnonymousConversionCount();
        
        return { success: true, user };
      }
      
      return { success: false, message: data.message || 'Google login failed' };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };


  const logout = async (): Promise<void> => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3002'}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Use HTTP-only cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear any remaining localStorage data (for backward compatibility)
      clearAuthData();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const isAdmin = (): boolean => {
    return authState.user?.role === 'ADMIN';
  };

  const value: AuthContextType = {
    ...authState,
    login,
    signup,
    googleLogin,
    logout,
    refreshToken,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'admin' | 'user'
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      window.location.href = '/login';
      return null;
    }

    if (requiredRole && user?.role.toLowerCase() !== requiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
