/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  async rewrites() {
    return [
      {
        source: '/api/chat',
        destination: process.env.VERCEL
          ? '/api/chat'  // Vercel environment does not need rewriting
          : 'https://chat.pipimove.com'  // Local development rewrites to external URL
      }
    ]
  }
}

export default nextConfig;
