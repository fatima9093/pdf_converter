'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ConversionLimitService } from '@/lib/conversionLimits';
import { useAuth } from '@/contexts/AuthContext';

export default function ConversionLimitBanner() {
  const { isAuthenticated } = useAuth();
  const [limitInfo, setLimitInfo] = useState<{
    remainingCount: number;
    limitReached: boolean;
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      const limitResult = ConversionLimitService.checkConversionLimit(false);
      console.log('🎯 Banner updating with limit result:', limitResult);
      setLimitInfo({
        remainingCount: limitResult.remainingCount,
        limitReached: limitResult.limitReached,
      });
    } else {
      setLimitInfo(null);
    }
  }, [isAuthenticated]);

  // Also update when localStorage changes (after conversions)
  useEffect(() => {
    if (!isAuthenticated) {
      const handleStorageChange = () => {
        const limitResult = ConversionLimitService.checkConversionLimit(false);
        console.log('🎯 Banner updating due to storage change:', limitResult);
        setLimitInfo({
          remainingCount: limitResult.remainingCount,
          limitReached: limitResult.limitReached,
        });
      };

      window.addEventListener('storage', handleStorageChange);
      
      // Also check periodically (in case localStorage changes in same tab)
      const interval = setInterval(handleStorageChange, 1000);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    }
  }, [isAuthenticated]);

  // Don't show banner for authenticated users
  if (isAuthenticated || !limitInfo) {
    return null;
  }

  // Don't show banner if user still has all conversions available
  if (limitInfo.remainingCount === 3) {
    return null;
  }

  if (limitInfo.limitReached) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-red-800">
              You&apos;ve reached your free conversion limit (3/3)
            </p>
            <p className="text-sm text-red-700 mt-1">
              <Link 
                href="/signup" 
                className="font-medium underline hover:text-red-600"
              >
                Sign up now
              </Link>
              {' '}for unlimited conversions or{' '}
              <Link 
                href="/login" 
                className="font-medium underline hover:text-red-600"
              >
                log in
              </Link>
              {' '}if you already have an account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-amber-800">
            {limitInfo.remainingCount === 1 
              ? 'Last free conversion remaining!' 
              : `${limitInfo.remainingCount} free conversions remaining`
            }
          </p>
          <p className="text-sm text-amber-700 mt-1">
            <Link 
              href="/signup" 
              className="font-medium underline hover:text-amber-600"
            >
              Sign up
            </Link>
            {' '}for unlimited conversions and save your files.
          </p>
        </div>
      </div>
    </div>
  );
}
