import {withSentryConfig} from '@sentry/nextjs';
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    // Optimize build performance
    swcMinify: true,
    experimental: {
        // Reduce memory usage during build
        memoryBasedWorkersCount: true,
        // Optimize bundle size
        optimizePackageImports: ['@mui/material', '@mui/icons-material', 'axios', 'moment'],
    },
    // Webpack optimizations for large projects
    webpack: (config, { isServer }) => {
        // Increase memory limit for webpack
        config.infrastructureLogging = {
            level: 'error',
        };
        
        // Optimize chunk splitting
        if (!isServer) {
            config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                    },
                    mui: {
                        test: /[\\/]node_modules[\\/]@mui[\\/]/,
                        name: 'mui',
                        chunks: 'all',
                    },
                },
            };
        }
        
        return config;
    },
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'www.blindcircle.com',
            // port: '444',  // Specify the port here
            pathname: '/agentx/uploads/**',  // Allow specific path
          },
          {
            protocol: 'https',
            hostname: 'www.blindcircle.com',
            // port: '444',  // Specify the port here
            pathname: '/agentxtest/uploads/**',  // Allow specific path
          },
          {
            protocol: 'https',
            hostname: 'iggi-media.s3.amazonaws.com',  // Another domain you're using
          },
          {
            protocol: 'https',
            hostname: 'images.unsplash.com',
          },
          {

            protocol: 'https',
            hostname: 'apimyagentx.com',
          },
          {

            protocol: 'https',
            hostname: 'api.myagentx.com',
          },

          
        ],
      },
};

export default withSentryConfig(nextConfig, {
// For all available options, see:
// https://www.npmjs.com/package/@sentry/webpack-plugin#options

org: "e8labs",
project: "javascript-nextjs",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Reduce source map upload to save memory during build
widenClientFileUpload: false,

// Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
// tunnelRoute: "/monitoring",

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,

// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
// See the following for more information:
// https://docs.sentry.io/product/crons/
// https://vercel.com/docs/cron-jobs
automaticVercelMonitors: true,

// Reduce memory usage during build
hideSourceMaps: true,
disableServerWebpackPlugin: false,
disableClientWebpackPlugin: false,
}, {
// Additional Sentry options to reduce build memory
silent: true,
dryRun: false,
});