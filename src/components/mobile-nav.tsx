"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function MobileNav({ links, isLoggedIn }: { links: { href: string; label: string }[]; isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid h-10 w-10 place-items-center rounded border border-ink-200 text-ink-700 md:hidden"
        aria-label="메뉴 열기"
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          {open ? (
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <div className="fixed inset-x-0 top-16 z-40 border-t border-ink-100 bg-white p-4 shadow-lift md:hidden">
          <nav className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded px-3 py-3.5 text-[15px] font-semibold text-ink-800 hover:bg-ink-50"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {!isLoggedIn && (
                <Link href="/login" className="rounded border border-ink-200 px-3 py-3 text-center text-sm font-semibold text-ink-800">
                  로그인
                </Link>
              )}
              <Link
                href="/request/new"
                className={`rounded bg-brand-600 px-3 py-3 text-center text-sm font-bold text-white ${isLoggedIn ? "col-span-2" : ""}`}
              >
                무료 견적받기
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
