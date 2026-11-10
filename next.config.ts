import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Table QR codes hold this short link (lib/table-session tableShortPath).
      // Temporary (307), so browsers don't cache it and the target can change
      // without reprinting the codes.
      {
        source: "/t/:branch/:table",
        destination: "/menu?branch=:branch&table=:table",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
