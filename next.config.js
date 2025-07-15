// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracing: false,
  },
  images: {
    domains: ["lh3.googleusercontent.com",'cdn2.thedogapi.com',
      'cdn2.thecatapi.com',
      'images.unsplash.com', 'res.cloudinary.com'],
     remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn2.thedogapi.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn2.thecatapi.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;
