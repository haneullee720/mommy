import Link from "next/link";

/**
 * 워드마크 중심. 아이콘 배지 대신 글자 자체가 마크가 되도록 자간을 조이고,
 * 작은 사각 점 하나만 액센트로 둔다.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-baseline gap-1.5" aria-label="청소모아 홈">
      <span className="text-[19px] font-bold leading-none tracking-[-0.05em] text-ink-900">
        {compact ? "청소" : "청소모아"}
      </span>
      <span className="h-1.5 w-1.5 shrink-0 rounded-[1px] bg-brand-600 transition-colors group-hover:bg-ink-900" />
    </Link>
  );
}
