"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-200 bg-white">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-ink-50/70"
              aria-expanded={isOpen}
            >
              <span className="text-[15px] font-bold text-ink-900">{item.q}</span>
              <span
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink-100 text-ink-600 transition",
                  isOpen && "rotate-45 bg-brand-600 text-white",
                )}
                aria-hidden
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            {isOpen && (
              <p className="whitespace-pre-line px-5 pb-6 text-[14.5px] leading-relaxed text-ink-500">{item.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
