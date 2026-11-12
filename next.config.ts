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
  experimental: {
    serverActions: {
      // Dashboard photo uploads go browser → Server Action → Laravel. Safari
      // can't encode WebP, so a cut-out from an iPhone is a PNG and can pass
      // the 1 MB default. Laravel allows 5 MB, but a Vercel function refuses
      // bodies over 4.5 MB: 4 MB leaves room for the multipart overhead.
      bodySizeLimit: "4mb",
    },
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
