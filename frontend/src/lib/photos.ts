// Photos are shrunk in the browser before upload, and a small thumbnail is made for lists (see
// backend/app/services/storage.py).

/** The longest side of an uploaded photo, in pixels: plenty for viewing full screen. */
const MAX_SIDE = 2048;
/** The longest side of a thumbnail: lists show them at up to 64px, so this is sharp on any screen. */
const THUMB_SIDE = 320;
/** The API's limits (max_photo_bytes, max_thumb_bytes). */
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const MAX_THUMB_BYTES = 512 * 1024;

/** A photo ready to upload. `thumb` is missing when this browser couldn't read the image (e.g. HEIC outside Safari): then `file` is the original. */
export type PreparedPhoto = { file: File; thumb?: File };

function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  // Browsers apply the photo's EXIF orientation when drawing it, so portraits stay upright.
  return img.decode().then(() => img).finally(() => URL.revokeObjectURL(url));
}

function toJpeg(img: HTMLImageElement, maxSide: number, quality: number): Promise<Blob> {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext("2d")!;
  // JPEG has no transparency: put transparent PNGs on white rather than black.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", quality));
}

const jpegName = (name: string, suffix = "") => `${name.replace(/\.[^.]*$/, "") || "foto"}${suffix}.jpg`;

/**
 * Shrink a photo to at most MAX_SIDE pixels as a JPEG, and make its thumbnail. Keeps the original if
 * it's already a small enough JPEG and the re-encoded one wouldn't be smaller. Throws an Error fit to
 * show people if the result is still over the API's limit.
 */
export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch {
    // Can't read it here; the API still takes it as it is.
    if (file.size > MAX_PHOTO_BYTES) throw new Error("Essa fotografia tem mais de 10 MB. Escolha uma mais pequena.");
    return { file };
  }
  const [big, small] = await Promise.all([toJpeg(img, MAX_SIDE, 0.85), toJpeg(img, THUMB_SIDE, 0.75)]);
  const fits = Math.max(img.naturalWidth, img.naturalHeight) <= MAX_SIDE;
  const photo = fits && file.type === "image/jpeg" && file.size <= big.size ? file : new File([big], jpegName(file.name), { type: "image/jpeg" });
  if (photo.size > MAX_PHOTO_BYTES) throw new Error("Essa fotografia tem mais de 10 MB. Escolha uma mais pequena.");
  const thumb = small.size <= MAX_THUMB_BYTES ? new File([small], jpegName(file.name, "-mini"), { type: "image/jpeg" }) : undefined;
  return { file: photo, thumb };
}
