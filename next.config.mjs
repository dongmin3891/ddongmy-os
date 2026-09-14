import notionImageSource from './config/notion-image-source.js'
import r2ImageSource from './config/r2-image-source.js'

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
      {
        protocol: r2ImageSource.protocol,
        hostname: r2ImageSource.hostname,
        port: '',
        pathname: `${r2ImageSource.pathnamePrefix}**`,
      },
    ],
  },
  turbopack: {
    root: import.meta.dirname,
  },
}

export default nextConfig
