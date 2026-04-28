"use client";

import { Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";

export function Footer() {
  const { text, settings, t } = useApp();

  return (
    <footer className="border-t border-amber-950/10 bg-stone-950 text-stone-200">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-200 text-stone-950">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <strong className="text-2xl text-white">{text(settings.shopName)}</strong>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-200">{text(settings.brandTagline)}</p>
            </div>
          </div>
          <p className="max-w-xl text-sm leading-7 text-stone-400">{text(settings.footerText)}</p>
        </div>

        <div>
          <h3 className="mb-4 font-bold text-white">{t("contact")}</h3>
          <div className="space-y-3 text-sm text-stone-400">
            <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {settings.contactPhone}</p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {settings.contactEmail}</p>
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {text(settings.contactAddress)}</p>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-bold text-white">Production-ready MVP</h3>
          <p className="text-sm leading-7 text-stone-400">
            Frontend and backend are ready for database integration when you choose your database.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} {text(settings.shopName)}. All rights reserved.
      </div>
    </footer>
  );
}
