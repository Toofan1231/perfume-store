"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, BarChart3, PackageCheck, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { useApp } from "@/lib/store";

export function HomePage() {
  const { products, categories, settings, t, text } = useApp();
  const featured = products.filter((product) => product.featured && product.active).slice(0, 4);

  const features = [
    ["Authentic quality", "Curated products with sizes, notes and reviews.", BadgeCheck],
    ["Fast checkout", "Cart, checkout and demo payment are ready.", Truck],
    ["Admin control", "Products, orders, categories, users and settings.", ShieldCheck],
    ["Analytics", "Revenue, orders, customers and top products.", BarChart3]
  ] as const;

  return (
    <main>
      <section className="relative overflow-hidden px-4 py-12 lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/10 bg-white px-4 py-2 text-sm font-bold text-amber-900 shadow-sm">
              <Sparkles className="h-4 w-4" /> {text(settings.announcement)}
            </div>

            <div>
              <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight text-stone-950 md:text-7xl">
                {text(settings.heroTitle)}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">{text(settings.heroSubtitle)}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/products" className="rounded-full bg-stone-950 px-7 py-4 text-center font-bold text-white shadow-xl hover:bg-amber-800">
                {t("shopNow")} <ArrowRight className="inline h-4 w-4" />
              </Link>
              <Link href="/admin" className="rounded-full border border-stone-300 bg-white px-7 py-4 text-center font-bold text-stone-900 hover:border-amber-700 hover:text-amber-800">
                {t("admin")}
              </Link>
            </div>
          </div>

          <div className="hero-noise relative min-h-[34rem] overflow-hidden rounded-[3rem] border border-amber-950/10 bg-amber-100 shadow-2xl">
            <ProductImage src={settings.heroImage} alt={text(settings.shopName)} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-stone-950/35" />
            <div className="absolute inset-x-8 top-8 rounded-[2rem] bg-white/70 p-5 text-sm font-bold text-stone-700 backdrop-blur-md">
              {text(settings.brandTagline)} · Oud · Rose · Amber · Fresh
            </div>
            <div className="absolute bottom-8 left-8 right-8 grid gap-3 sm:grid-cols-3">
              {categories.slice(0, 3).map((category) => (
                <Link href={`/products?category=${category.id}`} key={category.id} className="rounded-2xl bg-white/80 p-4 backdrop-blur-md transition hover:bg-white">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-900">{t("category")}</p>
                  <p className="mt-1 font-black text-stone-950">{text(category.name)}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {features.map(([title, copy, Icon]) => (
            <div key={title} className="glass-card rounded-[2rem] p-6">
              <Icon className="h-7 w-7 text-amber-800" />
              <h3 className="mt-5 text-lg font-black text-stone-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-800">Collection</p>
              <h2 className="mt-2 text-4xl font-black text-stone-950">{t("featured")}</h2>
            </div>
            <Link href="/products" className="font-bold text-amber-800 hover:text-amber-950">{t("viewAll")} →</Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featured.map((product) => <ProductCard product={product} key={product.id} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
