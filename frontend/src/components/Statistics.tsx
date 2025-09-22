'use client';

import React, { useState, useEffect } from 'react';
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
  const fileTypeData = stats ? [
    { type: stats.mostUploadedFileType.type, count: stats.mostUploadedFileType.count, color: 'bg-blue-500', percentage: stats.mostUploadedFileType.percentage },
    { type: 'Other Types', count: Math.max(0, stats.dailyUploads.reduce((sum, day) => sum + day.count, 0) - stats.mostUploadedFileType.count), color: 'bg-gray-500', percentage: Math.max(0, 100 - stats.mostUploadedFileType.percentage) }
  ] : [];

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statistics</h2>
          <p className="text-gray-600">Analytics and insights about your platform</p>
          {isUnauthenticated && (
            <p className="text-sm text-amber-600 mt-1">
              Please log in to view detailed statistics
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={exportData}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Uploads</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.dailyUploads.reduce((sum, day) => sum + day.count, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {stats.growthRates.uploads >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${stats.growthRates.uploads >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.growthRates.uploads >= 0 ? '+' : ''}{stats.growthRates.uploads.toFixed(1)}% from last period
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.conversionSuccessRate.rate}%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {stats.growthRates.successRate >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${stats.growthRates.successRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.growthRates.successRate >= 0 ? '+' : ''}{stats.growthRates.successRate.toFixed(1)}% from last period
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Storage Used</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStorageUsed.formatted}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <HardDrive className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {stats.growthRates.storage >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${stats.growthRates.storage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.growthRates.storage >= 0 ? '+' : ''}{stats.growthRates.storage.toFixed(1)}% from last period
            </span>
            <span className="text-sm text-gray-600 ml-2">({stats.totalStorageUsed.percentage}% of capacity)</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Conversions</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.conversionSuccessRate.failed.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {stats.growthRates.failures <= 0 ? (
              <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${stats.growthRates.failures <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.growthRates.failures >= 0 ? '+' : ''}{stats.growthRates.failures.toFixed(1)}% from last period
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Uploads Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Daily Uploads
            </h3>
          </div>
          <div className="space-y-3">
            {stats.dailyUploads.map((day) => {
              const maxCount = Math.max(...stats.dailyUploads.map(d => d.count));
              const percentage = (day.count / maxCount) * 100;
              
              return (
                <div key={day.date} className="flex items-center">
                  <div className="w-16 text-xs text-gray-600">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-8 text-xs text-gray-900 font-medium text-right">
                    {day.count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* File Types Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              File Types Distribution
            </h3>
          </div>
          <div className="space-y-4">
            {fileTypeData.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                  <span className="text-sm font-medium text-gray-900">{item.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{item.count.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">Most Popular</p>
              <p className="text-lg font-semibold text-gray-900">{stats.mostUploadedFileType.type}</p>
              <p className="text-sm text-gray-500">
                {stats.mostUploadedFileType.count.toLocaleString()} files ({stats.mostUploadedFileType.percentage}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Monthly Upload Trends
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.monthlyUploads.map((month, index) => {
            const prevMonth = index > 0 ? stats.monthlyUploads[index - 1] : null;
            const growth = prevMonth ? ((month.count - prevMonth.count) / prevMonth.count) * 100 : 0;
            
            return (
              <div key={month.month} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">
                  {new Date(month.month + '-01').toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Conversion Success Rate
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 relative">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#10B981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.conversionSuccessRate.rate / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">
                  {stats.conversionSuccessRate.rate}%
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">Overall Success Rate</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.conversionSuccessRate.successful.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Successful Conversions</p>
            <div className="mt-2 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600">Processing completed</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {stats.conversionSuccessRate.failed.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Failed Conversions</p>
            <div className="mt-2 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-xs text-red-600">Requires attention</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
