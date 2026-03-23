"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PhoneCall, Sparkle } from "@phosphor-icons/react";
import { AppIcon } from "@/components/ui/AppIcon";

type Toast = {
  id: string;
  message: string;
};

const ToastContext = React.createContext<{
  pushToast: (message: string, durationMs?: number) => void;
} | null>(null);

const TOAST_DURATION_MS = 60_000;

function useStableId() {
  const ref = React.useRef(0);
  return React.useCallback(() => {
    ref.current += 1;
    return String(ref.current);
  }, []);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const makeId = useStableId();

  const pushToast = React.useCallback((message: string, durationMs?: number) => {
    const id = makeId();
    setToasts((prev) => [...prev, { id, message }]);

    const ttl = typeof durationMs === "number" && durationMs > 0 ? durationMs : TOAST_DURATION_MS;
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, ttl);
  }, [makeId]);

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}

      <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex w-full max-w-md flex-col items-end gap-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className="pointer-events-auto w-full rounded-3xl bg-slate-900/95 p-4 ring-1 ring-white/10 shadow-soft"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/20 ring-1 ring-brand-400/25">
                  <AppIcon icon={PhoneCall} size="sm" strokeWidth={2.5} className="text-brand-200" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Подтверждение</span>
                    <AppIcon icon={Sparkle} size="sm" strokeWidth={2.5} className="text-brand-200" />
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{t.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

