import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quality Control Unit — Streams of Joy International",
    short_name: "QCU Attendance",
    description:
      "Secure geofenced attendance platform ensuring authenticity, accountability and excellence.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaff",
    theme_color: "#39A9DB",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
