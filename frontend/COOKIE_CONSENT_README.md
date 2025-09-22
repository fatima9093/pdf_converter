# Cookie Consent Management System

A comprehensive, GDPR-compliant cookie consent management system for your PDF converter application.

## Features

- ✅ Professional cookie consent banner with Accept/Decline/Customize options
- ✅ Granular cookie category management (Necessary, Analytics, Marketing, Personalization)
- ✅ Persistent consent storage with expiration (365 days)
- ✅ Conditional analytics loading based on consent
- ✅ Cookie settings management interface
- ✅ Automatic cleanup of non-consented cookies
- ✅ GDPR compliant with proper consent versioning
- ✅ Mobile-responsive design
- ✅ TypeScript support with full type safety

## Components

### 1. CookieService (`src/lib/cookieService.ts`)
Core service for cookie operations and consent management.

**Key Methods:**
- `setCookie()` - Set cookies with proper security flags
- `getCookie()` - Retrieve cookie values
- `saveConsentPreferences()` - Save user consent choices
- `getConsentPreferences()` - Get saved consent data
- `hasConsent(category)` - Check consent for specific category
- `acceptAll()` / `declineAll()` - Quick consent actions
- `clearAllConsent()` - Reset all consent data

### 2. CookieConsentContext (`src/contexts/CookieConsentContext.tsx`)
React context for managing consent state across the application.

**Provides:**
- Consent state management
- Event-driven consent updates
- Utility functions for checking consent
- Higher-order component for conditional rendering

### 3. CookieConsentBanner (`src/components/CookieConsentBanner.tsx`)
The main consent banner that appears for first-time visitors.

**Features:**
- Simple Accept/Decline interface
- Expandable detailed preferences
- Granular category toggles
- Professional design with animations

### 4. CookieConsentManager (`src/components/CookieConsentManager.tsx`)
Full-featured modal for managing cookie preferences.

**Features:**
- Detailed category explanations
- Current consent status display
- Bulk actions (Accept All, Decline All)
- Clear consent option

### 5. ConditionalAnalytics (`src/components/ConditionalAnalytics.tsx`)
Handles conditional loading of analytics scripts based on consent.

**Supports:**
- Google Analytics (with GDPR compliance)
- Facebook Pixel
- Dynamic script loading/removal
- Consent-based tracking functions

## Usage

### Basic Setup

The system is already integrated into your `ClientLayout.tsx`. The cookie consent banner will automatically appear for first-time visitors.

### Environment Variables

Add these optional environment variables to enable analytics:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=123456789
```

### Using Consent in Components

```tsx
import { useCookieConsent } from '@/contexts/CookieConsentContext';

function MyComponent() {
  const { hasConsent, getPreferences } = useCookieConsent();

  // Check specific consent
  if (hasConsent('analytics')) {
    // Load analytics code
  }

  // Get all preferences
  const preferences = getPreferences();
}
```

### Conditional Rendering

```tsx
import { withCookieConsent } from '@/contexts/CookieConsentContext';

const AnalyticsComponent = withCookieConsent(
  MyAnalyticsComponent, 
  'analytics'
);
```

### Manual Tracking

```tsx
import { trackEvent, trackPageView, trackConversion } from '@/components/ConditionalAnalytics';

// Track events (only if consent given)
trackEvent('button_click', { button_name: 'download' });
trackPageView('/pdf-converted');
trackConversion('pdf_conversion', 1);
```

## Cookie Categories

### Necessary Cookies
- **Always enabled** - Cannot be disabled
- Used for: Authentication, security, basic functionality
- Examples: Session tokens, CSRF protection

### Analytics Cookies
- **User choice** - Can be enabled/disabled
- Used for: Usage statistics, performance monitoring
- Examples: Google Analytics, error tracking

### Marketing Cookies
- **User choice** - Can be enabled/disabled
- Used for: Advertising, retargeting, campaign tracking
- Examples: Facebook Pixel, Google Ads

### Personalization Cookies
- **User choice** - Can be enabled/disabled
- Used for: User preferences, customization
- Examples: Theme settings, language preferences

## Consent Storage

Consent is stored in a cookie named `cookie-consent` with the following structure:

```json
{
  "hasConsented": true,
  "consentDate": "2024-01-01T00:00:00.000Z",
  "preferences": {
    "necessary": true,
    "analytics": true,
    "marketing": false,
    "personalization": true
  },
  "version": "1.0.0"
}
```

## Compliance Features

### GDPR Compliance
- ✅ Explicit consent required
- ✅ Granular category control
- ✅ Easy consent withdrawal
- ✅ Consent versioning
- ✅ Data subject rights support

### Cookie Cleanup
- Automatic removal of non-consented cookies
- Comprehensive cleanup of analytics cookies
- Marketing cookie purging
- Personalization data removal

## Integration Points

### Navbar Integration
A "Cookie Settings" button appears in the navigation bar (desktop and mobile) when consent has been given, allowing users to modify their preferences.

### Layout Integration
The system is integrated at the layout level, ensuring it works across all pages without additional setup.

### Analytics Integration
Conditional analytics loading ensures scripts are only loaded when consent is given, and removed when consent is withdrawn.

## Customization

### Styling
All components use Tailwind CSS classes and can be customized by modifying the component files.

### Content
Update text, links, and descriptions in the component files to match your privacy policy and requirements.

### Categories
Add or modify cookie categories by updating the `CookieConsentPreferences` interface and related logic.

### Analytics Providers
Add new analytics providers by extending the `ConditionalAnalytics` component.

## Testing

Use the `CookieConsentExample` component to test the system:

```tsx
import CookieConsentExample from '@/components/CookieConsentExample';

// Add to any page for testing
<CookieConsentExample />
```

## Legal Considerations

1. **Privacy Policy**: Ensure your privacy policy accurately describes cookie usage
2. **Consent Records**: Consider logging consent for audit purposes
3. **Data Processing**: Ensure compliance with local data protection laws
4. **Cookie Audits**: Regularly audit cookies to ensure accurate categorization

## Troubleshooting

### Banner Not Appearing
- Check if consent cookie already exists
- Clear browser storage to test first-visit experience
- Verify `CookieConsentProvider` is properly wrapped

### Analytics Not Loading
- Check environment variables are set
- Verify consent is given for analytics category
- Check browser console for script loading errors

### Consent Not Persisting
- Check if cookies are enabled in browser
- Verify domain/path settings in cookie configuration
- Check for cookie deletion by other scripts

## Support

For issues or questions about the cookie consent system, check:
1. Browser console for errors
2. Cookie storage in developer tools
3. Network tab for script loading issues
4. Component props and context usage
