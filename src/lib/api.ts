// API utility functions for backend integration

export interface ApiResponse<T = any> {
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

// Generic API call function
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
  } catch (error) {
    return {
      success: false,
      error: 'Network error occurred',
    };
  }
}

// Authentication API calls
export async function login(credentials: LoginRequest): Promise<ApiResponse> {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function signup(userData: SignupRequest): Promise<ApiResponse> {
  return apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function logout(): Promise<ApiResponse> {
  return apiCall('/auth/logout', {
    method: 'POST',
  });
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

  return fetch(`${API_BASE_URL}/convert`, {
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

  // Determine the correct endpoint based on tool ID
  let endpoint = '/convert'; // Default for office-to-pdf conversions
  
  if (request.toolId === 'pdf-to-jpg') {
    endpoint = '/pdf-to-jpg';
  } else if (request.toolId === 'pdf-to-word') {
    endpoint = '/pdf-to-word';
  } else if (request.toolId === 'pdf-to-excel') {
    endpoint = '/pdf-to-excel';
  } else if (request.toolId === 'pdf-to-powerpoint') {
    endpoint = '/pdf-to-powerpoint';
  }

  try {
    const response = await fetch(`${EXPRESS_API_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      return {
        success: false,
        error: error.error || `Conversion failed with status ${response.status}`,
      };
    }

    // For file downloads, we return the blob
    const blob = await response.blob();
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

export async function updateAdminSettings(settings: any): Promise<ApiResponse> {
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

export async function updateApiKey(keyId: string, updates: any): Promise<ApiResponse> {
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