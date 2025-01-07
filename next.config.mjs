/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '',
  assetPrefix: '',
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
}

export default nextConfig
