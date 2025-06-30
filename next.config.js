/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },

  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },

  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: 'http://localhost:4000/auth/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
