import type { NextConfig } from "next";

// `npm run build:static` → čisto statický web v ./static (bez Node servera).
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      // /watches/ → watches/index.html funguje na akomkoľvek statickom hostingu bez rewrite pravidiel.
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
