const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

/** The API answered 401: there's no valid login (or, for /auth/login, the credentials were wrong). */
export class AuthError extends Error {}

/** Calls the backend and returns its JSON, or throws an Error with a message fit to show people. */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    // `credentials` sends the session cookie, which the API sets on login.
    res = await fetch(API_URL + path, { ...init, credentials: "include" });
  } catch {
    throw new Error("Can’t reach the server. Check your connection and try again.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    // FastAPI sends {detail: "message"} for our own errors and {detail: [{msg}]} for validation errors.
    const detail = body?.detail;
    const message = typeof detail === "string" ? detail : detail?.[0]?.msg || `Something went wrong (${res.status}).`;
    if (res.status === 401) {
      // The login expired while the site was open: back to the login page. This runs outside
      // React, so there's no router; a full page load also clears the old user's state.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      if (!path.startsWith("/auth/")) window.location.assign("/");
      throw new AuthError(message);
    }
    throw new Error(message);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}
