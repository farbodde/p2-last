import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
let isLocalApi = false;
const remotePatterns: RemotePattern[] = [
  {
    protocol: "http",
    hostname: "localhost",
    port: "8000",
    pathname: "/media/**",
  },
  {
    protocol: "http",
    hostname: "127.0.0.1",
    port: "8000",
    pathname: "/media/**",
  },
];

if (apiBaseUrl) {
  try {
    const url = new URL(apiBaseUrl);
    isLocalApi = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
    const pattern = {
      protocol: url.protocol.replace(":", "") as RemotePattern["protocol"],
      hostname: url.hostname,
      port: url.port || undefined,
      pathname: "/media/**",
    };
    const exists = remotePatterns.some(
      (remotePattern) =>
        remotePattern.protocol === pattern.protocol &&
        remotePattern.hostname === pattern.hostname &&
        remotePattern.port === pattern.port,
    );

    if (!exists) {
      remotePatterns.push(pattern);
    }
  } catch {}
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
    dangerouslyAllowLocalIP:
      process.env.NODE_ENV !== "production" && isLocalApi,
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
