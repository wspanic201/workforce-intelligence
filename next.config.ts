import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/report/demo',
        destination: '/report/wake-tech-program-opportunity-scan',
        permanent: true,
      },
      {
        source: '/grant-alignment',
        destination: '/grants',
        permanent: true,
      },
      {
        source: '/market-research',
        destination: '/discover',
        permanent: true,
      },
      {
        source: '/program-health',
        destination: '/drift',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
