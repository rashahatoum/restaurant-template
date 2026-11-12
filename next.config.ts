import type { NextConfig } from "next";

// Photos uploaded to the Laravel API are served from its host under /storage
// (API-CONTRACT §2). Read from API_BASE_URL, never hard-coded: the staging
// host now, api.<domain> later. Unset → no remote images (mock photos are local).
const apiImages = (() => {
  if (!process.env.API_BASE_URL) return [];
  const { protocol, hostname, port } = new URL(process.env.API_BASE_URL);
  return [{ protocol: protocol.replace(":", "") as "http" | "https", hostname, port, pathname: "/storage/**" }];
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: apiImages,
  },
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
