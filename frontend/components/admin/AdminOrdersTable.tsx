"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { formatByn } from "@/lib/money";
import { AppIcon } from "@/components/ui/AppIcon";
import { BadgeCheck, CircleDashed, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/toast/ToastProvider";

type OrderItemView = {
  productNameSnapshot: string;
  quantity: number;
};

type OrderView = {
  id: number;
  customerName: string;
  phone: string;
  totalAmount: number;
  confirmationStatus: string;
  createdAt: string;
  items: OrderItemView[];
};

const statusLabels: Record<string, string> = {
  "неподтверждено": "неподтверждено",
  "подтверждено": "подтверждено"
};

export function AdminOrdersTable({ orders }: { orders: OrderView[] }) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = React.useState<number | null>(null);
  const [confirmId, setConfirmId] = React.useState<number | null>(null);
  const [deleteBusyId, setDeleteBusyId] = React.useState<number | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const { pushToast } = useToast();

  const confirmOrder = confirmId ? orders.find((o) => o.id === confirmId) ?? null : null;

  return (
    <>
      <div className="rounded-3xl bg-slate-900/60 ring-1 ring-white/10 shadow-soft">
        <div className="hidden lg:block">
          <table className="w-full table-fixed text-left text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 w-[86px] font-semibold text-slate-300">ID</th>
                <th className="px-4 py-3 w-[150px] font-semibold text-slate-300">Имя</th>
                <th className="px-4 py-3 w-[150px] font-semibold text-slate-300">Телефон</th>
                <th className="px-4 py-3 font-semibold text-slate-300">Товары</th>
                <th className="px-4 py-3 w-[90px] font-semibold text-slate-300">Кол-во</th>
                <th className="px-4 py-3 w-[120px] font-semibold text-slate-300">Итого</th>
                <th className="px-4 py-3 w-[220px] font-semibold text-slate-300">Статус</th>
                <th className="px-4 py-3 w-[170px] font-semibold text-slate-300">Дата</th>
                <th className="px-4 py-3 w-[132px] font-semibold text-slate-300">Удалить</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const totalQty = o.items.reduce((sum, i) => sum + i.quantity, 0);
                const itemsText = o.items.map((i) => `${i.productNameSnapshot} × ${i.quantity}`).join(", ");
                return (
                  <tr key={o.id} className="border-b border-white/5 align-top">
                    <td className="px-4 py-3 text-slate-200">
                      <div className="font-semibold text-white">#{o.id}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-200 break-words">{o.customerName}</td>
                    <td className="px-4 py-3 text-slate-200 break-all">{o.phone}</td>
                    <td className="px-4 py-3 text-slate-200 break-words">{itemsText}</td>
                    <td className="px-4 py-3 text-slate-200">{totalQty}</td>
                    <td className="px-4 py-3 font-extrabold text-white">{formatByn(o.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                          {o.confirmationStatus === "подтверждено" ? (
                            <AppIcon icon={BadgeCheck} size="sm" strokeWidth={2.5} className="text-brand-200" />
                          ) : (
                            <AppIcon icon={CircleDashed} size="sm" strokeWidth={2.5} className="text-brand-200" />
                          )}
                        </span>
                        <select
                          value={o.confirmationStatus}
                          onChange={async (e) => {
                            const next = e.target.value;
                            setUpdatingId(o.id);
                            try {
                              const res = await fetch(`/api/admin/orders/${o.id}/status`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ confirmationStatus: next })
                              });
                              if (!res.ok) throw new Error("Не удалось обновить статус");
                              router.refresh();
                            } catch {
                              // keep UI unchanged
                            } finally {
                              setUpdatingId(null);
                            }
                          }}
                          disabled={updatingId === o.id}
                          className="h-10 min-w-0 flex-1 rounded-2xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-brand-400/40 disabled:opacity-70"
                        >
                          {Object.keys(statusLabels).map((s) => (
                            <option key={s} value={s}>
                              {statusLabels[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-200">{new Date(o.createdAt).toLocaleString("ru-RU")}</td>
                    <td className="px-4 py-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setDeleteError(null);
                          setConfirmId(o.id);
                        }}
                        disabled={deleteBusyId === o.id}
                        className="gap-2 rounded-2xl bg-white/5 hover:bg-white/10"
                      >
                        <AppIcon icon={Trash2} size="sm" strokeWidth={2.5} />
                        Удалить
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-3 lg:hidden">
          {orders.map((o) => {
            const totalQty = o.items.reduce((sum, i) => sum + i.quantity, 0);
            const itemsText = o.items.map((i) => `${i.productNameSnapshot} × ${i.quantity}`).join(", ");
            return (
              <div key={o.id} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold text-white">Заказ #{o.id}</div>
                    <div className="mt-1 text-xs text-slate-400">{new Date(o.createdAt).toLocaleString("ru-RU")}</div>
                  </div>
                  <div className="text-sm font-extrabold text-white">{formatByn(o.totalAmount)}</div>
                </div>

                <div className="mt-3 space-y-2 text-sm text-slate-200">
                  <div className="break-words"><span className="text-slate-400">Имя:</span> {o.customerName}</div>
                  <div className="break-all"><span className="text-slate-400">Телефон:</span> {o.phone}</div>
                  <div className="break-words"><span className="text-slate-400">Товары:</span> {itemsText}</div>
                  <div><span className="text-slate-400">Количество:</span> {totalQty}</div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                      {o.confirmationStatus === "подтверждено" ? (
                        <AppIcon icon={BadgeCheck} size="sm" strokeWidth={2.5} className="text-brand-200" />
                      ) : (
                        <AppIcon icon={CircleDashed} size="sm" strokeWidth={2.5} className="text-brand-200" />
                      )}
                    </span>
                    <select
                      value={o.confirmationStatus}
                      onChange={async (e) => {
                        const next = e.target.value;
                        setUpdatingId(o.id);
                        try {
                          const res = await fetch(`/api/admin/orders/${o.id}/status`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ confirmationStatus: next })
                          });
                          if (!res.ok) throw new Error("Не удалось обновить статус");
                          router.refresh();
                        } catch {
                          // keep UI unchanged
                        } finally {
                          setUpdatingId(null);
                        }
                      }}
                      disabled={updatingId === o.id}
                      className="h-10 min-w-0 flex-1 rounded-2xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-brand-400/40 disabled:opacity-70"
                    >
                      {Object.keys(statusLabels).map((s) => (
                        <option key={s} value={s}>
                          {statusLabels[s]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setDeleteError(null);
                      setConfirmId(o.id);
                    }}
                    disabled={deleteBusyId === o.id}
                    className="gap-2 rounded-2xl bg-white/5 hover:bg-white/10 sm:w-auto"
                  >
                    <AppIcon icon={Trash2} size="sm" strokeWidth={2.5} />
                    Удалить
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        open={confirmId !== null}
        title="Удаление заказа"
        onClose={() => {
          setDeleteError(null);
          setConfirmId(null);
        }}
      >
        {confirmOrder ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Удалить заказ <span className="font-semibold text-white">#{confirmOrder.id}</span>? После удаления он исчезнет из списка.
            </p>

            {deleteError ? (
              <div className="rounded-2xl bg-red-500/10 p-3 text-sm font-semibold text-red-200 ring-1 ring-red-500/20">
                {deleteError}
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setDeleteError(null);
                  setConfirmId(null);
                }}
                className="flex-1 rounded-2xl"
              >
                Отмена
              </Button>

              <Button
                variant="primary"
                disabled={deleteBusyId === confirmId}
                onClick={async () => {
                  if (!confirmId) return;
                  setDeleteBusyId(confirmId);
                  setDeleteError(null);
                  try {
                    const res = await fetch(`/api/admin/orders/${confirmId}`, { method: "DELETE" });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) throw new Error(data?.message || "Не удалось удалить заказ");

                    setConfirmId(null);
                    pushToast("Заказ удалён", 3000);
                    router.refresh();
                  } catch (e) {
                    setDeleteError(e instanceof Error ? e.message : "Не удалось удалить заказ");
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
    </>
  );
}

