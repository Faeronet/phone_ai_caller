"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/ui/AppIcon";
import { Eye, EyeSlash, Key, Lock } from "@phosphor-icons/react";

const schema = z.object({
  key: z.string().min(1, "Ключ обязателен")
});

type Values = z.infer<typeof schema>;

export function AdminUnlockForm({ onUnlocked }: { onUnlocked?: () => void }) {
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showKey, setShowKey] = React.useState(false);

  const { register, handleSubmit, formState, reset } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { key: "" }
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl bg-slate-900/60 p-6 ring-1 ring-white/10 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/20 ring-1 ring-brand-400/25">
            <AppIcon icon={Lock} size="md" strokeWidth={2.5} className="text-brand-200" />
          </span>
          <h1 className="text-2xl font-extrabold text-white">Админка</h1>
        </div>
        <p className="mt-2 text-sm text-slate-300">
          Введите секретный ключ для доступа к заказам и товарам.
        </p>

        <form
          className="mt-5 space-y-4"
          onSubmit={handleSubmit(async (values) => {
            setLoading(true);
            setError(null);
            try {
              const res = await fetch("/api/admin/unlock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: values.key })
              });

              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.message || "Неверный ключ");
              }

              reset();
              onUnlocked?.();
              // Reload to re-check cookie on server.
              window.location.reload();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Ошибка");
            } finally {
              setLoading(false);
            }
          })}
        >
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-200" htmlFor="key">
              <span className="inline-flex items-center gap-2">
                <AppIcon icon={Key} size="sm" strokeWidth={2.5} className="text-brand-200" />
                Secret key
              </span>
            </label>
            <div className="relative">
              <input
                id="key"
                type={showKey ? "text" : "password"}
                className="h-11 w-full rounded-2xl bg-white/5 px-3 pr-11 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-slate-500 focus:ring-brand-400/40 disabled:opacity-70"
                placeholder="Введите ключ"
                {...register("key")}
                disabled={loading}
              />
              <button
                type="button"
                aria-label={showKey ? "Скрыть ключ" : "Показать ключ"}
                className="absolute inset-y-0 right-2 flex items-center rounded-2xl p-2 text-slate-300 ring-1 ring-white/10 hover:bg-white/5"
                onClick={() => setShowKey((v) => !v)}
                disabled={loading}
              >
                <AppIcon icon={showKey ? EyeSlash : Eye} size="sm" />
              </button>
            </div>
            {formState.errors.key ? <p className="text-xs font-semibold text-red-300">{formState.errors.key.message}</p> : null}
          </div>

          {error ? (
            <div className="rounded-2xl bg-red-500/10 p-3 text-sm font-semibold text-red-200 ring-1 ring-red-500/20">
              {error}
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Проверяем..." : "Открыть админку"}
          </Button>
        </form>
      </div>
    </div>
  );
}

