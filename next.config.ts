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
    ],
  },
  eslint: {
    // Temporär ESLint-Fehler während Build ignorieren
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporär TypeScript-Fehler während Build ignorieren  
    ignoreBuildErrors: true,
  },
  // External packages für Serverless (Puppeteer/Chromium)
  serverExternalPackages: ['@sparticuz/chromium-min', 'puppeteer-core'],
};

export default nextConfig;
