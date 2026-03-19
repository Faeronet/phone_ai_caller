"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { rubToCentsFromInput } from "@/lib/money";
import { AppIcon } from "@/components/ui/AppIcon";
import { Plus, Sparkles } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Название обязательно"),
  description: z.string().min(1, "Описание обязательно"),
  priceRub: z
    .string()
    .min(1, "Цена обязательна")
    .refine((v) => {
      const cents = rubToCentsFromInput(v);
      return cents !== null && cents > 0;
    }, "Цена должна быть больше 0"),
  image: z
    .any()
    .refine((v) => v instanceof FileList && v.length > 0, "Изображение обязательно")
});

type Values = z.infer<typeof schema>;

export function AdminProductForm() {
  const router = useRouter();
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const { register, handleSubmit, reset, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", priceRub: "", image: new DataTransfer().files }
  });

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="rounded-3xl bg-slate-900/60 p-6 ring-1 ring-white/10 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/20 ring-1 ring-brand-400/25">
          <AppIcon icon={Plus} size="md" strokeWidth={2.5} className="text-brand-200" />
        </span>
        <h2 className="text-lg font-extrabold text-white">Создать товар</h2>
      </div>
      <p className="mt-2 text-sm text-slate-300">Новые товары появятся в магазине после создания.</p>

      <form
        className="mt-5 space-y-4"
        onSubmit={handleSubmit(async (values) => {
          setStatus("loading");
          setError(null);
          try {
            const priceCents = rubToCentsFromInput(values.priceRub);
            if (!priceCents) throw new Error("Некорректная цена");

            const files = values.image as unknown as FileList;
            const imageFile = files?.[0];
            if (!imageFile) throw new Error("Изображение обязательно");

            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("description", values.description);
            formData.append("priceCents", String(priceCents));
            formData.append("image", imageFile);

            const res = await fetch("/api/admin/products", {
              method: "POST",
              body: formData
            });

            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data?.message || "Не удалось создать товар");
            }

            reset();
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
            setStatus("success");
            setTimeout(() => {
              setStatus("idle");
              router.refresh();
            }, 700);
          } catch (e) {
            setStatus("error");
            setError(e instanceof Error ? e.message : "Ошибка");
          }
        })}
      >
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-200">Название</label>
          <input
            className="h-11 w-full rounded-2xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-slate-500 focus:ring-brand-400/40"
            placeholder="Например, Citrus Bloom"
            {...register("name")}
            disabled={status === "loading"}
          />
          {formState.errors.name ? <p className="text-xs font-semibold text-red-300">{formState.errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-200">Описание</label>
          <textarea
            className="min-h-[96px] w-full resize-y rounded-2xl bg-white/5 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-slate-500 focus:ring-brand-400/40"
            placeholder="Короткое, но продающее описание"
            {...register("description")}
            disabled={status === "loading"}
          />
          {formState.errors.description ? (
            <p className="text-xs font-semibold text-red-300">{formState.errors.description.message}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-200">Цена (руб.)</label>
            <input
              className="h-11 w-full rounded-2xl bg-white/5 px-3 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-slate-500 focus:ring-brand-400/40"
              placeholder="Например, 1990"
              {...register("priceRub")}
              disabled={status === "loading"}
            />
            {formState.errors.priceRub ? (
              <p className="text-xs font-semibold text-red-300">{formState.errors.priceRub.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-200">Изображение</label>
            <input
              type="file"
              accept="image/*"
              className="block w-full cursor-pointer rounded-2xl bg-white/5 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 file:mr-4 file:rounded-2xl file:border-0 file:bg-brand-600/20 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-100 hover:file:bg-brand-600/30"
              disabled={status === "loading"}
              {...register("image")}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(URL.createObjectURL(f));
              }}
            />
            {formState.errors.image ? <p className="text-xs font-semibold text-red-300">{formState.errors.image.message as string}</p> : null}
          </div>
        </div>

        {previewUrl ? (
          <div className="mt-3 overflow-hidden rounded-3xl ring-1 ring-white/10 bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="h-28 w-full object-cover" />
          </div>
        ) : null}

        {status === "success" ? (
          <div className="rounded-2xl bg-brand-600/10 p-3 text-sm font-semibold text-brand-100 ring-1 ring-brand-400/20">
            <span className="inline-flex items-center gap-2">
              <AppIcon icon={Sparkles} size="sm" strokeWidth={2.5} className="text-brand-200" />
              Товар создан!
            </span>
          </div>
        ) : null}

        {status === "error" && error ? (
          <div className="rounded-2xl bg-red-500/10 p-3 text-sm font-semibold text-red-200 ring-1 ring-red-500/20">{error}</div>
        ) : null}

        <Button type="submit" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? (
            "Создаём..."
          ) : (
            <span className="inline-flex items-center gap-2">
              <AppIcon icon={Plus} size="sm" strokeWidth={2.5} />
              Создать товар
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}

