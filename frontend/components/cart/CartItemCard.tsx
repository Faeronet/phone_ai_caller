"use client";

import * as React from "react";
import type { CartItem } from "@/store/cartStore";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { formatRub } from "@/lib/money";
import { Trash2 } from "lucide-react";
import { AppIcon } from "@/components/ui/AppIcon";

export function CartItemCard({
  item,
  onQuantityChange,
  onRemove
}: {
  item: CartItem;
  onQuantityChange: (next: number) => void;
  onRemove: () => void;
}) {
  const lineTotal = item.priceCents * item.quantity;

  return (
    <div className="group rounded-3xl bg-slate-900/60 p-4 ring-1 ring-white/10 shadow-soft transition-all hover:-translate-y-0.5 hover:ring-brand-400/20">
      <div className="flex items-start gap-4">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-white">{item.name}</div>
              <div className="mt-1 text-xs text-slate-400">Цена за штуку: {formatRub(item.priceCents)}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <QuantityStepper
                value={item.quantity}
                min={1}
                max={20}
                onChange={onQuantityChange}
              />
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Сумма по позиции</div>
              <div className="text-sm font-extrabold text-white">{formatRub(lineTotal)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="ghost" size="sm" onClick={onRemove} type="button" className="rounded-2xl ring-1 ring-white/10 hover:ring-brand-400/30">
          <span className="inline-flex items-center gap-2">
            <AppIcon icon={Trash2} size="sm" strokeWidth={2.5} />
            Удалить
          </span>
        </Button>
      </div>
    </div>
  );
}

