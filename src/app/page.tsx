import Link from "next/link";
import { QuickEstimate } from "@/components/quick-estimate";
import { Faq } from "@/components/faq";
import { LinkButton, SectionHeading, Stars, TierBadge, Badge } from "@/components/ui";
import { SERVICES, SERVICE_MAP } from "@/lib/catalog";
import { listPartners, listRecentReviews, platformStats, readOpenFeed } from "@/lib/home";
import { manwon, timeAgo, untilDeadline } from "@/lib/format";
import { getUser } from "@/lib/service";

export const dynamic = "force-dynamic";

const STEPS = [
  { n: "01", title: "요청서 3분 작성", desc: "청소 종류·평수·희망일만 입력하면 끝. 주소 상세와 연락처는 결제 전까지 공개되지 않습니다.", emoji: "📝" },
  { n: "02", title: "업체 견적 도착", desc: "조건에 맞는 검증 업체들이 금액·인원·작업시간을 담아 견적을 보냅니다. 평균 5곳.", emoji: "📬" },
  { n: "03", title: "비교 후 선택", desc: "가격만이 아니라 별점·완료건수·A/S 기간까지 한 화면에서 비교하고 고르세요.", emoji: "⚖️" },
  { n: "04", title: "안전결제 후 시공", desc: "결제금은 청소모아가 보관합니다. 작업 확인 후에야 업체에 지급돼요.", emoji: "🛡️" },
];

const GUARANTEES = [
  {
    emoji: "🔒",
    title: "안전결제(에스크로)",
    desc: "선결제 금액은 작업 완료를 확인할 때까지 청소모아가 보관합니다. 업체가 나타나지 않으면 100% 환불됩니다.",
  },
  {
    emoji: "📄",
    title: "배상책임보험 확인",
    desc: "입점 시 사업자등록증과 배상책임보험 가입 여부를 확인합니다. 시공 중 파손은 보험으로 처리됩니다.",
  },
  {
    emoji: "🔁",
    title: "무상 재작업 A/S",
    desc: "작업 후 7일 이내 미흡한 부분은 무상 재작업. 협의가 안 되면 청소모아가 직접 분쟁을 조정합니다.",
  },
];

const FAQS = [
  {
    q: "견적을 받는 데 돈이 드나요?",
    a: "아니요. 요청서 작성부터 견적 비교, 업체 선택까지 모두 무료입니다.\n고객이 내는 금액은 선택한 업체의 시공 금액뿐이고, 청소모아는 업체가 내는 중개 수수료로 운영됩니다.",
  },
  {
    q: "선결제한 돈은 언제 업체에 넘어가나요?",
    a: "결제 즉시 넘어가지 않습니다. 청소모아가 예치(에스크로)하고 있다가,\n작업이 끝나고 고객이 '작업 확인'을 누른 뒤 정산됩니다. 7일 동안 확인이 없으면 자동 확정됩니다.",
  },
  {
    q: "청소가 마음에 들지 않으면 어떻게 하나요?",
    a: "작업 확인 전이라면 재작업을 요청하세요. 모든 계약에는 최소 7일의 무상 A/S 기간이 포함됩니다.\n업체와 협의가 되지 않으면 청소모아 분쟁조정팀이 개입해 부분 환불 또는 전액 환불을 결정합니다.",
  },
  {
    q: "업체는 어떻게 검증하나요?",
    a: "사업자등록증, 배상책임보험 증권, 대표자 실명을 확인한 뒤 승인합니다.\n승인 후에도 평점 4.0 미만이 누적되거나 노쇼가 발생하면 노출이 제한되고, 반복되면 퇴출됩니다.",
  },
  {
    q: "업체 입장에서 수수료는 얼마인가요?",
    a: "결제 금액 기준 10~15%입니다. 등급이 올라갈수록 낮아집니다(일반 15% → 우수 12% → 프리미엄 10%).\n입점비·월 이용료·견적 제출 비용은 0원이고, 실제 성사된 건에만 수수료가 발생합니다.",
  },
  {
    q: "정산은 언제 받나요?",
    a: "고객이 작업을 확인하면 수수료를 제외한 금액이 정산 대기로 잡히고, 영업일 기준 3일 안에 등록한 계좌로 입금됩니다.\n고객 미확인 건도 7일 뒤 자동 확정되어 정산됩니다.",
  },
];

export default function HomePage() {
  const stats = platformStats();
  const partners = listPartners().slice(0, 4);
  const reviews = listRecentReviews(3);
  const feed = readOpenFeed(6);

  return (
    <>
      {/* ------------------------------------------------------------ 히어로 */}
      <section className="hero-mesh border-b border-ink-100">
        <div className="container-page grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_440px] lg:py-20">
          <div className="animate-rise">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3.5 py-1.5 text-[13px] font-bold text-brand-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
              </span>
              지금 {stats.partnerCount}개 업체가 견적 대기중
            </div>

            <h1 className="mt-5 text-[34px] font-extrabold leading-[1.18] tracking-tight text-ink-900 sm:text-[46px] lg:text-[52px]">
              청소 견적,
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">한 번에 모아</span>
                <span className="absolute inset-x-0 bottom-1 z-0 h-3.5 bg-brand-200/70" aria-hidden />
              </span>{" "}
              비교하세요
            </h1>

            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-500 sm:text-[17px]">
              입주청소부터 계단·사무실 정기청소까지. 요청서 하나면 우리 동네 검증 업체들이 견적을 보냅니다.
              <br className="hidden sm:block" />
              가격·후기·A/S를 비교해 고르고, 안전결제로 맡기세요.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/request/new" size="lg" className="sm:px-8">
                3분 만에 견적 요청하기
              </LinkButton>
              <LinkButton href="/how-it-works" variant="secondary" size="lg">
                이용 방법 보기
              </LinkButton>
            </div>

            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-ink-200/70 pt-7">
              {[
                { v: `${stats.avgQuotesPerRequest || 5}개`, l: "요청당 평균 견적" },
                { v: `${stats.avgRating || 4.8}점`, l: "평균 만족도" },
                { v: `${stats.completedCount.toLocaleString("ko-KR")}건`, l: "누적 완료 건수" },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="tnum text-[22px] font-extrabold text-ink-900 sm:text-2xl">{s.v}</dt>
                  <dd className="mt-0.5 text-[12.5px] font-medium text-ink-400">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-rise lg:sticky lg:top-24">
            <QuickEstimate />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ 서비스 */}
      <section className="container-page py-20">
        <SectionHeading
          eyebrow="SERVICES"
          title="어떤 청소든, 맞는 업체가 있습니다"
          desc="집·건물·매장까지 8가지 청소 카테고리. 카테고리마다 실제 시공 단가를 공개합니다."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="card group relative flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift"
            >
              {s.popular && (
                <span className="absolute right-4 top-4">
                  <Badge tone="amber">인기</Badge>
                </span>
              )}
              <span className="text-3xl">{s.emoji}</span>
              <div>
                <p className="text-[17px] font-extrabold text-ink-900">{s.name}</p>
                <p className="mt-0.5 text-[13px] font-medium text-ink-400">{s.short}</p>
              </div>
              <p className="line-clamp-2 text-[13.5px] leading-relaxed text-ink-500">{s.description}</p>
              <div className="mt-auto flex items-center justify-between border-t border-ink-100 pt-3">
                <span className="tnum text-[13.5px] font-bold text-brand-700">
                  {s.unit === "month" ? "월 " : "평당 "}
                  {manwon(s.unitPriceMin)}~
                </span>
                <span className="text-[13px] font-semibold text-ink-400 transition group-hover:text-brand-700">자세히 →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ 이용 방법 */}
      <section className="border-y border-ink-100 bg-ink-50/60 py-20">
        <div className="container-page">
          <SectionHeading eyebrow="HOW IT WORKS" title="요청부터 정산까지, 네 단계" desc="복잡한 전화 돌리기 없이 화면 안에서 끝납니다." />
          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                <div className="card h-full p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="tnum text-sm font-extrabold text-brand-200">{s.n}</span>
                  </div>
                  <p className="mt-4 text-[16.5px] font-extrabold text-ink-900">{s.title}</p>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <span className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-ink-300 md:block" aria-hidden>
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <LinkButton href="/request/new" size="lg">
              지금 요청서 작성하기
            </LinkButton>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ 실시간 요청 피드 */}
      {feed.length > 0 && (
        <section className="container-page py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              align="left"
              eyebrow="LIVE"
              title="지금 견적을 받고 있는 요청"
              desc="업체가 보고 있는 실제 요청입니다. 주소 상세와 연락처는 결제 전까지 가려집니다."
            />
            <Link href="/partner-signup" className="text-sm font-bold text-brand-700 hover:underline">
              우리 업체도 견적 넣기 →
            </Link>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {feed.map((f) => (
              <div key={f.id} className="card p-5">
                <div className="flex items-center justify-between">
                  <Badge tone="brand">
                    {SERVICE_MAP[f.service].emoji} {SERVICE_MAP[f.service].name}
                  </Badge>
                  <span className="text-[12px] font-semibold text-ink-400">{untilDeadline(f.expiresAt)}</span>
                </div>
                <p className="mt-3 text-[15px] font-bold text-ink-900">
                  {f.region} {f.district} · {f.areaPyeong}평
                </p>
                <p className="tnum mt-1 text-[13px] text-ink-500">
                  희망일 {f.preferredDate} · 예상 {manwon(f.estimateMin)}~{manwon(f.estimateMax)}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
                  <span className="text-[13px] font-semibold text-ink-400">{timeAgo(f.createdAt)} 등록</span>
                  <span className="tnum text-[13px] font-extrabold text-brand-700">견적 {f.quoteCount}개 도착</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------ 안심 보장 */}
      <section className="border-y border-ink-100 bg-ink-900 py-20 text-white">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-bold tracking-wide text-brand-300">TRUST</p>
            <h2 className="text-2xl font-extrabold leading-tight sm:text-[32px]">
              모르는 업체에 선결제, 불안하셨죠
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-300 sm:text-base">
              그래서 청소모아가 돈을 대신 들고 있습니다. 작업이 끝나고 확인하기 전까지는 업체에 한 푼도 넘어가지 않습니다.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {GUARANTEES.map((g) => (
              <div key={g.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur">
                <span className="text-2xl">{g.emoji}</span>
                <p className="mt-4 text-[17px] font-extrabold">{g.title}</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-300">{g.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-6 sm:flex-row sm:justify-between">
            <div>
              <p className="text-[15px] font-bold">결제 흐름이 궁금하신가요?</p>
              <p className="mt-1 text-[13.5px] text-ink-400">결제 → 예치 → 작업 → 확인 → 정산. 각 단계를 그림으로 정리했습니다.</p>
            </div>
            <Link
              href="/safety"
              className="inline-flex h-11 shrink-0 items-center rounded-xl bg-white px-5 text-sm font-bold text-ink-900 transition hover:bg-ink-100"
            >
              안심 보장 제도 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ 업체 */}
      <section className="container-page py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading align="left" eyebrow="PARTNERS" title="평점 높은 청소 업체" desc="완료 건수와 실제 후기로만 순위를 매깁니다. 광고비로 순서를 바꾸지 않습니다." />
          <Link href="/partners" className="text-sm font-bold text-brand-700 hover:underline">
            전체 업체 보기 →
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {partners.map((p) => (
            <Link key={p.id} href={`/partners/${p.id}`} className="card p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift">
              <div className="flex items-start justify-between gap-2">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-lg font-extrabold text-brand-700">
                  {p.companyName.slice(0, 1)}
                </div>
                <TierBadge tier={p.tier} />
              </div>
              <p className="mt-3 text-[15.5px] font-extrabold text-ink-900">{p.companyName}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <Stars rating={p.rating} />
                <span className="tnum text-[13px] font-bold text-ink-900">{p.rating.toFixed(1)}</span>
                <span className="text-[12.5px] text-ink-400">({p.reviewCount})</span>
              </div>
              <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-ink-500">{p.intro}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {p.services.slice(0, 3).map((s) => (
                  <span key={s} className="rounded-md bg-ink-100 px-2 py-1 text-[11.5px] font-semibold text-ink-600">
                    {SERVICE_MAP[s].name}
                  </span>
                ))}
              </div>
              <p className="tnum mt-3 border-t border-ink-100 pt-3 text-[12.5px] font-semibold text-ink-400">
                완료 {p.completedJobs}건 · 평균 응답 {p.responseMinutes}분
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ 후기 */}
      {reviews.length > 0 && (
        <section className="border-y border-ink-100 bg-brand-50/50 py-20">
          <div className="container-page">
            <SectionHeading eyebrow="REVIEWS" title="실제 결제한 고객만 남긴 후기" desc="작업이 완료된 건에 대해서만 후기를 쓸 수 있습니다." />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {reviews.map((r) => {
                const author = getUser(r.customerId);
                return (
                  <figure key={r.id} className="card flex h-full flex-col p-6">
                    <Stars rating={r.rating} size={16} />
                    <blockquote className="mt-3 flex-1 text-[14.5px] leading-relaxed text-ink-700">“{r.content}”</blockquote>
                    <figcaption className="mt-4 border-t border-ink-100 pt-3 text-[12.5px] font-semibold text-ink-400">
                      {author ? `${author.name.slice(0, 1)}**` : "고객"} 님 · {timeAgo(r.createdAt)}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------ 파트너 모집 */}
      <section className="container-page py-20">
        <div className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-soft">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-12">
              <Badge tone="brand">청소 업체 사장님께</Badge>
              <h2 className="mt-4 text-2xl font-extrabold leading-tight text-ink-900 sm:text-[32px]">
                전단지 대신,
                <br />
                견적서로 일감을 받으세요
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-500">
                입점비·월 이용료·견적 제출 비용 모두 0원. 실제로 성사된 건에만 수수료가 발생합니다.
                선결제된 금액은 청소모아가 보관하므로 <strong className="text-ink-800">대금 미지급 걱정이 없습니다.</strong>
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  "수수료 10~15% (등급제, 실적 쌓일수록 인하)",
                  "작업 확인 후 영업일 3일 내 자동 정산",
                  "우리 지역·우리 종목 요청만 골라서 알림",
                  "노쇼·먹튀 고객 차단, 결제된 건만 배정",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[14.5px] font-medium text-ink-700">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100 text-[11px] font-black text-brand-700">
                      ✓
                    </span>
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <LinkButton href="/partner-signup" size="lg" variant="dark">
                  업체 등록 신청 (무료)
                </LinkButton>
                <LinkButton href="/pricing" size="lg" variant="secondary">
                  수수료 정책 보기
                </LinkButton>
              </div>
            </div>

            <div className="stripe-divider relative hidden lg:block">
              <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-brand-600 to-brand-800 p-12 text-white">
                <div className="w-full max-w-sm">
                  <p className="text-[13px] font-bold text-brand-200">정산 예시</p>
                  <p className="mt-1 text-lg font-extrabold">입주청소 32평 시공</p>
                  <div className="mt-6 space-y-3 rounded-2xl bg-white/10 p-5 backdrop-blur">
                    {[
                      ["고객 결제 금액", "420,000원"],
                      ["중개 수수료 (우수 12%)", "-50,400원"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-[14px]">
                        <span className="text-brand-100">{k}</span>
                        <span className="tnum font-bold">{v}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t border-white/20 pt-3">
                      <span className="text-[14px] font-bold">실 정산액</span>
                      <span className="tnum text-xl font-extrabold">369,600원</span>
                    </div>
                  </div>
                  <p className="mt-4 text-[12.5px] leading-relaxed text-brand-100">
                    카드 수수료·정산 이체 수수료는 청소모아가 부담합니다. 표시된 금액이 그대로 입금됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ FAQ */}
      <section className="container-page pb-20">
        <SectionHeading eyebrow="FAQ" title="자주 묻는 질문" />
        <div className="mx-auto mt-10 max-w-3xl">
          <Faq items={FAQS} />
        </div>
      </section>

      {/* ------------------------------------------------------------ 마지막 CTA */}
      <section className="container-page pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-14 text-center text-white sm:px-12">
          <h2 className="text-2xl font-extrabold leading-tight sm:text-[34px]">
            청소 업체 찾느라 전화 돌리지 마세요
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-brand-100 sm:text-base">
            요청서 한 장이면 우리 동네 업체들이 먼저 견적을 보냅니다. 비교는 무료, 결제는 안전하게.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/request/new"
              className="inline-flex h-14 items-center justify-center rounded-xl bg-white px-8 text-base font-extrabold text-brand-700 transition hover:bg-brand-50"
            >
              무료 견적 받기
            </Link>
            <Link
              href="/partner-signup"
              className="inline-flex h-14 items-center justify-center rounded-xl border border-white/30 px-8 text-base font-bold text-white transition hover:bg-white/10"
            >
              업체로 등록하기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
