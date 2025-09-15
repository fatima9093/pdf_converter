// Application configuration

export const config = {
  // File upload limits
  maxFileSize: 50 * 1024 * 1024, // 50MB in bytes
  maxFilesPerUpload: 10,
  
  // Supported file types by category
  fileTypes: {
    pdf: ['.pdf'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'],
    document: ['.doc', '.docx', '.txt', '.rtf'],
    presentation: ['.ppt', '.pptx'],
    spreadsheet: ['.xls', '.xlsx'],
  },

  // API endpoints
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 30000, // 30 seconds
  },

  // UI configuration
  ui: {
    itemsPerPage: 10,
    animationDuration: 200,
    toastDuration: 5000,
  },

  // Feature flags
  features: {
    enableBatchProcessing: false,
    enableFileHistory: true,
    enableNotifications: true,
    enableAnalytics: false,
  },

  // Tool-specific settings
  tools: {
    compression: {
      defaultQuality: 0.8,
      maxQuality: 1.0,
      minQuality: 0.1,
    },
    merge: {
      maxFiles: 20,
    },
    split: {
      maxPages: 1000,
    },
  },
} as const;

export type Config = typeof config;
