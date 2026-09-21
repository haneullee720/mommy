import { Icon, type IconName } from "./icons";
import { cn } from "@/lib/cn";

const NODES: { icon: IconName; label: string; sub: string; highlight?: boolean }[] = [
  { icon: "user", label: "고객 결제", sub: "카드·이체·간편결제" },
  { icon: "lock", label: "청소모아 보관", sub: "작업 확인 전까지 예치", highlight: true },
  { icon: "broom", label: "업체 시공", sub: "결제 확인 후 배정" },
  { icon: "wallet", label: "업체 정산", sub: "수수료 제외 후 지급" },
];

/**
 * 돈이 어디에 머무는지를 그림 하나로 보여준다.
 * 문단으로 설명하면 읽히지 않는 내용이라 도식이 더 빠르다.
 */
export function EscrowFlow({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
      {NODES.map((n, i) => (
        <li key={n.label} className="relative flex items-start gap-4 lg:flex-col lg:gap-0 lg:pr-8">
          {/* 연결선 */}
          {i < NODES.length - 1 && (
            <span
              aria-hidden
              className={cn(
                "absolute left-[23px] top-12 h-[calc(100%-16px)] w-px lg:left-12 lg:top-6 lg:h-px lg:w-[calc(100%-56px)]",
                dark ? "bg-white/20" : "bg-ink-200",
              )}
            />
          )}
          <span
            className={cn(
              "relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border",
              n.highlight
                ? dark
                  ? "border-brand-300 bg-brand-300 text-ink-900"
                  : "border-brand-600 bg-brand-600 text-white"
                : dark
                  ? "border-white/25 bg-ink-900 text-ink-300"
                  : "border-ink-200 bg-white text-ink-500",
            )}
          >
            <Icon name={n.icon} className="h-5 w-5" />
          </span>
          <div className="lg:mt-5">
            <p className={cn("text-[15px] font-semibold", dark ? "text-white" : "text-ink-900")}>{n.label}</p>
            <p className={cn("mt-1 text-[13px]", dark ? "text-ink-400" : "text-ink-500")}>{n.sub}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
