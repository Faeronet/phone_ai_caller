"use client";

import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { useCartStore, useCartTotals } from "@/store/cartStore";
import { CartCheckoutModal } from "@/components/orders/OrderCheckoutModal";
import { Button } from "@/components/ui/Button";
import { formatRub } from "@/lib/money";
import { AppIcon } from "@/components/ui/AppIcon";
import { ArrowRight, CheckCircle2, Receipt, ShoppingCart, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const { totalQuantity, totalAmountCents } = useCartTotals();
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

  const [checkoutOpen, setCheckoutOpen] = React.useState(false);

  const lineItems = React.useMemo(() => items.map((i) => ({ productId: i.productId, quantity: i.quantity })), [items]);

  return (
    <div className="relative">
      <Container>
        <div className="pt-10">
          <div className="rounded-3xl bg-slate-900/60 p-6 ring-1 ring-white/10 shadow-soft">
            <h1 className="flex items-center gap-3 text-2xl font-extrabold text-white">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/20 ring-1 ring-brand-400/25">
                <AppIcon icon={ShoppingCart} size="md" strokeWidth={2.5} className="text-brand-200" />
              </span>
              Корзина
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              {totalQuantity > 0 ? `Всего товаров: ${totalQuantity}` : "Вы пока не добавили товары"}
            </p>
          </div>

          {items.length === 0 ? (
            <div className="mt-10 rounded-3xl bg-slate-900/60 p-7 ring-1 ring-white/10 shadow-soft">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <AppIcon icon={ShoppingBag} size="sm" strokeWidth={2.5} className="text-brand-200" />
                Корзина пуста
              </div>
              <div className="mt-2 text-sm text-slate-300">Добавьте парфюм из магазина, чтобы оформить заказ.</div>
              <div className="mt-6">
                <Link href="/shop">
                  <Button variant="primary" size="md">
                    <span className="inline-flex items-center gap-2">
                      Перейти в магазин
                      <AppIcon icon={ArrowRight} size="sm" />
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItemCard
                    key={item.productId}
                    item={item}
                    onQuantityChange={(next) => setQuantity(item.productId, next)}
                    onRemove={() => removeItem(item.productId)}
                  />
                ))}
              </div>

              <aside className="h-fit rounded-3xl bg-slate-900/60 p-5 ring-1 ring-white/10 shadow-soft">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-sm text-slate-300">
                    <AppIcon icon={Receipt} size="sm" strokeWidth={2.5} className="text-brand-200" />
                    Итого
                  </div>
                  <div className="text-lg font-extrabold text-white">{formatRub(totalAmountCents)}</div>
                </div>
                <div className="mt-2 text-xs text-slate-400">Стоимость отображается из базы/seed (в демонстрации).</div>

                <button
                  type="button"
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-brand-600 text-base font-semibold text-white shadow-[0_0_40px_rgba(99,102,241,0.25)] hover:bg-brand-500 transition-all ring-1 ring-white/10"
                  onClick={() => setCheckoutOpen(true)}
                >
                  <span className="inline-flex items-center gap-2">
                    Оформить заказ
                    <AppIcon icon={CheckCircle2} size="sm" strokeWidth={2.5} />
                  </span>
                </button>

                <button
                  type="button"
                  className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-2xl bg-white/5 text-sm font-semibold text-slate-100 ring-1 ring-white/10 hover:bg-white/10 hover:ring-white/15 transition-all"
                  onClick={() => clear()}
                >
                  Очистить корзину
                </button>
              </aside>
            </div>
          )}
        </div>
      </Container>

      <CartCheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={lineItems}
        cartTotalCents={totalAmountCents}
        onSuccess={() => {
          clear();
        }}
      />
    </div>
  );
}

