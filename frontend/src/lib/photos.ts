// File name of a Wikimedia URL, without the "640px-" thumbnail prefix, to spot the same photo at two sizes.
const fname = (u: string) => decodeURIComponent((u || "").split("?")[0].split("/").pop() || "").replace(/^\d+px-/, "");

/** The main photo of a species followed by its extra Commons photos, without duplicates. */
export function photoSet(photos: Record<string, string>, media: Record<string, string[]>, latin: string, max: number) {
  const main = photos[latin] || "";
  const extra = (media[latin] || []).filter((u) => fname(u) !== fname(main));
  return [main, ...extra].filter(Boolean).slice(0, max);
}
