// next.config.js for PORTMAN frontend
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow local network/dev cross-origin requests for development
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.0.103:3000',
    'http://192.168.0.103',
  ],
};

module.exports = nextConfig;
