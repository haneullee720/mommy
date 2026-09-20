"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icons";

export function DashNav({ items }: { items: readonly { readonly href: string; readonly label: string; readonly icon: IconName }[] }) {
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
              "flex shrink-0 items-center gap-2.5 rounded px-3 py-2.5 text-[14px] font-medium transition-colors",
              active ? "bg-ink-900 text-white" : "text-ink-500 hover:text-ink-900",
            )}
          >
            <Icon name={item.icon} className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
