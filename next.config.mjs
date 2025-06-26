/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "cravio.ai"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cravio.ai",
        pathname: "/replate/storage/app/public/**",
      },
    ],
  },
  reactStrictMode: true,
  swcMinify: true,

  experimental: {
    optimizePackageImports: [
      "react-bootstrap",
      "@fortawesome/fontawesome-free",
    ],
  },

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.devtool = "eval-source-map";
    }

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
