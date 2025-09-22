'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ModalManager from '@/components/ModalManager';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import ConditionalAnalytics from '@/components/ConditionalAnalytics';
import { AuthProvider } from '@/contexts/AuthContext';
import { ModalProvider } from '@/contexts/ModalContext';
import { CookieConsentProvider } from '@/contexts/CookieConsentContext';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // Pages where navbar and footer should be hidden
  const authPages = ['/login', '/signup'];
  const isAuthPage = authPages.includes(pathname);

  // Get Google Client ID from environment variables
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google OAuth will not work.');
  }

  // Suppress GSI FedCM errors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalError = console.error;
      const originalWarn = console.warn;
      
      console.error = (...args) => {
        const message = args[0]?.toString?.() || '';
        if (
          message.includes('GSI_LOGGER') || 
          message.includes('FedCM') ||
          message.includes('AbortError: signal is aborted without reason') ||
          message.includes('Error retrieving a token')
        ) {
          return; // Suppress GSI/FedCM errors
        }
        originalError.apply(console, args);
      };
      
      console.warn = (...args) => {
        const message = args[0]?.toString?.() || '';
        if (
          message.includes('GSI_LOGGER') || 
          message.includes('FedCM') ||
          message.includes('AbortError: signal is aborted without reason') ||
          message.includes('Error retrieving a token')
        ) {
          return; // Suppress GSI/FedCM warnings
        }
        originalWarn.apply(console, args);
      };

      // Clean up on unmount
      return () => {
        console.error = originalError;
        console.warn = originalWarn;
      };
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={googleClientId || ''}>
      <CookieConsentProvider>
        <AuthProvider>
          <ModalProvider>
            <div className="min-h-screen flex flex-col bg-white">
              {!isAuthPage && <Navbar />}
              <main className="flex-1">{children}</main>
              {!isAuthPage && <Footer />}
              <ModalManager />
              <CookieConsentBanner />
              <ConditionalAnalytics 
                googleAnalyticsId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
                facebookPixelId={process.env.NEXT_PUBLIC_FB_PIXEL_ID}
              />
            </div>
          </ModalProvider>
        </AuthProvider>
      </CookieConsentProvider>
    </GoogleOAuthProvider>
  );
}
