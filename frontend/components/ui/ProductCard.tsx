"use client";

import * as React from "react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { AppIcon } from "./AppIcon";
import { ArrowRight, PhoneCall, ShieldCheck, ShoppingCart, Sparkles } from "lucide-react";

export type ProductView = {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
};

export function ProductCard({
  product,
  onAddToCart,
  onBuyNow
}: {
  product: ProductView;
  onAddToCart: (productId: number) => void;
  onBuyNow: (productId: number) => void;
}) {
  return (
    <div className="group overflow-hidden rounded-3xl bg-slate-900/70 p-4 ring-1 ring-white/10 shadow-soft transition-all hover:-translate-y-0.5 hover:ring-brand-400/20">
      <div className="relative">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="pointer-events-none absolute left-3 top-3">
          <Badge>
            <span className="inline-flex items-center gap-2">
              <AppIcon icon={PhoneCall} size="sm" strokeWidth={2.5} />
              AI-обзвон подтверждает заказ
            </span>
          </Badge>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-bold text-white">{product.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-300">{product.description}</p>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-white">
            <span className="text-slate-400">Цена: </span>
            <span>{new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(product.priceCents / 100)}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => onAddToCart(product.id)}
            type="button"
            className="w-full"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <AppIcon icon={ShoppingCart} size="sm" />
              Добавить в корзину
            </span>
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => onBuyNow(product.id)}
            type="button"
            className="w-full"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <AppIcon icon={Sparkles} size="sm" strokeWidth={2.5} />
              Купить в 1 клик
              <AppIcon icon={ArrowRight} size="sm" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

