import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Never print what people send to server actions (passwords, contact details) in the dev log.
  logging: { serverFunctions: false },
  // Certificate PDFs read these at run time, so they ship with every server function.
  outputFileTracingIncludes: { "/**": ["./src/assets/fonts/*.ttf"] },
  // Receipts are up to 4 MB, sent through a server action.
  experimental: { serverActions: { bodySizeLimit: "4.4mb" } },
};

export default nextConfig;
