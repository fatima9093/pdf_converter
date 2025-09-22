'use client';

import { useState } from 'react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { CookieConsentPreferences } from '@/lib/cookieService';

export default function CookieConsentBanner() {
  const { isConsentRequired, acceptAll, declineAll, saveCustomPreferences } = useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [customPreferences, setCustomPreferences] = useState<CookieConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false,
  });

  // Don't render if consent is not required
  if (!isConsentRequired) {
    return null;
  }

  const handleCustomSave = () => {
    saveCustomPreferences(customPreferences);
  };

  const handlePreferenceChange = (category: keyof CookieConsentPreferences, value: boolean) => {
    if (category === 'necessary') return; // Necessary cookies can't be disabled
    setCustomPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" />
      
      {/* Banner */}
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl border pointer-events-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6">
          {!showDetails ? (
            // Simple consent banner
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    We use cookies to enhance your experience
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We use essential cookies to make our site work. We&apos;d also like to set optional cookies for analytics and personalization. 
                    You can manage your preferences or learn more in our{' '}
                    <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                      Privacy Policy
                    </a>.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={acceptAll}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Accept All
                </button>
                <button
                  onClick={declineAll}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Decline All
                </button>
                <button
                  onClick={() => setShowDetails(true)}
                  className="flex-1 sm:flex-none px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Customize
                </button>
              </div>
            </div>
          ) : (
            // Detailed preferences
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Cookie Preferences
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close details"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="flex items-start justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">Necessary Cookies</h4>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Required</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      These cookies are essential for the website to function properly. They enable core functionality like security, authentication, and basic site operations.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end p-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">Analytics Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Help us understand how visitors interact with our website by collecting anonymous usage data and statistics.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handlePreferenceChange('analytics', !customPreferences.analytics)}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        customPreferences.analytics 
                          ? 'bg-blue-500 justify-end' 
                          : 'bg-gray-300 justify-start'
                      } p-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">Marketing Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Used to track visitors across websites to display relevant advertisements and measure campaign effectiveness.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handlePreferenceChange('marketing', !customPreferences.marketing)}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        customPreferences.marketing 
                          ? 'bg-blue-500 justify-end' 
                          : 'bg-gray-300 justify-start'
                      } p-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>

                {/* Personalization Cookies */}
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">Personalization Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Remember your preferences and settings to provide a more personalized experience on future visits.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handlePreferenceChange('personalization', !customPreferences.personalization)}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        customPreferences.personalization 
                          ? 'bg-blue-500 justify-end' 
                          : 'bg-gray-300 justify-start'
                      } p-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <button
                  onClick={acceptAll}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Accept All
                </button>
                <button
                  onClick={handleCustomSave}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Save Preferences
                </button>
                <button
                  onClick={declineAll}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Decline All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
