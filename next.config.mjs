/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "diggitsy.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "diggitsy.com",
        pathname: "/replate/storage/app/public/**",
      },
    ],
  },
  // Improve error handling and hydration
  reactStrictMode: true,
  swcMinify: true,

  // Optimize for production
  experimental: {
    optimizePackageImports: [
      "react-bootstrap",
      "@fortawesome/fontawesome-free",
    ],
  },

  // Better error handling in production
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Webpack configuration for better error handling
  webpack: (config, { dev, isServer }) => {
    // Improve error messages in development
    if (dev) {
      config.devtool = "eval-source-map";
    }

    // Ensure proper module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
};

export default nextConfig;
