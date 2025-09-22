/**
 * Cookie Service for managing cookie consent and cookie operations
 */

export interface CookieConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export interface CookieConsentData {
  hasConsented: boolean;
  consentDate: string;
  preferences: CookieConsentPreferences;
  version: string;
}

export class CookieService {
  private static readonly CONSENT_COOKIE_NAME = 'cookie-consent';
  private static readonly CONSENT_VERSION = '1.0.0';
  private static readonly CONSENT_DURATION = 365; // days

  /**
   * Set a cookie with the given name, value, and options
   */
  static setCookie(
    name: string, 
    value: string, 
    days: number = 365, 
    secure: boolean = true,
    sameSite: 'strict' | 'lax' | 'none' = 'lax'
  ): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    const cookieString = [
      `${name}=${encodeURIComponent(value)}`,
      `expires=${expires.toUTCString()}`,
      'path=/',
      secure ? 'secure' : '',
      `samesite=${sameSite}`
    ].filter(Boolean).join('; ');
    
    document.cookie = cookieString;
  }

  /**
   * Get a cookie value by name
   */
  static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  }

  /**
   * Delete a cookie by name
   */
  static deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  /**
   * Save cookie consent preferences
   */
  static saveConsentPreferences(preferences: CookieConsentPreferences): void {
    const consentData: CookieConsentData = {
      hasConsented: true,
      consentDate: new Date().toISOString(),
      preferences,
      version: this.CONSENT_VERSION
    };

    this.setCookie(
      this.CONSENT_COOKIE_NAME,
      JSON.stringify(consentData),
      this.CONSENT_DURATION,
      true,
      'lax'
    );

    // Clean up non-essential cookies if consent is withdrawn
    if (!preferences.analytics) {
      this.clearAnalyticsCookies();
    }
    if (!preferences.marketing) {
      this.clearMarketingCookies();
    }
    if (!preferences.personalization) {
      this.clearPersonalizationCookies();
    }
  }

  /**
   * Get saved cookie consent preferences
   */
  static getConsentPreferences(): CookieConsentData | null {
    const consentCookie = this.getCookie(this.CONSENT_COOKIE_NAME);
    if (!consentCookie) return null;

    try {
      const consentData = JSON.parse(consentCookie) as CookieConsentData;
      
      // Check if consent is still valid (version matches)
      if (consentData.version !== this.CONSENT_VERSION) {
        this.deleteCookie(this.CONSENT_COOKIE_NAME);
        return null;
      }
      
      return consentData;
    } catch (error) {
      console.error('Error parsing consent cookie:', error);
      this.deleteCookie(this.CONSENT_COOKIE_NAME);
      return null;
    }
  }

  /**
   * Check if user has given consent for a specific category
   */
  static hasConsent(category: keyof CookieConsentPreferences): boolean {
    const consent = this.getConsentPreferences();
    if (!consent) return false;
    
    return consent.preferences[category];
  }

  /**
   * Check if user has any consent saved
   */
  static hasAnyConsent(): boolean {
    return this.getConsentPreferences() !== null;
  }

  /**
   * Clear all consent and reset
   */
  static clearAllConsent(): void {
    this.deleteCookie(this.CONSENT_COOKIE_NAME);
    this.clearAnalyticsCookies();
    this.clearMarketingCookies();
    this.clearPersonalizationCookies();
  }

  /**
   * Accept all cookies
   */
  static acceptAll(): void {
    const preferences: CookieConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true
    };
    this.saveConsentPreferences(preferences);
  }

  /**
   * Decline all non-essential cookies
   */
  static declineAll(): void {
    const preferences: CookieConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false
    };
    this.saveConsentPreferences(preferences);
  }

  /**
   * Clear analytics cookies
   */
  private static clearAnalyticsCookies(): void {
    const analyticsCookies = [
      '_ga', '_ga_*', '_gid', '_gat', '_gtag_GA_*',
      '__utma', '__utmb', '__utmc', '__utmz', '__utmt',
      '_fbp', '_fbc', '__hstc', '__hssrc', '__hssc'
    ];
    
    analyticsCookies.forEach(cookie => {
      if (cookie.includes('*')) {
        // Handle wildcard cookies
        const prefix = cookie.replace('*', '');
        this.deleteCookiesStartingWith(prefix);
      } else {
        this.deleteCookie(cookie);
      }
    });
  }

  /**
   * Clear marketing cookies
   */
  private static clearMarketingCookies(): void {
    const marketingCookies = [
      '_fbp', '_fbc', 'fr', 'tr', 'ads_prefs',
      '__Secure-3PAPISID', '__Secure-3PSID', '__Secure-3PSIDCC',
      'IDE', 'test_cookie', '_gcl_au', '_gcl_aw'
    ];
    
    marketingCookies.forEach(cookie => this.deleteCookie(cookie));
  }

  /**
   * Clear personalization cookies
   */
  private static clearPersonalizationCookies(): void {
    const personalizationCookies = [
      'pref', 'theme', 'lang', 'timezone',
      '_hjid', '_hjFirstSeen', '_hjIncludedInPageviewSample'
    ];
    
    personalizationCookies.forEach(cookie => this.deleteCookie(cookie));
  }

  /**
   * Delete cookies that start with a specific prefix
   */
  private static deleteCookiesStartingWith(prefix: string): void {
    if (typeof document === 'undefined') return;
    
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name.startsWith(prefix)) {
        this.deleteCookie(name);
      }
    });
  }

  /**
   * Check if consent is required (user hasn't made a choice yet)
   */
  static isConsentRequired(): boolean {
    return !this.hasAnyConsent();
  }

  /**
   * Get consent expiry date
   */
  static getConsentExpiryDate(): Date | null {
    const consent = this.getConsentPreferences();
    if (!consent) return null;
    
    const consentDate = new Date(consent.consentDate);
    consentDate.setDate(consentDate.getDate() + this.CONSENT_DURATION);
    return consentDate;
  }

  /**
   * Check if consent has expired
   */
  static isConsentExpired(): boolean {
    const expiryDate = this.getConsentExpiryDate();
    if (!expiryDate) return true;
    
    return new Date() > expiryDate;
  }
}
