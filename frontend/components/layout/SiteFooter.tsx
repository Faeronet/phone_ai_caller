import { AppIcon } from "@/components/ui/AppIcon";
import { PhoneCall, Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/60">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2">
            <AppIcon icon={PhoneCall} size="sm" strokeWidth={2.5} className="text-brand-200" />
            Авторы проекта:
          </span>
          <span className="font-semibold text-slate-200">
            <span className="inline-flex items-center gap-2">
              Виктор, Андрей, Евгений, Дмитрий
              <AppIcon icon={Sparkles} size="sm" strokeWidth={2.5} className="text-brand-200" />
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}

