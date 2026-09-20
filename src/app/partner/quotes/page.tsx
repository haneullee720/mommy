import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentPartner } from "@/lib/auth";
import { getRequestsByIds, listQuotesByPartner } from "@/lib/service";
import { SERVICE_MAP } from "@/lib/catalog";
import { timeAgo, won } from "@/lib/format";
import { Alert, Badge, EmptyState, LinkButton } from "@/components/ui";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "보낸 견적" };
export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; tone: "brand" | "green" | "neutral" | "red" }> = {
  submitted: { label: "검토 대기", tone: "brand" },
  accepted: { label: "낙찰", tone: "green" },
  rejected: { label: "미선정", tone: "neutral" },
  withdrawn: { label: "철회", tone: "neutral" },
};

export default async function PartnerQuotesPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const sp = await searchParams;
  const ctx = await currentPartner();
  if (!ctx) redirect("/partner-signup");

  const allQuotes = await listQuotesByPartner(ctx.partner.id);
  const quotes = allQuotes.slice(0, 30);
  const requests = await getRequestsByIds(quotes.map((q) => q.requestId));
  const accepted = allQuotes.filter((q) => q.status === "accepted").length;
  const rate = allQuotes.length ? Math.round((accepted / allQuotes.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-ink-900">보낸 견적</h1>
          <p className="tnum mt-1 text-sm text-ink-500">
            총 {allQuotes.length}건 · 낙찰 {accepted}건 · 낙찰률 {rate}%
          </p>
        </div>
        <LinkButton href="/partner/requests" variant="secondary">새 요청 보기</LinkButton>
      </div>

      {sp.sent && <Alert tone="success">견적을 보냈습니다. 고객이 선택하면 알림을 보내드릴게요.</Alert>}

      {allQuotes.length === 0 ? (
        <EmptyState icon={<Icon name="send" className="h-7 w-7" />} title="아직 보낸 견적이 없습니다" desc="새 요청에서 조건을 확인하고 견적을 보내보세요." action={<LinkButton href="/partner/requests" className="mt-2">새 요청 보기</LinkButton>} />
      ) : (
        <ul className="space-y-3">
          {quotes.map((q) => {
            const req = requests.get(q.requestId);
            const meta = STATUS[q.status];
            return (
              <li key={q.id} className="card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {req && (
                    <span className="text-[15px] font-bold text-ink-900">
                      <Icon name={SERVICE_MAP[req.service].icon} className="h-3.5 w-3.5" />
                      {SERVICE_MAP[req.service].name}
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
                  <span className="tnum text-[17px] font-bold text-ink-900">{won(q.amount)}</span>
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
          {allQuotes.length > quotes.length && (
            <li className="tnum py-4 text-center text-[13px] text-ink-400">
              최근 {quotes.length}건을 보여드리고 있습니다 (전체 {allQuotes.length}건)
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
