import Link from "next/link";
import { QuickEstimate } from "@/components/quick-estimate";
import { Faq } from "@/components/faq";
import { Media } from "@/components/media";
import { BeforeAfter } from "@/components/before-after";
import { EscrowFlow } from "@/components/escrow-flow";
import { FeeBar } from "@/components/fee-bar";
import { StepFlow, type Step } from "@/components/step-flow";
import { Icon } from "@/components/icons";
import { LinkButton, Rating, Row, SectionHeading, TierBadge } from "@/components/ui";
import { SERVICES, SERVICE_MAP } from "@/lib/catalog";
import { getUsersByIds, listPartners, listRecentReviews, platformStats, readOpenFeed } from "@/lib/home";
import { isGenerated } from "@/lib/media";
import { manwon, timeAgo, untilDeadline } from "@/lib/format";

export const dynamic = "force-dynamic";

const STEPS: Step[] = [
  { icon: "document", title: "요청서 작성", note: "3분이면 끝납니다" },
  { icon: "inbox", title: "견적 도착", note: "평균 5곳이 보냅니다" },
  { icon: "scale", title: "비교 후 선택", note: "가격·후기·A/S를 한 화면에서" },
  { icon: "shield", title: "안전결제", note: "확인 후에 업체로 지급" },
];

const FAQS = [
  { q: "견적을 받는 데 돈이 드나요?", a: "아니요. 요청서 작성부터 견적 비교, 업체 선택까지 모두 무료입니다.\n고객이 내는 금액은 선택한 업체의 시공 금액뿐입니다." },
  { q: "선결제한 돈은 언제 업체에 넘어가나요?", a: "작업이 끝나고 고객이 '작업 확인'을 누른 뒤 넘어갑니다.\n그전까지는 청소모아가 예치합니다. 7일 동안 확인이 없으면 자동 확정됩니다." },
  { q: "청소가 마음에 들지 않으면요?", a: "작업 확인 전에 재작업을 요청하세요. 모든 계약에 최소 7일의 무상 A/S가 포함됩니다.\n협의가 안 되면 청소모아가 예치금을 쥔 채로 조정합니다." },
];

export default async function HomePage() {
  const [stats, allPartners, reviews, feed] = await Promise.all([
    platformStats(),
    listPartners(),
    listRecentReviews(2),
    readOpenFeed(6),
  ]);
  const partners = allPartners.slice(0, 4);
  const reviewAuthors = await getUsersByIds(reviews.map((r) => r.customerId));
  const [lead] = reviews;
  const sampleBeforeAfter = isGenerated("before") || isGenerated("after");

  return (
    <>
      {/* ---------------------------------------------------------- 히어로 */}
      <section className="section-sm">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div className="animate-rise">
            <p className="t-eyebrow flex items-center gap-2">
              <span className="inline-block h-1 w-1 rounded-full bg-brand-600" />
              지금 {stats.partnerCount}개 업체 대기중
            </p>
            <h1 className="t-display mt-6 text-ink-900">
              청소 견적,
              <br />한 번에 모아
              <br />비교하세요
            </h1>
            <p className="t-lead mt-6 max-w-md">
              요청서 하나면 우리 동네 검증 업체들이 견적을 보냅니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/request/new" size="lg">무료 견적 받기</LinkButton>
              <LinkButton href="/how-it-works" variant="secondary" size="lg">이용 방법</LinkButton>
            </div>
          </div>

          <Media name="hero" alt="청소를 마친 밝은 거실" ratio="16 / 9" eager className="animate-rise rounded" />
        </div>

        <div className="container-page mt-14">
          <dl className="grid grid-cols-3 border-y border-ink-100 py-7">
            {[
              { v: `${stats.avgQuotesPerRequest || 5}개`, l: "요청당 평균 견적" },
              { v: `${stats.avgRating || 4.8}점`, l: "평균 만족도" },
              { v: `${stats.completedCount.toLocaleString("ko-KR")}건`, l: "누적 완료" },
            ].map((s, i) => (
              <div key={s.l} className={i > 0 ? "border-l border-ink-100 pl-6 sm:pl-10" : ""}>
                <dt className="tnum text-[26px] font-bold leading-none tracking-[-0.03em] text-ink-900 sm:text-[32px]">{s.v}</dt>
                <dd className="t-caption mt-2.5">{s.l}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8">
            <QuickEstimate />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- 서비스 */}
      <section className="section">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Services" title="어떤 청소가 필요하세요?" />
            <Link href="/services" className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink-900">
              단가표 보기
              <Icon name="arrowRight" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <ul className="mt-10 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="group block">
                  <Media
                    name={s.slug}
                    alt={`${s.name} 시공 현장`}
                    className="rounded transition-opacity group-hover:opacity-90"
                  />
                  <p className="mt-4 text-[16px] font-semibold text-ink-900">{s.name}</p>
                  <p className="tnum mt-1 text-[13.5px] text-ink-500">
                    {s.unit === "month" ? "월 " : "평당 "}
                    {manwon(s.unitPriceMin)}~
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------------- 전후 비교 */}
      <section className="section border-t border-ink-100">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <BeforeAfter
            className="rounded border border-ink-100"
            sample={sampleBeforeAfter}
            before={<Media name="before" alt="청소 전 상태" fill showBadge={false} />}
            after={<Media name="after" alt="청소 후 상태" fill showBadge={false} />}
          />
          <div>
            <p className="t-eyebrow">Before / After</p>
            <h2 className="t-h2 mt-4 text-ink-900">
              손잡이를 끌어
              <br />차이를 확인하세요
            </h2>
            <p className="t-lead mt-5">모든 작업은 전후 사진으로 기록됩니다.</p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- 이용 방법 */}
      <section className="section border-t border-ink-100">
        <div className="container-page">
          <SectionHeading eyebrow="How it works" title="네 단계면 끝납니다" />
          <StepFlow steps={STEPS} className="mt-12" />
          <div className="mt-12">
            <LinkButton href="/request/new" size="lg">요청서 작성하기</LinkButton>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- 안심 보장 */}
      <section className="bg-ink-900 text-white">
        <div className="container-page section">
          <div className="max-w-xl">
            <p className="t-eyebrow text-ink-400">Trust</p>
            <h2 className="t-h2 mt-4">결제한 돈은 여기 머뭅니다</h2>
          </div>
          <div className="mt-14">
            <EscrowFlow tone="dark" />
          </div>
          <div className="mt-14 flex flex-col items-start gap-4 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[15px] text-ink-300">업체가 오지 않으면 100% 환불 · 7일 무상 A/S</p>
            <Link
              href="/safety"
              className="inline-flex h-11 items-center rounded-md border border-white/20 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-white hover:text-ink-900"
            >
              안심 보장 제도
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- 실시간 피드 */}
      {feed.length > 0 && (
        <section className="section">
          <div className="container-page">
            <SectionHeading eyebrow="Live" title="지금 견적을 받고 있는 요청" />
            <ul className="mt-10 grid border-t border-l border-ink-100 md:grid-cols-2 lg:grid-cols-3">
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
                  <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4">
                    <span className="t-caption">{timeAgo(f.createdAt)}</span>
                    <span className="tnum text-[13px] font-semibold text-brand-700">견적 {f.quoteCount}개</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------- 업체 + 후기 */}
      <section className="section border-t border-ink-100">
        <div className="container-page grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="Partners" title="평점 높은 업체" />
              <Link href="/partners" className="text-[14px] font-semibold text-ink-900 hover:text-brand-700">
                전체 보기 →
              </Link>
            </div>
            <div className="mt-8 border-t border-ink-100">
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
                    <span className="flex flex-wrap items-center gap-x-3">
                      <Rating value={p.rating} count={p.reviewCount} />
                      <span className="tnum text-ink-400">완료 {p.completedJobs}건</span>
                    </span>
                  }
                />
              ))}
            </div>
          </div>

          {lead && (
            <figure className="lg:border-l lg:border-ink-100 lg:pl-14">
              <p className="t-eyebrow">Reviews</p>
              <Rating value={lead.rating} className="mt-5" />
              <blockquote className="mt-4 text-[19px] font-medium leading-[1.6] tracking-[-0.02em] text-ink-900">
                “{lead.content}”
              </blockquote>
              <figcaption className="t-caption mt-5">
                {reviewAuthors.get(lead.customerId)?.name.slice(0, 1) ?? "고"}** 님 · {timeAgo(lead.createdAt)}
              </figcaption>
            </figure>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------- 파트너 모집 */}
      <section className="section border-t border-ink-100">
        <div className="container-page grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="t-eyebrow">For partners</p>
            <h2 className="t-h2 mt-4 text-ink-900">
              전단지 대신,
              <br />견적서로 일감을
            </h2>
            <ul className="mt-8 space-y-3.5">
              {[
                "입점비·월 이용료 0원",
                "성사된 건만 수수료 10~15%",
                "결제된 건만 배정 — 노쇼 없음",
                "작업 확인 후 영업일 3일 내 정산",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] text-ink-700">
                  <Icon name="check" className="mt-1.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/partner-signup" size="lg" variant="dark">업체 등록 신청</LinkButton>
              <LinkButton href="/pricing" size="lg" variant="secondary">수수료 정책</LinkButton>
            </div>
          </div>

          <div>
            <p className="t-eyebrow">정산 예시 · 입주청소 32평</p>
            <FeeBar amount={420000} feeRate={0.12} className="mt-6" />
            <p className="t-caption mt-6">카드·이체 수수료는 청소모아가 부담합니다.</p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- FAQ */}
      <section className="section border-t border-ink-100">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="FAQ" title="자주 묻는 질문" />
            <Link href="/faq" className="text-[14px] font-semibold text-ink-900 hover:text-brand-700">
              전체 보기 →
            </Link>
          </div>
          <div className="mt-10 max-w-3xl">
            <Faq items={FAQS} />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- 고지 */}
      {sampleBeforeAfter && (
        <div className="container-page">
          <p className="t-caption border-t border-ink-100 pt-6">
            카테고리 이미지는 예시이며 실제 시공 결과와 다를 수 있습니다.
          </p>
        </div>
      )}

      {/* ---------------------------------------------------------- 마지막 CTA */}
      <section className="section-sm border-t border-ink-100">
        <div className="container-page flex flex-col items-start justify-between gap-8 py-6 lg:flex-row lg:items-center">
          <h2 className="t-h2 text-ink-900">전화 돌리지 마세요</h2>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <LinkButton href="/request/new" size="lg">무료 견적 받기</LinkButton>
            <LinkButton href="/partner-signup" size="lg" variant="secondary">업체로 등록하기</LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
