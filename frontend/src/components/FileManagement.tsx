'use client';

import React, { useState, useEffect } from 'react';
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
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'Excel':
        return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      case 'PowerPoint':
        return <Presentation className="w-5 h-5 text-orange-600" />;
      case 'Image':
        return <Image className="w-5 h-5 text-purple-600" />;
      case 'PDF':
        return <FileText className="w-5 h-5 text-red-600" />;
      default:
        return <File className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'Converting':
        return <Loader className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Conversion History</h2>
          <p className="text-gray-600">Monitor all file conversions (authenticated and anonymous users)</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center text-sm text-gray-600">
            <HardDrive className="w-4 h-4 mr-1" />
            Total Storage: {getTotalStorage()}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversions by filename or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
          />
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'Pending' | 'Converting' | 'Completed' | 'Failed')}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-black"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Converting">Converting</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'Word' | 'Excel' | 'PowerPoint' | 'PDF' | 'Image' | 'Other')}
              className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-black"
            >
              <option value="all">All Types</option>
              <option value="Word">Word</option>
              <option value="Excel">Excel</option>
              <option value="PowerPoint">PowerPoint</option>
              <option value="PDF">PDF</option>
              <option value="Image">Image</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedFiles.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-900">
              {selectedFiles.length} file(s) selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Files Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                currentPage === 1
                  ? 'text-gray-300 bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? 'text-gray-300 bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstFile + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastFile, filteredFiles.length)}</span> of{' '}
                <span className="font-medium">{filteredFiles.length}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`px-3 py-2 text-sm font-medium border rounded-md ${
                  currentPage === 1
                    ? 'text-gray-300 bg-gray-100 border-gray-200 cursor-not-allowed'
                    : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (totalPages <= 7) {
                    // Show all pages if 7 or fewer
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium border rounded-md ${
                          page === currentPage
                            ? 'text-white bg-blue-600 border-blue-600'
                            : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else {
                    // Show first, last, current, and nearby pages with ellipsis
                    const showPage = 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1);
                    
                    if (showPage) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium border rounded-md ${
                            page === currentPage
                              ? 'text-white bg-blue-600 border-blue-600'
                              : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
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
                className={`px-3 py-2 text-sm font-medium border rounded-md ${
                  currentPage === totalPages
                    ? 'text-gray-300 bg-gray-100 border-gray-200 cursor-not-allowed'
                    : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Conversions</p>
              <p className="text-2xl font-bold text-gray-900">{files.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {files.filter(f => f.status === 'Completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Loader className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Processing</p>
              <p className="text-2xl font-bold text-gray-900">
                {files.filter(f => f.status === 'Converting' || f.status === 'Pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-gray-900">
                {files.filter(f => f.status === 'Failed').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
