import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return { name: "Luxora Perfume Store", short_name: "Luxora", description: "Premium perfume store", start_url: "/", display: "standalone", background_color: "#fffaf5", theme_color: "#201712", icons: [{ src: "/images/icon.svg", sizes: "any", type: "image/svg+xml" }] }; }
