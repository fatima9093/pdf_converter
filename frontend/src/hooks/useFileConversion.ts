import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tool, FileUploadState } from '@/types';
import { convertFile } from '@/lib/api';
import { isValidFileType } from '@/lib/tools';
import { ConversionLimitService } from '@/lib/conversionLimits';
import { useAuth } from '@/contexts/AuthContext';

export function useFileConversion() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [uploadState, setUploadState] = useState<FileUploadState>({
    file: null,
    isUploading: false,
    uploadProgress: 0,
    error: null,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const validateAndSetFile = (file: File, tool: Tool): boolean => {
    if (!isValidFileType(file, tool)) {
      setUploadState(prev => ({
        ...prev,
        error: `Only ${tool.acceptedFileTypes.join(', ')} files are supported for this tool.`,
      }));
      return false;
    }

    setUploadState({
      file,
      isUploading: false,
      uploadProgress: 100,
      error: null,
    });
    return true;
  };

  const processFile = async (tool: Tool): Promise<boolean> => {
    if (!uploadState.file) return false;

    // Check conversion limits before processing
    const limitResult = ConversionLimitService.checkConversionLimit(isAuthenticated);
    
    if (!limitResult.canConvert) {
      // Redirect to signup page with message
      router.push('/signup?message=For further conversions, please sign up first&from=conversion-limit');
      return false;
    }

    setIsProcessing(true);
    setUploadState(prev => ({ ...prev, error: null }));

    try {
      const result = await convertFile({
        toolId: tool.id,
        file: uploadState.file,
      });

      if (result.success && result.data) {
        // Increment conversion count for anonymous users
        if (!isAuthenticated) {
          ConversionLimitService.incrementAnonymousConversionCount();
        }

        const url = URL.createObjectURL(result.data as Blob);
        setDownloadUrl(url);
        setIsCompleted(true);
        return true;
      } else {
        setUploadState(prev => ({
          ...prev,
          error: result.error || 'Conversion failed',
        }));
        return false;
      }
    } catch {
      setUploadState(prev => ({
        ...prev,
        error: 'An error occurred during conversion',
      }));
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (originalFileName: string, outputFormat: string) => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `converted_${originalFileName.split('.')[0]}.${outputFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const reset = () => {
    setUploadState({
      file: null,
      isUploading: false,
      uploadProgress: 0,
      error: null,
    });
    setIsProcessing(false);
    setDownloadUrl(null);
    setIsCompleted(false);
  };

  return {
    uploadState,
    isProcessing,
    isCompleted,
    downloadUrl,
    validateAndSetFile,
    processFile,
    downloadFile,
    reset,
  };
}
