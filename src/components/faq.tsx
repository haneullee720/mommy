"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icons";

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="border-t border-ink-100">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-ink-100">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
              aria-expanded={isOpen}
            >
              <span className={cn("text-[16px] font-semibold transition-colors", isOpen ? "text-ink-900" : "text-ink-700")}>
                {item.q}
              </span>
              <Icon
                name="chevronDown"
                className={cn("h-4 w-4 shrink-0 text-ink-400 transition-transform duration-200", isOpen && "rotate-180")}
              />
            </button>
            {isOpen && (
              <p className="whitespace-pre-line pb-7 pr-10 text-[14.5px] leading-[1.8] text-ink-500">{item.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
