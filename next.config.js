/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  redirects: async () => {
    return [
      {
        source: "/github",
        destination: "https://github.com/johannlai/chatFn",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
