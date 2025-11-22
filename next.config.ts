const nextConfig = {
  eslint: {
    // Disable ESLint during builds (Vercel will ignore ESLint errors)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds (optional - only if needed)
    ignoreBuildErrors: true,
  },
  async rewrites() {
    // Only rewrite non-auth API routes to the backend
    // Auth routes (/api/auth/*) are handled by Next.js API routes
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    return [
      {
        // Rewrite marketplace, users, wallet routes to backend
        source: "/api/marketplace/:path*",
        destination: `${apiUrl}/api/marketplace/:path*`,
      },
      {
        source: "/api/users/:path*",
        destination: `${apiUrl}/api/users/:path*`,
      },
      {
        source: "/api/wallet/:path*",
        destination: `${apiUrl}/api/wallet/:path*`,
      },
      // Auth routes are NOT rewritten - they're handled by Next.js API routes
    ];
  },
};

export default nextConfig;
