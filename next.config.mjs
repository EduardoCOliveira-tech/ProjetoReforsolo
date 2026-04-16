/** @type {import('next').NextConfig} */
const nextConfig = {
  // Diz ao Next.js para não processar esses pacotes pesados no build
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
};

export default nextConfig;