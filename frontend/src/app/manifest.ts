import type { MetadataRoute } from "next";

// Written out as a file at build time (the site is a static export).
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Monitorização Leça",
    short_name: "Rio Leça",
    description: "Tracking invasive species along the River Leça",
    start_url: "/",
    display: "standalone",
    background_color: "#f5ead8",
    theme_color: "#f5ead8",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
