"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export function DashNav({ items }: { items: { href: string; label: string; icon: string }[] }) {
  const pathname = usePathname();
  return (
    <nav className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto md:mx-0 md:flex-col">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/my" && item.href !== "/partner" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[14px] font-semibold transition",
              active ? "bg-brand-600 text-white shadow-soft" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
            )}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
