"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/ui/AppIcon";
import { ArrowRight, Bot, PhoneCall, Receipt, ShieldCheck, Sparkles, PackageCheck, ShoppingBag } from "lucide-react";

const devs = [
  { name: "Виктор", role: "PM" },
  { name: "Евгений", role: "Team Lead" },
  { name: "Андрей", role: "AI Engineer" },
  { name: "Дмитрий", role: "AI Engineer" }
];

export default function HomePage() {
  return (
    <div className="relative">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/3 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
      </div>

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-14 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 ring-1 ring-white/10">
              <AppIcon icon={Sparkles} size="sm" strokeWidth={2.5} className="text-brand-200" />
              <span className="text-sm font-semibold text-slate-200">Демо AI-обзвонщика для e-commerce</span>
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Phone <span className="font-script text-brand-200">AI</span> Caller
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              После оформления заказа AI-обзвонщик связывается с покупателем и помогает подтвердить заказ.
              Это демонстрация связки “AI + магазин + корзина + заказы”.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/shop">
                <Button size="lg" className="w-full sm:w-auto">
                  <span className="inline-flex items-center gap-2">
                    <AppIcon icon={ShoppingBag} size="sm" strokeWidth={2.5} />
                    Перейти в магазин
                    <AppIcon icon={ArrowRight} size="sm" />
                  </span>
                </Button>
              </Link>
              <Link href="/shop" className="text-sm font-semibold text-brand-300 hover:text-brand-200">
                Посмотреть товары
              </Link>
            </div>
          </motion.div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              { title: "Автоматизация подтверждения", desc: "Меньше ручной работы — больше точности.", icon: ShieldCheck },
              { title: "Быстрая обработка", desc: "Снижаем время от заказа до подтверждения.", icon: Receipt },
              { title: "Демо интеграции AI", desc: "Показывает полный цикл e-commerce.", icon: Bot }
            ].map((c, idx) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className="rounded-3xl bg-slate-900/60 p-5 ring-1 ring-white/10 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/20 ring-1 ring-brand-400/25">
                    <AppIcon icon={c.icon} size="sm" strokeWidth={2.5} className="text-brand-200" />
                  </span>
                  <h3 className="text-sm font-bold text-white">{c.title}</h3>
                </div>
                <p className="mt-2 text-sm text-slate-300">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-extrabold tracking-tight text-white"
          >
            Как это работает
          </motion.h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {[
              { step: "Покупатель оформляет заказ", icon: PackageCheck },
              { step: "Заказ сохраняется в системе", icon: Receipt },
              { step: "AI-обзвонщик связывается с клиентом", icon: PhoneCall },
              { step: "Клиент подтверждает заказ", icon: ShieldCheck }
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className="rounded-3xl bg-slate-900/60 p-5 ring-1 ring-white/10 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/25 ring-1 ring-brand-400/30">
                    <span className="text-sm font-extrabold text-brand-200">{i + 1}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <AppIcon icon={s.icon} size="sm" strokeWidth={2.5} className="text-brand-200" />
                      <h3 className="text-sm font-bold text-white truncate">{s.step}</h3>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-extrabold tracking-tight text-white"
          >
            Преимущества
          </motion.h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Автоматизация подтверждения заказов",
                desc: "AI звонит клиентам и помогает подтвердить заказ в нужный момент.",
                icon: Bot
              },
              { title: "Ускорение обработки заявок", desc: "Сокращаем время реакции и снижаем количество пропусков.", icon: Sparkles },
              { title: "Демонстрация интеграции AI и e-commerce", desc: "Показываем полный путь данных: UI → API → PostgreSQL → admin.", icon: ShieldCheck }
            ].map((p, idx) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                className="group relative overflow-hidden rounded-3xl bg-slate-900/60 p-6 ring-1 ring-white/10 shadow-soft"
              >
                <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-brand-600/20 blur-2xl" />
                  <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-indigo-500/15 blur-2xl" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600/20 ring-1 ring-brand-400/25">
                    <AppIcon icon={p.icon} size="sm" strokeWidth={2.5} className="text-brand-200" />
                  </span>
                  <h3 className="text-base font-bold text-white">{p.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-extrabold tracking-tight text-white"
          >
            Разработчики
          </motion.h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {devs.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="rounded-3xl bg-slate-900/60 p-6 ring-1 ring-white/10 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-white">{d.name}</span>
                  <span className="inline-flex items-center justify-center rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
                    <span className="text-xs font-extrabold text-brand-200 inline-flex items-center gap-2">
                      <AppIcon icon={Sparkles} size="sm" strokeWidth={2.5} />
                      {d.role}
                    </span>
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-300">Команда AI-направления</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

