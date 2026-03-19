"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Table, Th, Td } from "@/components/ui/Table";
import { formatRub } from "@/lib/money";
import { AppIcon } from "@/components/ui/AppIcon";
import { BadgeCheck, CircleDashed } from "lucide-react";

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

  return (
    <Table>
      <thead>
        <tr className="border-b border-white/10">
          <Th>ID заказа</Th>
          <Th>Имя</Th>
          <Th>Телефон</Th>
          <Th>Товары</Th>
          <Th>Количество</Th>
          <Th>Итого</Th>
          <Th>Статус</Th>
          <Th>Дата</Th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => {
          const totalQty = o.items.reduce((sum, i) => sum + i.quantity, 0);
          const itemsText = o.items.map((i) => `${i.productNameSnapshot} × ${i.quantity}`).join(", ");
          return (
            <tr key={o.id} className="border-b border-white/5">
              <Td>
                <div className="font-semibold text-white">#{o.id}</div>
              </Td>
              <Td>{o.customerName}</Td>
              <Td>{o.phone}</Td>
              <Td className="max-w-[260px] break-words">{itemsText}</Td>
              <Td>{totalQty}</Td>
              <Td className="font-extrabold text-white">{formatRub(o.totalAmount)}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
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
                    className="h-10 flex-1 rounded-2xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-brand-400/40 disabled:opacity-70"
                  >
                    {Object.keys(statusLabels).map((s) => (
                      <option key={s} value={s}>
                        {statusLabels[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </Td>
              <Td>{new Date(o.createdAt).toLocaleString("ru-RU")}</Td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

