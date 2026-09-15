import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentPartner } from "@/lib/auth";
import { listOrdersByPartner, getRequest } from "@/lib/service";
import { readDB } from "@/lib/db";
import { SERVICE_MAP } from "@/lib/catalog";
import { TIER_LABEL, TIER_RULE } from "@/lib/fees";
import { dateFull, won } from "@/lib/format";
import { Badge, EmptyState, TierBadge } from "@/components/ui";

export const metadata: Metadata = { title: "정산" };
export const dynamic = "force-dynamic";

export default async function SettlementPage() {
  const ctx = await currentPartner();
  if (!ctx) redirect("/partner-signup");
  const { partner } = ctx;

  const db = readDB();
  const rates = db.settings.feeRates;
  const orders = listOrdersByPartner(partner.id).filter((o) => o.paidAt);

  const pending = orders.filter((o) => ["escrow", "in_progress", "completed"].includes(o.status));
  const settled = orders.filter((o) => o.status === "settled");

  const sum = (list: typeof orders, key: "amount" | "feeAmount" | "payoutAmount") => list.reduce((s, o) => s + o[key], 0);

  const thisMonth = settled.filter((o) => o.settledAt && new Date(o.settledAt).getMonth() === new Date().getMonth());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-extrabold text-ink-900">정산</h1>
        <p className="mt-1 text-sm text-ink-500">
          고객 작업 확인 후 영업일 3일 내 등록 계좌로 입금됩니다. 카드·이체 수수료는 청소모아가 부담합니다.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "정산 예정", value: won(sum(pending, "payoutAmount")), note: `${pending.length}건 진행 중` },
          { label: "이번 달 정산", value: won(sum(thisMonth, "payoutAmount")), note: `${thisMonth.length}건 완료` },
          { label: "누적 정산", value: won(sum(settled, "payoutAmount")), note: `${settled.length}건 누적` },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-[12.5px] font-semibold text-ink-400">{s.label}</p>
            <p className="tnum mt-1.5 text-[21px] font-extrabold text-ink-900">{s.value}</p>
            <p className="tnum mt-0.5 text-[12px] text-ink-400">{s.note}</p>
          </div>
        ))}
      </div>

      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[15px] font-extrabold text-ink-900">수수료 등급</p>
          <TierBadge tier={partner.tier} />
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {(["basic", "good", "premium"] as const).map((t) => (
            <li
              key={t}
              className={
                partner.tier === t
                  ? "rounded-xl border-2 border-brand-500 bg-brand-50 p-4"
                  : "rounded-xl border border-ink-200 p-4"
              }
            >
              <p className="text-[13.5px] font-extrabold text-ink-900">{TIER_LABEL[t]}</p>
              <p className="tnum mt-1 text-[20px] font-extrabold text-brand-700">{Math.round(rates[t] * 100)}%</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">{TIER_RULE[t]}</p>
            </li>
          ))}
        </ul>
        <p className="tnum mt-4 rounded-xl bg-ink-50 p-4 text-[13px] text-ink-600">
          현재 완료 {partner.completedJobs}건 · 평점 {partner.rating.toFixed(1)} —{" "}
          {partner.tier === "premium"
            ? "최고 등급입니다. 수수료 10%가 계속 적용됩니다."
            : partner.tier === "good"
              ? `프리미엄까지 완료 ${Math.max(0, 60 - partner.completedJobs)}건 남음`
              : `우수 등급까지 완료 ${Math.max(0, 20 - partner.completedJobs)}건 남음`}
        </p>
      </section>

      <section className="card p-5">
        <p className="text-[15px] font-extrabold text-ink-900">입금 계좌</p>
        <p className="tnum mt-2 text-[14px] text-ink-600">
          {partner.bankAccount.bank || "미등록"} {partner.bankAccount.number} ({partner.bankAccount.holder})
        </p>
      </section>

      <section>
        <p className="mb-3 text-[16px] font-extrabold text-ink-900">정산 내역</p>
        {orders.length === 0 ? (
          <EmptyState icon="💰" title="정산 내역이 없습니다" desc="작업이 완료되면 이곳에 정산 내역이 쌓입니다." />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="border-b border-ink-100 bg-ink-50/70">
                <tr className="text-[12px] font-bold text-ink-500">
                  <th className="px-4 py-3">주문번호</th>
                  <th className="px-4 py-3">서비스</th>
                  <th className="px-4 py-3 text-right">결제액</th>
                  <th className="px-4 py-3 text-right">수수료</th>
                  <th className="px-4 py-3 text-right">정산액</th>
                  <th className="px-4 py-3">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {orders.map((o) => {
                  const req = getRequest(o.requestId);
                  return (
                    <tr key={o.id} className="text-[13px]">
                      <td className="tnum px-4 py-3 font-semibold text-ink-700">{o.code}</td>
                      <td className="px-4 py-3 text-ink-600">{req ? SERVICE_MAP[req.service].name : "-"}</td>
                      <td className="tnum px-4 py-3 text-right text-ink-700">{won(o.amount)}</td>
                      <td className="tnum px-4 py-3 text-right text-red-500">
                        -{won(o.feeAmount)}
                        <span className="ml-1 text-[11px] text-ink-400">({Math.round(o.feeRate * 100)}%)</span>
                      </td>
                      <td className="tnum px-4 py-3 text-right font-extrabold text-ink-900">{won(o.payoutAmount)}</td>
                      <td className="px-4 py-3">
                        {o.status === "settled" ? (
                          <span className="tnum text-[12px] font-semibold text-emerald-600">{dateFull(o.settledAt!)} 지급</span>
                        ) : (
                          <Badge tone="amber">정산 예정</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
