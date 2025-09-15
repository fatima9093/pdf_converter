'use client';

import { ADS_CONFIG } from '@/config/ads';

interface AdSpaceProps {
  position: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  visible?: boolean;
}

export default function AdSpace({ position, size = 'medium', className = '', visible = true }: AdSpaceProps) {
  // If ads are disabled globally or this specific ad is set to invisible, don't render
  if (!visible || !ADS_CONFIG.ENABLED) {
    return null;
  }
  const getAdDimensions = () => {
    if (position === 'horizontal') {
      switch (size) {
        case 'small':
          return 'h-16 w-full max-w-6xl';
        case 'large':
          return 'h-24 w-full max-w-6xl';
        default:
          return 'h-20 w-full max-w-6xl';
      }
    } else {
      // vertical
      switch (size) {
        case 'small':
          return 'w-32 min-h-96';
        case 'large':
          return 'w-40 min-h-[600px]';
        default:
          return 'w-36 min-h-[500px]';
      }
    }
  };

  return (
    <div className={`${getAdDimensions()} ${className}`}>
      <div className="w-full h-full bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-400 transition-colors">
        <div className="text-center p-4">
          <div className="text-sm font-medium mb-1">Advertisement</div>
          <div className="text-xs opacity-75">
            {position === 'horizontal' ? 'Banner Ad Space' : 'Sidebar Ad Space'}
          </div>
        </div>
      </div>
    </div>
  );
}
