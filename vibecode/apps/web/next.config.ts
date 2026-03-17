import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Transpila os packages internos do monorepo
  transpilePackages: [
    '@vibecode/db',
    '@vibecode/shared',
    '@vibecode/ai',
  ],

  // Configurações experimentais
  experimental: {
    // Instrumentação para Sentry etc. (futuro)
    instrumentationHook: true,
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ]
  },
}

export default nextConfig
