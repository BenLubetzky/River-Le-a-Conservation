const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

/** Calls the backend and returns its JSON, or throws an Error with a message fit to show people. */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(API_URL + path, init);
  } catch {
    throw new Error("Can’t reach the server. Check your connection and try again.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    // FastAPI sends {detail: "message"} for our own errors and {detail: [{msg}]} for validation errors.
    const detail = body?.detail;
    throw new Error(typeof detail === "string" ? detail : detail?.[0]?.msg || `Something went wrong (${res.status}).`);
  }
  return res.json();
}
