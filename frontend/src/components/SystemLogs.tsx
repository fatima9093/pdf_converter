'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  AlertCircle, 
  AlertTriangle,
  Info,
  XCircle,
  Clock,
  User,
  FileText,
  Shield,
  RefreshCw,
  Download,
  Eye,
  Trash2
} from 'lucide-react';
import { SystemLog } from '@/types';

export default function SystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'conversion_error' | 'login_failure' | 'system_error' | 'security_alert' | 'user_action' | 'api_error'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [showLogDetails, setShowLogDetails] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const logsPerPage = 10;
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const severityDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
      if (severityDropdownRef.current && !severityDropdownRef.current.contains(event.target as Node)) {
        setShowSeverityDropdown(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowTypeDropdown(false);
        setShowSeverityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch system logs from API
  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      
      if (filterType !== 'all') {
        params.append('type', filterType);
      }
      if (filterSeverity !== 'all') {
        params.append('severity', filterSeverity);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      params.append('limit', logsPerPage.toString());
      params.append('offset', ((currentPage - 1) * logsPerPage).toString());

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/admin/logs?${params.toString()}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include', // Include HTTP-only cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('API Request URL:', apiUrl);
      console.log('Response Status:', response.status);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required. Please log in as an administrator.');
          setLogs([]);
          return;
        }
        if (response.status === 403) {
          setError('Access denied. Administrator privileges required.');
          setLogs([]);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      console.log('API Response:', result);
      console.log('Current Page:', currentPage);
      console.log('Total Pages:', totalPages);
      console.log('Total Logs:', totalLogs);

      if (result.success) {
        // Transform the data to match our interface
        const transformedLogs = result.data.logs.map((log: SystemLog & { timestamp: string }) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
        setLogs(transformedLogs);
        
        // Update pagination info
        setTotalLogs(result.data.total || transformedLogs.length);
        setTotalPages(Math.ceil((result.data.total || transformedLogs.length) / logsPerPage));
      } else {
        console.error('Failed to fetch logs:', result.error);
        setError(result.error || 'Failed to fetch logs');
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      if (error instanceof Error) {
        setError(`Network error: ${error.message}`);
      } else {
        setError('Network error. Please check your connection and try again.');
      }
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterType, filterSeverity, searchTerm, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const getLogIcon = (type: string, severity: string) => {
    const iconClass = severity === 'critical' ? 'text-red-600' :
                     severity === 'high' ? 'text-orange-600' :
                     severity === 'medium' ? 'text-yellow-600' :
                     'text-primary';

    switch (type) {
      case 'conversion_error':
        return <FileText className={`w-5 h-5 ${iconClass}`} />;
      case 'login_failure':
        return <User className={`w-5 h-5 ${iconClass}`} />;
      case 'system_error':
        return <XCircle className={`w-5 h-5 ${iconClass}`} />;
      case 'security_alert':
        return <Shield className={`w-5 h-5 ${iconClass}`} />;
      case 'user_action':
        return <User className={`w-5 h-5 ${iconClass}`} />;
      case 'api_error':
        return <AlertCircle className={`w-5 h-5 ${iconClass}`} />;
      default:
        return <Info className={`w-5 h-5 ${iconClass}`} />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const classes = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-primary/10 text-primary border-primary/20'
    };

    const icons = {
      critical: <XCircle className="w-3 h-3 mr-1" />,
      high: <AlertTriangle className="w-3 h-3 mr-1" />,
      medium: <AlertCircle className="w-3 h-3 mr-1" />,
      low: <Info className="w-3 h-3 mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes[severity as keyof typeof classes]}`}>
        {icons[severity as keyof typeof icons]}
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      conversion_error: 'Conversion Error',
      login_failure: 'Login Failure',
      system_error: 'System Error',
      security_alert: 'Security Alert',
      user_action: 'User Action',
      api_error: 'API Error'
    };
    return labels[type as keyof typeof labels] || type;
  };

  // Since we're now doing server-side filtering and pagination, we don't need client-side filtering
  const filteredLogs = logs;

  const handleDeleteLogs = async (logIds: string[]) => {
    if (confirm(`Are you sure you want to delete ${logIds.length} log entries? This action cannot be undone.`)) {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/admin/logs`;
        
        const response = await fetch(apiUrl, {
          method: 'DELETE',
          credentials: 'include', // Include HTTP-only cookies for authentication
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ logIds })
        });

        if (!response.ok) {
          if (response.status === 401) {
            alert('Authentication required. Please log in as an administrator.');
            return;
          }
          if (response.status === 403) {
            alert('Access denied. Administrator privileges required.');
            return;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success) {
          // Refresh the logs list
          await fetchLogs();
          setSelectedLogs([]);
        } else {
          console.error('Failed to delete logs:', result.error);
          alert(`Failed to delete logs: ${result.error}`);
        }
      } catch (error) {
        console.error('Error deleting logs:', error);
        if (error instanceof Error) {
          alert(`Failed to delete logs: ${error.message}`);
        } else {
          alert('Failed to delete logs. Please try again.');
        }
      }
    }
  };

  const exportLogs = () => {
    const csvContent = [
      'Timestamp,Type,Severity,Message,User Email,Details',
      ...filteredLogs.map(log => 
        `"${log.timestamp.toISOString()}","${log.type}","${log.severity}","${log.message}","${log.userEmail || ''}","${log.details?.replace(/"/g, '""') || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'system_logs_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityStats = () => {
    const stats = logs.reduce((acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return stats;
  };

  const severityStats = getSeverityStats();

  // Pagination handlers
  const handlePageChange = (page: number) => {
    console.log('Changing to page:', page);
    setCurrentPage(page);
    setSelectedLogs([]); // Clear selections when changing pages
  };

  const handlePreviousPage = () => {
    console.log('Previous clicked. Current page:', currentPage, 'Total pages:', totalPages);
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    console.log('Next clicked. Current page:', currentPage, 'Total pages:', totalPages);
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Reset to first page when filters change
  const handleFilterChange = (newFilterType: typeof filterType) => {
    setFilterType(newFilterType);
    setCurrentPage(1);
  };

  const handleSeverityChange = (newFilterSeverity: typeof filterSeverity) => {
    setFilterSeverity(newFilterSeverity);
    setCurrentPage(1);
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System Logs</h2>
            <p className="text-gray-600">Monitor system events, errors, and security alerts</p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-900">Error Loading Logs</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchLogs}
                className="mt-3 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .mobile-select-system {
            font-size: 16px !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            appearance: none !important;
          }
          
          @media screen and (max-width: 640px) {
            .mobile-select-system {
              font-size: 16px !important;
              height: 44px !important;
              line-height: 1.2 !important;
              padding: 8px 32px 8px 12px !important;
            }
            
            .mobile-select-system option {
              padding: 6px 8px !important;
              font-size: 16px !important;
              line-height: 1.2 !important;
              background-color: white !important;
              color: black !important;
              height: 32px !important;
              min-height: 32px !important;
              max-height: 32px !important;
              border: none !important;
              margin: 0 !important;
              display: block !important;
            }
            
            .mobile-select-system:focus {
              font-size: 16px !important;
              outline: none !important;
            }
            
            /* Force smaller dropdown on mobile */
            .mobile-select-system[size] {
              height: auto !important;
              max-height: 200px !important;
              overflow-y: auto !important;
            }
            
            /* iOS Safari specific overrides */
            @supports (-webkit-touch-callout: none) {
              .mobile-select-system {
                -webkit-appearance: none !important;
                background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") !important;
                background-position: right 8px center !important;
                background-repeat: no-repeat !important;
                background-size: 16px 16px !important;
              }
              
              .mobile-select-system option {
                font-size: 16px !important;
                padding: 8px !important;
                line-height: 1.2 !important;
                height: 32px !important;
                -webkit-appearance: none !important;
              }
            }
          }
          
          /* Additional mobile-specific overrides */
          @media screen and (max-width: 480px) {
            .mobile-select-system {
              font-size: 16px !important;
              padding: 8px 28px 8px 40px !important;
              height: 44px !important;
            }
            
            .mobile-select-system option {
              font-size: 16px !important;
              padding: 6px 8px !important;
              height: 30px !important;
              min-height: 30px !important;
            }
          }
          
          .mobile-dropdown {
            max-width: calc(100vw - 2rem) !important;
            left: 0 !important;
            right: 0 !important;
            position: absolute !important;
            animation: slideDown 0.15s ease-out;
            border-radius: 0.5rem !important;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
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
          
          .mobile-dropdown button {
            min-height: 44px !important;
            display: flex !important;
            align-items: center !important;
            width: 100% !important;
            text-align: left !important;
          }
          
          @media screen and (max-width: 640px) {
            .mobile-dropdown {
              max-height: 40vh !important;
              overflow-y: auto !important;
              -webkit-overflow-scrolling: touch !important;
            }
            
            .mobile-dropdown button {
              padding: 12px 16px !important;
              font-size: 16px !important;
            }
          }
        `
      }} />
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">System Logs</h2>
          <p className="text-sm sm:text-base text-gray-600">Monitor system events, errors, and security alerts</p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={exportLogs}
            className="flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Export
          </button>
          <button
            onClick={fetchLogs}
            className="flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Severity Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Critical</p>
              <p className="text-2xl font-bold text-gray-900">{severityStats.critical || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">High</p>
              <p className="text-2xl font-bold text-gray-900">{severityStats.high || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Medium</p>
              <p className="text-2xl font-bold text-gray-900">{severityStats.medium || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Info className="w-8 h-8 text-primary" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Low</p>
              <p className="text-2xl font-bold text-gray-900">{severityStats.low || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
            style={{ fontSize: '16px' }}
          />
        </div>
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
          {/* Custom Filter Type Dropdown */}
          <div className="relative" ref={typeDropdownRef}>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <button
              onClick={() => {
                setShowTypeDropdown(!showTypeDropdown);
                setShowSeverityDropdown(false);
              }}
              className="w-full pl-10 pr-10 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black cursor-pointer text-left flex items-center justify-between"
              style={{ fontSize: '16px' }}
            >
              <span className="truncate">
                {filterType === 'all' ? 'All Types' :
                 filterType === 'conversion_error' ? 'Conversion Errors' :
                 filterType === 'login_failure' ? 'Login Failures' :
                 filterType === 'system_error' ? 'System Errors' :
                 filterType === 'security_alert' ? 'Security Alerts' :
                 filterType === 'user_action' ? 'User Actions' :
                 filterType === 'api_error' ? 'API Errors' : 'All Types'}
              </span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${showTypeDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showTypeDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto mobile-dropdown">
                {[
                  { value: 'all', label: 'All Types' },
                  { value: 'conversion_error', label: 'Conversion Errors' },
                  { value: 'login_failure', label: 'Login Failures' },
                  { value: 'system_error', label: 'System Errors' },
                  { value: 'security_alert', label: 'Security Alerts' },
                  { value: 'user_action', label: 'User Actions' },
                  { value: 'api_error', label: 'API Errors' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleFilterChange(option.value as typeof filterType);
                      setShowTypeDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm ${
                      filterType === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                    style={{ fontSize: '16px' }}
                  >
                    {option.label}
                  </button>
                ))}
          </div>
            )}
          </div>

          {/* Custom Filter Severity Dropdown */}
          <div className="relative" ref={severityDropdownRef}>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <button
              onClick={() => {
                setShowSeverityDropdown(!showSeverityDropdown);
                setShowTypeDropdown(false);
              }}
              className="w-full pl-10 pr-10 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black cursor-pointer text-left flex items-center justify-between"
              style={{ fontSize: '16px' }}
            >
              <span className="truncate">
                {filterSeverity === 'all' ? 'All Severities' :
                 filterSeverity === 'critical' ? 'Critical' :
                 filterSeverity === 'high' ? 'High' :
                 filterSeverity === 'medium' ? 'Medium' :
                 filterSeverity === 'low' ? 'Low' : 'All Severities'}
              </span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${showSeverityDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showSeverityDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto mobile-dropdown">
                {[
                  { value: 'all', label: 'All Severities' },
                  { value: 'critical', label: 'Critical' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleSeverityChange(option.value as typeof filterSeverity);
                      setShowSeverityDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm ${
                      filterSeverity === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                    style={{ fontSize: '16px' }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedLogs.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="space-y-3">
            <div className="text-sm font-medium text-red-900 text-center sm:text-left">
              {selectedLogs.length} log(s) selected
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => handleDeleteLogs(selectedLogs)}
                className="px-3 py-2 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Table - Desktop View */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedLogs.length === filteredLogs.length && filteredLogs.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLogs(filteredLogs.map(log => log.id));
                      } else {
                        setSelectedLogs([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedLogs.includes(log.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLogs([...selectedLogs, log.id]);
                        } else {
                          setSelectedLogs(selectedLogs.filter(id => id !== log.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getLogIcon(log.type, log.severity)}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {getTypeLabel(log.type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{log.message}</div>
                    {log.details && (
                      <div className="text-xs text-gray-500 mt-1 truncate max-w-md">
                        {log.details.length > 60 
                          ? `${log.details.substring(0, 60)}...` 
                          : log.details
                        }
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {log.userEmail ? (
                      <div className="text-sm text-gray-900">{log.userEmail}</div>
                    ) : (
                      <span className="text-sm text-gray-500">System</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <div>{log.timestamp.toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {log.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getSeverityBadge(log.severity)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setShowLogDetails(log.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLogs([log.id])}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Delete Log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No logs found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredLogs.map((log) => (
          <div key={log.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            {/* Header with checkbox, log icon, type, and actions */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedLogs.includes(log.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedLogs([...selectedLogs, log.id]);
                    } else {
                      setSelectedLogs(selectedLogs.filter(id => id !== log.id));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-shrink-0">
                  {getLogIcon(log.type, log.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{getTypeLabel(log.type)}</div>
                  <div className="text-xs text-gray-500">{log.message}</div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setShowLogDetails(log.id)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteLogs([log.id])}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                  title="Delete Log"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Log details - stacked vertically for mobile */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Severity:</span>
                {getSeverityBadge(log.severity)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">User:</span>
                <span className="font-medium">{log.userEmail || 'System'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Time:</span>
                <div className="text-right">
                  <div>{log.timestamp.toLocaleDateString()}</div>
                  <div className="text-gray-500">{log.timestamp.toLocaleTimeString()}</div>
                </div>
              </div>
              {log.details && (
                <div className="text-xs text-gray-600" title={log.details}>
                  {log.details.length > 50 
                    ? `${log.details.substring(0, 50)}...` 
                    : log.details
                  }
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">No logs found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {showLogDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowLogDetails(null)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {(() => {
                const log = logs.find(l => l.id === showLogDetails);
                if (!log) return null;
                
                return (
                  <div>
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 sm:mx-0 sm:h-10 sm:w-10">
                          {getLogIcon(log.type, log.severity)}
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            {getTypeLabel(log.type)}
                          </h3>
                          <div className="mt-2 space-y-3">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Message:</p>
                              <p className="text-sm text-gray-900">{log.message}</p>
                            </div>
                            
                            {log.details && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">Details:</p>
                                <p className="text-sm text-gray-900 whitespace-pre-wrap">{log.details}</p>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-700">Severity:</p>
                                {getSeverityBadge(log.severity)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Timestamp:</p>
                                <p className="text-sm text-gray-900">
                                  {log.timestamp.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            {log.userEmail && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">User:</p>
                                <p className="text-sm text-gray-900">{log.userEmail}</p>
                              </div>
                            )}

                            {log.ipAddress && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">IP Address:</p>
                                <p className="text-sm text-gray-900 font-mono">{log.ipAddress}</p>
                              </div>
                            )}

                            {log.userAgent && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">User Agent:</p>
                                <p className="text-sm text-gray-900 break-all">{log.userAgent}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                      <button
                        onClick={() => setShowLogDetails(null)}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="space-y-3">
        <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
          Showing {((currentPage - 1) * logsPerPage) + 1} to {Math.min(currentPage * logsPerPage, totalLogs)} of {totalLogs} logs
          <div className="text-xs text-gray-500 mt-1">
            Debug: Page {currentPage} of {totalPages} | Logs per page: {logsPerPage}
          </div>
        </div>
        <div className="flex items-center justify-center sm:justify-end">
          <div className="flex items-center space-x-1">
            <button 
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium border rounded-md ${
                currentPage === 1
                  ? 'text-gray-300 bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>
            
            {/* Page numbers - simplified for mobile */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium border rounded-md ${
                      currentPage === pageNum
                        ? 'text-white bg-blue-600 border-blue-600'
                        : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium border rounded-md ${
                currentPage === totalPages
                  ? 'text-gray-300 bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
