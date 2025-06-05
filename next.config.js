/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { appDir: true },
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      // Poll every 1000ms for file changes
      poll: 1000,
      // Delay rebuild 300ms to batch rapid edits
      aggregateTimeout: 300,
    };
    return config;
  },
};
module.exports = nextConfig;
