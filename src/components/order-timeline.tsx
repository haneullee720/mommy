import { cn } from "@/lib/cn";
import type { OrderStatus } from "@/lib/types";

const STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: "pending_payment", label: "결제 대기", desc: "업체 선택 완료" },
  { key: "escrow", label: "안전결제 보관", desc: "청소모아가 금액 예치" },
  { key: "in_progress", label: "작업 중", desc: "업체 현장 작업" },
  { key: "completed", label: "작업 완료", desc: "고객 확인 대기" },
  { key: "settled", label: "정산 완료", desc: "업체 지급 완료" },
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const current = STEPS.findIndex((s) => s.key === status);
  return (
    <ol className="grid gap-3 sm:grid-cols-5">
      {STEPS.map((s, i) => {
        const done = i <= current;
        const isCurrent = i === current;
        return (
          <li key={s.key} className="relative">
            <div className={cn("h-1.5 rounded-full transition", done ? "bg-brand-600" : "bg-ink-200")} />
            <p className={cn("mt-2.5 text-[13px] font-extrabold", isCurrent ? "text-brand-700" : done ? "text-ink-800" : "text-ink-300")}>
              {done && !isCurrent ? "✓ " : ""}
              {s.label}
            </p>
            <p className={cn("mt-0.5 text-[11.5px]", done ? "text-ink-500" : "text-ink-300")}>{s.desc}</p>
          </li>
        );
      })}
    </ol>
  );
}
