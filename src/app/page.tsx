import Link from "next/link";
import { QuickEstimate } from "@/components/quick-estimate";
import { Faq } from "@/components/faq";
import { Icon, type IconName } from "@/components/icons";
import { Badge, LinkButton, Rating, Row, SectionHeading, TierBadge } from "@/components/ui";
import { SERVICES, SERVICE_MAP } from "@/lib/catalog";
import { getUsersByIds, listPartners, listRecentReviews, platformStats, readOpenFeed } from "@/lib/home";
import { manwon, timeAgo, untilDeadline } from "@/lib/format";

export const dynamic = "force-dynamic";

const STEPS: { n: string; title: string; desc: string; icon: IconName }[] = [
  { n: "01", title: "요청서 3분 작성", desc: "청소 종류·평수·희망일만 입력하면 끝. 주소 상세와 연락처는 결제 전까지 공개되지 않습니다.", icon: "document" },
  { n: "02", title: "업체 견적 도착", desc: "조건에 맞는 검증 업체들이 금액·인원·작업시간을 담아 견적을 보냅니다. 평균 5곳.", icon: "inbox" },
  { n: "03", title: "비교 후 선택", desc: "가격만이 아니라 별점·완료건수·A/S 기간까지 한 화면에서 비교하고 고르세요.", icon: "scale" },
  { n: "04", title: "안전결제 후 시공", desc: "결제금은 청소모아가 보관합니다. 작업 확인 후에야 업체에 지급돼요.", icon: "shield" },
];

const GUARANTEES: { icon: IconName; title: string; desc: string }[] = [
  { icon: "lock", title: "안전결제", desc: "선결제 금액은 작업 완료를 확인할 때까지 청소모아가 보관합니다. 업체가 나타나지 않으면 100% 환불됩니다." },
  { icon: "certificate", title: "배상책임보험 확인", desc: "입점 시 사업자등록증과 배상책임보험 가입 여부를 확인합니다. 시공 중 파손은 보험으로 처리됩니다." },
  { icon: "rotate", title: "무상 재작업", desc: "작업 후 7일 이내 미흡한 부분은 무상 재작업. 협의가 안 되면 청소모아가 직접 분쟁을 조정합니다." },
];

const FAQS = [
  { q: "견적을 받는 데 돈이 드나요?", a: "아니요. 요청서 작성부터 견적 비교, 업체 선택까지 모두 무료입니다.\n고객이 내는 금액은 선택한 업체의 시공 금액뿐이고, 청소모아는 업체가 내는 중개 수수료로 운영됩니다." },
  { q: "선결제한 돈은 언제 업체에 넘어가나요?", a: "결제 즉시 넘어가지 않습니다. 청소모아가 예치(에스크로)하고 있다가,\n작업이 끝나고 고객이 '작업 확인'을 누른 뒤 정산됩니다. 7일 동안 확인이 없으면 자동 확정됩니다." },
  { q: "청소가 마음에 들지 않으면 어떻게 하나요?", a: "작업 확인 전이라면 재작업을 요청하세요. 모든 계약에는 최소 7일의 무상 A/S 기간이 포함됩니다.\n업체와 협의가 되지 않으면 청소모아 분쟁조정팀이 개입해 부분 환불 또는 전액 환불을 결정합니다." },
  { q: "업체는 어떻게 검증하나요?", a: "사업자등록증, 배상책임보험 증권, 대표자 실명을 확인한 뒤 승인합니다.\n승인 후에도 평점 4.0 미만이 누적되거나 노쇼가 발생하면 노출이 제한되고, 반복되면 퇴출됩니다." },
  { q: "업체 입장에서 수수료는 얼마인가요?", a: "결제 금액 기준 10~15%입니다. 등급이 올라갈수록 낮아집니다(일반 15% → 우수 12% → 프리미엄 10%).\n입점비·월 이용료·견적 제출 비용은 0원이고, 실제 성사된 건에만 수수료가 발생합니다." },
  { q: "정산은 언제 받나요?", a: "고객이 작업을 확인하면 수수료를 제외한 금액이 정산 대기로 잡히고, 영업일 기준 3일 안에 등록한 계좌로 입금됩니다.\n고객 미확인 건도 7일 뒤 자동 확정되어 정산됩니다." },
];

export default async function HomePage() {
  const [stats, allPartners, reviews, feed] = await Promise.all([
    platformStats(),
    listPartners(),
    listRecentReviews(3),
    readOpenFeed(6),
  ]);
  const partners = allPartners.slice(0, 4);
  const reviewAuthors = await getUsersByIds(reviews.map((r) => r.customerId));
  const [lead, ...rest] = reviews;

  return (
    <>
      {/* ---------------------------------------------------------- 히어로 */}
      <section className="section-lg">
        <div className="container-page">
          <div className="animate-rise max-w-4xl">
            <p className="t-eyebrow flex items-center gap-2">
              <span className="inline-block h-1 w-1 rounded-full bg-brand-600" />
              지금 {stats.partnerCount}개 업체가 견적 대기중
            </p>

            <h1 className="t-display mt-7 text-ink-900">
              청소 견적,
              <br />한 번에 모아 비교하세요
            </h1>

            <p className="t-lead mt-8 max-w-xl">
              입주청소부터 계단·사무실 정기청소까지. 요청서 하나면 우리 동네 검증 업체들이 견적을 보냅니다.
              가격·후기·A/S를 비교해 고르고, 안전결제로 맡기세요.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/request/new" size="lg">3분 만에 견적 요청하기</LinkButton>
              <LinkButton href="/how-it-works" variant="secondary" size="lg">이용 방법 보기</LinkButton>
            </div>
          </div>

          <dl className="mt-20 grid grid-cols-3 border-t border-ink-100 pt-8">
            {[
              { v: `${stats.avgQuotesPerRequest || 5}개`, l: "요청당 평균 견적" },
              { v: `${stats.avgRating || 4.8}점`, l: "평균 만족도" },
              { v: `${stats.completedCount.toLocaleString("ko-KR")}건`, l: "누적 완료" },
            ].map((s, i) => (
              <div key={s.l} className={i > 0 ? "border-l border-ink-100 pl-6 sm:pl-10" : ""}>
                <dt className="tnum text-[28px] font-bold leading-none tracking-[-0.03em] text-ink-900 sm:text-[34px]">
                  {s.v}
                </dt>
                <dd className="t-caption mt-2.5">{s.l}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-14">
            <QuickEstimate />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- 서비스 */}
      <section className="section border-t border-ink-100">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Services"
              title="어떤 청소든, 맞는 업체가 있습니다"
              desc="카테고리마다 실제 시공 단가를 먼저 공개합니다. 업체마다 값이 다른 이유는 포함 범위가 다르기 때문입니다."
            />
            <Link href="/services" className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink-900">
              전체 서비스
              <Icon name="arrowRight" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-12 border-t border-ink-100">
            {SERVICES.map((s) => (
              <Row
                key={s.slug}
                href={`/services/${s.slug}`}
                leading={<Icon name={s.icon} className="h-6 w-6" />}
                title={
                  <span className="flex items-center gap-2.5">
                    {s.name}
                    {s.popular && <Badge tone="amber">인기</Badge>}
                  </span>
                }
                meta={s.short}
                trailing={
                  <span className="tnum text-[14px] font-semibold text-ink-900">
                    {s.unit === "month" ? "월 " : "평당 "}
                    {manwon(s.unitPriceMin)}~
                  </span>
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- 이용 방법 */}
      <section className="section">
        <div className="container-page">
          <SectionHeading eyebrow="How it works" title="요청부터 정산까지, 네 단계" desc="복잡한 전화 돌리기 없이 화면 안에서 끝납니다." />

          <ol className="mt-14 border-t border-ink-100">
            {STEPS.map((s) => (
              <li key={s.n} className="grid gap-4 border-b border-ink-100 py-8 sm:grid-cols-[88px_1fr_auto] sm:items-baseline sm:gap-8">
                <span className="tnum text-[28px] font-bold leading-none tracking-[-0.04em] text-ink-200">{s.n}</span>
                <div>
                  <p className="t-h3 text-ink-900">{s.title}</p>
                  <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-500">{s.desc}</p>
                </div>
                <Icon name={s.icon} className="hidden h-6 w-6 text-ink-300 sm:block" />
              </li>
            ))}
          </ol>

          <div className="mt-12">
            <LinkButton href="/request/new" size="lg">지금 요청서 작성하기</LinkButton>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- 실시간 피드 */}
      {feed.length > 0 && (
        <section className="section border-t border-ink-100">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Live"
                title="지금 견적을 받고 있는 요청"
                desc="업체가 보고 있는 실제 요청입니다. 주소 상세와 연락처는 결제 전까지 가려집니다."
              />
              <Link href="/partner-signup" className="text-[14px] font-semibold text-ink-900 hover:text-brand-700">
                우리 업체도 견적 넣기 →
              </Link>
            </div>

            <ul className="mt-12 grid border-t border-l border-ink-100 md:grid-cols-2 lg:grid-cols-3">
              {feed.map((f) => (
                <li key={f.id} className="border-b border-r border-ink-100 bg-white p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink-700">
                      <Icon name={SERVICE_MAP[f.service].icon} className="h-4 w-4 text-ink-400" />
                      {SERVICE_MAP[f.service].name}
                    </span>
                    <span className="t-caption">{untilDeadline(f.expiresAt)}</span>
                  </div>
                  <p className="tnum mt-4 text-[15px] font-semibold text-ink-900">
                    {f.region} {f.district} · {f.areaPyeong}평
                  </p>
                  <p className="tnum mt-1 text-[13px] text-ink-500">
                    희망일 {f.preferredDate} · 예상 {manwon(f.estimateMin)}~{manwon(f.estimateMax)}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4">
                    <span className="t-caption">{timeAgo(f.createdAt)} 등록</span>
                    <span className="tnum text-[13px] font-semibold text-brand-700">견적 {f.quoteCount}개</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------- 안심 보장 */}
      <section className="bg-ink-900 text-white">
        <div className="container-page section">
          <div className="max-w-2xl">
            <p className="t-eyebrow text-ink-400">Trust</p>
            <h2 className="t-h2 mt-4">모르는 업체에 선결제, 불안하셨죠</h2>
            <p className="mt-5 text-[16px] leading-relaxed text-ink-300">
              그래서 청소모아가 돈을 대신 들고 있습니다. 작업이 끝나고 확인하기 전까지는 업체에 한 푼도 넘어가지 않습니다.
            </p>
          </div>

          <div className="mt-16 grid gap-10 border-t border-white/10 pt-12 md:grid-cols-3 md:gap-0">
            {GUARANTEES.map((g, i) => (
              <div key={g.title} className={i > 0 ? "md:border-l md:border-white/10 md:pl-10" : "md:pr-10"}>
                <Icon name={g.icon} className="h-6 w-6 text-brand-300" />
                <p className="t-h3 mt-5">{g.title}</p>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-400">{g.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col items-start gap-4 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[15px] text-ink-300">결제 → 예치 → 작업 → 확인 → 정산. 각 단계를 정리했습니다.</p>
            <Link
              href="/safety"
              className="inline-flex h-11 items-center rounded-md border border-white/20 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-white hover:text-ink-900"
            >
              안심 보장 제도 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- 업체 */}
      <section className="section">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Partners"
              title="평점 높은 청소 업체"
              desc="완료 건수와 실제 후기로만 순위를 매깁니다. 광고비로 순서를 바꾸지 않습니다."
            />
            <Link href="/partners" className="text-[14px] font-semibold text-ink-900 hover:text-brand-700">
              전체 업체 보기 →
            </Link>
          </div>

          <div className="mt-12 border-t border-ink-100">
            {partners.map((p) => (
              <Row
                key={p.id}
                href={`/partners/${p.id}`}
                title={
                  <span className="flex items-center gap-2.5">
                    {p.companyName}
                    <TierBadge tier={p.tier} />
                  </span>
                }
                meta={
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Rating value={p.rating} count={p.reviewCount} />
                    <span className="tnum text-ink-400">완료 {p.completedJobs}건</span>
                    <span className="hidden text-ink-400 sm:inline">
                      {p.services.slice(0, 3).map((s) => SERVICE_MAP[s].name).join(" · ")}
                    </span>
                  </span>
                }
                trailing={<span className="t-caption hidden sm:block">평균 응답 {p.responseMinutes}분</span>}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- 후기 */}
      {lead && (
        <section className="section border-t border-ink-100">
          <div className="container-page">
            <SectionHeading eyebrow="Reviews" title="실제 결제한 고객만 남긴 후기" />

            <figure className="mt-14 max-w-4xl">
              <blockquote className="text-[22px] font-medium leading-[1.55] tracking-[-0.025em] text-ink-900 sm:text-[30px]">
                “{lead.content}”
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3 text-[13.5px]">
                <Rating value={lead.rating} />
                <span className="text-ink-400">
                  {reviewAuthors.get(lead.customerId)?.name.slice(0, 1) ?? "고"}** 님 · {timeAgo(lead.createdAt)}
                </span>
              </figcaption>
            </figure>

            {rest.length > 0 && (
              <div className="mt-16 grid gap-10 border-t border-ink-100 pt-12 md:grid-cols-2 md:gap-16">
                {rest.map((r) => (
                  <figure key={r.id}>
                    <Rating value={r.rating} />
                    <blockquote className="mt-3 text-[15px] leading-relaxed text-ink-700">“{r.content}”</blockquote>
                    <figcaption className="t-caption mt-3">
                      {reviewAuthors.get(r.customerId)?.name.slice(0, 1) ?? "고"}** 님 · {timeAgo(r.createdAt)}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------- 파트너 모집 */}
      <section className="section border-t border-ink-100">
        <div className="container-page grid gap-16 lg:grid-cols-2">
          <div>
            <p className="t-eyebrow">For partners</p>
            <h2 className="t-h2 mt-4 text-ink-900">
              전단지 대신,
              <br />견적서로 일감을 받으세요
            </h2>
            <p className="t-lead mt-6">
              입점비·월 이용료·견적 제출 비용 모두 0원. 실제로 성사된 건에만 수수료가 발생합니다.
              선결제된 금액은 청소모아가 보관하므로 <strong className="font-semibold text-ink-900">대금 미지급 걱정이 없습니다.</strong>
            </p>

            <ul className="mt-8 space-y-3.5">
              {[
                "수수료 10~15% (등급제, 실적 쌓일수록 인하)",
                "작업 확인 후 영업일 3일 내 자동 정산",
                "우리 지역·우리 종목 요청만 골라서 알림",
                "노쇼·먹튀 고객 차단, 결제된 건만 배정",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[14.5px] text-ink-700">
                  <Icon name="check" className="mt-1 h-3.5 w-3.5 shrink-0 text-brand-600" />
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/partner-signup" size="lg" variant="dark">업체 등록 신청 (무료)</LinkButton>
              <LinkButton href="/pricing" size="lg" variant="secondary">수수료 정책 보기</LinkButton>
            </div>
          </div>

          <div className="lg:pl-16">
            <p className="t-eyebrow">정산 예시</p>
            <p className="t-h3 mt-3 text-ink-900">입주청소 32평 시공</p>
            <dl className="mt-8 border-t border-ink-100">
              {[
                ["고객 결제 금액", "420,000원"],
                ["중개 수수료 (우수 12%)", "−50,400원"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-ink-100 py-4 text-[14.5px]">
                  <dt className="text-ink-500">{k}</dt>
                  <dd className="tnum font-semibold text-ink-900">{v}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between py-6">
                <dt className="text-[15px] font-semibold text-ink-900">실 정산액</dt>
                <dd className="tnum text-[30px] font-bold tracking-[-0.03em] text-brand-700">369,600원</dd>
              </div>
            </dl>
            <p className="t-caption">카드 수수료·정산 이체 수수료는 청소모아가 부담합니다. 표시된 금액이 그대로 입금됩니다.</p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- FAQ */}
      <section className="section border-t border-ink-100">
        <div className="container-page">
          <SectionHeading eyebrow="FAQ" title="자주 묻는 질문" />
          <div className="mt-12 max-w-3xl">
            <Faq items={FAQS} />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- 마지막 CTA */}
      <section className="section-sm border-t border-ink-100">
        <div className="container-page flex flex-col items-start justify-between gap-8 py-8 lg:flex-row lg:items-center">
          <div>
            <h2 className="t-h2 text-ink-900">청소 업체 찾느라 전화 돌리지 마세요</h2>
            <p className="t-lead mt-4">요청서 한 장이면 우리 동네 업체들이 먼저 견적을 보냅니다.</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <LinkButton href="/request/new" size="lg">무료 견적 받기</LinkButton>
            <LinkButton href="/partner-signup" size="lg" variant="secondary">업체로 등록하기</LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
