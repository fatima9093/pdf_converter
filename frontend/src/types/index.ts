export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  acceptedFileTypes: string[];
  outputFormat: string;
  color: string;
  allowMultipleFiles?: boolean;
  maxFiles?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  provider?: 'EMAIL' | 'GOOGLE';
  isBlocked?: boolean;
  lastLogin?: string;
  totalConversions?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    tokens: AuthTokens;
  };
  errors?: unknown[];
}

export interface GoogleAuthData {
  idToken: string;
}

export interface ConversionJob {
  id: string;
  userId: string;
  toolId: string;
  originalFileName: string;
  convertedFileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  fileSize: number;
}

export interface FileUploadState {
  file: File | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Admin Dashboard Types
export interface AdminUser extends User {
  isBlocked: boolean;
  lastLogin?: string;
  totalConversions: number;
}

export interface FileRecord {
  id: string;
  filename: string;
  fileType: 'Word' | 'Excel' | 'PowerPoint' | 'PDF' | 'Image' | 'Other';
  originalExtension: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
  uploadedAt: Date;
  status: 'Pending' | 'Converting' | 'Completed' | 'Failed';
  fileSize: number;
  downloadUrl?: string;
  errorMessage?: string;
}

export interface DashboardStatistics {
  dailyUploads: { date: string; count: number }[];
  monthlyUploads: { month: string; count: number }[];
  mostUploadedFileType: {
    type: string;
    count: number;
    percentage: number;
  };
  conversionSuccessRate: {
    successful: number;
    failed: number;
    rate: number;
  };
  totalStorageUsed: {
    bytes: number;
    formatted: string;
    percentage: number;
  };
  growthRates: {
    uploads: number;
    successRate: number;
    failures: number;
    storage: number;
  };
}

export interface SystemLog {
  id: string;
  type: 'conversion_error' | 'login_failure' | 'system_error' | 'security_alert' | 'user_action' | 'api_error';
  message: string;
  details?: string;
  userId?: string;
  userEmail?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent?: string;
}

export interface AdminSettings {
  fileSize: {
    maxSizeMB: number;
    maxSizeBytes: number;
  };
  supportedFileTypes: string[];
  apiKeys: {
    name: string;
    key: string;
    service: string;
    isActive: boolean;
  }[];
  adminAccounts: {
    id: string;
    email: string;
    name: string;
    permissions: string[];
    lastLogin?: Date;
  }[];
  systemSettings: {
    maxConcurrentConversions: number;
    retentionDays: number;
    maintenanceMode: boolean;
  };
}