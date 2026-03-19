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

  const label = React.useMemo(() => {
    if (pathname?.startsWith("/shop")) return "Phone AI Caller • Shop";
    if (pathname?.startsWith("/cart")) return "Phone AI Caller • Cart";
    if (pathname?.startsWith("/admin")) return "Phone AI Caller • Admin";
    return "Phone AI Caller";
  }, [pathname]);

  return (
    <header
      className={twMerge(
        "fixed left-0 right-0 top-0 z-50 h-16 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl",
        className
      )}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-base font-extrabold tracking-tight text-white">
          <span className="inline-flex items-center gap-2">
            <AppIcon icon={PhoneCall} size="sm" strokeWidth={2.5} className="text-brand-200" />
            {label}
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {pathname?.startsWith("/shop") || pathname?.startsWith("/cart") || pathname?.startsWith("/admin") ? (
            <Link href="/cart" className="group">
              <Button variant="secondary" className="h-10">
                <span className="inline-flex items-center gap-2">
                  <AppIcon icon={ShoppingCart} size="sm" strokeWidth={2.5} />
                  Корзина
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

