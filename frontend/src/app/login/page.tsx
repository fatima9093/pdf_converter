'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { login, googleLogin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for success message from signup
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await login(email, password);
      
      if (result.success && result.user) {
        // Redirect based on user role
        if (result.user.role === 'ADMIN') {
          router.push('/dashboard');
        } else {
          router.push('/'); // Main page for regular users
        }
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    console.log('🔍 Google login attempt:', credentialResponse);
    
    if (credentialResponse.credential) {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      try {
        console.log('📤 Sending credential to backend...');
        const result = await googleLogin(credentialResponse.credential);
        console.log('📥 Backend response:', result);
        
        if (result.success && result.user) {
          console.log('✅ Google login successful');
          // Redirect based on user role
          if (result.user.role === 'ADMIN') {
            router.push('/dashboard');
          } else {
            router.push('/'); // Main page for regular users
          }
        } else {
          console.error('❌ Google login failed:', result.message);
          setError(result.message || 'Google login failed');
        }
      } catch (error) {
        console.error('❌ Google login error:', error);
        setError('Google login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error('❌ No credential received from Google');
      setError('No credential received from Google. Please try again.');
    }
  };

  const handleGoogleError = (error?: unknown) => {
    console.error('❌ Google OAuth error:', error);
    
    // Handle specific error types
    if (error && typeof error === 'object' && 'type' in error) {
      if (error.type === 'popup_closed') {
        console.log('ℹ️ User closed Google login popup');
        return; // Don't show error for user cancellation
      }
      
      if (error.type === 'network_error') {
        setError('Network error during Google login. Please check your internet connection and try again.');
        return;
      }
    }
    
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Google Login */}
          <div className="mb-6">
            <div className="w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                width="100%"
                text="continue_with"
                shape="rectangular"
                auto_select={false}
                cancel_on_tap_outside={true}
              />
            </div>
            
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 text-sm">{successMessage}</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#2b3d98] focus:ring-blue-500 border-gray-300 text-black "
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="text-[#2b3d98] hover:text-blue-500 transition-colors duration-200">
                  Forgot your password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`
                group relative w-full flex justify-center py-3 px-4 border border-transparent 
                text-sm font-medium rounded-lg text-white transition-all duration-200
                ${isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#2b3d98] hover:bg-[#243485] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }
              `}
            >
              {isLoading ? (
                'Signing in...'
              ) : (
                <span className="flex items-center space-x-2">
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#2b3d98] hover:text-blue-500 font-medium transition-colors duration-200">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
