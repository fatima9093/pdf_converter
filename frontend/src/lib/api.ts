// API utility functions for backend integration
import { ConversionLimitService } from './conversionLimits';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface ConvertRequest {
  toolId: string;
  file: File;
}

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const EXPRESS_API_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:3002';

// Helper function for Express API calls with credentials (HTTP-only cookies)
export async function apiFetch(url: string, options: RequestInit = {}) {
  return fetch(`${EXPRESS_API_URL}${url}`, {
    ...options,
    credentials: "include", // 🔑 always send HTTP-only cookies
    headers: {
      ...options.headers,
    },
  });
}

// Helper function for Next.js API calls with credentials (HTTP-only cookies)
export async function nextApiFetch(url: string, options: RequestInit = {}) {
  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: "include", // 🔑 always send HTTP-only cookies
    headers: {
      ...options.headers,
    },
  });
}

// Generic API call function
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await nextApiFetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'An error occurred',
      };
    }

    return {
      success: true,
      data,
    };
  } catch {
    return {
      success: false,
      error: 'Network error occurred',
    };
  }
}

// Authentication API calls - FIXED to call Railway backend directly
export async function login(credentials: LoginRequest): Promise<ApiResponse> {
  try {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Login failed',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Network error occurred',
    };
  }
}

export async function signup(userData: SignupRequest): Promise<ApiResponse> {
  try {
    const response = await apiFetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Signup failed',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Network error occurred',
    };
  }
}

export async function logout(): Promise<ApiResponse> {
  try {
    const response = await apiFetch('/api/auth/logout', {
      method: 'POST',
      credentials: "include"
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Logout failed',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Network error occurred',
    };
  }
}

// File conversion API calls
export async function convertFile(request: ConvertRequest): Promise<ApiResponse> {
  // Check if this conversion should use the Express backend
  const expressBackendTools = [
    'word-to-pdf', 
    'powerpoint-to-pdf', 
    'excel-to-pdf', 
    'pdf-to-jpg',
    'pdf-to-word',
    'pdf-to-excel', 
    'pdf-to-powerpoint'
  ];
  
  if (expressBackendTools.includes(request.toolId)) {
    return convertFileWithExpress(request);
  }

  // Use the existing Next.js API for other conversions
  const formData = new FormData();
  formData.append('file', request.file);
  formData.append('toolId', request.toolId);

  return nextApiFetch('/convert', {
    method: 'POST',
    body: formData,
  }).then(async (response) => {
    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Conversion failed',
      };
    }

    // For file downloads, we return the blob
    const blob = await response.blob();
    return {
      success: true,
      data: blob,
    };
  }).catch(() => ({
    success: false,
    error: 'Network error occurred',
  }));
}

// Express backend conversion for Office documents and PDF conversions
export async function convertFileWithExpress(request: ConvertRequest): Promise<ApiResponse> {
  const formData = new FormData();
  formData.append('file', request.file);

  // With HTTP-only cookies, we can't directly check authentication status
  // The server will determine if the user is authenticated based on the cookies
  // For now, we'll assume the user might be authenticated and let the server decide

  // Determine the correct endpoint based on tool ID
  // Use public endpoints that don't require authentication
  let endpoint = '/convert'; // Default for office-to-pdf conversions (public)
  
  if (request.toolId === 'pdf-to-word') {
    endpoint = '/pdf-to-word'; // Public endpoint
  } else if (request.toolId === 'pdf-to-excel') {
    endpoint = '/pdf-to-excel'; // Public endpoint
  } else if (request.toolId === 'pdf-to-powerpoint') {
    endpoint = '/pdf-to-powerpoint'; // Public endpoint
  } else if (['word-to-pdf', 'powerpoint-to-pdf', 'excel-to-pdf'].includes(request.toolId)) {
    endpoint = '/convert'; // Public endpoint
  } else if (request.toolId === 'pdf-to-jpg') {
    endpoint = '/pdf-to-jpg'; // Public endpoint
  }

  try {
    const fetchOptions: RequestInit = {
      method: 'POST',
      body: formData,
      credentials: 'include', // Always include HTTP-only cookies
    };

    const response = await apiFetch(endpoint, fetchOptions);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      return {
        success: false,
        error: error.error || `Conversion failed with status ${response.status}`,
      };
    }

    // For file downloads, we return the blob
    const blob = await response.blob();
    
    // 🔥 FIX: Increment conversion count for anonymous users AFTER successful backend conversion
    // We need to check if user is authenticated client-side since we can't access HTTP-only cookies
    try {
      // Check if user is authenticated by calling the /api/auth/me endpoint
      const authResponse = await nextApiFetch('/auth/me');
      const isAuthenticated = authResponse.ok;
      
      console.log(`🔍 Backend conversion completed. User authenticated: ${isAuthenticated}`);
      
      // Only increment count for anonymous users
      if (!isAuthenticated) {
        ConversionLimitService.incrementAnonymousConversionCount();
        console.log('✅ Incremented conversion count for backend-handled tool');
      }
    } catch {
      // If auth check fails, assume user is anonymous and increment count
      console.warn('⚠️ Auth check failed, assuming anonymous user');
      ConversionLimitService.incrementAnonymousConversionCount();
      console.log('✅ Incremented conversion count for backend-handled tool (fallback)');
    }
    
    return {
      success: true,
      data: blob,
    };
  } catch (error) {
    console.error('Express API error:', error);
    return {
      success: false,
      error: 'Failed to connect to conversion service. Please make sure the backend server is running.',
    };
  }
}

// Dashboard API calls
export async function getDashboardStats(): Promise<ApiResponse> {
  return apiCall('/dashboard/stats');
}

export async function getUserConversions(): Promise<ApiResponse> {
  return apiCall('/dashboard/conversions');
}

// Admin API calls
export async function getAdminStats(): Promise<ApiResponse> {
  return apiCall('/admin/stats');
}

export async function getAllUsers(): Promise<ApiResponse> {
  return apiCall('/admin/users');
}

export async function getSystemHealth(): Promise<ApiResponse> {
  return apiCall('/admin/health');
}

// User Management API calls
export async function blockUser(userId: string): Promise<ApiResponse> {
  return apiCall(`/admin/users/${userId}/block`, {
    method: 'POST',
  });
}

export async function unblockUser(userId: string): Promise<ApiResponse> {
  return apiCall(`/admin/users/${userId}/unblock`, {
    method: 'POST',
  });
}

export async function deleteUser(userId: string): Promise<ApiResponse> {
  return apiCall(`/admin/users/${userId}`, {
    method: 'DELETE',
  });
}

export async function bulkDeleteUsers(userIds: string[]): Promise<ApiResponse> {
  return apiCall('/admin/users/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ userIds }),
  });
}

// File Management API calls
export async function getAllFiles(): Promise<ApiResponse> {
  return apiCall('/admin/files');
}

export async function deleteFile(fileId: string): Promise<ApiResponse> {
  return apiCall(`/admin/files/${fileId}`, {
    method: 'DELETE',
  });
}

export async function bulkDeleteFiles(fileIds: string[]): Promise<ApiResponse> {
  return apiCall('/admin/files/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ fileIds }),
  });
}

export async function downloadFile(fileId: string): Promise<ApiResponse> {
  return apiCall(`/admin/files/${fileId}/download`);
}

// Statistics API calls
export async function getDashboardStatistics(timeRange?: string): Promise<ApiResponse> {
  const params = timeRange ? `?range=${timeRange}` : '';
  return apiCall(`/admin/statistics${params}`);
}

export async function getFileTypeStatistics(): Promise<ApiResponse> {
  return apiCall('/admin/statistics/file-types');
}

export async function getConversionStatistics(): Promise<ApiResponse> {
  return apiCall('/admin/statistics/conversions');
}

// System Logs API calls
export async function getSystemLogs(filters?: {
  type?: string;
  severity?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ApiResponse> {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.severity) params.append('severity', filters.severity);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());
  
  return apiCall(`/admin/logs?${params.toString()}`);
}

export async function deleteSystemLog(logId: string): Promise<ApiResponse> {
  return apiCall(`/admin/logs/${logId}`, {
    method: 'DELETE',
  });
}

export async function bulkDeleteSystemLogs(logIds: string[]): Promise<ApiResponse> {
  return apiCall('/admin/logs/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ logIds }),
  });
}

// Admin Settings API calls
export async function getAdminSettings(): Promise<ApiResponse> {
  return apiCall('/admin/settings');
}

export async function updateAdminSettings(settings: Record<string, unknown>): Promise<ApiResponse> {
  return apiCall('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

export async function addApiKey(apiKey: {
  name: string;
  key: string;
  service: string;
}): Promise<ApiResponse> {
  return apiCall('/admin/settings/api-keys', {
    method: 'POST',
    body: JSON.stringify(apiKey),
  });
}

export async function updateApiKey(keyId: string, updates: Record<string, unknown>): Promise<ApiResponse> {
  return apiCall(`/admin/settings/api-keys/${keyId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteApiKey(keyId: string): Promise<ApiResponse> {
  return apiCall(`/admin/settings/api-keys/${keyId}`, {
    method: 'DELETE',
  });
}

export async function addAdminAccount(admin: {
  email: string;
  name: string;
  permissions: string[];
}): Promise<ApiResponse> {
  return apiCall('/admin/settings/admins', {
    method: 'POST',
    body: JSON.stringify(admin),
  });
}

export async function deleteAdminAccount(adminId: string): Promise<ApiResponse> {
  return apiCall(`/admin/settings/admins/${adminId}`, {
    method: 'DELETE',
  });
}

// Tracking Functions
interface TrackConversionParams {
  toolType: string;
  originalFileName: string;
  convertedFileName?: string;
  fileSize: number;
  userId?: string;
  status?: 'COMPLETED' | 'FAILED';
}

export async function trackConversion(params: TrackConversionParams): Promise<void> {
  try {
    // Determine if we're on server-side or client-side
    const isServerSide = typeof window === 'undefined';
    
    // Use appropriate URL based on context
    const baseUrl = isServerSide 
      ? (process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000')
      : '';
    
    const url = `${baseUrl}/api/track-conversion`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include HTTP-only cookies
      body: JSON.stringify({
        ...params,
        processingLocation: 'FRONTEND'
      })
    });

    if (!response.ok) {
      console.warn(`Tracking failed: ${response.status}`);
      return;
    }

    console.log('✅ Conversion tracked successfully');
  } catch (error) {
    console.warn('⚠️ Failed to track conversion:', error);
  }
}

// Get user ID from HTTP-only cookie (server-side only)
export async function getUserIdFromRequest(request: Request): Promise<string | undefined> {
  try {
    // This function should only be used server-side where cookies can be accessed
    // For client-side, user ID should be obtained from the /api/auth/me endpoint
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return undefined;

    // Parse cookies to find accessToken
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const accessToken = cookies.accessToken;
    if (!accessToken) return undefined;

    // Simple JWT decode without backend verification (use with caution)
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    return payload.userId || payload.sub;
  } catch (error) {
    console.warn('Failed to get user ID from request:', error);
    return undefined;
  }
}