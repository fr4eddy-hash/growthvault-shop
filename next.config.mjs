/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow Vercel Blob URLs in images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
