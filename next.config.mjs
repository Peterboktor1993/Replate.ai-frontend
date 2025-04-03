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
};

export default nextConfig;
