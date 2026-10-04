/* eslint-disable @next/next/no-img-element -- photos are hot-linked from Wikimedia and user uploads (blob: URLs) */
import type { CSSProperties } from "react";

export default function Photo({ src, alt = "", washed = true, style }: { src?: string; alt?: string; washed?: boolean; style?: CSSProperties }) {
  if (!src) return null;
  return <img src={src} alt={alt} className={washed ? "washed" : undefined} style={{ width: "100%", height: "100%", objectFit: "cover", ...style }} />;
}