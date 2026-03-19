"use client";

import * as React from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ProductView } from "@/components/ui/ProductCard";

export type CartItem = {
  productId: number;
  name: string;
  priceCents: number;
  imageUrl: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (product: ProductView, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          const nextItems = existing
            ? state.items.map((i) =>
                i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
              )
            : [...state.items, { productId: product.id, name: product.name, priceCents: product.priceCents, imageUrl: product.imageUrl, quantity }];
          return { items: nextItems };
        });
      },
      setQuantity: (productId, quantity) => {
        set((state) => {
          const q = Math.max(1, Math.floor(quantity));
          const nextItems = state.items.map((i) => (i.productId === productId ? { ...i, quantity: q } : i));
          return { items: nextItems };
        });
      },
      removeItem: (productId) => {
        set((state) => {
          const nextItems = state.items.filter((i) => i.productId !== productId);
          return { items: nextItems };
        });
      },
      clear: () => set({ items: [] })
    }),
    {
      name: "phone-ai-caller-cart",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          // Zustand storage must be defined; on SSR we fallback to a no-op storage.
          return {
            length: 0,
            clear: () => {},
            key: () => null,
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {}
          } as unknown as Storage;
        }
        return window.localStorage;
      }),
      partialize: (state) => ({ items: state.items })
    }
  )
);

export function useCartTotals() {
  const items = useCartStore((s) => s.items);
  return React.useMemo(() => {
    const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalAmountCents = items.reduce((sum, i) => sum + i.quantity * i.priceCents, 0);
    return { totalQuantity, totalAmountCents };
  }, [items]);
}

