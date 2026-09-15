import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getOrderByRequest, getPartner, getRequest, listQuotes } from "@/lib/service";
import { OPTION_MAP, PROPERTY_LABEL, SERVICE_MAP } from "@/lib/catalog";
import { manwon, timeAgo, untilDeadline, won } from "@/lib/format";
import { Alert, Badge, EmptyState, LinkButton, RequestStatusBadge, Stars, TierBadge } from "@/components/ui";
import { AcceptQuoteForm } from "@/components/accept-quote";
import { CancelRequestButton } from "@/components/cancel-request";

export const metadata: Metadata = { title: "견적 비교" };
export const dynamic = "force-dynamic";

export default async function RequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser("customer");

  const req = getRequest(id);
  if (!req || req.customerId !== user.id) notFound();

  const order = getOrderByRequest(req.id);
  if (order && order.status !== "pending_payment") redirect(`/my/orders/${order.id}`);

  const quotes = listQuotes(req.id);
  const def = SERVICE_MAP[req.service];
  const cheapest = quotes.length ? Math.min(...quotes.map((q) => q.amount)) : 0;
  const bestRated = quotes.length
    ? quotes.reduce((best, q) => {
        const bp = getPartner(best.partnerId);
        const cp = getPartner(q.partnerId);
        return (cp?.rating ?? 0) > (bp?.rating ?? 0) ? q : best;
      })
    : null;

  return (
    <div className="space-y-6">
      <Link href="/my" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-500 hover:text-ink-900">
        ← 내 견적 요청
      </Link>

      {sp.new && (
        <Alert tone="success">
          요청이 접수되었습니다! 조건에 맞는 업체들이 곧 견적을 보냅니다. 견적이 도착하면 문자로 알려드려요.
        </Alert>
      )}

      {/* 요청 요약 */}
      <section className="card p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl">{def.emoji}</span>
          <h1 className="text-[20px] font-extrabold text-ink-900">{def.name}</h1>
          <RequestStatusBadge status={req.status} />
          <span className="tnum ml-auto text-[12.5px] font-semibold text-ink-400">{req.code}</span>
        </div>

        <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {[
            ["공간", `${PROPERTY_LABEL[req.propertyType]} · ${req.areaPyeong}평`],
            ["지역", `${req.region} ${req.district}`],
            ["희망일", `${req.preferredDate}${req.dateFlexible ? " (조율 가능)" : ""}`],
            ["예상 범위", `${manwon(req.estimateMin)} ~ ${manwon(req.estimateMax)}`],
            ["상세 주소", req.addressDetail || "-"],
            ["연락처", `${req.contactName} · ${req.contactPhone}`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-ink-100 pb-2 text-[13.5px]">
              <dt className="shrink-0 text-ink-400">{k}</dt>
              <dd className="tnum text-right font-semibold text-ink-800">{v}</dd>
            </div>
          ))}
        </dl>

        {req.options.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {req.options.map((o) => (
              <Badge key={o} tone="brand">{OPTION_MAP[o]?.label ?? o}</Badge>
            ))}
          </div>
        )}

        {req.description && (
          <p className="mt-4 whitespace-pre-line rounded-xl bg-ink-50 p-4 text-[13.5px] leading-relaxed text-ink-600">
            {req.description}
          </p>
        )}

        <p className="mt-4 text-[12.5px] text-ink-400">
          🔒 상세 주소와 연락처는 <strong className="text-ink-600">결제가 완료된 업체에게만</strong> 공개됩니다.
        </p>

        {req.status === "open" && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
            <span className="text-[13px] font-semibold text-brand-700">견적 마감까지 {untilDeadline(req.expiresAt)}</span>
            <CancelRequestButton requestId={req.id} />
          </div>
        )}
      </section>

      {/* 견적 목록 */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-[18px] font-extrabold text-ink-900">
            도착한 견적 <span className="tnum text-brand-700">{quotes.length}</span>개
          </h2>
          {quotes.length > 1 && <p className="text-[12.5px] text-ink-400">금액이 낮은 순으로 정렬됩니다</p>}
        </div>

        {quotes.length === 0 ? (
          <EmptyState
            icon="📭"
            title="아직 도착한 견적이 없어요"
            desc="보통 30분 ~ 3시간 안에 첫 견적이 도착합니다. 도착하면 문자로 알려드릴게요."
          />
        ) : (
          <ul className="space-y-4">
            {quotes.map((q) => {
              const p = getPartner(q.partnerId);
              if (!p) return null;
              const isCheapest = q.amount === cheapest;
              const isBestRated = bestRated?.id === q.id && p.rating > 0;
              return (
                <li key={q.id} className="card overflow-hidden transition hover:shadow-soft">
                  <div className="flex flex-col gap-5 p-5 sm:flex-row">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/partners/${p.id}`} className="text-[16px] font-extrabold text-ink-900 hover:underline">
                          {p.companyName}
                        </Link>
                        <TierBadge tier={p.tier} />
                        {isCheapest && <Badge tone="green">최저가</Badge>}
                        {isBestRated && <Badge tone="amber">평점 1위</Badge>}
                      </div>

                      <div className="mt-1.5 flex items-center gap-2">
                        <Stars rating={p.rating} />
                        <span className="tnum text-[13px] font-bold text-ink-900">{p.rating.toFixed(1)}</span>
                        <span className="text-[12.5px] text-ink-400">
                          후기 {p.reviewCount} · 완료 {p.completedJobs}건
                        </span>
                      </div>

                      <p className="mt-3 whitespace-pre-line text-[13.5px] leading-relaxed text-ink-600">{q.message}</p>

                      <dl className="tnum mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                        {[
                          ["투입 인원", `${q.crewSize}명`],
                          ["예상 작업", `${q.workHours}시간`],
                          ["작업 가능일", q.availableDate],
                          ["무상 A/S", `${q.warrantyDays}일`],
                        ].map(([k, v]) => (
                          <div key={k} className="rounded-lg bg-ink-50 px-3 py-2">
                            <dt className="text-[11.5px] text-ink-400">{k}</dt>
                            <dd className="text-[13px] font-bold text-ink-800">{v}</dd>
                          </div>
                        ))}
                      </dl>

                      {q.includes.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-1.5">
                          {q.includes.map((inc) => (
                            <li key={inc} className="rounded-md bg-brand-50 px-2 py-1 text-[11.5px] font-semibold text-brand-700">
                              ✓ {inc}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="flex w-full shrink-0 flex-col justify-between gap-3 border-t border-ink-100 pt-4 sm:w-52 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                      <div className="text-right">
                        <p className="text-[12px] text-ink-400">부가세 포함 총액</p>
                        <p className="tnum text-[24px] font-extrabold leading-tight text-ink-900">{won(q.amount)}</p>
                        {req.estimateMax > 0 && q.amount < req.estimateMax && (
                          <p className="tnum mt-0.5 text-[12px] font-bold text-emerald-600">
                            예상 상한 대비 {manwon(req.estimateMax - q.amount)} 절약
                          </p>
                        )}
                        <p className="mt-1 text-[11.5px] text-ink-400">{timeAgo(q.createdAt)} 도착</p>
                      </div>
                      <AcceptQuoteForm requestId={req.id} quoteId={q.id} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-ink-200 bg-white p-5">
        <p className="text-sm font-extrabold text-ink-900">업체를 선택하면 어떻게 되나요?</p>
        <ol className="mt-3 space-y-2 text-[13.5px] text-ink-600">
          <li>1. 결제 페이지로 이동합니다. 이 시점까지 비용은 발생하지 않습니다.</li>
          <li>2. 결제하면 금액은 청소모아가 보관(에스크로)하고, 업체에 상세 주소와 연락처가 전달됩니다.</li>
          <li>3. 작업 완료 후 고객이 확인하면 수수료를 제외한 금액이 업체에 정산됩니다.</li>
        </ol>
        <p className="mt-3 text-[12.5px] text-ink-400">
          작업 3일 전까지 취소하면 전액 환불됩니다. 자세한 내용은{" "}
          <Link href="/safety" className="font-semibold text-brand-700 underline">안심 보장 제도</Link>를 확인하세요.
        </p>
      </section>
    </div>
  );
}
