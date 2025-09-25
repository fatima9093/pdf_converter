'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  FileText,
  PieChart,
  BarChart3,
  Activity,
  CheckCircle,
  AlertCircle,
  HardDrive,
  RefreshCw,
  Download
} from 'lucide-react';
import { DashboardStatistics } from '@/types';

export default function Statistics() {
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  const timeRangeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeRangeDropdownRef.current && !timeRangeDropdownRef.current.contains(event.target as Node)) {
        setShowTimeRangeDropdown(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowTimeRangeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch real statistics data from API
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/statistics?timeRange=${timeRange}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            setStats(result.data);
          } else {
            console.error('Failed to fetch statistics:', result.error);
            // Fallback to empty stats structure
            setStats({
              dailyUploads: [],
              monthlyUploads: [],
              mostUploadedFileType: { type: 'N/A', count: 0, percentage: 0 },
              allFileTypes: [],
              conversionSuccessRate: { successful: 0, failed: 0, rate: 0 },
              totalStorageUsed: { bytes: 0, formatted: '0 Bytes', percentage: 0 },
              growthRates: { uploads: 0, successRate: 0, failures: 0, storage: 0 }
            });
          }
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          console.error('Failed to fetch statistics:', response.status, errorData);
          
          // If 401 (Unauthorized), redirect to login or show empty stats
          if (response.status === 401) {
            console.log('User not authenticated, showing empty statistics');
            // Fallback to empty stats for unauthenticated users
            setStats({
              dailyUploads: [],
              monthlyUploads: [],
              mostUploadedFileType: { type: 'N/A', count: 0, percentage: 0 },
              allFileTypes: [],
              conversionSuccessRate: { successful: 0, failed: 0, rate: 0 },
              totalStorageUsed: { bytes: 0, formatted: '0 Bytes', percentage: 0 },
              growthRates: { uploads: 0, successRate: 0, failures: 0, storage: 0 }
            });
          } else {
            // Other errors - show empty stats
            setStats({
              dailyUploads: [],
              monthlyUploads: [],
              mostUploadedFileType: { type: 'N/A', count: 0, percentage: 0 },
              allFileTypes: [],
              conversionSuccessRate: { successful: 0, failed: 0, rate: 0 },
              totalStorageUsed: { bytes: 0, formatted: '0 Bytes', percentage: 0 },
              growthRates: { uploads: 0, successRate: 0, failures: 0, storage: 0 }
            });
          }
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        // Fallback to empty stats
        setStats({
          dailyUploads: [],
          monthlyUploads: [],
          mostUploadedFileType: { type: 'N/A', count: 0, percentage: 0 },
          allFileTypes: [],
          conversionSuccessRate: { successful: 0, failed: 0, rate: 0 },
          totalStorageUsed: { bytes: 0, formatted: '0 Bytes', percentage: 0 },
          growthRates: { uploads: 0, successRate: 0, failures: 0, storage: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [timeRange]);

  // Generate file type data from statistics
  const getFileTypeColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500',
      'bg-gray-500'
    ];
    return colors[index % colors.length];
  };

  const fileTypeData = stats?.allFileTypes && stats.allFileTypes.length > 0 ? 
    stats.allFileTypes.map((fileType, index) => ({
      type: fileType.type,
      count: fileType.count,
      color: getFileTypeColor(index),
      percentage: fileType.percentage
    })) :
    (stats ? [
      { type: stats.mostUploadedFileType.type, count: stats.mostUploadedFileType.count, color: 'bg-blue-500', percentage: stats.mostUploadedFileType.percentage },
      { type: 'Other Types', count: Math.max(0, stats.dailyUploads.reduce((sum, day) => sum + day.count, 0) - stats.mostUploadedFileType.count), color: 'bg-gray-500', percentage: Math.max(0, 100 - stats.mostUploadedFileType.percentage) }
    ] : []);

  const exportData = () => {
    if (!stats) return;

    const csvContent = [
      'Metric,Value',
      `Total Uploads (${timeRange}),${stats.dailyUploads.reduce((sum, day) => sum + day.count, 0)}`,
      `Most Popular File Type,${stats.mostUploadedFileType.type}`,
      `Conversion Success Rate,${stats.conversionSuccessRate.rate}%`,
      `Storage Used,${stats.totalStorageUsed.formatted}`,
      '',
      'Daily Uploads:',
      'Date,Count',
      ...stats.dailyUploads.map(day => `${day.date},${day.count}`),
      '',
      'Monthly Uploads:',
      'Month,Count',
      ...stats.monthlyUploads.map(month => `${month.month},${month.count}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'statistics_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats) return null;

  // Check if user is not authenticated (all stats are empty/zero)
  const isUnauthenticated = stats.dailyUploads.length === 0 && 
    stats.conversionSuccessRate.successful === 0 && 
    stats.conversionSuccessRate.failed === 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .statistics-dropdown {
            max-width: calc(100vw - 2rem) !important;
            left: 0 !important;
            right: 0 !important;
            position: absolute !important;
            animation: slideDown 0.15s ease-out;
            border-radius: 0.5rem !important;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
            /* Ensure dropdown stays within viewport */
            transform: translateX(0) !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .statistics-dropdown button {
            min-height: 44px !important;
            display: flex !important;
            align-items: center !important;
            width: 100% !important;
            text-align: left !important;
          }
          
          @media screen and (max-width: 640px) {
            .statistics-dropdown {
              max-height: 40vh !important;
              overflow-y: auto !important;
              -webkit-overflow-scrolling: touch !important;
              /* Ensure proper mobile positioning */
              left: -0.5rem !important;
              right: -0.5rem !important;
              max-width: calc(100vw - 1rem) !important;
            }
            
            .statistics-dropdown button {
              padding: 12px 16px !important;
              font-size: 16px !important;
              /* Better touch targets */
              min-height: 48px !important;
            }
            
            /* Ensure parent container allows overflow */
            .statistics-dropdown-container {
              overflow: visible !important;
            }
          }
          
          /* Additional responsive safeguards */
          @media screen and (max-width: 480px) {
            .statistics-dropdown {
              left: -1rem !important;
              right: -1rem !important;
              max-width: calc(100vw - 0.5rem) !important;
            }
          }
        `
      }} />
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="space-y-4">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Statistics</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Analytics and insights about your platform</p>
              {isUnauthenticated && (
                <p className="text-sm text-amber-600 mt-2 p-2 bg-amber-50 rounded-lg">
                  Please log in to view detailed statistics
                </p>
              )}
            </div>
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
              {/* Custom Time Range Dropdown */}
              <div className="w-full sm:w-auto relative overflow-visible statistics-dropdown-container" ref={timeRangeDropdownRef}>
                <button
                  onClick={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
                  className="w-full sm:w-auto px-3 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black cursor-pointer text-left flex items-center justify-between min-w-0 hover:bg-gray-50 transition-colors"
                  style={{ fontSize: '16px', minWidth: '160px' }}
                >
                  <span className="truncate mr-2">
                    {timeRange === '7d' ? 'Last 7 days' :
                     timeRange === '30d' ? 'Last 30 days' :
                     timeRange === '90d' ? 'Last 90 days' :
                     timeRange === '1y' ? 'Last year' : 'Last 30 days'}
                  </span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${showTimeRangeDropdown ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showTimeRangeDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto statistics-dropdown">
                    {[
                      { value: '7d', label: 'Last 7 days' },
                      { value: '30d', label: 'Last 30 days' },
                      { value: '90d', label: 'Last 90 days' },
                      { value: '1y', label: 'Last year' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setTimeRange(option.value as '7d' | '30d' | '90d' | '1y');
                          setShowTimeRangeDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm ${
                          timeRange === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                  style={{ fontSize: '16px' }}
                >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={exportData}
                  className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Uploads</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {stats.dailyUploads.reduce((sum, day) => sum + day.count, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0 ml-2">
                <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {stats.growthRates.uploads >= 0 ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1 flex-shrink-0" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 mr-1 flex-shrink-0" />
              )}
              <span className={`text-xs sm:text-sm ${stats.growthRates.uploads >= 0 ? 'text-green-600' : 'text-red-600'} truncate`}>
                {stats.growthRates.uploads >= 0 ? '+' : ''}{stats.growthRates.uploads.toFixed(1)}% from last period
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Success Rate</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {stats.conversionSuccessRate.rate}%
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0 ml-2">
                <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {stats.growthRates.successRate >= 0 ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1 flex-shrink-0" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 mr-1 flex-shrink-0" />
              )}
              <span className={`text-xs sm:text-sm ${stats.growthRates.successRate >= 0 ? 'text-green-600' : 'text-red-600'} truncate`}>
                {stats.growthRates.successRate >= 0 ? '+' : ''}{stats.growthRates.successRate.toFixed(1)}% from last period
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Storage Used</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalStorageUsed.formatted}</p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg flex-shrink-0 ml-2">
                <HardDrive className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex flex-col space-y-1 mt-2">
              <div className="flex items-center">
                {stats.growthRates.storage >= 0 ? (
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1 flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 mr-1 flex-shrink-0" />
                )}
                <span className={`text-xs sm:text-sm ${stats.growthRates.storage >= 0 ? 'text-green-600' : 'text-red-600'} truncate`}>
                  {stats.growthRates.storage >= 0 ? '+' : ''}{stats.growthRates.storage.toFixed(1)}% from last period
                </span>
              </div>
              <span className="text-xs sm:text-sm text-gray-600">({stats.totalStorageUsed.percentage}% of capacity)</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Failed Conversions</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {stats.conversionSuccessRate.failed.toLocaleString()}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg flex-shrink-0 ml-2">
                <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {stats.growthRates.failures <= 0 ? (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1 flex-shrink-0" />
              ) : (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 mr-1 flex-shrink-0" />
              )}
              <span className={`text-xs sm:text-sm ${stats.growthRates.failures <= 0 ? 'text-green-600' : 'text-red-600'} truncate`}>
                {stats.growthRates.failures >= 0 ? '+' : ''}{stats.growthRates.failures.toFixed(1)}% from last period
              </span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Daily Uploads Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Daily Uploads
              </h3>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {stats.dailyUploads.map((day) => {
                const maxCount = Math.max(...stats.dailyUploads.map(d => d.count));
                const percentage = (day.count / maxCount) * 100;
                
                return (
                  <div key={day.date} className="flex items-center">
                    <div className="w-12 sm:w-16 text-xs text-gray-600 flex-shrink-0">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex-1 mx-2 sm:mx-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-6 sm:w-8 text-xs text-gray-900 font-medium text-right flex-shrink-0">
                      {day.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* File Types Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <PieChart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                File Types Distribution
              </h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {fileTypeData.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className={`w-3 h-3 rounded-full ${item.color} mr-2 sm:mr-3 flex-shrink-0`}></div>
                    <span className="text-sm font-medium text-gray-900 truncate">{item.type}</span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    <span className="text-sm text-gray-600">{item.count.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">Most Popular</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">{stats.mostUploadedFileType.type}</p>
                <p className="text-sm text-gray-500">
                  {stats.mostUploadedFileType.count.toLocaleString()} files ({stats.mostUploadedFileType.percentage}%)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Monthly Upload Trends
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.monthlyUploads.map((month, index) => {
              const prevMonth = index > 0 ? stats.monthlyUploads[index - 1] : null;
              const growth = prevMonth ? ((month.count - prevMonth.count) / prevMonth.count) * 100 : 0;
              
              return (
                <div key={month.month} className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    {new Date(month.month + '-01').toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                    {month.count.toLocaleString()}
                  </p>
                  {prevMonth && (
                    <div className="flex items-center justify-center">
                      {growth >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(growth).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversion Success Rate Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Conversion Success Rate
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 relative">
                <svg className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90">
                  <circle
                    cx={window.innerWidth < 640 ? "40" : "48"}
                    cy={window.innerWidth < 640 ? "40" : "48"}
                    r={window.innerWidth < 640 ? "32" : "40"}
                    stroke="#E5E7EB"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx={window.innerWidth < 640 ? "40" : "48"}
                    cy={window.innerWidth < 640 ? "40" : "48"}
                    r={window.innerWidth < 640 ? "32" : "40"}
                    stroke="#10B981"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * (window.innerWidth < 640 ? 32 : 40)}`}
                    strokeDashoffset={`${2 * Math.PI * (window.innerWidth < 640 ? 32 : 40) * (1 - stats.conversionSuccessRate.rate / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg sm:text-xl font-bold text-gray-900">
                    {stats.conversionSuccessRate.rate}%
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Overall Success Rate</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                {stats.conversionSuccessRate.successful.toLocaleString()}
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Successful Conversions</p>
              <div className="mt-2 flex items-center justify-center">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600">Processing completed</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
                {stats.conversionSuccessRate.failed.toLocaleString()}
              </div>
              <p className="text-xs sm:text-sm text-gray-600">Failed Conversions</p>
              <div className="mt-2 flex items-center justify-center">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 mr-1" />
                <span className="text-xs text-red-600">Requires attention</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
