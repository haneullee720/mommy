import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { currentPartner } from "@/lib/auth";
import { getRequest, getSettings, listQuotes } from "@/lib/service";
import { OPTION_MAP, PROPERTY_LABEL, SERVICE_MAP } from "@/lib/catalog";
import { manwon, maskAddress, timeAgo, untilDeadline, won } from "@/lib/format";
import { Alert, Badge } from "@/components/ui";
import { QuoteForm } from "@/components/quote-form";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "견적 제출" };
export const dynamic = "force-dynamic";

export default async function PartnerRequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await currentPartner();
  if (!ctx) redirect("/partner-signup");

  const req = await getRequest(id);
  if (!req) notFound();

  const feeRate = (await getSettings()).feeRates[ctx.partner.tier];
  const def = SERVICE_MAP[req.service];
  const others = await listQuotes(req.id);
  const mine = others.find((q) => q.partnerId === ctx.partner.id) ?? null;
  const competitorAmounts = others.filter((q) => q.partnerId !== ctx.partner.id).map((q) => q.amount);

  return (
    <div className="space-y-6">
      <Link href="/partner/requests" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-500 hover:text-ink-900">
        ← 새 요청 목록
      </Link>

      {req.status !== "open" && <Alert tone="warn">이미 마감된 요청입니다. 다른 요청을 확인해 주세요.</Alert>}
      {ctx.partner.status !== "approved" && <Alert tone="warn">심사 승인 후 견적을 제출할 수 있습니다.</Alert>}
      {mine && mine.status === "submitted" && (
        <Alert tone="info">이미 견적을 제출했습니다. 아래에서 금액과 내용을 수정해 다시 보낼 수 있습니다.</Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="card p-6">
          <h1 className="text-[18px] font-bold text-ink-900">
            {mine ? "견적 수정" : "견적 제출"}
          </h1>
          <p className="mt-1 text-sm text-ink-500">금액과 조건을 정확히 적을수록 선택될 확률이 높아집니다.</p>
          <div className="mt-6">
            <QuoteForm
              requestId={req.id}
              companyName={ctx.partner.companyName}
              feeRate={feeRate}
              suggestMin={req.estimateMin}
              suggestMax={req.estimateMax}
              preferredDate={req.preferredDate}
              baseIncludes={[...def.includes, "작업 전후 사진 리포트", "친환경 약품 사용", "폐기물 정리"]}
              existing={mine && mine.status === "submitted" ? mine : null}
            />
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <Icon name={def.icon} className="h-[18px] w-[18px] text-ink-400" />
              <p className="text-[15.5px] font-bold text-ink-900">{def.name}</p>
            </div>
            <p className="mt-1 text-[12px] font-semibold text-brand-700">{untilDeadline(req.expiresAt)}</p>

            <dl className="mt-4 space-y-2.5 text-[13.5px]">
              {[
                ["공간", `${PROPERTY_LABEL[req.propertyType]} · ${req.areaPyeong}평`],
                ["지역", `${req.region} ${req.district}`],
                ["상세 주소", maskAddress(req.addressDetail)],
                ["희망일", `${req.preferredDate}${req.dateFlexible ? " (조율 가능)" : ""}`],
                ["고객 예상", `${manwon(req.estimateMin)}~${manwon(req.estimateMax)}`],
                ["등록", timeAgo(req.createdAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-ink-100 pb-2">
                  <dt className="shrink-0 text-ink-400">{k}</dt>
                  <dd className="tnum text-right font-semibold text-ink-800">{v}</dd>
                </div>
              ))}
            </dl>

            {req.options.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {req.options.map((o) => (
                  <Badge key={o} tone="brand">{OPTION_MAP[o]?.label ?? o}</Badge>
                ))}
              </div>
            )}

            {req.description && (
              <p className="mt-3 whitespace-pre-line rounded bg-ink-50 p-3.5 text-[13px] leading-relaxed text-ink-600">
                {req.description}
              </p>
            )}

            <p className="mt-3 text-[11.5px] text-ink-400">
              고객 상세 주소와 연락처는 낙찰·결제 완료 후 공개됩니다.
            </p>
          </div>

          <div className="card p-5">
            <p className="text-[13px] font-bold text-ink-400">경쟁 현황</p>
            {competitorAmounts.length === 0 ? (
              <p className="mt-2 text-[13.5px] font-semibold text-brand-700">아직 다른 견적이 없습니다. 먼저 제출해 보세요!</p>
            ) : (
              <dl className="tnum mt-3 space-y-2 text-[13.5px]">
                <div className="flex justify-between">
                  <dt className="text-ink-500">제출된 견적</dt>
                  <dd className="font-bold text-ink-900">{competitorAmounts.length}개</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-500">최저 금액</dt>
                  <dd className="font-bold text-ink-900">{won(Math.min(...competitorAmounts))}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-500">평균 금액</dt>
                  <dd className="font-bold text-ink-900">
                    {won(Math.round(competitorAmounts.reduce((a, b) => a + b, 0) / competitorAmounts.length))}
                  </dd>
                </div>
              </dl>
            )}
            <p className="mt-3 text-[11.5px] leading-relaxed text-ink-400">
              고객은 금액만 보지 않습니다. 평점·A/S 기간·메시지도 함께 비교합니다.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
