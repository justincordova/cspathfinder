import "./src/lib/env"; // Side-effect: validates env vars at build time
import path from "path";

const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "img.logo.dev" }],
  },
  env: {
    NEXT_PUBLIC_LOGO_DEV_TOKEN: process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN,
  },
  turbopack: {
    resolveAlias: {
      // Ensure tailwindcss resolves from the project root, not a parent dir
      tailwindcss: path.resolve("./node_modules/tailwindcss"),
    },
  },
};

export default nextConfig;
