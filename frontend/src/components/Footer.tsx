"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
  Twitter,
} from "lucide-react";
import { useApp } from "@/lib/store";

export function Footer() {
  const { settings, t, text } = useApp();

  const shopName = text(settings.shopName) || "Luxora";

  const footerText =
    text(settings.footerText) ||
    "Premium fragrance shopping experience with authentic perfumes, elegant packaging, and fast delivery.";

  const contactPhone = text(settings.contactPhone) || "+93 700 000 000";
  const contactEmail = text(settings.contactEmail) || "sales@luxora.dev";
  const contactAddress = text(settings.contactAddress) || "Kabul, Afghanistan";

  const quickLinks = [
    { href: "/", label: t("home") },
    { href: "/products", label: t("products") },
    { href: "/cart", label: t("cart") },
    { href: "/profile", label: t("profile") },
    { href: "/admin", label: t("admin") },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-amber-950/10 bg-stone-950 text-stone-200">
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-200/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.7fr_0.8fr_0.9fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-stone-950 shadow-lg shadow-amber-900/20">
                <Sparkles className="h-6 w-6" />
              </span>

              <span>
                <span className="block text-3xl font-black tracking-tight text-white">
                  {shopName}
                </span>
                <span className="mt-1 block text-xs font-bold uppercase tracking-[0.35em] text-amber-300">
                  Perfume House
                </span>
              </span>
            </Link>

            <p className="mt-6 max-w-md text-sm leading-7 text-stone-400">
              {footerText}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-stone-300">
                <ShieldCheck className="h-4 w-4 text-amber-300" />
                Authentic Products
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-stone-300">
                <Truck className="h-4 w-4 text-amber-300" />
                Fast Delivery
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.28em] text-amber-300">
              Store
            </h3>

            <div className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm font-semibold text-stone-400 transition hover:translate-x-1 hover:text-amber-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.28em] text-amber-300">
              Contact
            </h3>

            <div className="mt-5 space-y-4 text-sm text-stone-400">
              <p className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <span>{contactPhone}</span>
              </p>

              <p className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <span>{contactEmail}</span>
              </p>

              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <span>{contactAddress}</span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.28em] text-amber-300">
              Stay Connected
            </h3>

            <p className="mt-5 text-sm leading-7 text-stone-400">
              Follow our latest perfume collections, offers, gift sets, and
              luxury fragrance updates.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition hover:border-amber-300 hover:bg-amber-300 hover:text-stone-950"
              >
                <Instagram className="h-5 w-5" />
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition hover:border-amber-300 hover:bg-amber-300 hover:text-stone-950"
              >
                <Facebook className="h-5 w-5" />
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition hover:border-amber-300 hover:bg-amber-300 hover:text-stone-950"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-sm text-stone-500 md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="font-bold text-stone-300">{shopName}</span>. All
            rights reserved.
          </p>

          <div className="flex flex-wrap gap-4">
            <span className="transition hover:text-amber-200">
              Privacy Policy
            </span>
            <span className="transition hover:text-amber-200">
              Terms of Service
            </span>
            <span className="transition hover:text-amber-200">
              Secure Checkout
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
