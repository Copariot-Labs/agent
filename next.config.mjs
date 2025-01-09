/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/chat',
        destination: process.env.VERCEL 
          ? '/api/chat'  // Vercel 环境不需要重写
          : 'https://chat.pipimove.com'  // 本地开发重写到外部 URL
      }
    ]
  }
}

export default nextConfig
