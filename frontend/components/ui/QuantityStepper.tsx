"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "./Button";
import { Minus, Plus } from "lucide-react";
import { AppIcon } from "./AppIcon";

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  disabled = false,
  className
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={twMerge("inline-flex items-center gap-2 rounded-2xl bg-white/5 p-1 ring-1 ring-white/10", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 px-0"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        type="button"
      >
        <AppIcon icon={Minus} size="sm" />
      </Button>
      <input
        className="w-14 rounded-xl bg-transparent text-center text-sm font-semibold text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
        type="number"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          if (disabled) return;
          const nextNum = Number(e.target.value || min);
          onChange(Math.max(min, Math.min(max, nextNum)));
        }}
      />
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 px-0"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        type="button"
      >
        <AppIcon icon={Plus} size="sm" />
      </Button>
    </div>
  );
}

