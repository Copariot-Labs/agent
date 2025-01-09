/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/chat',
        destination: process.env.NEXT_PUBLIC_BASE_URL,
      }
    ]
  }
}

export default nextConfig
