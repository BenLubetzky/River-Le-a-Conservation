import { useId } from "react";

/** The site's mark: a river winding through a green circle, with the sun. Same drawing as app/icon.svg. */
export default function Logo({ size = 30 }: { size?: number }) {
  const clip = useId();
  return (
    <svg width={size} height={size} viewBox="-56 -56 112 112" aria-hidden="true" style={{ flex: "none" }}>
      <defs>
        <clipPath id={clip}><circle r="56" /></clipPath>
      </defs>
      <circle r="56" fill="var(--color-accent-2-600)" />
      <path d="M-22,-60 C-22,-16 24,-20 18,8 C12,34 -18,28 -12,60" clipPath={`url(#${clip})`} stroke="var(--color-bg)" strokeWidth="11" fill="none" strokeLinecap="round" />
      <circle cx="24" cy="-24" r="8" fill="var(--color-accent)" />
    </svg>
  );
}
