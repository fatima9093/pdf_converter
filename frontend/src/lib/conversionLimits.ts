// Conversion limits for anonymous users
export const ANONYMOUS_CONVERSION_LIMIT = 3;
export const CONVERSION_COUNT_KEY = 'anonymous_conversion_count';

export interface ConversionLimitResult {
  canConvert: boolean;
  currentCount: number;
  remainingCount: number;
  limitReached: boolean;
}

export class ConversionLimitService {
  /**
   * Check if user can perform a conversion
   * @param isAuthenticated - Whether the user is logged in
   * @returns ConversionLimitResult with conversion status
   */
  static checkConversionLimit(isAuthenticated: boolean): ConversionLimitResult {
    // Authenticated users have unlimited conversions
    if (isAuthenticated) {
      return {
        canConvert: true,
        currentCount: 0,
        remainingCount: Infinity,
        limitReached: false,
      };
    }

    // For anonymous users, check localStorage
    const currentCount = this.getAnonymousConversionCount();
    const remainingCount = Math.max(0, ANONYMOUS_CONVERSION_LIMIT - currentCount);
    const limitReached = currentCount >= ANONYMOUS_CONVERSION_LIMIT;

    console.log(`🔍 Checking conversion limit: currentCount=${currentCount}, remainingCount=${remainingCount}, limitReached=${limitReached}`);

    return {
      canConvert: !limitReached,
      currentCount,
      remainingCount,
      limitReached,
    };
  }

  /**
   * Get current conversion count for anonymous users
   */
  static getAnonymousConversionCount(): number {
    if (typeof window === 'undefined') return 0;
    
    try {
      const count = localStorage.getItem(CONVERSION_COUNT_KEY);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.warn('Failed to read conversion count from localStorage:', error);
      return 0;
    }
  }

  /**
   * Increment conversion count for anonymous users
   */
  static incrementAnonymousConversionCount(): number {
    if (typeof window === 'undefined') return 0;

    try {
      const currentCount = this.getAnonymousConversionCount();
      const newCount = currentCount + 1;
      localStorage.setItem(CONVERSION_COUNT_KEY, newCount.toString());
      console.log(`🔢 Conversion count incremented: ${currentCount} → ${newCount}`);
      return newCount;
    } catch (error) {
      console.warn('Failed to increment conversion count in localStorage:', error);
      return 0;
    }
  }

  /**
   * Reset conversion count (useful when user signs up/logs in)
   */
  static resetAnonymousConversionCount(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(CONVERSION_COUNT_KEY);
    } catch (error) {
      console.warn('Failed to reset conversion count in localStorage:', error);
    }
  }

  /**
   * Get a user-friendly message about conversion limits
   */
  static getLimitMessage(limitResult: ConversionLimitResult): string {
    if (limitResult.limitReached) {
      return 'You have reached the limit of 3 free conversions. Please sign up to continue converting files.';
    }
    
    if (limitResult.remainingCount === 1) {
      return 'You have 1 free conversion remaining. Sign up for unlimited conversions.';
    }
    
    if (limitResult.remainingCount > 1) {
      return `You have ${limitResult.remainingCount} free conversions remaining.`;
    }

    return '';
  }

  /**
   * Debug utility - get current state and manually test limits
   */
  static debugConversionLimits(): void {
    if (typeof window === 'undefined') return;
    
    const currentCount = this.getAnonymousConversionCount();
    const limitResult = this.checkConversionLimit(false);
    
    console.log('🔍 CONVERSION LIMITS DEBUG:');
    console.log(`Current count: ${currentCount}`);
    console.log(`Remaining: ${limitResult.remainingCount}`);
    console.log(`Can convert: ${limitResult.canConvert}`);
    console.log(`Limit reached: ${limitResult.limitReached}`);
    console.log(`LocalStorage value:`, localStorage.getItem(CONVERSION_COUNT_KEY));
    
    // Add buttons to manually test
    if (document.getElementById('debug-conversion-buttons')) return;
    
    const debugDiv = document.createElement('div');
    debugDiv.id = 'debug-conversion-buttons';
    debugDiv.style.cssText = 'position:fixed;top:10px;right:10px;z-index:9999;background:white;padding:10px;border:1px solid black;';
    
    const incrementBtn = document.createElement('button');
    incrementBtn.textContent = 'Add +1 Count';
    incrementBtn.onclick = () => {
      this.incrementAnonymousConversionCount();
      this.debugConversionLimits();
    };
    
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset Count';
    resetBtn.onclick = () => {
      this.resetAnonymousConversionCount();
      this.debugConversionLimits();
    };
    
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove Debug';
    removeBtn.onclick = () => {
      debugDiv.remove();
    };
    
    debugDiv.appendChild(incrementBtn);
    debugDiv.appendChild(resetBtn);
    debugDiv.appendChild(removeBtn);
    document.body.appendChild(debugDiv);
  }

}
