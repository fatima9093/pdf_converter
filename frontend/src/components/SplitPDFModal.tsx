'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, File, Download, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { Tool } from '@/types';
import { isValidFileType, getAcceptedFileTypesString } from '@/lib/tools';
import { ConversionLimitService } from '@/lib/conversionLimits';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface SplitPDFModalProps {
  tool: Tool | null;
  isOpen: boolean;
  onClose: () => void;
  asPage?: boolean; // New prop to render as page instead of modal
}

interface PageRange {
  id: string;
  startPage: number;
  endPage: number;
  fileName: string;
}

export default function SplitPDFModal({ tool, isOpen, onClose, asPage = false }: SplitPDFModalProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<'individual' | 'ranges'>('individual');
  const [pageRanges, setPageRanges] = useState<PageRange[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Check conversion limit when modal opens
  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      const limitResult = ConversionLimitService.checkConversionLimit(false);
      if (!limitResult.canConvert) {
        console.log('🚫 Conversion limit reached on SplitPDF modal open, redirecting to signup');
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

    // Validate file size
    if (file.size === 0) {
      setError('The uploaded file is empty. Please upload a valid PDF file.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setError('File is too large. Please upload a PDF file smaller than 50MB.');
      return;
    }

    setError(null);
    setUploadedFile(file);
    
    // Get page count from the PDF
    try {
      console.log(`📄 Getting PDF info for: ${file.name} (${file.size} bytes)`);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/pdf-info', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.pageCount) {
          setPdfPageCount(data.pageCount);
          console.log(`📄 PDF has ${data.pageCount} pages`);
          
          // Initialize with default page ranges if ranges mode
          if (splitMode === 'ranges') {
            setPageRanges([{
              id: '1',
              startPage: 1,
              endPage: Math.min(5, data.pageCount),
              fileName: 'split_1.pdf'
            }]);
          }
        } else {
          console.warn('PDF info API returned unsuccessful response:', data);
          setPdfPageCount(1); // Default to 1 page if we can't determine
        }
      } else {
        console.warn('PDF info API request failed:', response.status, response.statusText);
        setPdfPageCount(1); // Default to 1 page if we can't determine
      }
    } catch (err) {
      console.error('Error getting PDF info:', err);
      setError('Unable to read PDF file information. You can still proceed with the split operation.');
      setPdfPageCount(1); // Default to 1 page if we can't determine
    }
  }, [tool, splitMode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: tool ? Object.fromEntries(tool.acceptedFileTypes.map(type => [type, []])) : {}
  });

  const addPageRange = () => {
    const lastRange = pageRanges[pageRanges.length - 1];
    const startPage = lastRange ? lastRange.endPage + 1 : 1;
    
    if (startPage <= pdfPageCount) {
      setPageRanges(prev => [...prev, {
        id: Date.now().toString(),
        startPage,
        endPage: Math.min(startPage + 4, pdfPageCount),
        fileName: `split_${prev.length + 1}.pdf`
      }]);
    }
  };

  const removePageRange = (id: string) => {
    setPageRanges(prev => prev.filter(range => range.id !== id));
  };

  const updatePageRange = (id: string, field: keyof PageRange, value: string | number) => {
    setPageRanges(prev => prev.map(range => 
      range.id === id ? { ...range, [field]: value } : range
    ));
  };

  const validatePageRanges = (): string | null => {
    for (const range of pageRanges) {
      if (range.startPage < 1 || range.endPage > pdfPageCount) {
        return `Page range ${range.startPage}-${range.endPage} is invalid. Pages must be between 1 and ${pdfPageCount}.`;
      }
      if (range.startPage > range.endPage) {
        return `Invalid range: Start page (${range.startPage}) cannot be greater than end page (${range.endPage}).`;
      }
      if (!range.fileName.trim()) {
        return 'All file names must be provided.';
      }
    }
    
    // Check for overlapping ranges
    const sortedRanges = [...pageRanges].sort((a, b) => a.startPage - b.startPage);
    for (let i = 0; i < sortedRanges.length - 1; i++) {
      if (sortedRanges[i].endPage >= sortedRanges[i + 1].startPage) {
        return 'Page ranges cannot overlap.';
      }
    }
    
    return null;
  };

  const handleProcess = async () => {
    if (!uploadedFile || !tool) return;

    if (splitMode === 'ranges') {
      const validationError = validatePageRanges();
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('toolId', tool.id);
      formData.append('splitMode', splitMode);
      
      if (splitMode === 'ranges') {
        formData.append('pageRanges', JSON.stringify(pageRanges));
      }

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        setDownloadUrl(downloadUrl);
        setIsCompleted(true);
        
        // Increment conversion count for anonymous users AFTER successful split
        if (!isAuthenticated) {
          ConversionLimitService.incrementAnonymousConversionCount();
          console.log('✅ Incremented conversion count for Split PDF');
        }
      } else {
        let errorMessage = 'Split operation failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('❌ Split API Error:', errorData);
        } catch (parseError) {
          console.warn('Could not parse error response:', parseError);
          errorMessage = `Split operation failed (${response.status}: ${response.statusText})`;
        }
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Split PDF error:', err);
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError('An error occurred while splitting your PDF. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = splitMode === 'individual' 
        ? `${uploadedFile?.name.split('.')[0]}_split_pages.zip`
        : `${uploadedFile?.name.split('.')[0]}_split_ranges.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetModal = () => {
    setUploadedFile(null);
    setPdfPageCount(0);
    setSplitMode('individual');
    setPageRanges([]);
    setIsProcessing(false);
    setIsCompleted(false);
    setError(null);
    setDownloadUrl(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!tool) return null;
  if (!asPage && !isOpen) return null;

  // Render as page component (no modal overlay)
  if (asPage) {
    return (
      <div className="bg-white rounded-xl shadow-lg max-w-4xl mx-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tool.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Split your PDF into individual pages or custom page ranges
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!uploadedFile && !isCompleted && (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                ${isDragActive 
                  ? 'border-[#e5322d] bg-[#e5322d]/5' 
                  : 'border-gray-300 hover:border-[#e5322d]/50 hover:bg-gray-50'
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
          )}

          {uploadedFile && !isCompleted && (
            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <File className="w-8 h-8 text-[#e5322d]" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {pdfPageCount} pages
                  </p>
                </div>
              </div>

              {/* Split Options */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">How would you like to split this PDF?</h3>
                
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="splitMode"
                      value="individual"
                      checked={splitMode === 'individual'}
                      onChange={(e) => setSplitMode(e.target.value as 'individual' | 'ranges')}
                      className="mt-1 h-4 w-4 text-[#e5322d] focus:ring-[#e5322d]"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Split into individual pages</p>
                      <p className="text-sm text-gray-500">
                        Each page becomes a separate PDF (Page1.pdf, Page2.pdf, ...)
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="splitMode"
                      value="ranges"
                      checked={splitMode === 'ranges'}
                      onChange={(e) => setSplitMode(e.target.value as 'individual' | 'ranges')}
                      className="mt-1 h-4 w-4 text-[#e5322d] focus:ring-[#e5322d]"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Split by custom page ranges</p>
                      <p className="text-sm text-gray-500">
                        Define specific page ranges (e.g., pages 1-3, pages 4-10)
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Page Ranges Configuration */}
              {splitMode === 'ranges' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Page Ranges</h4>
                    <button
                      onClick={addPageRange}
                      className="flex items-center space-x-1 text-[#e5322d] hover:text-[#d02823] text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Range</span>
                    </button>
                  </div>

                  {pageRanges.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <p>Click &quot;Add Range&quot; to define your first page range</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {pageRanges.map((range) => (
                      <div key={range.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 rounded-lg">
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">Start</label>
                          <input
                            type="number"
                            min="1"
                            max={pdfPageCount}
                            value={range.startPage}
                            onChange={(e) => updatePageRange(range.id, 'startPage', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#e5322d]"
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">End</label>
                          <input
                            type="number"
                            min="1"
                            max={pdfPageCount}
                            value={range.endPage}
                            onChange={(e) => updatePageRange(range.id, 'endPage', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#e5322d]"
                          />
                        </div>
                        
                        <div className="col-span-7">
                          <label className="block text-xs text-gray-500 mb-1">File Name</label>
                          <input
                            type="text"
                            value={range.fileName}
                            onChange={(e) => updatePageRange(range.id, 'fileName', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#e5322d]"
                            placeholder="e.g., chapter1.pdf"
                          />
                        </div>
                        
                        <div className="col-span-1 flex justify-end">
                          <button
                            onClick={() => removePageRange(range.id)}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors duration-200"
                            title="Remove range"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {pageRanges.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-700 text-sm">
                        <strong>Preview:</strong> This will create {pageRanges.length} PDF files from your {pdfPageCount}-page document.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {splitMode === 'individual' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700 text-sm">
                    <strong>Preview:</strong> This will create {pdfPageCount > 0 ? pdfPageCount : 'separate'} PDF files, one for each page 
                    {pdfPageCount > 0 ? `(Page1.pdf, Page2.pdf, ..., Page${pdfPageCount}.pdf)` : '(Page1.pdf, Page2.pdf, ...)'}.
                  </p>
                </div>
              )}

              <button
                onClick={handleProcess}
                disabled={isProcessing || (splitMode === 'ranges' && pageRanges.length === 0)}
                className={`
                  w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
                  ${isProcessing || (splitMode === 'ranges' && pageRanges.length === 0)
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-[#e5322d] text-white hover:bg-[#d02823]'
                  }
                `}
              >
                {isProcessing 
                  ? 'Splitting PDF...' 
                  : splitMode === 'individual'
                    ? `Split into ${pdfPageCount > 0 ? pdfPageCount : 'Individual'} Files`
                    : `Split into ${pageRanges.length} Files`
                }
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
              <h3 className="text-lg font-bold text-gray-900">PDF Split Successfully!</h3>
              <p className="text-gray-600">
                Your PDF has been split into {splitMode === 'individual' ? pdfPageCount : pageRanges.length} separate files.
              </p>
              
              <button
                onClick={handleDownload}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download Split Files</span>
              </button>

              <button
                onClick={resetModal}
                className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Split Another PDF
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
    );
  }

  // Render as modal (original behavior)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{tool.name}</h2>
            <p className="text-sm text-gray-500 mt-1">Split your PDF into multiple files</p>
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
                {isDragActive ? 'Drop your PDF here' : 'Upload your PDF file'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-gray-400">
                Supported formats: {getAcceptedFileTypesString(tool)}
              </p>
            </div>
          )}

          {uploadedFile && pdfPageCount > 0 && !isCompleted && (
            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <File className="w-8 h-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {pdfPageCount} pages
                  </p>
                </div>
              </div>

              {/* Split Options */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">How would you like to split this PDF?</h3>
                
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="splitMode"
                      value="individual"
                      checked={splitMode === 'individual'}
                      onChange={(e) => setSplitMode(e.target.value as 'individual' | 'ranges')}
                      className="mt-1 h-4 w-4 text-primary focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Split into individual pages</p>
                      <p className="text-sm text-gray-500">
                        Each page becomes a separate PDF (Page1.pdf, Page2.pdf, ...)
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="splitMode"
                      value="ranges"
                      checked={splitMode === 'ranges'}
                      onChange={(e) => setSplitMode(e.target.value as 'individual' | 'ranges')}
                      className="mt-1 h-4 w-4 text-primary focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Split by custom page ranges</p>
                      <p className="text-sm text-gray-500">
                        Define specific page ranges (e.g., pages 1-3, pages 4-10)
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Page Ranges Configuration */}
              {splitMode === 'ranges' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Page Ranges</h4>
                    <button
                      onClick={addPageRange}
                      className="flex items-center space-x-1 text-primary hover:text-blue-700 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Range</span>
                    </button>
                  </div>

                  {pageRanges.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <p>Click &quot;Add Range&quot; to define your first page range</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {pageRanges.map((range) => (
                      <div key={range.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 rounded-lg">
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">Start</label>
                          <input
                            type="number"
                            min="1"
                            max={pdfPageCount}
                            value={range.startPage}
                            onChange={(e) => updatePageRange(range.id, 'startPage', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">End</label>
                          <input
                            type="number"
                            min="1"
                            max={pdfPageCount}
                            value={range.endPage}
                            onChange={(e) => updatePageRange(range.id, 'endPage', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="col-span-7">
                          <label className="block text-xs text-gray-500 mb-1">File Name</label>
                          <input
                            type="text"
                            value={range.fileName}
                            onChange={(e) => updatePageRange(range.id, 'fileName', e.target.value)}
                            placeholder="e.g., chapter1.pdf"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="col-span-1">
                          <button
                            onClick={() => removePageRange(range.id)}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors duration-200"
                            title="Remove range"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {pageRanges.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-700 text-sm">
                        <strong>Preview:</strong> This will create {pageRanges.length} PDF files from your {pdfPageCount}-page document.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {splitMode === 'individual' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700 text-sm">
                    <strong>Preview:</strong> This will create {pdfPageCount > 0 ? pdfPageCount : 'separate'} PDF files, one for each page 
                    {pdfPageCount > 0 ? `(Page1.pdf, Page2.pdf, ..., Page${pdfPageCount}.pdf)` : '(Page1.pdf, Page2.pdf, ...)'}.
                  </p>
                </div>
              )}

              <button
                onClick={handleProcess}
                disabled={isProcessing || (splitMode === 'ranges' && pageRanges.length === 0)}
                className={`
                  w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
                  ${isProcessing || (splitMode === 'ranges' && pageRanges.length === 0)
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : `${tool.color} text-white hover:opacity-90`
                  }
                `}
              >
                {isProcessing 
                  ? 'Splitting PDF...' 
                  : splitMode === 'individual'
                    ? `Split into ${pdfPageCount > 0 ? pdfPageCount : 'Individual'} Files`
                    : `Split into ${pageRanges.length} Files`
                }
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
              <h3 className="text-lg font-bold text-gray-900">PDF Split Complete!</h3>
              <p className="text-gray-600">
                Your PDF has been split into {splitMode === 'individual' ? pdfPageCount : pageRanges.length} files.
              </p>
              
              <button
                onClick={handleDownload}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download Split Files (ZIP)</span>
              </button>

              <button
                onClick={resetModal}
                className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Split Another PDF
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
