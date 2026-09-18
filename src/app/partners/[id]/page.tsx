import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPartner, getUser, listReviewsByPartner } from "@/lib/service";
import { SERVICE_MAP } from "@/lib/catalog";
import { TIER_LABEL } from "@/lib/fees";
import { dateFull } from "@/lib/format";
import { Badge, EmptyState, LinkButton, Stars, TierBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getPartner(id);
  return p
    ? { title: `${p.companyName} 업체 정보`, description: p.intro.slice(0, 120) }
    : { title: "업체 정보" };
}

export default async function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partner = getPartner(id);
  if (!partner) notFound();

  const allReviews = listReviewsByPartner(partner.id);
  const reviews = allReviews.slice(0, 12);
  const avg = (key: "kindness" | "detail" | "punctuality") =>
    allReviews.length ? (allReviews.reduce((s, r) => s + r.scores[key], 0) / allReviews.length).toFixed(1) : "-";

  return (
    <>
      <section className="hero-mesh border-b border-ink-100 py-12">
        <div className="container-page">
          <nav className="mb-5 flex items-center gap-2 text-[13px] font-semibold text-ink-400">
            <Link href="/partners" className="hover:text-ink-700">등록 업체</Link>
            <span>/</span>
            <span className="text-ink-700">{partner.companyName}</span>
          </nav>

          <div className="flex flex-wrap items-start gap-5">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-600 text-2xl font-extrabold text-white">
              {partner.companyName.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[26px] font-extrabold text-ink-900">{partner.companyName}</h1>
                <TierBadge tier={partner.tier} />
                {partner.hasInsurance && <Badge tone="blue">배상책임보험</Badge>}
                {partner.status === "approved" && <Badge tone="green">사업자 확인 완료</Badge>}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <Stars rating={partner.rating} size={16} />
                  <span className="tnum text-[15px] font-extrabold text-ink-900">{partner.rating.toFixed(1)}</span>
                </span>
                <span className="tnum text-[13px] text-ink-500">후기 {partner.reviewCount}개 · 완료 {partner.completedJobs}건</span>
              </div>
              <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-ink-600">{partner.intro}</p>
            </div>
            <LinkButton href="/request/new" size="lg">이 업체에 견적 요청</LinkButton>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-8 py-12 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section>
            <h2 className="text-[18px] font-extrabold text-ink-900">가능한 청소 종류</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {partner.services.map((s) => {
                const def = SERVICE_MAP[s];
                return (
                  <li key={s}>
                    <Link href={`/services/${s}`} className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-4 transition hover:border-brand-300">
                      <span className="text-xl">{def.emoji}</span>
                      <span>
                        <span className="block text-[14px] font-bold text-ink-900">{def.name}</span>
                        <span className="block text-[12px] text-ink-400">{def.short}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-extrabold text-ink-900">고객 후기 {allReviews.length}개</h2>
            {reviews.length === 0 ? (
              <div className="mt-4">
                <EmptyState icon="⭐" title="아직 후기가 없습니다" desc="작업이 완료된 고객만 후기를 남길 수 있습니다." />
              </div>
            ) : (
              <>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {[
                    ["친절도", avg("kindness")],
                    ["꼼꼼함", avg("detail")],
                    ["시간 준수", avg("punctuality")],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-ink-200 bg-white px-4 py-3">
                      <p className="text-[12.5px] text-ink-400">{k}</p>
                      <p className="tnum mt-0.5 text-[17px] font-extrabold text-ink-900">{v}</p>
                    </div>
                  ))}
                </div>
                <ul className="mt-4 space-y-3">
                  {reviews.map((r) => {
                    const author = getUser(r.customerId);
                    return (
                      <li key={r.id} className="card p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Stars rating={r.rating} size={15} />
                          <span className="tnum text-[13px] font-bold text-ink-900">{r.rating.toFixed(1)}</span>
                          <span className="text-[12.5px] text-ink-400">{author ? `${author.name.slice(0, 1)}**` : "고객"} 님</span>
                          <span className="tnum ml-auto text-[12px] text-ink-400">{dateFull(r.createdAt)}</span>
                        </div>
                        <p className="mt-2.5 whitespace-pre-line text-[14px] leading-relaxed text-ink-700">{r.content}</p>
                        {r.reply && (
                          <div className="mt-3 rounded-xl border-l-2 border-brand-400 bg-brand-50/60 p-3.5">
                            <p className="text-[12px] font-bold text-brand-700">업체 답변</p>
                            <p className="mt-1 text-[13.5px] text-ink-700">{r.reply}</p>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {allReviews.length > reviews.length && (
                  <p className="tnum mt-4 text-center text-[13px] text-ink-400">
                    최근 {reviews.length}개를 보여드리고 있습니다 (전체 {allReviews.length}개)
                  </p>
                )}
              </>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <p className="text-[13px] font-bold text-ink-400">업체 정보</p>
            <dl className="tnum mt-3 space-y-2.5 text-[13.5px]">
              {[
                ["대표자", partner.ceoName],
                ["사업자번호", partner.bizNo],
                ["설립", `${partner.since}년`],
                ["상시 인력", `${partner.crewSize}명`],
                ["평균 응답", `${partner.responseMinutes}분`],
                ["등급", `${TIER_LABEL[partner.tier]} 파트너`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-ink-100 pb-2">
                  <dt className="shrink-0 text-ink-400">{k}</dt>
                  <dd className="text-right font-semibold text-ink-800">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card p-5">
            <p className="text-[13px] font-bold text-ink-400">서비스 지역</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {partner.regions.map((r) => (
                <span key={r} className="rounded-md bg-ink-100 px-2 py-1 text-[12px] font-semibold text-ink-600">{r}</span>
              ))}
            </div>
          </div>

          {partner.certifications.length > 0 && (
            <div className="card p-5">
              <p className="text-[13px] font-bold text-ink-400">보유 인증</p>
              <ul className="mt-2 space-y-1.5">
                {partner.certifications.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-[13px] text-ink-600">
                    <span className="mt-0.5 text-brand-600">✓</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-5">
            <p className="text-[13px] leading-relaxed text-brand-800">
              특정 업체를 지정해 요청할 수는 없지만, 요청서를 보내면 이 업체를 포함한 조건에 맞는 업체들이 견적을 보냅니다.
            </p>
            <LinkButton href="/request/new" className="mt-3 w-full">견적 요청하기</LinkButton>
          </div>
        </aside>
      </div>
    </>
  );
}
