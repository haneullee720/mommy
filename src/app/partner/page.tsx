import Link from "next/link";
import type { Metadata } from "next";
import { currentPartner } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listOpenRequestsForPartner, listOrdersByPartner, listQuotesByPartner } from "@/lib/service";
import { readDB } from "@/lib/db";
import { SERVICE_MAP } from "@/lib/catalog";
import { TIER_LABEL, TIER_RULE } from "@/lib/fees";
import { manwon, timeAgo, untilDeadline, won } from "@/lib/format";
import { Alert, Badge, EmptyState, LinkButton, OrderStatusBadge, Stars } from "@/components/ui";

export const metadata: Metadata = { title: "파트너 대시보드" };
export const dynamic = "force-dynamic";

export default async function PartnerHome() {
  const ctx = await currentPartner();
  if (!ctx) redirect("/partner-signup");
  const { partner } = ctx;

  const db = readDB();
  const feeRate = db.settings.feeRates[partner.tier];
  const open = listOpenRequestsForPartner(partner);
  const quotes = listQuotesByPartner(partner.id);
  const orders = listOrdersByPartner(partner.id);

  const quotedIds = new Set(quotes.filter((q) => q.status === "submitted" || q.status === "accepted").map((q) => q.requestId));
  const newRequests = open.filter((r) => !quotedIds.has(r.id));
  const working = orders.filter((o) => ["escrow", "in_progress"].includes(o.status));
  const pendingSettle = orders.filter((o) => o.status === "completed");
  const settledThisMonth = orders.filter(
    (o) => o.status === "settled" && o.settledAt && new Date(o.settledAt).getMonth() === new Date().getMonth(),
  );

  const accepted = quotes.filter((q) => q.status === "accepted").length;
  const winRate = quotes.length ? Math.round((accepted / quotes.length) * 100) : 0;

  const STATS = [
    { label: "새 요청", value: `${newRequests.length}건`, href: "/partner/requests", tone: "brand" as const },
    { label: "진행 중 작업", value: `${working.length}건`, href: "/partner/orders", tone: "blue" as const },
    { label: "정산 대기", value: won(pendingSettle.reduce((s, o) => s + o.payoutAmount, 0)), href: "/partner/settlement", tone: "amber" as const },
    { label: "이번 달 정산", value: won(settledThisMonth.reduce((s, o) => s + o.payoutAmount, 0)), href: "/partner/settlement", tone: "green" as const },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[24px] font-extrabold text-ink-900">{partner.companyName}</h1>
        <p className="mt-1 text-sm text-ink-500">오늘의 일감과 정산 현황을 확인하세요.</p>
      </div>

      {partner.status === "pending" && (
        <Alert tone="warn">
          현재 <strong>심사 진행 중</strong>입니다. 사업자등록증과 배상책임보험 확인이 끝나면 견적 제출이 열립니다. 보통 1영업일 내 완료됩니다.
        </Alert>
      )}
      {partner.status === "suspended" && (
        <Alert tone="error">이용이 제한된 계정입니다. 고객센터로 문의해 주세요.</Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 transition hover:border-brand-300 hover:shadow-soft">
            <p className="text-[12.5px] font-semibold text-ink-400">{s.label}</p>
            <p className="tnum mt-1.5 text-[22px] font-extrabold text-ink-900">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-[18px] font-extrabold text-ink-900">지금 견적을 기다리는 요청</h2>
            <Link href="/partner/requests" className="text-[13px] font-bold text-brand-700 hover:underline">
              전체 보기 →
            </Link>
          </div>

          {newRequests.length === 0 ? (
            <EmptyState
              icon="🔔"
              title="새로 들어온 요청이 없습니다"
              desc="담당 지역과 취급 청소 종류를 넓히면 더 많은 요청을 받을 수 있어요."
            />
          ) : (
            <ul className="space-y-3">
              {newRequests.slice(0, 5).map((r) => (
                <li key={r.id}>
                  <Link href={`/partner/requests/${r.id}`} className="card block p-5 transition hover:border-brand-300 hover:shadow-soft">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="brand">
                        {SERVICE_MAP[r.service].emoji} {SERVICE_MAP[r.service].name}
                      </Badge>
                      {r.dateFlexible && <Badge tone="green">일정 조율 가능</Badge>}
                      <span className="ml-auto text-[12px] font-semibold text-ink-400">{untilDeadline(r.expiresAt)}</span>
                    </div>
                    <p className="tnum mt-2.5 text-[15px] font-extrabold text-ink-900">
                      {r.region} {r.district} · {r.areaPyeong}평
                    </p>
                    <p className="tnum mt-1 text-[13px] text-ink-500">
                      희망일 {r.preferredDate} · 고객 예상 {manwon(r.estimateMin)}~{manwon(r.estimateMax)}
                    </p>
                    <p className="mt-3 border-t border-ink-100 pt-3 text-[12.5px] font-semibold text-ink-400">
                      {timeAgo(r.createdAt)} 등록 · 견적 {db.quotes.filter((q) => q.requestId === r.id).length}개 경쟁
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-4">
          <div className="card p-5">
            <p className="text-[13px] font-bold text-ink-400">우리 업체 지표</p>
            <dl className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-[13.5px] text-ink-500">평점</dt>
                <dd className="flex items-center gap-1.5">
                  <Stars rating={partner.rating} />
                  <span className="tnum text-[13.5px] font-bold text-ink-900">{partner.rating.toFixed(1)}</span>
                </dd>
              </div>
              {[
                ["완료 건수", `${partner.completedJobs}건`],
                ["견적 낙찰률", `${winRate}%`],
                ["평균 응답", `${partner.responseMinutes}분`],
                ["현재 수수료", `${Math.round(feeRate * 100)}%`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <dt className="text-[13.5px] text-ink-500">{k}</dt>
                  <dd className="tnum text-[13.5px] font-bold text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-5">
            <p className="text-[13.5px] font-extrabold text-brand-800">등급 혜택</p>
            <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-brand-800/80">
              {(["basic", "good", "premium"] as const).map((t) => (
                <li key={t} className={partner.tier === t ? "font-bold text-brand-900" : ""}>
                  {partner.tier === t ? "▶ " : "· "}
                  {TIER_LABEL[t]} 수수료 {Math.round(db.settings.feeRates[t] * 100)}% — {TIER_RULE[t]}
                </li>
              ))}
            </ul>
          </div>

          {working.length > 0 && (
            <div className="card p-5">
              <p className="text-[13px] font-bold text-ink-400">오늘 처리할 작업</p>
              <ul className="mt-3 space-y-2">
                {working.slice(0, 3).map((o) => (
                  <li key={o.id}>
                    <Link href="/partner/orders" className="flex items-center justify-between gap-2 rounded-xl bg-ink-50 px-3 py-2.5 hover:bg-ink-100">
                      <span className="tnum text-[13px] font-semibold text-ink-800">{o.scheduledDate}</span>
                      <OrderStatusBadge status={o.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <LinkButton href="/partner/requests" className="w-full" size="lg">
            견적 넣으러 가기
          </LinkButton>
        </aside>
      </div>
    </div>
  );
}
