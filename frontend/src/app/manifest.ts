import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rio Leça Conservação",
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
