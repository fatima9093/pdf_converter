/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mammoth', 'html-pdf-node', 'puppeteer', 'pdfjs-dist', 'canvas', 'sharp'],
  },
  webpack: (config, { isServer }) => {
    // Handle Node.js modules that aren't compatible with the browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        url: false,
        querystring: false,
        http: false,
        https: false,
        zlib: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    // Ensure proper handling of Node.js modules
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('mammoth', 'html-pdf-node', 'puppeteer', 'canvas', 'sharp');
    }

    return config;
  },
};

module.exports = nextConfig;
