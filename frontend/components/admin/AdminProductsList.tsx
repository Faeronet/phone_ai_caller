"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AppIcon } from "@/components/ui/AppIcon";
import { formatRub } from "@/lib/money";

type AdminProduct = {
  id: number;
  name: string;
  priceCents: number;
  imageUrl: string;
  createdAt: string;
};

export function AdminProductsList() {
  const [products, setProducts] = React.useState<AdminProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [confirmId, setConfirmId] = React.useState<number | null>(null);
  const [deleteBusyId, setDeleteBusyId] = React.useState<number | null>(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/products");
      const data = (await res.json().catch(() => ({}))) as { products?: AdminProduct[] };
      if (!res.ok) throw new Error(data ? "Не удалось загрузить товары" : "Не удалось загрузить товары");
      setProducts(data.products ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const confirmProduct = confirmId ? products.find((p) => p.id === confirmId) ?? null : null;

  return (
    <div className="rounded-3xl bg-slate-900/60 p-6 ring-1 ring-white/10 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-extrabold text-white">Товары</h2>
        {products.length ? (
          <span className="text-sm font-semibold text-slate-300">Всего: {products.length}</span>
        ) : null}
      </div>

      <p className="mt-1 text-sm text-slate-300">
        {loading ? "Загрузка..." : products.length ? "Управляйте карточками товаров" : "Каталог пока пуст — добавьте товары через форму выше"}
      </p>

      {error ? (
        <div className="mt-4 rounded-2xl bg-red-500/10 p-3 text-sm font-semibold text-red-200 ring-1 ring-red-500/20">{error}</div>
      ) : null}

      <div className="mt-5 space-y-3">
        {loading ? null : products.length ? (
          products.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl} alt={p.name} className="h-14 w-14 rounded-2xl object-cover ring-1 ring-white/10" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-white">{p.name}</div>
                <div className="mt-1 text-xs text-slate-300">{formatRub(p.priceCents)}</div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {p.createdAt ? new Date(p.createdAt).toLocaleString("ru-RU") : ""}
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmId(p.id)}
                disabled={deleteBusyId === p.id}
                className="gap-2 rounded-2xl bg-white/5 hover:bg-white/10"
              >
                <AppIcon icon={Trash2} size="sm" strokeWidth={2.5} />
                Удалить
              </Button>
            </div>
          ))
        ) : (
          <div className="mt-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 text-sm text-slate-300">
            Товары пока не добавлены. Используйте админку для создания карточек.
          </div>
        )}
      </div>

      <Modal
        open={confirmId !== null}
        title="Удаление товара"
        onClose={() => setConfirmId(null)}
      >
        {confirmProduct ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Удалить <span className="font-semibold text-white">{confirmProduct.name}</span>? Файл изображения будет удалён на сервере (best-effort).
            </p>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => setConfirmId(null)} className="flex-1 rounded-2xl">
                Отмена
              </Button>
              <Button
                variant="primary"
                disabled={deleteBusyId === confirmId}
                onClick={async () => {
                  if (!confirmId) return;
                  setDeleteBusyId(confirmId);
                  try {
                    const res = await fetch(`/api/admin/products/${confirmId}`, { method: "DELETE" });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) throw new Error(data?.message || "Не удалось удалить товар");
                    setConfirmId(null);
                    await load();
                  } catch (e) {
                    // Keep modal open to allow retry.
                  } finally {
                    setDeleteBusyId(null);
                  }
                }}
                className="flex-1 rounded-2xl"
              >
                {deleteBusyId === confirmId ? "Удаляем..." : "Удалить"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

