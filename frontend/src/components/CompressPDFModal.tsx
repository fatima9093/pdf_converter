'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, File, Download, AlertCircle, CheckCircle, Zap, Shield } from 'lucide-react';
import { Tool } from '@/types';
import { isValidFileType, getAcceptedFileTypesString } from '@/lib/tools';
import { ConversionLimitService } from '@/lib/conversionLimits';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface CompressPDFModalProps {
  tool: Tool | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CompressPDFModal({ tool, isOpen, onClose }: CompressPDFModalProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Check conversion limit when modal opens
  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      const limitResult = ConversionLimitService.checkConversionLimit(false);
      if (!limitResult.canConvert) {
        console.log('🚫 Conversion limit reached on CompressPDF modal open, redirecting to signup');
        onClose(); // Close modal immediately
        router.push('/signup?message=For further conversions, please sign up first&from=conversion-limit');
      }
    }
  }, [isOpen, isAuthenticated, onClose, router]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!tool) return;
    
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!isValidFileType(file, tool)) {
      setError(`Only ${getAcceptedFileTypesString(tool)} files are supported for this tool.`);
      return;
    }

    setError(null);
    setUploadedFile(file);
    setOriginalSize(file.size);
  }, [tool]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: tool ? Object.fromEntries(tool.acceptedFileTypes.map(type => [type, []])) : {}
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleProcess = async () => {
    if (!uploadedFile || !tool) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('toolId', tool.id);

      console.log(`🗜️ Starting lossless compression: ${uploadedFile.name} (${originalSize} bytes)`);

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const blob = await response.blob();
        const newSize = blob.size;
        setCompressedSize(newSize);
        
        console.log(`✅ Compression result: ${originalSize} -> ${newSize} bytes`);
        console.log(`📉 Reduction: ${((originalSize - newSize) / originalSize * 100).toFixed(1)}%`);
        
        const downloadUrl = URL.createObjectURL(blob);
        setDownloadUrl(downloadUrl);
        setIsCompleted(true);
        
        // Increment conversion count for anonymous users AFTER successful compression
        if (!isAuthenticated) {
          ConversionLimitService.incrementAnonymousConversionCount();
          console.log('✅ Incremented conversion count for Compress PDF');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Compression failed');
      }
    } catch {
      setError('An error occurred while compressing your PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl && uploadedFile) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `compressed_${uploadedFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetModal = () => {
    setUploadedFile(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setIsProcessing(false);
    setIsCompleted(false);
    setError(null);
    setDownloadUrl(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const compressionRatio = originalSize > 0 && compressedSize > 0 
    ? ((originalSize - compressedSize) / originalSize * 100).toFixed(1)
    : '0';

  const spacesSaved = originalSize - compressedSize;

  if (!isOpen || !tool) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{tool.name}</h2>
            <p className="text-sm text-gray-500 mt-1">Optimize PDF size while preserving all content</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!uploadedFile && !isCompleted && (
            <div>
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                  ${isDragActive 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                  }
                `}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {isDragActive ? 'Drop your PDF here' : 'Upload your PDF file'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Drag and drop or click to select
                </p>
                <p className="text-xs text-gray-400">
                  Supported formats: {getAcceptedFileTypesString(tool)}
                </p>
              </div>

              {/* Lossless Compression Info */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">Lossless Compression</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Preserves all text, images, and layout</li>
                      <li>• Removes unnecessary metadata and redundant data</li>
                      <li>• Optimizes internal PDF structure</li>
                      <li>• No quality loss or content changes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {uploadedFile && !isCompleted && (
            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <File className="w-8 h-8 text-purple-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(originalSize)}
                  </p>
                </div>
              </div>

              {/* Compression Preview */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Zap className="w-6 h-6 text-purple-600" />
                    <h3 className="font-bold text-purple-900 text-lg">Advanced Compression</h3>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="text-gray-700 font-medium mb-2">File to optimize:</p>
                    <p className="text-2xl font-bold text-purple-600">{formatFileSize(originalSize)}</p>
                    <p className="text-sm text-gray-500 mt-1">Current file size</p>
                  </div>
                  
                  <div className="bg-blue-100 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-800 mb-2">Optimization Techniques:</h4>
                    <ul className="text-sm text-blue-700 text-left space-y-1">
                      <li>• Remove unnecessary metadata</li>
                      <li>• Optimize internal PDF structure</li>
                      <li>• Compress object streams</li>
                      <li>• Font subsetting and optimization</li>
                      <li>• Multiple compression strategies</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-100 rounded-lg p-3">
                    <p className="text-green-800 font-medium">
                      🛡️ Content Protection Guaranteed
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      All text, images, and layout preserved
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className={`
                  w-full py-4 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2
                  ${isProcessing
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                  }
                `}
              >
                <Zap className="w-5 h-5" />
                <span>{isProcessing ? 'Applying Multiple Compression Strategies...' : 'Optimize PDF Size'}</span>
              </button>

              <button
                onClick={resetModal}
                className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Choose Different File
              </button>
            </div>
          )}

          {isCompleted && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Compression Complete!</h3>
              
              {/* Compression Results */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="text-center">
                    <p className="text-gray-600">Original Size</p>
                    <p className="font-bold text-gray-900 text-lg">{formatFileSize(originalSize)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Compressed Size</p>
                    <p className="font-bold text-green-600 text-lg">{formatFileSize(compressedSize)}</p>
                  </div>
                </div>
                
                <div className={`text-center rounded-lg p-4 ${
                  parseFloat(compressionRatio) > 5 
                    ? 'bg-green-100' 
                    : 'bg-yellow-100'
                }`}>
                  {parseFloat(compressionRatio) > 5 ? (
                    <>
                      <p className="text-green-800 font-bold text-lg">
                        🎉 {compressionRatio}% Size Reduction!
                      </p>
                      <p className="text-green-700 text-sm">
                        You saved {formatFileSize(spacesSaved)} of storage space
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-yellow-800 font-bold text-lg">
                        📊 {compressionRatio}% Reduction Achieved
                      </p>
                      <p className="text-yellow-700 text-sm">
                        This PDF was already well-optimized
                      </p>
                      <p className="text-yellow-600 text-xs mt-1">
                        Saved {formatFileSize(spacesSaved)} • Further compression may require quality loss
                      </p>
                    </>
                  )}
                  <p className="text-gray-600 text-xs mt-2">
                    ✅ All content preserved - no quality loss
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleDownload}
                className="w-full bg-green-600 text-white py-4 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
              >
                <Download className="w-5 h-5" />
                <span>Download Optimized PDF</span>
              </button>

              <button
                onClick={resetModal}
                className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Compress Another PDF
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}