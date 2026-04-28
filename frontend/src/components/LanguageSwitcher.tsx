"use client";
import { Globe2 } from "lucide-react";
import { languageMeta } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import type { Language } from "@/types";
export function LanguageSwitcher(){ const { language, setLanguage } = useApp(); return <label className="flex items-center gap-2 rounded-full border border-amber-900/10 bg-white px-3 py-2 text-sm shadow-sm"><Globe2 className="h-4 w-4 text-amber-800"/><select value={language} onChange={e=>setLanguage(e.target.value as Language)} className="bg-transparent font-semibold text-stone-800 outline-none">{(Object.keys(languageMeta) as Language[]).map(k=><option key={k} value={k}>{languageMeta[k].label}</option>)}</select></label>; }
