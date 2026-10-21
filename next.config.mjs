/** @type {import('next').NextConfig} */
const nextConfig = {
    // Low-RAM build host (4 vCPU): cap page-data/static-gen workers — each loads a
    // full copy of the module graph. Refs: nextjs memory-usage guide, vercel/next.js#95744.
    experimental: {
        cpus: 2,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
        formats: ['image/avif', 'image/webp'],
    },
};

export default nextConfig;
