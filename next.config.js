/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yqzunbubsqmsfsayneeh.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
  },
  eslint: {
    // Warnung: Dies ist nur für den Build-Prozess. In der Entwicklung sollten die ESLint-Regeln aktiv bleiben.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 