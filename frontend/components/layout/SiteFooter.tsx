"use client";
import { AppIcon } from "@/components/ui/AppIcon";
import { PhoneCall, Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/60">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2 text-slate-400">
            <AppIcon icon={PhoneCall} size="sm" strokeWidth={2.5} className="text-brand-200" />
            Авторы проекта:
          </span>

          <div className="flex flex-wrap gap-x-5 gap-y-2 font-semibold text-slate-200">
            <span className="inline-flex items-center gap-2">
              Виктор — PM <AppIcon icon={Sparkles} size="sm" strokeWidth={2.5} className="text-brand-200" />
            </span>
            <span className="inline-flex items-center gap-2">Евгений — Team Lead</span>
            <span className="inline-flex items-center gap-2">Андрей — AI Engineer</span>
            <span className="inline-flex items-center gap-2">Дмитрий — AI Engineer</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

