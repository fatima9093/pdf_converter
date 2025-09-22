'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CookieService, CookieConsentPreferences, CookieConsentData } from '@/lib/cookieService';

interface CookieConsentContextType {
  // State
  isConsentRequired: boolean;
  consentData: CookieConsentData | null;
  isLoading: boolean;
  
  // Actions
  acceptAll: () => void;
  declineAll: () => void;
  saveCustomPreferences: (preferences: CookieConsentPreferences) => void;
  clearConsent: () => void;
  
  // Utilities
  hasConsent: (category: keyof CookieConsentPreferences) => boolean;
  getPreferences: () => CookieConsentPreferences | null;
  isConsentExpired: () => boolean;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [isConsentRequired, setIsConsentRequired] = useState(false);
  const [consentData, setConsentData] = useState<CookieConsentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load consent data on mount
  const loadConsentData = useCallback(() => {
    try {
      const savedConsent = CookieService.getConsentPreferences();
      
      if (savedConsent && !CookieService.isConsentExpired()) {
        setConsentData(savedConsent);
        setIsConsentRequired(false);
      } else {
        // Clear expired consent
        if (savedConsent && CookieService.isConsentExpired()) {
          CookieService.clearAllConsent();
        }
        setConsentData(null);
        setIsConsentRequired(true);
      }
    } catch (error) {
      console.error('Error loading consent data:', error);
      setConsentData(null);
      setIsConsentRequired(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      loadConsentData();
    }
  }, [loadConsentData]);

  const acceptAll = useCallback(() => {
    try {
      CookieService.acceptAll();
      const newConsentData = CookieService.getConsentPreferences();
      setConsentData(newConsentData);
      setIsConsentRequired(false);
      
      // Trigger analytics initialization if consent was given
      window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
        detail: { 
          type: 'accept-all',
          preferences: newConsentData?.preferences 
        }
      }));
    } catch (error) {
      console.error('Error accepting all cookies:', error);
    }
  }, []);

  const declineAll = useCallback(() => {
    try {
      CookieService.declineAll();
      const newConsentData = CookieService.getConsentPreferences();
      setConsentData(newConsentData);
      setIsConsentRequired(false);
      
      // Trigger cleanup of analytics scripts
      window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
        detail: { 
          type: 'decline-all',
          preferences: newConsentData?.preferences 
        }
      }));
    } catch (error) {
      console.error('Error declining cookies:', error);
    }
  }, []);

  const saveCustomPreferences = useCallback((preferences: CookieConsentPreferences) => {
    try {
      CookieService.saveConsentPreferences(preferences);
      const newConsentData = CookieService.getConsentPreferences();
      setConsentData(newConsentData);
      setIsConsentRequired(false);
      
      // Trigger custom preferences event
      window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
        detail: { 
          type: 'custom',
          preferences: newConsentData?.preferences 
        }
      }));
    } catch (error) {
      console.error('Error saving custom preferences:', error);
    }
  }, []);

  const clearConsent = useCallback(() => {
    try {
      CookieService.clearAllConsent();
      setConsentData(null);
      setIsConsentRequired(true);
      
      // Trigger consent cleared event
      window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
        detail: { 
          type: 'cleared',
          preferences: null 
        }
      }));
    } catch (error) {
      console.error('Error clearing consent:', error);
    }
  }, []);

  const hasConsent = useCallback((category: keyof CookieConsentPreferences): boolean => {
    return CookieService.hasConsent(category);
  }, []);

  const getPreferences = useCallback((): CookieConsentPreferences | null => {
    return consentData?.preferences || null;
  }, [consentData]);

  const isConsentExpired = useCallback((): boolean => {
    return CookieService.isConsentExpired();
  }, []);

  const value: CookieConsentContextType = {
    // State
    isConsentRequired,
    consentData,
    isLoading,
    
    // Actions
    acceptAll,
    declineAll,
    saveCustomPreferences,
    clearConsent,
    
    // Utilities
    hasConsent,
    getPreferences,
    isConsentExpired,
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}

// Higher-order component to conditionally render based on cookie consent
export function withCookieConsent<P extends object>(
  Component: React.ComponentType<P>,
  requiredCategory: keyof CookieConsentPreferences
) {
  return function CookieConsentComponent(props: P) {
    const { hasConsent, isLoading } = useCookieConsent();

    if (isLoading) {
      return null; // Don't render anything while loading
    }

    if (!hasConsent(requiredCategory)) {
      return null; // Don't render if consent not given
    }

    return <Component {...props} />;
  };
}
