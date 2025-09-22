'use client';

import { useState, useEffect } from 'react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { CookieConsentPreferences } from '@/lib/cookieService';

interface CookieConsentManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CookieConsentManager({ isOpen, onClose }: CookieConsentManagerProps) {
  const { 
    consentData, 
    saveCustomPreferences, 
    clearConsent, 
    acceptAll, 
    declineAll 
  } = useCookieConsent();
  
  const [preferences, setPreferences] = useState<CookieConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false,
  });

  // Load current preferences when modal opens
  useEffect(() => {
    if (isOpen && consentData?.preferences) {
      setPreferences(consentData.preferences);
    }
  }, [isOpen, consentData]);

  if (!isOpen) return null;

  const handlePreferenceChange = (category: keyof CookieConsentPreferences, value: boolean) => {
    if (category === 'necessary') return; // Necessary cookies can't be disabled
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSave = () => {
    saveCustomPreferences(preferences);
    onClose();
  };

  const handleAcceptAll = () => {
    acceptAll();
    onClose();
  };

  const handleDeclineAll = () => {
    declineAll();
    onClose();
  };

  const handleClearConsent = () => {
    if (confirm('Are you sure you want to clear all cookie preferences? This will require you to make new choices.')) {
      clearConsent();
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Cookie Preferences</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Current Status */}
            {consentData && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Current Status</h3>
                <p className="text-sm text-blue-700 mb-1">
                  Consent given on: {formatDate(consentData.consentDate)}
                </p>
                <p className="text-sm text-blue-700">
                  Version: {consentData.version}
                </p>
              </div>
            )}

            {/* Cookie Categories */}
            <div className="space-y-4 mb-6">
              {/* Necessary Cookies */}
              <div className="border rounded-lg">
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-t-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">Necessary Cookies</h4>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Always Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Essential for website functionality, security, and basic operations. These cannot be disabled.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end p-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t bg-white rounded-b-lg">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Examples:</h5>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Authentication tokens and session management</li>
                    <li>• Security and CSRF protection</li>
                    <li>• Basic site functionality and preferences</li>
                  </ul>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border rounded-lg">
                <div className="flex items-start justify-between p-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">Analytics Cookies</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Help us understand website usage and improve user experience through anonymous data collection.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handlePreferenceChange('analytics', !preferences.analytics)}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.analytics 
                          ? 'bg-blue-500 justify-end' 
                          : 'bg-gray-300 justify-start'
                      } p-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </button>
                  </div>
                </div>
                <div className="px-4 pb-4 border-t bg-gray-50">
                  <h5 className="text-sm font-medium text-gray-700 mb-2 mt-3">Examples:</h5>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Google Analytics (_ga, _gid, _gat)</li>
                    <li>• Page views, bounce rates, and user flow</li>
                    <li>• Performance monitoring and error tracking</li>
                  </ul>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="border rounded-lg">
                <div className="flex items-start justify-between p-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">Marketing Cookies</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Track visitors across websites to show relevant ads and measure advertising effectiveness.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handlePreferenceChange('marketing', !preferences.marketing)}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.marketing 
                          ? 'bg-blue-500 justify-end' 
                          : 'bg-gray-300 justify-start'
                      } p-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </button>
                  </div>
                </div>
                <div className="px-4 pb-4 border-t bg-gray-50">
                  <h5 className="text-sm font-medium text-gray-700 mb-2 mt-3">Examples:</h5>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Facebook Pixel (_fbp, _fbc)</li>
                    <li>• Google Ads conversion tracking</li>
                    <li>• Retargeting and audience building</li>
                  </ul>
                </div>
              </div>

              {/* Personalization Cookies */}
              <div className="border rounded-lg">
                <div className="flex items-start justify-between p-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">Personalization Cookies</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Remember your preferences and settings for a customized experience.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handlePreferenceChange('personalization', !preferences.personalization)}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.personalization 
                          ? 'bg-blue-500 justify-end' 
                          : 'bg-gray-300 justify-start'
                      } p-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </button>
                  </div>
                </div>
                <div className="px-4 pb-4 border-t bg-gray-50">
                  <h5 className="text-sm font-medium text-gray-700 mb-2 mt-3">Examples:</h5>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Theme preferences (dark/light mode)</li>
                    <li>• Language and region settings</li>
                    <li>• UI customizations and layout preferences</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Accept All
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Save Preferences
              </button>
              <button
                onClick={handleDeclineAll}
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Decline All
              </button>
            </div>

            {/* Clear Consent */}
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={handleClearConsent}
                className="w-full px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear All Cookie Preferences
              </button>
            </div>

            {/* Privacy Policy Link */}
            <div className="mt-4 text-center">
              <a 
                href="/privacy" 
                className="text-sm text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read our Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
