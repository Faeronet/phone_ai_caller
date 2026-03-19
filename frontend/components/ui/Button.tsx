"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-brand-400/50 disabled:opacity-50 disabled:pointer-events-none";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-glow hover:bg-brand-500 hover:shadow-[0_0_40px_rgba(99,102,241,0.35)]",
  secondary:
    "bg-white/5 text-slate-100 ring-1 ring-white/10 hover:bg-white/10 hover:ring-white/15",
  ghost: "bg-transparent text-slate-100 hover:bg-white/5"
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base"
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return <button className={twMerge(base, variantClasses[variant], sizeClasses[size], className)} {...props} />;
}

