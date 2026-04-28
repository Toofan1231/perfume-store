import type { Product } from "@/types";

export const safeId = (prefix = "id") => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};
export const productMinPrice = (product: Product) => product.sizes.length ? Math.min(...product.sizes.map(size => size.price)) : 0;
export const productMaxPrice = (product: Product) => product.sizes.length ? Math.max(...product.sizes.map(size => size.price)) : 0;
export const splitCsv = (value: string) => value.split(',').map(item => item.trim()).filter(Boolean);
export const parseSizes = (value: string) => value.split(',').map(item => item.trim()).filter(Boolean).map(item => { const [label, price, stock] = item.split(':').map(part => part.trim()); return { label: label || '100ml', price: Number(price || 0), stock: Number(stock || 0) }; });
export const sizesToText = (product: Product) => product.sizes.map(size => `${size.label}:${size.price}:${size.stock}`).join(', ');
