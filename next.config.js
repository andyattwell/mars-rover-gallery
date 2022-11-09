/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['mars.nasa.gov', 'mars.jpl.nasa.gov'],
  },
}

module.exports = nextConfig
