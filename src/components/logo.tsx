import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2" aria-label="청소모아 홈">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-soft transition group-hover:bg-brand-700">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 13.5 8.2 5.8A2 2 0 0 1 10 4.6h4a2 2 0 0 1 1.8 1.2L19 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="4" y="13.5" width="16" height="6.2" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9.2 16.6h5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && (
        <span className="text-[19px] font-extrabold tracking-tight text-ink-900">
          청소모아
        </span>
      )}
    </Link>
  );
}
