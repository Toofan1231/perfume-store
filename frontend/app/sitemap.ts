import type { MetadataRoute } from "next";
import { demoProducts } from "@/data/demo";
export default function sitemap(): MetadataRoute.Sitemap { const base = "http://localhost:3000"; return [{ url: base, lastModified: new Date() }, { url: `${base}/products`, lastModified: new Date() }, ...demoProducts.map(p => ({ url: `${base}/products/${p.id}`, lastModified: new Date(p.createdAt) }))]; }
