import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/api/v1/payments/success",
        destination: "/payment/success",
        permanent: false,
      },
      {
        source: "/api/v1/payments/cancel",
        destination: "/payment/cancel",
        permanent: false,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
