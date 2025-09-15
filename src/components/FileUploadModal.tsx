'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, File, Download, AlertCircle, CheckCircle, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Tool } from '@/types';
import { isValidFileType, getAcceptedFileTypesString } from '@/lib/tools';
import { convertFile } from '@/lib/api';

interface FileUploadModalProps {
  tool: Tool | null;
  isOpen: boolean;
  onClose: () => void;
}

interface UploadedFile {
  file: File;
  id: string;
}

export default function FileUploadModal({ tool, isOpen, onClose }: FileUploadModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const isMultiFileMode = tool?.allowMultipleFiles || false;
  const maxFiles = tool?.maxFiles || 1;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!tool) return;
    
    const newFiles: UploadedFile[] = [];
    const errors: string[] = [];

    acceptedFiles.forEach(file => {
      // Validate file type
      if (!isValidFileType(file, tool)) {
        errors.push(`${file.name}: Only ${getAcceptedFileTypesString(tool)} files are supported for this tool.`);
        return;
      }

      // Check if we're at the file limit
      if (uploadedFiles.length + newFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed for this tool.`);
        return;
      }

      newFiles.push({
        file,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      });
    });

    if (errors.length > 0) {
      setError(errors.join(' '));
      return;
    }

    setError(null);
    
    if (isMultiFileMode) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
    } else {
      setUploadedFiles(newFiles.slice(0, 1)); // Only take the first file for single-file tools
    }
  }, [tool, uploadedFiles.length, maxFiles, isMultiFileMode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: isMultiFileMode,
    accept: tool ? Object.fromEntries(tool.acceptedFileTypes.map(type => [type, []])) : {}
  });

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    setError(null);
  };

  const moveFile = (id: string, direction: 'up' | 'down') => {
    setUploadedFiles(prev => {
      const index = prev.findIndex(f => f.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newFiles = [...prev];
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      return newFiles;
    });
  };

  const handleProcess = async () => {
    if (uploadedFiles.length === 0 || !tool) return;

    setIsProcessing(true);
    setError(null);

    try {
      if (isMultiFileMode && uploadedFiles.length > 1) {
        // For merge operations, send all files
        const formData = new FormData();
        uploadedFiles.forEach((uploadedFile, index) => {
          formData.append(`file_${index}`, uploadedFile.file);
        });
        formData.append('toolId', tool.id);
        formData.append('fileCount', uploadedFiles.length.toString());

        const response = await fetch('/api/convert', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const blob = await response.blob();
          const downloadUrl = URL.createObjectURL(blob);
          setDownloadUrl(downloadUrl);
          setIsCompleted(true);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Conversion failed');
        }
      } else {
        // Single file conversion
        const result = await convertFile({
          toolId: tool.id,
          file: uploadedFiles[0].file,
        });

        if (result.success && result.data) {
          const blob = result.data as Blob;
          const downloadUrl = URL.createObjectURL(blob);
          setDownloadUrl(downloadUrl);
          
          // Store the blob type for proper filename detection
          (window as any).lastConversionBlobType = blob.type;
          
          setIsCompleted(true);
        } else {
          setError(result.error || 'An error occurred while processing your file.');
        }
      }
    } catch (err) {
      setError('An error occurred while processing your file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl && uploadedFiles.length > 0) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      let fileName: string;
      const baseName = uploadedFiles[0].file.name.split('.')[0];
      
      if (isMultiFileMode) {
        fileName = `merged_${uploadedFiles.length}_files.${tool?.outputFormat}`;
      } else {
        // Check the blob type to determine correct file extension
        const blobType = (window as any).lastConversionBlobType;
        
        if (tool?.id === 'pdf-to-jpg' && (blobType === 'application/zip' || blobType === 'application/x-zip-compressed')) {
          // Multi-page PDF to JPG returns ZIP
          fileName = `converted_${baseName}_images.zip`;
        } else {
          // Single file or other conversions
          fileName = `converted_${baseName}.${tool?.outputFormat}`;
        }
      }
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetModal = () => {
    setUploadedFiles([]);
    setIsProcessing(false);
    setIsCompleted(false);
    setError(null);
    setDownloadUrl(null);
    // Clean up the stored blob type
    delete (window as any).lastConversionBlobType;
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen || !tool) return null;

  const canProcess = uploadedFiles.length > 0 && (isMultiFileMode ? uploadedFiles.length >= 2 : true);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{tool.name}</h2>
            {isMultiFileMode && (
              <p className="text-sm text-gray-500 mt-1">
                Upload {tool.maxFiles ? `up to ${tool.maxFiles}` : 'multiple'} PDF files to merge
              </p>
            )}
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
          {uploadedFiles.length === 0 && !isCompleted && (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? 'Drop your files here' : `Upload your ${isMultiFileMode ? 'files' : 'file'}`}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-gray-400">
                Supported formats: {getAcceptedFileTypesString(tool)}
                {isMultiFileMode && ` • Max ${maxFiles} files`}
              </p>
            </div>
          )}

          {uploadedFiles.length > 0 && !isCompleted && (
            <div className="space-y-4">
              {/* File List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">
                    Uploaded Files {isMultiFileMode && `(${uploadedFiles.length}/${maxFiles})`}
                  </h3>
                  {isMultiFileMode && uploadedFiles.length < maxFiles && (
                    <button
                      {...getRootProps()}
                      className="text-primary hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                    >
                      <input {...getInputProps()} />
                      + Add More Files
                    </button>
                  )}
                </div>

                {uploadedFiles.map((uploadedFile, index) => (
                  <div key={uploadedFile.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <File className="w-8 h-8 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{uploadedFile.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    
                    {isMultiFileMode && uploadedFiles.length > 1 && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          {index + 1}
                        </span>
                        {index > 0 && (
                          <button
                            onClick={() => moveFile(uploadedFile.id, 'up')}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            title="Move up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                        )}
                        {index < uploadedFiles.length - 1 && (
                          <button
                            onClick={() => moveFile(uploadedFile.id, 'down')}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            title="Move down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                    
                    <button
                      onClick={() => removeFile(uploadedFile.id)}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors duration-200"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {isMultiFileMode && uploadedFiles.length >= 2 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700 text-sm">
                    <strong>Merge Order:</strong> Files will be merged in the order shown above. 
                    Use the arrow buttons to reorder if needed.
                  </p>
                </div>
              )}

              <button
                onClick={handleProcess}
                disabled={isProcessing || !canProcess}
                className={`
                  w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
                  ${isProcessing || !canProcess
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : `${tool.color} text-white hover:opacity-90`
                  }
                `}
              >
                {isProcessing 
                  ? 'Processing...' 
                  : isMultiFileMode 
                    ? `Merge ${uploadedFiles.length} Files`
                    : `Convert with ${tool.name}`
                }
              </button>

              {isMultiFileMode && uploadedFiles.length < 2 && (
                <p className="text-center text-sm text-gray-500">
                  Add at least 2 PDF files to merge them together
                </p>
              )}

              <button
                onClick={resetModal}
                className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Clear All Files
              </button>
            </div>
          )}

          {isCompleted && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {isMultiFileMode ? 'Files Merged Successfully!' : 'Conversion Complete!'}
              </h3>
              <p className="text-gray-600">
                {isMultiFileMode 
                  ? `Your ${uploadedFiles.length} PDF files have been merged into one document.`
                  : 'Your file has been successfully converted.'
                }
              </p>
              
              <button
                onClick={handleDownload}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>
                  Download {isMultiFileMode ? 'Merged' : 'Converted'} File
                </span>
              </button>

              <button
                onClick={resetModal}
                className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                {isMultiFileMode ? 'Merge More Files' : 'Convert Another File'}
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