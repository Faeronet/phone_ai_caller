"use client";

import * as React from "react";
import { ProductCard, type ProductView } from "@/components/ui/ProductCard";
import { useCartStore } from "@/store/cartStore";
import { OneClickOrderModal } from "@/components/orders/OrderCheckoutModal";
import { Container } from "@/components/layout/Container";
import { motion } from "framer-motion";
import { AppIcon } from "@/components/ui/AppIcon";
import { Sparkle } from "@phosphor-icons/react";

export default function ShopPage() {
  const addItem = useCartStore((s) => s.addItem);

  const [products, setProducts] = React.useState<ProductView[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [buyNowProductId, setBuyNowProductId] = React.useState<number | null>(null);

  const buyNowProduct = React.useMemo(
    () => (buyNowProductId ? products.find((p) => p.id === buyNowProductId) : null),
    [buyNowProductId, products]
  );

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Не удалось загрузить товары");
        const data = (await res.json()) as { products: ProductView[] };
        if (mounted) setProducts(data.products);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Ошибка");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="relative">
      <Container>
        <div className="pt-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="rounded-3xl bg-slate-900/60 p-6 ring-1 ring-white/10 shadow-soft"
          >
            <h1 className="flex items-center gap-3 text-2xl font-extrabold text-white">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/20 ring-1 ring-brand-400/25">
                <AppIcon icon={Sparkle} size="md" strokeWidth={2.5} className="text-brand-200" />
              </span>
              Магазин парфюмов
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Выберите аромат: добавьте в корзину или оформите заказ в один клик.
            </p>
          </motion.div>

          {loading ? (
            <div className="mt-8 text-sm text-slate-400">Загрузка товаров...</div>
          ) : error ? (
            <div className="mt-8 rounded-3xl bg-red-500/10 p-4 text-sm font-semibold text-red-200 ring-1 ring-red-500/20">
              {error}
            </div>
          ) : null}

          {loading || error ? null : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-8 rounded-3xl bg-slate-900/60 p-6 ring-1 ring-white/10 shadow-soft"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/20 ring-1 ring-brand-400/25">
                  <AppIcon icon={Sparkle} size="md" strokeWidth={2.5} className="text-brand-200" />
                </span>
                <h2 className="text-lg font-extrabold text-white">Каталог пока пуст</h2>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                Товары будут добавлены через админку. Следите за обновлениями!
              </p>
            </motion.div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {products.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: idx * 0.05 }}
                >
                  <ProductCard
                    product={p}
                    onAddToCart={(productId) => {
                      const prod = products.find((x) => x.id === productId);
                      if (!prod) return;
                      addItem(prod, 1);
                    }}
                    onBuyNow={(productId) => setBuyNowProductId(productId)}
                  />
                </motion.div>
              ))}
            </div>
          )}

          <OneClickOrderModal
            open={buyNowProductId !== null && !!buyNowProduct}
            onClose={() => setBuyNowProductId(null)}
            product={
              buyNowProduct ?? {
                id: 0,
                name: "",
                priceCents: 0,
                imageUrl: ""
              }
            }
          />
        </div>
      </Container>
    </div>
  );
}

