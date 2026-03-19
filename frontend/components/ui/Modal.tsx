"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { AppIcon } from "./AppIcon";

export function Modal({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const overlayRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          ref={overlayRef}
          aria-modal="true"
          role="dialog"
          onMouseDown={(e) => {
            if (e.target === overlayRef.current) onClose();
          }}
        >
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" />
          <motion.div
            className="relative w-full max-h-[calc(100vh-2rem)] max-w-lg overflow-y-auto rounded-3xl bg-slate-900/95 p-5 ring-1 ring-white/10 shadow-soft"
            initial={{ scale: 0.98, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 8, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-4">
              {title ? <h3 className="text-lg font-bold text-white">{title}</h3> : null}
              <button
                type="button"
                aria-label="Закрыть"
                onClick={onClose}
                className="rounded-2xl p-2 text-slate-200 ring-1 ring-white/10 hover:bg-white/5 hover:ring-brand-400/30 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
              >
                <AppIcon icon={X} size="sm" />
              </button>
            </div>
            <div className="mt-3">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

