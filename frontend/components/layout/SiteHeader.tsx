"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "../ui/Button";
import { useCartTotals } from "@/store/cartStore";
import { AppIcon } from "@/components/ui/AppIcon";
import { PhoneCall, ShoppingBag, ShoppingCart } from "lucide-react";

function CartCountPill({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white ring-1 ring-white/10">
      {count}
    </span>
  );
}

export function SiteHeader({ className }: { className?: string }) {
  const pathname = usePathname();
  const { totalQuantity: cartCount } = useCartTotals();

  const isShop = pathname?.startsWith("/shop");
  const isCart = pathname?.startsWith("/cart");
  const isAdmin = pathname?.startsWith("/admin");

  const showShopButton = isAdmin || isCart;

  const label = React.useMemo(() => {
    if (isShop) return "Phone AI Caller • Shop";
    if (isCart) return "Phone AI Caller • Cart";
    if (isAdmin) return "Phone AI Caller • Admin";
    return "Phone AI Caller";
  }, [isShop, isCart, isAdmin]);

  return (
    <header
      className={twMerge(
        "fixed left-0 right-0 top-0 z-50 h-16 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl",
        className
      )}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="max-w-[60vw] truncate text-base font-extrabold tracking-tight text-white sm:max-w-none"
          >
            <span className="inline-flex items-center gap-2">
              <AppIcon icon={PhoneCall} size="sm" strokeWidth={2.5} className="text-brand-200" />
              {label}
            </span>
          </Link>

          {showShopButton ? (
            <Link href="/shop" className="group">
              <Button variant="secondary" className="h-10 gap-2 px-3">
                <span className="inline-flex items-center gap-2">
                  <AppIcon icon={ShoppingBag} size="sm" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Магазин</span>
                </span>
              </Button>
            </Link>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {isShop || isCart || isAdmin ? (
            <Link href="/cart" className="group">
              <Button variant="secondary" className="h-10">
                <span className="inline-flex items-center gap-2">
                  <AppIcon icon={ShoppingCart} size="sm" strokeWidth={2.5} />
                  <span className="hidden sm:inline-flex">Корзина</span>
                </span>
                <CartCountPill count={cartCount} />
              </Button>
            </Link>
          ) : (
            <Link href="/shop">
              <Button variant="primary" className="h-10">
                <span className="inline-flex items-center gap-2">
                  <AppIcon icon={ShoppingBag} size="sm" strokeWidth={2.5} />
                  Перейти в магазин
                </span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

