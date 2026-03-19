"use client";

import { twMerge } from "tailwind-merge";

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 ring-1 ring-white/10",
        className
      )}
    >
      {children}
    </span>
  );
}

