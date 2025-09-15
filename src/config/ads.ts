/**
 * Advertisement Configuration
 * 
 * To enable advertisements throughout the application:
 * 1. Change ADS_ENABLED to true
 * 2. Restart your development server
 * 
 * All advertisement sections will automatically appear when enabled.
 */

export const ADS_CONFIG = {
  // Global ad visibility toggle
  ENABLED: false,
  
  // Individual ad section controls (only used when ENABLED is true)
  SECTIONS: {
    TOP_BANNER: true,
    BOTTOM_BANNER: true,
    LEFT_SIDEBAR: true,
    RIGHT_SIDEBAR: true,
  },
  
  // Ad sizes configuration
  SIZES: {
    TOP_BANNER: 'small' as const,
    BOTTOM_BANNER: 'medium' as const,
    SIDEBAR: 'medium' as const,
  }
};
