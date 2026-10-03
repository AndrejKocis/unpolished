import type { NextConfig } from "next";
import { BASE_PATH } from "./lib/constants";

// `npm run build:static` → čisto statický web v ./docs pre GitHub Pages (bez Node servera).
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      basePath: BASE_PATH,
      // /watches/ → watches/index.html funguje na akomkoľvek statickom hostingu bez rewrite pravidiel.
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
