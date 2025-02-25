/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['yqzunbubsqmsfsayneeh.supabase.co', 'ui-avatars.com'],
  },
  eslint: {
    // Warnung: Dies ist nur für den Build-Prozess. In der Entwicklung sollten die ESLint-Regeln aktiv bleiben.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 