import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/report/demo',
        destination: '/report/wake-tech-program-opportunity-scan',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
