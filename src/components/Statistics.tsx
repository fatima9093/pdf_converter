'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  FileText,
  Users,
  Calendar,
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

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockStats: DashboardStatistics = {
      dailyUploads: [
        { date: '2024-01-15', count: 45 },
        { date: '2024-01-16', count: 52 },
        { date: '2024-01-17', count: 38 },
        { date: '2024-01-18', count: 67 },
        { date: '2024-01-19', count: 43 },
        { date: '2024-01-20', count: 58 },
        { date: '2024-01-21', count: 72 }
      ],
      monthlyUploads: [
        { month: '2023-10', count: 1245 },
        { month: '2023-11', count: 1389 },
        { month: '2023-12', count: 1156 },
        { month: '2024-01', count: 1567 }
      ],
      mostUploadedFileType: {
        type: 'Word Documents',
        count: 2847,
        percentage: 42.3
      },
      conversionSuccessRate: {
        successful: 6234,
        failed: 289,
        rate: 95.6
      },
      totalStorageUsed: {
        bytes: 54760833024, // ~51GB
        formatted: '51.0 GB',
        percentage: 68.2
      }
    };

    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const fileTypeData = [
    { type: 'Word', count: 2847, color: 'bg-blue-500', percentage: 42.3 },
    { type: 'Excel', count: 1923, color: 'bg-green-500', percentage: 28.6 },
    { type: 'PowerPoint', count: 1245, color: 'bg-orange-500', percentage: 18.5 },
    { type: 'Images', count: 567, color: 'bg-purple-500', percentage: 8.4 },
    { type: 'Other', count: 148, color: 'bg-gray-500', percentage: 2.2 }
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statistics</h2>
          <p className="text-gray-600">Analytics and insights about your platform</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+12.5% from last period</span>
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
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+2.1% from last period</span>
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
            <span className="text-sm text-gray-600">{stats.totalStorageUsed.percentage}% of capacity</span>
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
            <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">-5.2% from last period</span>
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
            {stats.dailyUploads.map((day, index) => {
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
