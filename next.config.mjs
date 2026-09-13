import notionImageSource from './config/notion-image-source.js'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    formats: ['image/webp'],
    qualities: [60],
    remotePatterns: [
      {
        protocol: notionImageSource.protocol,
        hostname: notionImageSource.hostname,
        port: '',
        pathname: `${notionImageSource.pathnamePrefix}**`,
      },
    ],
  },
  turbopack: {
    root: import.meta.dirname,
  },
}

export default nextConfig
