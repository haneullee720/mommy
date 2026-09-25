import Link from "next/link";
import { QuickEstimate } from "@/components/quick-estimate";
import { Faq } from "@/components/faq";
import { Media } from "@/components/media";
import { BeforeAfter } from "@/components/before-after";
import { EscrowFlow } from "@/components/escrow-flow";
import { FeeBar } from "@/components/fee-bar";
import { StepFlow, type Step } from "@/components/step-flow";
import { Icon, type IconName } from "@/components/icons";
import { LinkButton, Rating, SectionHeading, Stars, TierBadge } from "@/components/ui";
import { SERVICES, SERVICE_MAP } from "@/lib/catalog";
import { getUsersByIds, listPartners, listRecentReviews, platformStats, readOpenFeed } from "@/lib/home";
import { isGenerated } from "@/lib/media";
import { manwon, timeAgo, untilDeadline } from "@/lib/format";

export const dynamic = "force-dynamic";

const STEPS: Step[] = [
  { icon: "document", title: "요청서 작성", note: "3분이면 끝납니다" },
  { icon: "inbox", title: "견적 도착", note: "여러 업체가 보냅니다" },
  { icon: "scale", title: "비교 후 선택", note: "가격·후기·A/S를 한 화면에서" },
  { icon: "shield", title: "안전결제", note: "확인 후에 업체로 지급" },
];

/** 히어로 아래 띠. 전부 우리가 실제로 지키는 약속만 적는다. */
const PROMISES: { icon: IconName; title: string; note: string }[] = [
  { icon: "shield", title: "검증된 업체만", note: "사업자등록증·배상책임보험 확인" },
  { icon: "scale", title: "견적 비교는 무료", note: "요청부터 선택까지 0원" },
  { icon: "lock", title: "안전결제", note: "작업 확인 후에 업체로 지급" },
];

/** 왜 청소모아인가 — 플랫폼이 직접 이행하는 것들 */
const REASONS: { icon: IconName; title: string; desc: string }[] = [
  { icon: "shield", title: "검증된 업체", desc: "사업자등록증과 배상책임보험을 확인한 업체만 등록됩니다." },
  { icon: "scale", title: "정직한 견적", desc: "광고비로 순서를 바꾸지 않습니다. 평점과 완료 건수로만 정렬합니다." },
  { icon: "lock", title: "안전결제", desc: "결제한 돈은 청소모아가 예치했다가 작업 확인 후 지급합니다." },
  { icon: "check", title: "무상 A/S", desc: "모든 계약에 최소 7일의 무상 재작업이 포함됩니다." },
];

const FAQS = [
  { q: "견적을 받는 데 돈이 드나요?", a: "아니요. 요청서 작성부터 견적 비교, 업체 선택까지 모두 무료입니다.\n고객이 내는 금액은 선택한 업체의 시공 금액뿐입니다." },
  { q: "선결제한 돈은 언제 업체에 넘어가나요?", a: "작업이 끝나고 고객이 '작업 확인'을 누른 뒤 넘어갑니다.\n그전까지는 청소모아가 예치합니다. 7일 동안 확인이 없으면 자동 확정됩니다." },
  { q: "청소가 마음에 들지 않으면요?", a: "작업 확인 전에 재작업을 요청하세요. 모든 계약에 최소 7일의 무상 A/S가 포함됩니다.\n협의가 안 되면 청소모아가 예치금을 쥔 채로 조정합니다." },
];

// Tailwind 는 소스에 그대로 적힌 클래스만 만들어 내므로 조합이 아닌 표로 둔다.
const STAT_COLS: Record<number, string> = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" };

export default async function HomePage() {
  const [stats, allPartners, reviews, feed] = await Promise.all([
    platformStats(),
    listPartners(),
    listRecentReviews(3),
    readOpenFeed(6),
  ]);
  const partners = allPartners.slice(0, 4);
  const reviewAuthors = await getUsersByIds(reviews.map((r) => r.customerId));
  const sampleBeforeAfter = isGenerated("before") || isGenerated("after");

  // 실적 숫자는 실제 데이터가 있을 때만 보여준다.
  // 없는 만족도·견적 수를 대신 채워 넣으면 손님이 그 숫자를 믿고 업체를 고르게 된다.
  const heroStats: { v: string; l: string }[] = [];
  if (stats.avgQuotesPerRequest > 0)
    heroStats.push({ v: `${stats.avgQuotesPerRequest}개`, l: "요청당 평균 견적" });
  if (stats.avgRating > 0) heroStats.push({ v: `${stats.avgRating}점`, l: "평균 만족도" });
  if (stats.completedCount > 0)
    heroStats.push({ v: `${stats.completedCount.toLocaleString("ko-KR")}건`, l: "누적 완료" });

  return (
    <>
      {/* ---------------------------------------------------------- 히어로 */}
      <section className="hero-wash">
        <div className="container-page section-sm">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <div className="animate-rise">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-[12.5px] font-bold text-brand-700 shadow-soft">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
                {stats.partnerCount > 0
                  ? `지금 ${stats.partnerCount}개 업체 대기중`
                  : "청소 업체 등록을 받고 있습니다"}
              </p>
              <h1 className="t-display mt-5 text-ink-900">
                청소 견적,
                <br />
                <span className="text-brand-600">한 번에 모아</span> 비교하세요
              </h1>
              <p className="t-lead mt-5 max-w-md">
                입주청소·사무실청소·계단청소까지.
                <br />
                요청서 하나면 우리 동네 검증 업체들이 견적을 보냅니다.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <LinkButton href="/request/new" size="lg">
                  무료 견적 받기
                  <Icon name="arrowRight" className="h-4 w-4" />
                </LinkButton>
                <LinkButton href="/services" variant="secondary" size="lg">서비스 보기</LinkButton>
              </div>

              <ul className="mt-10 grid gap-5 sm:grid-cols-3">
                {PROMISES.map((p) => (
                  <li key={p.title} className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-white/80 text-brand-600 shadow-soft">
                      <Icon name={p.icon} className="h-4.5 w-4.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-bold text-ink-900">{p.title}</span>
                      <span className="block text-[12.5px] leading-snug text-ink-500">{p.note}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Media
              name="hero"
              alt="햇빛이 드는 거실에서 청소하는 모습"
              ratio="16 / 9"
              eager
              className="animate-rise rounded-2xl shadow-lift"
            />
          </div>

          <div className="mt-14">
            {heroStats.length > 0 && (
              <dl className={`card mb-6 grid divide-x divide-ink-100 p-7 shadow-soft ${STAT_COLS[heroStats.length]}`}>
                {heroStats.map((s, i) => (
                  <div key={s.l} className={i > 0 ? "pl-6 sm:pl-10" : ""}>
                    <dt className="tnum text-[26px] font-extrabold leading-none tracking-[-0.03em] text-brand-600 sm:text-[32px]">
                      {s.v}
                    </dt>
                    <dd className="t-caption mt-2.5">{s.l}</dd>
                  </div>
                ))}
              </dl>
            )}
            <QuickEstimate />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- 서비스 */}
      <section className="section">
        <div className="container-page">
          <SectionHeading
            align="center"
            title={<>청소모아의 <span className="text-brand-600">전문 서비스</span></>}
            desc="공간에 맞는 맞춤형 청소 서비스로 더 깨끗한 일상을 만들어드립니다."
          />

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="card card-hover group block h-full overflow-hidden">
                  <Media name={s.slug} alt={`${s.name} 작업 공간`} />
                  <div className="flex items-start gap-3 p-5">
                    <span className="icon-chip h-10 w-10 shrink-0">
                      <Icon name={s.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-bold text-ink-900">{s.name}</span>
                      <span className="mt-1 block text-[13px] leading-snug text-ink-500">{s.short}</span>
                      <span className="tnum mt-2 block text-[13px] font-bold text-brand-600">
                        {s.unit === "month" ? "월 " : "평당 "}
                        {manwon(s.unitPriceMin)}~
                      </span>
                    </span>
                    <Icon
                      name="arrowRight"
                      className="mt-1 h-4 w-4 shrink-0 text-ink-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-600"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------------- 왜 청소모아인가 */}
      <section className="section section-tint">
        <div className="container-page">
          <SectionHeading
            align="center"
            title={<>청소모아가 <span className="text-brand-600">특별한 이유</span></>}
            desc="빠른 연결보다 안전한 거래를 먼저 만듭니다."
          />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map((r) => (
              <li key={r.title} className="card card-hover h-full bg-white p-7">
                <span className="icon-chip">
                  <Icon name={r.icon} className="h-6 w-6" />
                </span>
                <p className="mt-5 text-[17px] font-bold text-ink-900">{r.title}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-500">{r.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------------- 전후 비교 */}
      <section className="section">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <BeforeAfter
            className="overflow-hidden rounded-2xl border border-ink-100 shadow-soft"
            sample={sampleBeforeAfter}
            before={<Media name="before" alt="청소 전 상태" fill showBadge={false} />}
            after={<Media name="after" alt="청소 후 상태" fill showBadge={false} />}
          />
          <div>
            <p className="t-eyebrow">Before / After</p>
            <h2 className="t-h2 mt-4 text-ink-900">
              손잡이를 끌어
              <br />
              <span className="text-brand-600">차이를 확인하세요</span>
            </h2>
            <p className="t-lead mt-5">모든 작업은 전후 사진으로 기록됩니다.</p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- 이용 절차 */}
      <section className="section section-tint">
        <div className="container-page">
          <SectionHeading
            align="center"
            title={<>이용 <span className="text-brand-600">절차</span></>}
            desc="간단한 절차로 쉽고 편리하게 이용하세요."
          />
          <StepFlow steps={STEPS} className="mt-14" />
          <div className="mt-14 text-center">
            <LinkButton href="/request/new" size="lg">
              요청서 작성하기
              <Icon name="arrowRight" className="h-4 w-4" />
            </LinkButton>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- 안심 보장 */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
        <div className="container-page section">
          <div className="max-w-xl">
            <p className="t-eyebrow text-brand-100">Trust</p>
            <h2 className="t-h2 mt-4">결제한 돈은 여기 머뭅니다</h2>
          </div>
          <div className="mt-14">
            <EscrowFlow tone="dark" />
          </div>
          <div className="mt-14 flex flex-col items-start gap-4 border-t border-white/20 pt-10 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[15px] text-brand-50">업체가 오지 않으면 100% 환불 · 7일 무상 A/S</p>
            <Link
              href="/safety"
              className="inline-flex h-11 items-center rounded-xl border border-white/40 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-white hover:text-brand-700"
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
            <SectionHeading
              align="center"
              title={<>지금 견적을 받고 있는 <span className="text-brand-600">요청</span></>}
            />
            <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {feed.map((f) => (
                <li key={f.id} className="card card-hover p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-[13px] font-bold text-ink-800">
                      <Icon name={SERVICE_MAP[f.service].icon} className="h-4 w-4 text-brand-500" />
                      {SERVICE_MAP[f.service].name}
                    </span>
                    <span className="t-caption">{untilDeadline(f.expiresAt)}</span>
                  </div>
                  <p className="tnum mt-4 text-[15px] font-bold text-ink-900">
                    {f.region} {f.district} · {f.areaPyeong}평
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4">
                    <span className="t-caption">{timeAgo(f.createdAt)}</span>
                    <span className="tnum text-[13px] font-bold text-brand-600">견적 {f.quoteCount}개</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------- 후기 */}
      {reviews.length > 0 && (
        <section className="section section-tint">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                title={<>고객님의 <span className="text-brand-600">생생한 후기</span></>}
                desc="청소모아를 이용하신 고객님들이 직접 남긴 후기입니다."
              />
              <LinkButton href="/partners" variant="secondary">
                더 많은 후기 보기
                <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </LinkButton>
            </div>
            <ul className="mt-10 grid gap-6 md:grid-cols-3">
              {reviews.map((r) => (
                <li key={r.id} className="card h-full bg-white p-6 shadow-soft">
                  <Stars rating={r.rating} size={15} />
                  <blockquote className="mt-4 text-[14.5px] leading-[1.75] text-ink-700">{r.content}</blockquote>
                  <figcaption className="t-caption mt-5 border-t border-ink-100 pt-4">
                    {reviewAuthors.get(r.customerId)?.name.slice(0, 1) ?? "고"}** 고객님 · {timeAgo(r.createdAt)}
                  </figcaption>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------- 업체 */}
      {partners.length > 0 && (
        <section className="section">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading title={<>평점 높은 <span className="text-brand-600">업체</span></>} />
              <LinkButton href="/partners" variant="secondary">
                전체 보기
                <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </LinkButton>
            </div>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {partners.map((p) => (
                <li key={p.id}>
                  <Link href={`/partners/${p.id}`} className="card card-hover block h-full p-6">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[15px] font-bold text-ink-900">{p.companyName}</span>
                      <TierBadge tier={p.tier} />
                    </div>
                    <Rating value={p.rating} count={p.reviewCount} className="mt-3" />
                    <p className="tnum mt-3 border-t border-ink-100 pt-3 text-[13px] text-ink-500">
                      완료 {p.completedJobs}건
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------- 파트너 모집 */}
      <section className="section section-tint">
        <div className="container-page grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="t-eyebrow">For partners</p>
            <h2 className="t-h2 mt-4 text-ink-900">
              전단지 대신,
              <br />
              <span className="text-brand-600">견적서로 일감을</span>
            </h2>
            <ul className="mt-8 space-y-3.5">
              {[
                "입점비·월 이용료 0원",
                "성사된 건만 수수료 10~15%",
                "결제된 건만 배정 — 노쇼 없음",
                "작업 확인 후 영업일 3일 내 정산",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] text-ink-700">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
                    <Icon name="check" className="h-3 w-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/partner-signup" size="lg">업체 등록 신청</LinkButton>
              <LinkButton href="/pricing" size="lg" variant="secondary">수수료 정책</LinkButton>
            </div>
          </div>

          <div className="card bg-white p-7 shadow-soft">
            <p className="t-eyebrow">정산 예시 · 입주청소 32평</p>
            <FeeBar amount={420000} feeRate={0.12} className="mt-6" />
            <p className="t-caption mt-6">카드·이체 수수료는 청소모아가 부담합니다.</p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- FAQ */}
      <section className="section">
        <div className="container-page">
          <SectionHeading
            align="center"
            title={<>자주 묻는 <span className="text-brand-600">질문</span></>}
          />
          <div className="mx-auto mt-10 max-w-3xl">
            <Faq items={FAQS} />
            <div className="mt-8 text-center">
              <Link href="/faq" className="text-[14px] font-bold text-brand-600 hover:underline">
                전체 질문 보기 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- 마지막 CTA */}
      <section className="pb-16">
        <div className="container-page">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 px-8 py-12 text-white shadow-lift sm:px-12">
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <p className="t-eyebrow text-brand-100">Clean together</p>
                <h2 className="t-h2 mt-3">
                  지금 바로, <span className="text-white/80">깨끗한 변화를</span> 경험하세요
                </h2>
                <p className="mt-3 text-[15px] text-brand-50">전화 돌리지 마세요. 요청서 하나면 됩니다.</p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link
                  href="/request/new"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-white px-7 text-[15px] font-bold text-brand-700 transition-colors hover:bg-brand-50"
                >
                  무료 견적 받기
                  <Icon name="arrowRight" className="h-4 w-4" />
                </Link>
                <Link
                  href="/partner-signup"
                  className="inline-flex h-13 items-center justify-center rounded-xl border border-white/40 px-7 text-[15px] font-bold text-white transition-colors hover:bg-white/10"
                >
                  업체로 등록하기
                </Link>
              </div>
            </div>
          </div>

          {sampleBeforeAfter && (
            <p className="t-caption mt-6 text-center">
              카테고리 이미지는 예시이며 실제 시공 결과와 다를 수 있습니다.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
