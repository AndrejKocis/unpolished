import type { NextConfig } from "next";
import { IMAGE_WIDTHS } from "./lib/image-loader";

// `npm run build:static` → čisto statický web v ./docs pre GitHub Pages (bez Node servera).
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      // /watches/ → watches/index.html funguje na akomkoľvek statickom hostingu bez rewrite pravidiel.
      trailingSlash: true,
      // Statický web nemá server na optimalizáciu obrázkov — WebP verzie vyrába build (scripts/optimize-images.mjs).
      images: { loader: "custom", loaderFile: "./lib/image-loader.ts", deviceSizes: IMAGE_WIDTHS, imageSizes: [] },
    }
  : {};

export default nextConfig;
