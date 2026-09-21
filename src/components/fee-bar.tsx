import { won } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * 결제액이 수수료와 정산액으로 어떻게 갈리는지 막대 하나로 보여준다.
 * 표로 적으면 세 줄이지만, 비율은 막대가 훨씬 빨리 읽힌다.
 */
export function FeeBar({
  amount,
  feeRate,
  className,
}: {
  amount: number;
  feeRate: number;
  className?: string;
}) {
  const fee = Math.round((amount * feeRate) / 10) * 10;
  const payout = amount - fee;
  const payoutPct = (payout / amount) * 100;

  return (
    <div className={className}>
      <div className="flex h-14 w-full overflow-hidden rounded bg-ink-100">
        <div
          className="flex items-center bg-brand-600 pl-4 text-white"
          style={{ width: `${payoutPct}%` }}
        >
          <span className="tnum text-[14px] font-semibold">{won(payout)}</span>
        </div>
        <div className="flex flex-1 items-center justify-center bg-ink-900 text-white">
          <span className="tnum text-[13px] font-semibold">{Math.round(feeRate * 100)}%</span>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Legend label="고객 결제 (전체)" value={won(amount)} />
        <Legend swatch="bg-brand-600" label="업체 정산" value={won(payout)} strong />
        <Legend swatch="bg-ink-900" label={`중개 수수료 ${Math.round(feeRate * 100)}%`} value={`−${won(fee)}`} />
      </dl>
    </div>
  );
}

function Legend({ swatch, label, value, strong }: { swatch?: string; label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-[12.5px] text-ink-500">
        {swatch && <span className={cn("h-2.5 w-2.5 rounded-[2px]", swatch)} />}
        {label}
      </dt>
      <dd className={cn("tnum mt-1 font-bold tracking-[-0.02em]", strong ? "text-[20px] text-ink-900" : "text-[15px] text-ink-700")}>
        {value}
      </dd>
    </div>
  );
}
