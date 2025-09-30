/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removido experimental.appDir - não é mais necessário no Next.js 14
  typescript: {
    // Ignorar erros de tipo durante o build
    ignoreBuildErrors: false,
  },
  eslint: {
    // Ignorar erros de ESLint durante o build
    ignoreDuringBuilds: false,
  },
  // Configurações para Vercel
  output: 'standalone',
  experimental: {
    // Garantir compatibilidade com Vercel
    serverComponentsExternalPackages: ['react-phone-number-input'],
  },
}

module.exports = nextConfig
