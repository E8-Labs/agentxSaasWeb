import { withSentryConfig } from "@sentry/nextjs";
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Allow dev requests from ngrok (and other tunnel) origins to avoid cross-origin warnings.
  // allowedDevOrigins: [
  //   '*.ngrok-free.app',
  //   '*.ngrok.io',
  //   '*.ngrok.app',
  //   // Exact host when using a specific ngrok URL (replace with your current ngrok host if it changes):
  //   '855f-154-80-6-115.ngrok-free.app',
  // ],
  // All /api/* requests are handled by Next.js: specific Route Handlers run first,
  // then app/api/[...path]/route.ts proxies the rest to the backend.
  async rewrites() {
    return [];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.blindcircle.com",
        pathname: "/agentx/uploads/**",
      },
      {
        protocol: "https",
        hostname: "www.blindcircle.com",
        pathname: "/agentxtest/uploads/**",
      },
      {
        protocol: "https",
        hostname: "iggi-media.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "app.assignx.ai",
      },
      {
        protocol: "https",
        hostname: "apimyagentx.com",
        pathname: "/agentx/uploads/**",
      },
      {
        protocol: "https",
        hostname: "apimyagentx.com",
        pathname: "/agentxtest/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.myagentx.com",
        pathname: "/agentx/uploads/**",
      },
    ],
  },
  // Example: allow embedding /embed/vapi in an iframe
  async headers() {
    return [
      {
        source: "/embed/vapi",
        headers: [{ key: "X-Frame-Options", value: "ALLOWALL" }],
      },
      // Add other embed/iframe routes below as needed
    ];
  },
};

const isSentryEnabled = !!process.env.SENTRY_AUTH_TOKEN;

export default isSentryEnabled
  ? withSentryConfig(nextConfig, {
    org: "e8labs",
    project: "javascript-nextjs",
    silent: !process.env.CI,
    widenClientFileUpload: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  })
  : nextConfig;
