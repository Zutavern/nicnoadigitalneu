import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yqzunbubsqmsfsayneeh.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
  typescript: {
    // Temporär TypeScript-Fehler während Build ignorieren  
    ignoreBuildErrors: true,
  },
  // Turbopack root directory explizit setzen
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
