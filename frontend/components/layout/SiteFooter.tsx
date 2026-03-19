"use client";
import { AppIcon } from "@/components/ui/AppIcon";
import { PhoneCall, Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/60">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <AppIcon icon={PhoneCall} size="sm" strokeWidth={2.5} className="text-brand-200" />
            Команда проекта
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="flex items-start justify-between gap-4 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold text-white">Виктор</div>
                <div className="text-xs font-semibold text-slate-300">PM (Product Manager), AI Engineer</div>
              </div>
              <AppIcon icon={Sparkles} size="sm" strokeWidth={2.5} className="mt-1 text-brand-200 shrink-0" />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold text-white">Евгений</div>
                <div className="text-xs font-semibold text-slate-300">Team Lead, AI Engineer</div>
              </div>
              <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-2xl bg-brand-600/20 ring-1 ring-brand-400/25 text-brand-200 text-xs font-extrabold">
                TL
              </span>
            </div>

            <div className="flex items-start justify-between gap-4 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold text-white">Андрей</div>
                <div className="text-xs font-semibold text-slate-300">AI Engineer</div>
              </div>
              <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 text-slate-200 text-xs font-extrabold">
                AI
              </span>
            </div>

            <div className="flex items-start justify-between gap-4 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold text-white">Дмитрий</div>
                <div className="text-xs font-semibold text-slate-300">AI Engineer</div>
              </div>
              <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 text-slate-200 text-xs font-extrabold">
                AI
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

