"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { formatRub } from "@/lib/money";
import { AppIcon } from "@/components/ui/AppIcon";
import { CheckCircle2, Phone, User, Package } from "lucide-react";

const phoneRegex = /^[0-9+()\\s-]{7,}$/;

const baseSchema = z.object({
  customerName: z.string().min(1, "Имя обязательно"),
  phone: z.string().min(1, "Телефон обязателен").regex(phoneRegex, "Проверьте номер телефона")
});

type BaseValues = z.infer<typeof baseSchema>;

type LineItem = { productId: number; quantity: number };

export function OneClickOrderModal({
  open,
  onClose,
  product,
  defaultQuantity = 1,
  onSuccess
}: {
  open: boolean;
  onClose: () => void;
  product: { id: number; name: string; priceCents: number; imageUrl: string };
  defaultQuantity?: number;
  onSuccess?: (orderId: number) => void;
}) {
  const schema = baseSchema.extend({
    quantity: z.number().min(1, "Количество должно быть минимум 1")
  });

  const [quantity, setQuantity] = React.useState(defaultQuantity);
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: "",
      phone: "",
      quantity: defaultQuantity
    }
  });

  React.useEffect(() => {
    if (!open) return;
    setQuantity(defaultQuantity);
    reset({ customerName: "", phone: "", quantity: defaultQuantity });
    setStatus("idle");
    setErrorMessage(null);
  }, [open, defaultQuantity, reset]);

  const items: LineItem[] = React.useMemo(() => [{ productId: product.id, quantity }], [product.id, quantity]);
  const totalCents = product.priceCents * quantity;

  return (
    <Modal open={open} onClose={onClose} title="Оформление заказа">
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          setStatus("loading");
          setErrorMessage(null);

          try {
            const res = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                customerName: values.customerName,
                phone: values.phone,
                items
              })
            });

            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data?.message || "Не удалось оформить заказ");
            }

            const data = (await res.json()) as { orderId: number };
            setStatus("success");
            onSuccess?.(data.orderId);
            // Leave success visible briefly.
            setTimeout(() => onClose(), 900);
          } catch (e) {
            setStatus("error");
            setErrorMessage(e instanceof Error ? e.message : "Неизвестная ошибка");
          }
        })}
      >
        {status === "success" ? (
          <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/25 ring-1 ring-brand-400/30">
                <AppIcon icon={CheckCircle2} size="md" strokeWidth={2.5} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Заказ оформлен</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Мы свяжемся с вами, чтобы подтвердить заказ. Статус: <span className="font-semibold text-slate-200">неподтверждено</span>.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-3xl bg-slate-900/60 p-4 ring-1 ring-white/10">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageUrl} alt={product.name} className="h-14 w-14 rounded-2xl object-cover" />
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-white">{product.name}</div>
              <div className="mt-1 text-sm text-slate-300">Итого: {formatRub(totalCents)}</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-200" htmlFor="customerName">
            <span className="inline-flex items-center gap-2">
              <AppIcon icon={User} size="sm" strokeWidth={2.5} className="text-brand-200" />
              Имя
            </span>
          </label>
          <input
            id="customerName"
            className="h-11 w-full rounded-2xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-slate-500 focus:ring-brand-400/40"
            placeholder="Как к вам обращаться?"
            {...register("customerName")}
            disabled={status === "loading"}
          />
          {formState.errors.customerName ? (
            <p className="text-xs font-semibold text-red-300">{formState.errors.customerName.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-200" htmlFor="phone">
            <span className="inline-flex items-center gap-2">
              <AppIcon icon={Phone} size="sm" strokeWidth={2.5} className="text-brand-200" />
              Номер телефона
            </span>
          </label>
          <input
            id="phone"
            className="h-11 w-full rounded-2xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-slate-500 focus:ring-brand-400/40"
            placeholder="+7 (999) 123-45-67"
            {...register("phone")}
            disabled={status === "loading"}
          />
          {formState.errors.phone ? (
            <p className="text-xs font-semibold text-red-300">{formState.errors.phone.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-200" htmlFor="quantity">
            <span className="inline-flex items-center gap-2">
              <AppIcon icon={Package} size="sm" strokeWidth={2.5} className="text-brand-200" />
              Количество
            </span>
          </label>
          <div className="pt-1">
            <QuantityStepper
              value={quantity}
              min={1}
              max={20}
              onChange={(next) => {
                setQuantity(next);
                setValue("quantity", next, { shouldValidate: true });
              }}
            />
          </div>
          {/** Hidden field to satisfy zod */}
          <input type="hidden" id="quantity" {...register("quantity", { valueAsNumber: true })} value={quantity} />
          {formState.errors.quantity ? (
            <p className="text-xs font-semibold text-red-300">{formState.errors.quantity.message}</p>
          ) : null}
        </div>

        {status === "error" && errorMessage ? (
          <div className="rounded-2xl bg-red-500/10 p-3 text-sm font-semibold text-red-200 ring-1 ring-red-500/20">
            {errorMessage}
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? "Оформляем..." : "Оформить заказ"}
        </Button>
      </form>
    </Modal>
  );
}

export function CartCheckoutModal({
  open,
  onClose,
  items,
  cartTotalCents,
  onSuccess
}: {
  open: boolean;
  onClose: () => void;
  items: LineItem[];
  cartTotalCents: number;
  onSuccess?: (orderId: number) => void;
}) {
  const schema = baseSchema;
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const { register, handleSubmit, reset, formState } = useForm<BaseValues>({
    resolver: zodResolver(schema),
    defaultValues: { customerName: "", phone: "" }
  });

  React.useEffect(() => {
    if (!open) return;
    reset({ customerName: "", phone: "" });
    setStatus("idle");
    setErrorMessage(null);
  }, [open, reset]);

  return (
    <Modal open={open} onClose={onClose} title="Оформление заказа">
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          setStatus("loading");
          setErrorMessage(null);
          try {
            const res = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                customerName: values.customerName,
                phone: values.phone,
                items
              })
            });

            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data?.message || "Не удалось оформить заказ");
            }

            const data = (await res.json()) as { orderId: number };
            setStatus("success");
            onSuccess?.(data.orderId);
            setTimeout(() => onClose(), 900);
          } catch (e) {
            setStatus("error");
            setErrorMessage(e instanceof Error ? e.message : "Неизвестная ошибка");
          }
        })}
      >
        {status === "success" ? (
          <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/25 ring-1 ring-brand-400/30">
                <AppIcon icon={CheckCircle2} size="md" strokeWidth={2.5} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Заказ оформлен</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Мы перезвоним и подтвердим заказ. Статус: <span className="font-semibold text-slate-200">неподтверждено</span>.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-3xl bg-slate-900/60 p-4 ring-1 ring-white/10">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-bold text-white">Сумма к оплате</div>
            <div className="text-sm font-extrabold text-white">{formatRub(cartTotalCents)}</div>
          </div>
          <div className="mt-2 text-xs text-slate-400">Количество берётся из корзины автоматически.</div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-200" htmlFor="customerName">
            <span className="inline-flex items-center gap-2">
              <AppIcon icon={User} size="sm" strokeWidth={2.5} className="text-brand-200" />
              Имя
            </span>
          </label>
          <input
            id="customerName"
            className="h-11 w-full rounded-2xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-slate-500 focus:ring-brand-400/40"
            placeholder="Как к вам обращаться?"
            {...register("customerName")}
            disabled={status === "loading"}
          />
          {formState.errors.customerName ? (
            <p className="text-xs font-semibold text-red-300">{formState.errors.customerName.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-200" htmlFor="phone">
            <span className="inline-flex items-center gap-2">
              <AppIcon icon={Phone} size="sm" strokeWidth={2.5} className="text-brand-200" />
              Номер телефона
            </span>
          </label>
          <input
            id="phone"
            className="h-11 w-full rounded-2xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-slate-500 focus:ring-brand-400/40"
            placeholder="+7 (999) 123-45-67"
            {...register("phone")}
            disabled={status === "loading"}
          />
          {formState.errors.phone ? (
            <p className="text-xs font-semibold text-red-300">{formState.errors.phone.message}</p>
          ) : null}
        </div>

        {status === "error" && errorMessage ? (
          <div className="rounded-2xl bg-red-500/10 p-3 text-sm font-semibold text-red-200 ring-1 ring-red-500/20">
            {errorMessage}
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? "Оформляем..." : "Оформить заказ"}
        </Button>
      </form>
    </Modal>
  );
}

