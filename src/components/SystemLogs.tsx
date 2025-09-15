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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'conversion_error' | 'login_failure' | 'system_error' | 'security_alert'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [showLogDetails, setShowLogDetails] = useState<string | null>(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockLogs: SystemLog[] = [
      {
        id: '1',
        type: 'conversion_error',
        message: 'Failed to convert PowerPoint file: Unsupported font type',
        details: 'File: presentation.pptx, User: john.smith@example.com, Error: Font "Calibri Light" not found in system fonts',
        userId: '1',
        userEmail: 'john.smith@example.com',
        timestamp: new Date('2024-01-21T14:30:00'),
        severity: 'medium'
      },
      {
        id: '2',
        type: 'login_failure',
        message: 'Multiple failed login attempts detected',
        details: 'IP: 192.168.1.100, User: admin@example.com, Attempts: 5 in last 5 minutes',
        userEmail: 'admin@example.com',
        timestamp: new Date('2024-01-21T13:45:00'),
        severity: 'high'
      },
      {
        id: '3',
        type: 'system_error',
        message: 'File storage service temporarily unavailable',
        details: 'AWS S3 connection timeout, automatic retry in progress',
        timestamp: new Date('2024-01-21T12:15:00'),
        severity: 'critical'
      },
      {
        id: '4',
        type: 'conversion_error',
        message: 'Excel file conversion timeout',
        details: 'File: large-dataset.xlsx (15MB), Processing time exceeded 5 minutes',
        userId: '2',
        userEmail: 'sarah.johnson@example.com',
        timestamp: new Date('2024-01-21T11:20:00'),
        severity: 'medium'
      },
      {
        id: '5',
        type: 'security_alert',
        message: 'Suspicious file upload detected',
        details: 'File: suspicious.exe disguised as .docx, automatically quarantined',
        userId: '3',
        userEmail: 'mike.wilson@example.com',
        timestamp: new Date('2024-01-21T10:30:00'),
        severity: 'critical'
      },
      {
        id: '6',
        type: 'conversion_error',
        message: 'Word document contains corrupted data',
        details: 'File: report.docx, Error: Invalid XML structure in document.xml',
        userId: '4',
        userEmail: 'emily.davis@example.com',
        timestamp: new Date('2024-01-21T09:45:00'),
        severity: 'low'
      },
      {
        id: '7',
        type: 'login_failure',
        message: 'Account lockout triggered',
        details: 'User: test@example.com locked after 10 failed attempts, IP: 203.0.113.1',
        userEmail: 'test@example.com',
        timestamp: new Date('2024-01-21T08:15:00'),
        severity: 'medium'
      },
      {
        id: '8',
        type: 'system_error',
        message: 'Database connection pool exhausted',
        details: 'Max connections (100) reached, new requests queued',
        timestamp: new Date('2024-01-21T07:30:00'),
        severity: 'high'
      }
    ];

    setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, []);

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
      security_alert: 'Security Alert'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    
    return matchesSearch && matchesType && matchesSeverity;
  });

  const handleDeleteLogs = (logIds: string[]) => {
    if (confirm(`Are you sure you want to delete ${logIds.length} log entries? This action cannot be undone.`)) {
      setLogs(logs.filter(log => !logIds.includes(log.id)));
      setSelectedLogs([]);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
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
            onClick={() => window.location.reload()}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
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
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs by message, details, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Types</option>
              <option value="conversion_error">Conversion Errors</option>
              <option value="login_failure">Login Failures</option>
              <option value="system_error">System Errors</option>
              <option value="security_alert">Security Alerts</option>
            </select>
          </div>
          <div className="relative">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
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
          Showing {filteredLogs.length} of {logs.length} logs
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-hover">
            1
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
