import type { Metadata } from "next";
import Link from "next/link";
import { readDB } from "@/lib/db";
import { platformStats } from "@/lib/service";
import { SERVICE_MAP } from "@/lib/catalog";
import { manwon, timeAgo, won } from "@/lib/format";
import { Badge, OrderStatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "운영 현황" };
export const dynamic = "force-dynamic";

export default function AdminHome() {
  const db = readDB();
  const stats = platformStats();

  const pendingPartners = db.partners.filter((p) => p.status === "pending");
  const escrowHeld = db.orders.filter((o) => ["escrow", "in_progress", "completed"].includes(o.status));
  const toSettle = db.orders.filter((o) => o.status === "completed");

  const byService = Object.entries(
    db.requests.reduce<Record<string, number>>((acc, r) => {
      acc[r.service] = (acc[r.service] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const maxCount = byService[0]?.[1] ?? 1;

  const CARDS = [
    { label: "거래액 (GMV)", value: won(stats.gmv), note: `결제 ${db.orders.filter((o) => o.paidAt).length}건` },
    { label: "중개 수수료 매출", value: won(stats.revenue), note: `평균 수수료율 ${stats.gmv ? Math.round((stats.revenue / stats.gmv) * 100) : 0}%` },
    { label: "에스크로 보관액", value: won(escrowHeld.reduce((s, o) => s + o.amount, 0)), note: `${escrowHeld.length}건 보관 중` },
    { label: "정산 대기", value: won(toSettle.reduce((s, o) => s + o.payoutAmount, 0)), note: `${toSettle.length}건 지급 예정` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[24px] font-extrabold text-ink-900">운영 현황</h1>
        <p className="mt-1 text-sm text-ink-500">플랫폼 전체 거래와 정산 상태를 한눈에 확인합니다.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-[12.5px] font-semibold text-ink-400">{c.label}</p>
            <p className="tnum mt-1.5 text-[21px] font-extrabold text-ink-900">{c.value}</p>
            <p className="tnum mt-0.5 text-[12px] text-ink-400">{c.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["등록 업체", `${stats.partnerCount}곳`],
          ["누적 요청", `${stats.requestCount}건`],
          ["요청당 평균 견적", `${stats.avgQuotesPerRequest}개`],
          ["평균 평점", `${stats.avgRating}점`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-ink-200 bg-white px-5 py-4">
            <p className="text-[12.5px] text-ink-400">{k}</p>
            <p className="tnum mt-1 text-[17px] font-extrabold text-ink-900">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-[16px] font-extrabold text-ink-900">승인 대기 업체</p>
            <Link href="/admin/partners" className="text-[13px] font-bold text-brand-700 hover:underline">전체 →</Link>
          </div>
          {pendingPartners.length === 0 ? (
            <p className="mt-4 text-[13.5px] text-ink-400">대기 중인 신청이 없습니다.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {pendingPartners.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 rounded-xl bg-ink-50 px-4 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-bold text-ink-900">{p.companyName}</span>
                    <span className="tnum block text-[12px] text-ink-500">{p.bizNo} · {timeAgo(p.createdAt)}</span>
                  </span>
                  <Badge tone="amber">심사 대기</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <p className="text-[16px] font-extrabold text-ink-900">서비스별 요청 분포</p>
          <ul className="mt-4 space-y-2.5">
            {byService.map(([slug, count]) => (
              <li key={slug}>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-ink-700">
                    {SERVICE_MAP[slug as keyof typeof SERVICE_MAP]?.name ?? slug}
                  </span>
                  <span className="tnum font-bold text-ink-900">{count}건</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card p-5">
        <div className="flex items-center justify-between">
          <p className="text-[16px] font-extrabold text-ink-900">최근 거래</p>
          <Link href="/admin/orders" className="text-[13px] font-bold text-brand-700 hover:underline">전체 →</Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left">
            <thead className="border-b border-ink-100">
              <tr className="text-[12px] font-bold text-ink-500">
                <th className="py-2.5 pr-3">주문번호</th>
                <th className="py-2.5 pr-3">업체</th>
                <th className="py-2.5 pr-3 text-right">결제액</th>
                <th className="py-2.5 pr-3 text-right">수수료</th>
                <th className="py-2.5">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {db.orders.slice().reverse().slice(0, 8).map((o) => {
                const partner = db.partners.find((p) => p.id === o.partnerId);
                return (
                  <tr key={o.id} className="text-[13px]">
                    <td className="tnum py-2.5 pr-3 font-semibold text-ink-700">{o.code}</td>
                    <td className="py-2.5 pr-3 text-ink-600">{partner?.companyName ?? "-"}</td>
                    <td className="tnum py-2.5 pr-3 text-right text-ink-700">{manwon(o.amount)}</td>
                    <td className="tnum py-2.5 pr-3 text-right font-bold text-brand-700">{manwon(o.feeAmount)}</td>
                    <td className="py-2.5"><OrderStatusBadge status={o.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
