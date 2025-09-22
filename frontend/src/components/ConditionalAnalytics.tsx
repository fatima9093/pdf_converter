'use client';

import { useEffect, useCallback } from 'react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
  }
}

interface ConditionalAnalyticsProps {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
}

export default function ConditionalAnalytics({ 
  googleAnalyticsId, 
  facebookPixelId 
}: ConditionalAnalyticsProps) {
  const { hasConsent, isLoading } = useCookieConsent();

  const loadAnalytics = useCallback(() => {
    // Load Google Analytics
    if (googleAnalyticsId && hasConsent('analytics')) {
      loadGoogleAnalytics(googleAnalyticsId);
    }

    // Load Facebook Pixel
    if (facebookPixelId && hasConsent('marketing')) {
      loadFacebookPixel(facebookPixelId);
    }
  }, [googleAnalyticsId, facebookPixelId, hasConsent]);

  const loadGoogleAnalytics = (gaId: string) => {
    // Check if already loaded
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`)) {
      return;
    }

    // Create and append the Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Initialize gtag
    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      }
      window.gtag = gtag;
      
      gtag('js', new Date());
      gtag('config', gaId, {
        anonymize_ip: true, // GDPR compliance
        cookie_flags: 'max-age=7200;secure;samesite=none', // Cookie settings
      });

      console.log('Google Analytics loaded with consent');
    };
  };

  const loadFacebookPixel = (pixelId: string) => {
    // Check if already loaded
    if (window.fbq) return;

    // Facebook Pixel Code
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    // Add noscript fallback
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
    document.head.appendChild(noscript);

    console.log('Facebook Pixel loaded with consent');
  };

  const removeAnalytics = useCallback(() => {
    // Remove Google Analytics
    removeGoogleAnalytics();
    
    // Remove Facebook Pixel
    removeFacebookPixel();
  }, []);

  const removeGoogleAnalytics = () => {
    // Remove GA scripts
    const gaScripts = document.querySelectorAll('script[src*="googletagmanager.com"]');
    gaScripts.forEach(script => script.remove());

    // Clear dataLayer
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.length = 0;
    }

    // Remove gtag function
    if (window.gtag) {
      delete window.gtag;
    }

    console.log('Google Analytics removed due to consent withdrawal');
  };

  const removeFacebookPixel = () => {
    // Remove Facebook Pixel scripts
    const fbScripts = document.querySelectorAll('script[src*="connect.facebook.net"]');
    fbScripts.forEach(script => script.remove());

    // Remove noscript elements
    const noscripts = document.querySelectorAll('noscript');
    noscripts.forEach(noscript => {
      if (noscript.innerHTML.includes('facebook.com/tr')) {
        noscript.remove();
      }
    });

    // Remove fbq function
    if (window.fbq) {
      delete window.fbq;
    }

    console.log('Facebook Pixel removed due to consent withdrawal');
  };

  useEffect(() => {
    if (isLoading) return;

    const handleConsentChange = (event: CustomEvent) => {
      const { type, preferences } = event.detail;
      
      if (type === 'accept-all' || (type === 'custom' && preferences?.analytics)) {
        // Load analytics scripts
        loadAnalytics();
      } else if (type === 'decline-all' || type === 'cleared' || (type === 'custom' && !preferences?.analytics)) {
        // Remove analytics scripts and data
        removeAnalytics();
      }
    };

    // Listen for consent changes
    window.addEventListener('cookieConsentChanged', handleConsentChange as EventListener);

    // Initial load if consent already given
    if (hasConsent('analytics')) {
      loadAnalytics();
    }

    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange as EventListener);
    };
  }, [isLoading, hasConsent, loadAnalytics, removeAnalytics]);

  // This component doesn't render anything visible
  return null;
}

// Utility functions for manual tracking (use these in your components)
export const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  // Only track if analytics consent is given
  if (typeof window !== 'undefined') {
    // Check consent before tracking
    const consentCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('cookie-consent='));
    
    if (consentCookie) {
      try {
        const consentData = JSON.parse(decodeURIComponent(consentCookie.split('=')[1]));
        if (consentData.preferences?.analytics && window.gtag) {
          window.gtag('event', eventName, parameters);
        }
      } catch (error) {
        console.error('Error checking consent for tracking:', error);
      }
    }
  }
};

export const trackPageView = (page_path: string) => {
  trackEvent('page_view', {
    page_path,
    page_title: document.title,
    page_location: window.location.href,
  });
};

export const trackConversion = (conversionType: string, value?: number) => {
  trackEvent('conversion', {
    conversion_type: conversionType,
    value: value || 1,
    currency: 'USD',
  });
};
