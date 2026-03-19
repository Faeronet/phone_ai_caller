"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";

type IconSize = "sm" | "md" | "lg";

const sizeClasses: Record<IconSize, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6"
};

export function AppIcon({
  icon: Icon,
  size = "md",
  strokeWidth = 2,
  className
}: {
  icon: LucideIcon;
  size?: IconSize;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <Icon
      strokeWidth={strokeWidth}
      className={twMerge("shrink-0 text-current", sizeClasses[size], className)}
      aria-hidden="true"
    />
  );
}

