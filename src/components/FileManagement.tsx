'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye,
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

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockFiles: FileRecord[] = [
      {
        id: '1',
        filename: 'Annual Report 2024.docx',
        fileType: 'Word',
        originalExtension: '.docx',
        uploadedBy: {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@example.com'
        },
        uploadedAt: new Date('2024-01-21T10:30:00'),
        status: 'Completed',
        fileSize: 2048576, // 2MB
        downloadUrl: '/downloads/annual-report-2024.pdf'
      },
      {
        id: '2',
        filename: 'Sales Data Q4.xlsx',
        fileType: 'Excel',
        originalExtension: '.xlsx',
        uploadedBy: {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com'
        },
        uploadedAt: new Date('2024-01-21T09:15:00'),
        status: 'Converting',
        fileSize: 1536000 // 1.5MB
      },
      {
        id: '3',
        filename: 'Product Presentation.pptx',
        fileType: 'PowerPoint',
        originalExtension: '.pptx',
        uploadedBy: {
          id: '3',
          name: 'Mike Wilson',
          email: 'mike.wilson@example.com'
        },
        uploadedAt: new Date('2024-01-21T08:45:00'),
        status: 'Failed',
        fileSize: 5242880, // 5MB
        errorMessage: 'Unsupported font type detected'
      },
      {
        id: '4',
        filename: 'Marketing Budget.xlsx',
        fileType: 'Excel',
        originalExtension: '.xlsx',
        uploadedBy: {
          id: '4',
          name: 'Emily Davis',
          email: 'emily.davis@example.com'
        },
        uploadedAt: new Date('2024-01-21T07:20:00'),
        status: 'Completed',
        fileSize: 892000,
        downloadUrl: '/downloads/marketing-budget.pdf'
      },
      {
        id: '5',
        filename: 'Company Logo.png',
        fileType: 'Image',
        originalExtension: '.png',
        uploadedBy: {
          id: '5',
          name: 'David Brown',
          email: 'david.brown@example.com'
        },
        uploadedAt: new Date('2024-01-20T16:30:00'),
        status: 'Pending',
        fileSize: 512000
      },
      {
        id: '6',
        filename: 'Project Timeline.docx',
        fileType: 'Word',
        originalExtension: '.docx',
        uploadedBy: {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@example.com'
        },
        uploadedAt: new Date('2024-01-20T14:15:00'),
        status: 'Completed',
        fileSize: 1024000, // 1MB
        downloadUrl: '/downloads/project-timeline.pdf'
      }
    ];

    setTimeout(() => {
      setFiles(mockFiles);
      setLoading(false);
    }, 1000);
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
          <h2 className="text-2xl font-bold text-gray-900">File Management</h2>
          <p className="text-gray-600">Monitor and manage uploaded files</p>
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
            placeholder="Search files by name or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
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
              onChange={(e) => setFilterType(e.target.value as any)}
              className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
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
                    checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFiles(filteredFiles.map(file => file.id));
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
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
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
              {filteredFiles.map((file) => (
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

        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No files found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Files</p>
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
