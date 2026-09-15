import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentPartner } from "@/lib/auth";
import { getRequest, listQuotesByPartner } from "@/lib/service";
import { SERVICE_MAP } from "@/lib/catalog";
import { timeAgo, won } from "@/lib/format";
import { Alert, Badge, EmptyState, LinkButton } from "@/components/ui";

export const metadata: Metadata = { title: "보낸 견적" };
export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; tone: "brand" | "green" | "neutral" | "red" }> = {
  submitted: { label: "검토 대기", tone: "brand" },
  accepted: { label: "낙찰 🎉", tone: "green" },
  rejected: { label: "미선정", tone: "neutral" },
  withdrawn: { label: "철회", tone: "neutral" },
};

export default async function PartnerQuotesPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const sp = await searchParams;
  const ctx = await currentPartner();
  if (!ctx) redirect("/partner-signup");

  const quotes = listQuotesByPartner(ctx.partner.id);
  const accepted = quotes.filter((q) => q.status === "accepted").length;
  const rate = quotes.length ? Math.round((accepted / quotes.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-extrabold text-ink-900">보낸 견적</h1>
          <p className="tnum mt-1 text-sm text-ink-500">
            총 {quotes.length}건 · 낙찰 {accepted}건 · 낙찰률 {rate}%
          </p>
        </div>
        <LinkButton href="/partner/requests" variant="secondary">새 요청 보기</LinkButton>
      </div>

      {sp.sent && <Alert tone="success">견적을 보냈습니다. 고객이 선택하면 알림을 보내드릴게요.</Alert>}

      {quotes.length === 0 ? (
        <EmptyState icon="📤" title="아직 보낸 견적이 없습니다" desc="새 요청에서 조건을 확인하고 견적을 보내보세요." action={<LinkButton href="/partner/requests" className="mt-2">새 요청 보기</LinkButton>} />
      ) : (
        <ul className="space-y-3">
          {quotes.map((q) => {
            const req = getRequest(q.requestId);
            const meta = STATUS[q.status];
            return (
              <li key={q.id} className="card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {req && (
                    <span className="text-[15px] font-extrabold text-ink-900">
                      {SERVICE_MAP[req.service].emoji} {SERVICE_MAP[req.service].name}
                    </span>
                  )}
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                  <span className="ml-auto text-[12px] font-semibold text-ink-400">{timeAgo(q.createdAt)}</span>
                </div>
                {req && (
                  <p className="tnum mt-2 text-[13.5px] text-ink-500">
                    {req.region} {req.district} · {req.areaPyeong}평 · 작업 가능일 {q.availableDate}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-3">
                  <span className="tnum text-[17px] font-extrabold text-ink-900">{won(q.amount)}</span>
                  {q.status === "submitted" && req?.status === "open" && (
                    <Link href={`/partner/requests/${q.requestId}`} className="text-[13px] font-bold text-brand-700 hover:underline">
                      견적 수정 →
                    </Link>
                  )}
                  {q.status === "accepted" && (
                    <Link href="/partner/orders" className="text-[13px] font-bold text-brand-700 hover:underline">
                      작업 관리 →
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
