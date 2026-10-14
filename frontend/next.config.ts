import type { NextConfig } from "next";

// Where the backend runs. Read when the site is built and started; set BACKEND_URL in production.
const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // The browser calls the API at /api/... on this site's own address, and Next.js passes those
  // requests on to the backend. Site and API then share one address, so the login cookie is a
  // first-party cookie wherever the two are hosted (browsers block third-party ones).
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/:path*` }];
  },
};

export default nextConfig;
