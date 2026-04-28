"use client";

import Link from "next/link";
import { Menu, ShoppingBag, Sparkles, User, X } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useApp } from "@/lib/store";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { t, text, settings, cartCount, currentUser, logout } = useApp();

  const links = [
    ["/", t("home")],
    ["/products", t("products")],
    ["/cart", t("cart")],
    ["/profile", t("profile")],
    ["/admin", t("admin")]
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-amber-950/10 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-stone-950 text-amber-200 shadow-lg">
            <Sparkles className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-xl font-black text-stone-950">{text(settings.shopName)}</span>
            <span className="block text-xs font-semibold uppercase tracking-[0.28em] text-amber-800">{text(settings.brandTagline)}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="text-sm font-semibold text-stone-700 hover:text-amber-800">
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          {currentUser ? (
            <button onClick={logout} className="rounded-full border border-stone-200 px-4 py-2 text-sm font-bold">
              {t("logout")}
            </button>
          ) : (
            <Link href="/login" className="rounded-full border border-stone-200 px-4 py-2 text-sm font-bold">
              <User className="inline h-4 w-4" /> {t("login")}
            </Link>
          )}

          <Link href="/cart" className="relative rounded-full bg-stone-950 px-4 py-2 text-sm font-bold text-white">
            <ShoppingBag className="inline h-4 w-4" /> {t("cart")}
            {cartCount > 0 ? (
              <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-xs text-stone-950">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="rounded-xl border border-stone-200 p-2 lg:hidden" aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-stone-200 bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {links.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-semibold hover:bg-amber-50">
                {label}
              </Link>
            ))}
            <LanguageSwitcher />
            {currentUser ? (
              <button onClick={logout} className="rounded-xl px-3 py-3 text-left font-semibold">
                {t("logout")}
              </button>
            ) : (
              <Link href="/login" className="rounded-xl px-3 py-3 font-semibold">
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
