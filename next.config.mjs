const isProd = process.env.NODE_ENV === "production";
const internalHost = process.env.TAURI_DEV_HOST || "localhost";
const isTauriBuild = process.env.TAURI_BUILD === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isTauriBuild ? "export" : undefined,
  images: {
    unoptimized: true,
  },
  assetPrefix: isProd ? undefined : `http://${internalHost}:3000`,
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
