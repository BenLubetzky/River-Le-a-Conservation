// Cloudflare Worker in front of the static site (out/). Requests to /api/... go to the backend;
// everything else is served from the static files. See wrangler.jsonc.

interface Env {
  /** The static files in out/. */
  ASSETS: { fetch(request: Request): Promise<Response> };
  /** The backend's address, e.g. https://conservacao-leca-api.onrender.com */
  BACKEND_URL: string;
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      // /api/reports?x=1 → <backend>/reports?x=1, with the same method, headers (including the
      // session cookie) and body. Redirects are passed back to the browser rather than followed.
      const target = env.BACKEND_URL.replace(/\/$/, "") + url.pathname.slice("/api".length) + url.search;
      return fetch(new Request(target, request), { redirect: "manual" });
    }
    return env.ASSETS.fetch(request);
  },
};

export default worker;
