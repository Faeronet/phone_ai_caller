"use client";

import * as React from "react";
import type { CartItem } from "@/store/cartStore";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { formatByn } from "@/lib/money";
import { twMerge } from "tailwind-merge";
import { TrashSimple } from "@phosphor-icons/react";
import { AppIcon } from "@/components/ui/AppIcon";

export function CartItemCard({
  item,
  onQuantityChange,
  onRemove,
  available
}: {
  item: CartItem;
  onQuantityChange: (next: number) => void;
  onRemove: () => void;
  available: boolean;
}) {
  const lineTotal = item.priceCents * item.quantity;
  const isOutOfStock = !available;

  return (
    <div
      className={twMerge(
        "group rounded-3xl bg-slate-900/60 p-4 ring-1 ring-white/10 shadow-soft transition-all hover:-translate-y-0.5 hover:ring-brand-400/20",
        isOutOfStock ? "opacity-60 hover:-translate-y-0 hover:ring-white/10" : ""
      )}
    >
      <div className="flex items-start gap-4">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-white">{item.name}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {isOutOfStock ? (
                  <span className="rounded-2xl bg-white/5 px-2 py-0.5 text-xs font-semibold text-slate-200 ring-1 ring-white/10">
                    Нет в наличии
                  </span>
                ) : null}
                <div className={isOutOfStock ? "text-xs text-slate-500" : "text-xs text-slate-400"}>
                  Цена за штуку: {formatByn(item.priceCents)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <QuantityStepper
                value={item.quantity}
                min={1}
                max={20}
                onChange={onQuantityChange}
                disabled={isOutOfStock}
              />
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Сумма по позиции</div>
              <div className="text-sm font-extrabold text-white">{formatByn(lineTotal)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="ghost" size="sm" onClick={onRemove} type="button" className="rounded-2xl ring-1 ring-white/10 hover:ring-brand-400/30">
          <span className="inline-flex items-center gap-2">
            <AppIcon icon={TrashSimple} size="sm" strokeWidth={2.5} />
            Удалить
          </span>
        </Button>
      </div>
    </div>
  );
}

