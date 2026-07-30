import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "insiderol",
    short_name: "insiderol",
    description:
      "Türkiye'deki şirketler için anonim maaş, çalışan yorumu ve mülakat deneyimi platformu.",
    start_url: "/",
    display: "standalone",
    background_color: "#1b2421",
    theme_color: "#1b2421",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
