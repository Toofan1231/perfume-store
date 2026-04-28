"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, Sparkles, User, X } from "lucide-react";
import { useMemo, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useApp } from "@/lib/store";

type NavLink = {
  href: string;
  label: string;
};

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const { t, text, cartCount, settings, currentUser, logout } = useApp();

  const shopName = text(settings.shopName) || "Luxora";

  const links = useMemo<NavLink[]>(
    () => [
      { href: "/", label: t("home") },
      { href: "/products", label: t("products") },
      { href: "/cart", label: t("cart") },
      { href: "/profile", label: t("profile") },
      { href: "/admin", label: t("admin") },
    ],
    [t],
  );

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-stone-950 text-amber-200 shadow-lg shadow-stone-950/20">
            <Sparkles className="h-6 w-6" />
          </span>

          <span className="leading-none">
            <span className="block text-2xl font-black tracking-tight text-stone-950">
              {shopName}
            </span>
            <span className="mt-1 block text-xs font-bold uppercase tracking-[0.35em] text-amber-800">
              Perfume House
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {links.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "rounded-full px-4 py-2 text-sm font-bold transition",
                  active
                    ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200"
                    : "text-stone-800 hover:bg-stone-100 hover:text-amber-900",
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />

          {currentUser ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-stone-800 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900"
            >
              {t("logout")}
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-stone-800 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900"
            >
              <User className="h-4 w-4" />
              <span>{t("login")}</span>
            </Link>
          )}

          <Link
            href="/cart"
            className="relative inline-flex min-w-[120px] items-center justify-center gap-2 rounded-full border border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100 px-5 py-3 text-sm font-black text-amber-950 shadow-sm transition hover:border-amber-400 hover:from-amber-100 hover:to-amber-200 hover:shadow-md"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{t("cart")}</span>

            {cartCount > 0 ? (
              <span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-stone-950 px-1 text-xs font-black text-white shadow-md">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-xl border border-stone-200 p-2 text-stone-800 transition hover:bg-stone-100 lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-stone-200 bg-white px-4 py-4 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            {links.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={[
                    "rounded-2xl px-4 py-3 text-sm font-bold transition",
                    active
                      ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200"
                      : "text-stone-800 hover:bg-stone-100 hover:text-amber-900",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-1">
              <LanguageSwitcher />
            </div>

            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="rounded-2xl border border-stone-200 px-4 py-3 text-left text-sm font-bold text-stone-800 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900"
              >
                {t("logout")}
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 px-4 py-3 text-sm font-bold text-stone-800 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900"
              >
                <User className="h-4 w-4" />
                <span>{t("login")}</span>
              </Link>
            )}

            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="relative inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-3 text-sm font-black text-amber-950 transition hover:border-amber-400 hover:from-amber-100 hover:to-amber-200"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{t("cart")}</span>

              {cartCount > 0 ? (
                <span className="absolute right-3 top-2 grid h-6 min-w-6 place-items-center rounded-full bg-stone-950 px-1 text-xs font-black text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
