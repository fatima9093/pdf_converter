'use client';

import HeroSection from "@/components/HeroSection";
import AdSpace from "@/components/AdSpace";
import ConversionLimitBanner from "@/components/ConversionLimitBanner";
import { ADS_CONFIG } from "@/config/ads";

export default function Home() {
  return (
    <div className="bg-white">
      {/* Top Ad Space - Only render container if ads are enabled */}
      {ADS_CONFIG.ENABLED && ADS_CONFIG.SECTIONS.TOP_BANNER && (
        <div className="w-full flex justify-center py-4 bg-white">
          <AdSpace position="horizontal" size={ADS_CONFIG.SIZES.TOP_BANNER} />
        </div>
      )}

      {/* Main Content with Sidebar Ads */}
      <div className="flex w-full">
        {/* Left Sidebar Ad - Only render container if ads are enabled */}
        {ADS_CONFIG.ENABLED && ADS_CONFIG.SECTIONS.LEFT_SIDEBAR && (
          <div className="hidden lg:flex lg:w-44 xl:w-48 flex-shrink-0 pl-4 py-8">
            <AdSpace position="vertical" size={ADS_CONFIG.SIZES.SIDEBAR} className="sticky top-8" />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0 px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <ConversionLimitBanner />
            <HeroSection />
          </div>
        </div>

        {/* Right Sidebar Ad - Only render container if ads are enabled */}
        {ADS_CONFIG.ENABLED && ADS_CONFIG.SECTIONS.RIGHT_SIDEBAR && (
          <div className="hidden lg:flex lg:w-44 xl:w-48 flex-shrink-0 pr-4 py-8">
            <AdSpace position="vertical" size={ADS_CONFIG.SIZES.SIDEBAR} className="sticky top-8" />
          </div>
        )}
      </div>

      {/* Bottom Ad Space - Only render container if ads are enabled */}
      {ADS_CONFIG.ENABLED && ADS_CONFIG.SECTIONS.BOTTOM_BANNER && (
        <div className="w-full flex justify-center py-6 bg-white border-t border-gray-200">
          <AdSpace position="horizontal" size={ADS_CONFIG.SIZES.BOTTOM_BANNER} />
        </div>
      )}
    </div>
  );
}