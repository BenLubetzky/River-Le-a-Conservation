import type { MetadataRoute } from "next";

// Written out as a file at build time (the site is a static export).
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Monitorização Leça",
    short_name: "Rio Leça",
    description: "Monitorização de espécies invasoras ao longo do Rio Leça",
    lang: "pt-PT",
    start_url: "/",
    display: "standalone",
    background_color: "#f5ead8",
    theme_color: "#f5ead8",
    icons: [
      { src: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
