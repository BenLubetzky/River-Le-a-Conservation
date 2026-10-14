import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// Where the backend runs during `next dev`.
const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");

// The browser always calls the API at /api/... on the site's own address, so site and API share
// one address and the login cookie is first-party (browsers block third-party ones).
//
// - `next dev`: Next.js itself forwards /api/... to the backend.
// - `next build`: the site is exported as plain static files (out/), served by Cloudflare, where a
//   small Worker (worker/index.ts) does the forwarding. A static export can't forward by itself.
export default function config(phase: string): NextConfig {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      async rewrites() {
        return [{ source: "/api/:path*", destination: `${BACKEND_URL}/:path*` }];
      },
    };
  }
  return { output: "export" };
}
