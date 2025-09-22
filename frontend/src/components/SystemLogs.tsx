'use client';

import React, { useState, useEffect } from 'react';
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

      const response = await fetch(`/api/admin/logs?${params.toString()}`);
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
      setError('Network error. Please check your connection and try again.');
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
        const response = await fetch('/api/admin/logs', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ logIds })
        });

        const result = await response.json();

        if (result.success) {
          // Refresh the logs list
          await fetchLogs();
          setSelectedLogs([]);
        } else {
          console.error('Failed to delete logs:', result.error);
          alert('Failed to delete logs. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting logs:', error);
        alert('Failed to delete logs. Please try again.');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Logs</h2>
          <p className="text-gray-600">Monitor system events, errors, and security alerts</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportLogs}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={fetchLogs}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={async () => {
              // Create some test logs for debugging
              try {
                const response = await fetch('/api/admin/logs/test', { method: 'POST' });
                const result = await response.json();
                console.log('Test logs created:', result);
                await fetchLogs();
              } catch (error) {
                console.error('Failed to create test logs:', error);
              }
            }}
            className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200"
          >
            Create Test Logs
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
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs by message, details, or user..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
          />
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value as typeof filterType)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white text-black"
            >
              <option value="all">All Types</option>
              <option value="conversion_error">Conversion Errors</option>
              <option value="login_failure">Login Failures</option>
              <option value="system_error">System Errors</option>
              <option value="security_alert">Security Alerts</option>
              <option value="user_action">User Actions</option>
              <option value="api_error">API Errors</option>
            </select>
          </div>
          <div className="relative">
            <select
              value={filterSeverity}
              onChange={(e) => handleSeverityChange(e.target.value as typeof filterSeverity)}
              className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white text-black"
            >
              <option value="all" className="text-black">All Severities</option>
              <option value="critical" className="text-black">Critical</option>
              <option value="high" className="text-black">High</option>
              <option value="medium" className="text-black">Medium</option>
              <option value="low" className="text-black">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedLogs.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-900">
              {selectedLogs.length} log(s) selected
            </span>
            <button
              onClick={() => handleDeleteLogs(selectedLogs)}
              className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                    className="rounded border-gray-300 text-primary focus:ring-primary"
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
                      className="rounded border-gray-300 text-primary focus:ring-primary"
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
                        className="p-1 text-gray-400 hover:text-primary rounded"
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
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * logsPerPage) + 1} to {Math.min(currentPage * logsPerPage, totalLogs)} of {totalLogs} logs
          <div className="text-xs text-gray-500 mt-1">
            Debug: Page {currentPage} of {totalPages} | Logs per page: {logsPerPage}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {/* Page numbers */}
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
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === pageNum
                      ? 'text-white bg-primary border border-transparent'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
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
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
