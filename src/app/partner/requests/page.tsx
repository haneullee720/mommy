import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentPartner } from "@/lib/auth";
import { listOpenRequestsForPartner, listQuotesByPartner } from "@/lib/service";
import { readDB } from "@/lib/db";
import { OPTION_MAP, SERVICE_MAP } from "@/lib/catalog";
import { manwon, timeAgo, untilDeadline } from "@/lib/format";
import { Badge, EmptyState } from "@/components/ui";

export const metadata: Metadata = { title: "새 요청" };
export const dynamic = "force-dynamic";

export default async function PartnerRequestsPage() {
  const ctx = await currentPartner();
  if (!ctx) redirect("/partner-signup");

  const db = readDB();
  const open = listOpenRequestsForPartner(ctx.partner);
  const myQuotes = listQuotesByPartner(ctx.partner.id);
  const quotedMap = new Map(myQuotes.map((q) => [q.requestId, q]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-extrabold text-ink-900">새 요청</h1>
        <p className="mt-1 text-sm text-ink-500">
          담당 지역({ctx.partner.regions.join(", ")})과 취급 종목에 맞는 요청만 보여드립니다.
        </p>
      </div>

      {open.length === 0 ? (
        <EmptyState
          icon="🔕"
          title="지금은 매칭되는 요청이 없습니다"
          desc="새 요청이 들어오면 알림으로 알려드립니다. 담당 지역을 넓히면 더 많은 기회를 받을 수 있어요."
        />
      ) : (
        <ul className="space-y-3">
          {open.map((r) => {
            const mine = quotedMap.get(r.id);
            const competitors = db.quotes.filter((q) => q.requestId === r.id && q.status !== "withdrawn").length;
            return (
              <li key={r.id}>
                <Link href={`/partner/requests/${r.id}`} className="card block p-5 transition hover:border-brand-300 hover:shadow-soft">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="brand">
                      {SERVICE_MAP[r.service].emoji} {SERVICE_MAP[r.service].name}
                    </Badge>
                    {r.dateFlexible && <Badge tone="green">일정 조율</Badge>}
                    {mine && mine.status === "submitted" && <Badge tone="blue">견적 제출함</Badge>}
                    <span className="ml-auto text-[12px] font-semibold text-ink-400">{untilDeadline(r.expiresAt)}</span>
                  </div>

                  <p className="tnum mt-2.5 text-[15.5px] font-extrabold text-ink-900">
                    {r.region} {r.district} · {r.areaPyeong}평
                  </p>
                  <p className="tnum mt-1 text-[13px] text-ink-500">
                    희망일 {r.preferredDate} · 고객 예상 {manwon(r.estimateMin)}~{manwon(r.estimateMax)}
                  </p>

                  {r.options.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {r.options.map((o) => (
                        <span key={o} className="rounded-md bg-ink-100 px-2 py-1 text-[11.5px] font-semibold text-ink-600">
                          {OPTION_MAP[o]?.label ?? o}
                        </span>
                      ))}
                    </div>
                  )}

                  {r.description && <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-ink-500">{r.description}</p>}

                  <p className="mt-3 border-t border-ink-100 pt-3 text-[12.5px] font-semibold text-ink-400">
                    {timeAgo(r.createdAt)} 등록 · 경쟁 견적 {competitors}개
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
