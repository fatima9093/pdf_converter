'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  FileText,
  FileSpreadsheet,
  Presentation,
  Image,
  File,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { FileRecord } from '@/types';

export default function FileManagement() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Converting' | 'Completed' | 'Failed'>('all');
  const [filterType, setFilterType] = useState<'all' | 'Word' | 'Excel' | 'PowerPoint' | 'PDF' | 'Image' | 'Other'>('all');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filesPerPage] = useState(10);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowStatusDropdown(false);
        setShowTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch real data from API
  useEffect(() => {
    const fetchFileRecords = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/conversions`, {
          credentials: 'include', // Use HTTP-only cookies instead of localStorage
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            // Transform the dates from strings to Date objects
            const transformedFiles = result.data.map((file: FileRecord) => ({
              ...file,
              uploadedAt: new Date(file.uploadedAt)
            }));
            setFiles(transformedFiles);
          } else {
            console.error('Failed to fetch file records:', result.error);
            // Fallback to empty array
            setFiles([]);
          }
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          console.error('Failed to fetch file records:', response.status, errorData);
          // Fallback to empty array
          setFiles([]);
        }
      } catch (error) {
        console.error('Error fetching file records:', error);
        // Fallback to empty array
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFileRecords();
  }, []);

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'Word':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'Excel':
        return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
      case 'PowerPoint':
        return <Presentation className="w-4 h-4 text-orange-600" />;
      case 'Image':
        return <Image className="w-4 h-4 text-purple-600" />;
      case 'PDF':
        return <FileText className="w-4 h-4 text-red-600" />;
      default:
        return <File className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'Failed':
        return <AlertCircle className="w-3 h-3 text-red-600" />;
      case 'Converting':
        return <Loader className="w-3 h-3 text-blue-600 animate-spin" />;
      case 'Pending':
        return <Clock className="w-3 h-3 text-yellow-600" />;
      default:
        return <Clock className="w-3 h-3 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.uploadedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.uploadedBy.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || file.status === filterStatus;
    const matchesType = filterType === 'all' || file.fileType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate pagination values
  const totalPages = Math.ceil(filteredFiles.length / filesPerPage);
  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterType]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedFiles([]); // Clear selection when changing pages
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleDownload = (file: FileRecord) => {
    if (file.downloadUrl) {
      // In a real app, this would download the file
      window.open(file.downloadUrl, '_blank');
    }
  };

  const handleDelete = (fileId: string) => {
    if (confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      setFiles(files.filter(file => file.id !== fileId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedFiles.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedFiles.length} files? This action cannot be undone.`)) {
      setFiles(files.filter(file => !selectedFiles.includes(file.id)));
      setSelectedFiles([]);
    }
  };

  const getTotalStorage = () => {
    const totalBytes = files.reduce((sum, file) => sum + file.fileSize, 0);
    return formatFileSize(totalBytes);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <React.Fragment>
      <style dangerouslySetInnerHTML={{
        __html: `
          .mobile-select {
            font-size: 16px !important;
          }
          
          @media (max-width: 640px) {
            .mobile-select {
              font-size: 16px !important;
              height: 48px;
            }
            
            .mobile-select option {
              padding: 12px 8px !important;
              font-size: 16px !important;
              line-height: 1.4 !important;
              background-color: white !important;
              color: black !important;
              min-height: 44px;
            }
            
            .mobile-select:focus {
              font-size: 16px !important;
            }
          }
          
          @media (max-width: 480px) {
            .mobile-select {
              font-size: 16px !important;
              padding: 12px 32px 12px 40px !important;
            }
          }
          
          .files-dropdown {
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
          
          .files-dropdown button {
            min-height: 44px !important;
            display: flex !important;
            align-items: center !important;
            width: 100% !important;
            text-align: left !important;
          }
          
          .files-dropdown-container {
            overflow: visible !important;
          }
          
          @media screen and (max-width: 640px) {
            .files-dropdown {
              max-height: 40vh !important;
              overflow-y: auto !important;
              -webkit-overflow-scrolling: touch !important;
              left: -0.5rem !important;
              right: -0.5rem !important;
              max-width: calc(100vw - 1rem) !important;
            }
            
            .files-dropdown button {
              padding: 12px 16px !important;
              font-size: 16px !important;
              min-height: 48px !important;
            }
          }
          
          @media screen and (max-width: 480px) {
            .files-dropdown {
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
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Conversion History</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Monitor all file conversions</p>
        </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center justify-center sm:justify-start text-sm text-gray-600">
                <HardDrive className="w-4 h-4 mr-2" />
                <span>Total Storage: {getTotalStorage()}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
                <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
            </div>
        </div>
      </div>

      {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="space-y-3">
        <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
          />
        </div>
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
          {/* Custom Filter Status Dropdown */}
          <div className="relative overflow-visible files-dropdown-container" ref={statusDropdownRef}>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <button
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowTypeDropdown(false);
              }}
              className="w-full pl-10 pr-10 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black cursor-pointer text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              style={{ fontSize: '16px' }}
            >
              <span className="truncate">
                {filterStatus === 'all' ? 'All Status' :
                 filterStatus === 'Pending' ? 'Pending' :
                 filterStatus === 'Converting' ? 'Converting' :
                 filterStatus === 'Completed' ? 'Completed' :
                 filterStatus === 'Failed' ? 'Failed' : 'All Status'}
              </span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${showStatusDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showStatusDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto files-dropdown">
                {[
                  { value: 'all', label: 'All Status' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Converting', label: 'Converting' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'Failed', label: 'Failed' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilterStatus(option.value as 'all' | 'Pending' | 'Converting' | 'Completed' | 'Failed');
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm ${
                      filterStatus === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                    style={{ fontSize: '16px' }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Filter Type Dropdown */}
          <div className="relative overflow-visible files-dropdown-container" ref={typeDropdownRef}>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <button
              onClick={() => {
                setShowTypeDropdown(!showTypeDropdown);
                setShowStatusDropdown(false);
              }}
              className="w-full pl-10 pr-10 py-3 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black cursor-pointer text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              style={{ fontSize: '16px' }}
            >
              <span className="truncate">
                {filterType === 'all' ? 'All Types' :
                 filterType === 'Word' ? 'Word' :
                 filterType === 'Excel' ? 'Excel' :
                 filterType === 'PowerPoint' ? 'PowerPoint' :
                 filterType === 'PDF' ? 'PDF' :
                 filterType === 'Image' ? 'Image' :
                 filterType === 'Other' ? 'Other' : 'All Types'}
              </span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${showTypeDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showTypeDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto files-dropdown">
                {[
                  { value: 'all', label: 'All Types' },
                  { value: 'Word', label: 'Word' },
                  { value: 'Excel', label: 'Excel' },
                  { value: 'PowerPoint', label: 'PowerPoint' },
                  { value: 'PDF', label: 'PDF' },
                  { value: 'Image', label: 'Image' },
                  { value: 'Other', label: 'Other' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilterType(option.value as 'all' | 'Word' | 'Excel' | 'PowerPoint' | 'PDF' | 'Image' | 'Other');
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
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedFiles.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm font-medium text-red-900 text-center sm:text-left">
              {selectedFiles.length} file(s) selected
            </div>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors w-full sm:w-auto"
              >
                Delete Selected
              </button>
          </div>
        </div>
      )}

      {/* Files Table - Desktop View */}
      <div className="hidden sm:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedFiles.length === currentFiles.length && currentFiles.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles(currentFiles.map(file => file.id));
                      } else {
                        setSelectedFiles([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Converted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles([...selectedFiles, file.id]);
                        } else {
                          setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {getFileIcon(file.fileType)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{file.filename}</div>
                        <div className="text-sm text-gray-500">
                          {file.fileType} ({file.originalExtension})
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{file.uploadedBy.name}</div>
                        <div className="text-sm text-gray-500">{file.uploadedBy.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <div>{file.uploadedAt.toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {file.uploadedAt.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatFileSize(file.fileSize)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getStatusIcon(file.status)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        file.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        file.status === 'Failed' ? 'bg-red-100 text-red-800' :
                        file.status === 'Converting' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {file.status}
                      </span>
                    </div>
                    {file.errorMessage && (
                      <div className="text-xs text-red-600 mt-1" title={file.errorMessage}>
                        {file.errorMessage.length > 30 
                          ? `${file.errorMessage.substring(0, 30)}...` 
                          : file.errorMessage
                        }
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {file.status === 'Completed' && file.downloadUrl && (
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          title="Download File"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Delete File"
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

        {currentFiles.length === 0 && filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No conversions found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
        <div className="sm:hidden space-y-3">
        {currentFiles.map((file) => (
            <div key={file.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {/* Header with checkbox, file icon, name, and actions */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFiles([...selectedFiles, file.id]);
                    } else {
                      setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                    }
                  }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0 mt-1"
                />
                  <div className="flex-shrink-0 mt-1">
                  {getFileIcon(file.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 leading-tight mb-1">{file.filename}</div>
                  <div className="text-xs text-gray-500">
                    {file.fileType} ({file.originalExtension})
                  </div>
                </div>
              </div>
                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                {file.status === 'Completed' && file.downloadUrl && (
                  <button
                    onClick={() => handleDownload(file)}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Download File"
                  >
                      <Download className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(file.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete File"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* File details - stacked vertically for mobile */}
              <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Status:</span>
                <div className="flex items-center">
                  {getStatusIcon(file.status)}
                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    file.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    file.status === 'Failed' ? 'bg-red-100 text-red-800' :
                    file.status === 'Converting' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {file.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Size:</span>
                  <span className="font-medium text-gray-900">{formatFileSize(file.fileSize)}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-gray-500 font-medium">Uploaded by:</span>
                  <div className="text-right max-w-[60%]">
                    <div className="font-medium text-gray-900 text-sm truncate">{file.uploadedBy.name}</div>
                    <div className="text-gray-500 text-xs truncate">{file.uploadedBy.email}</div>
              </div>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-gray-500 font-medium">Date:</span>
                <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{file.uploadedAt.toLocaleDateString()}</div>
                  <div className="text-gray-500 text-xs">{file.uploadedAt.toLocaleTimeString()}</div>
                  </div>
              </div>
              {file.errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
                    <div className="text-xs text-red-700" title={file.errorMessage}>
                      <span className="font-medium">Error: </span>
                      {file.errorMessage.length > 50 
                        ? `${file.errorMessage.substring(0, 50)}...` 
                    : file.errorMessage
                  }
                    </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {currentFiles.length === 0 && filteredFiles.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm px-4">No conversions found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="space-y-4">
              <div className="text-sm text-gray-700 text-center">
            Showing <span className="font-medium">{indexOfFirstFile + 1}</span> to{' '}
            <span className="font-medium">{Math.min(indexOfLastFile, filteredFiles.length)}</span> of{' '}
            <span className="font-medium">{filteredFiles.length}</span> results
          </div>
              <div className="flex items-center justify-center">
            <div className="flex items-center space-x-1">
              <button 
                onClick={handlePrevious}
                disabled={currentPage === 1}
                    className={`px-3 py-2 text-sm font-medium border rounded-lg transition-colors ${
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (totalPages <= 3) {
                        // Show all pages if 3 or fewer on mobile
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm font-medium border rounded-lg transition-colors ${
                          page === currentPage
                            ? 'text-white bg-blue-600 border-blue-600'
                            : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else {
                        // Show first, last, current for mobile
                    const showPage = 
                      page === 1 || 
                      page === totalPages || 
                          page === currentPage;
                    
                    if (showPage) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 text-sm font-medium border rounded-lg transition-colors ${
                            page === currentPage
                              ? 'text-white bg-blue-600 border-blue-600'
                              : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                        } else if ((page === 2 && currentPage > 3) || (page === totalPages - 1 && currentPage < totalPages - 2)) {
                      return (
                            <span key={page} className="px-2 py-2 text-sm text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                })}
              </div>
              
              <button 
                onClick={handleNext}
                disabled={currentPage === totalPages}
                    className={`px-3 py-2 text-sm font-medium border rounded-lg transition-colors ${
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
      )}

      {/* Summary Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-3 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Conversions</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{files.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-3 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Completed</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {files.filter(f => f.status === 'Completed').length}
              </p>
            </div>
          </div>
        </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
              <Loader className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-3 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Processing</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {files.filter(f => f.status === 'Converting' || f.status === 'Pending').length}
              </p>
            </div>
          </div>
        </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-3 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Failed</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {files.filter(f => f.status === 'Failed').length}
              </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </React.Fragment>
  );
}
