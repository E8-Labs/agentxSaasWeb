/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
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
        ],
      },
};

export default nextConfig;
