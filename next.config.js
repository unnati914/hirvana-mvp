/** @type {import('next').NextConfig} */
module.exports = {
  async redirects() {
    return [
      { source: "/waitlist", destination: "/login", permanent: false },
      { source: "/signup", destination: "/login", permanent: false },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Prevents ENOENT on missing .next/cache/webpack/*.pack.gz when the cache
      // is removed or corrupted (e.g. .next deleted while dev is still running).
      config.cache = false;
    }
    return config;
  },
};
