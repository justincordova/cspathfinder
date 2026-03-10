import "./src/lib/env"; // Side-effect: validates env vars at build time

const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "img.logo.dev" }],
  },
  env: {
    HF_TOKEN: process.env.HF_TOKEN,
    NEXT_PUBLIC_LOGO_DEV_TOKEN: process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN,
  },
};

export default nextConfig;
