import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SERVICES, SERVICE_MAP, OPTIONS } from "@/lib/catalog";
import { listPartners } from "@/lib/service";
import { manwon } from "@/lib/format";
import { estimate } from "@/lib/estimate";
import { Badge, LinkButton, Stars, TierBadge } from "@/components/ui";
import { Faq } from "@/components/faq";
import type { ServiceSlug } from "@/lib/types";
import { Icon } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const def = SERVICE_MAP[slug as ServiceSlug];
  if (!def) return { title: "서비스" };
  return {
    title: `${def.name} 가격과 견적`,
    description: `${def.name} ${def.description.slice(0, 80)} 평당 ${manwon(def.unitPriceMin)}부터. 검증 업체 견적을 무료로 비교하세요.`,
  };
}

const SIZES = [10, 18, 24, 32, 45, 60];

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const def = SERVICE_MAP[slug as ServiceSlug];
  if (!def) notFound();

  const partners = (await listPartners({ service: slug as ServiceSlug })).slice(0, 6);
  const others = SERVICES.filter((s) => s.slug !== def.slug).slice(0, 4);

  const table = SIZES.map((size) => ({
    size,
    est: estimate({ service: def.slug, propertyType: "apartment", areaPyeong: size, options: [] }),
  }));

  return (
    <>
      <section className="border-b border-ink-100 py-14">
        <div className="container-page">
          <nav className="mb-5 flex items-center gap-2 text-[13px] font-semibold text-ink-400">
            <Link href="/services" className="hover:text-ink-700">청소 서비스</Link>
            <span>/</span>
            <span className="text-ink-700">{def.name}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <div>
              <Icon name={def.icon} className="h-8 w-8 text-ink-400" />
              <h1 className="mt-3 text-[32px] font-bold leading-tight text-ink-900 sm:text-[40px]">{def.name}</h1>
              <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-ink-500">{def.description}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Badge tone="brand">평균 소요 {def.duration}</Badge>
                <Badge tone="green">무상 A/S 7일 이상</Badge>
                <Badge tone="blue">안전결제 적용</Badge>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <LinkButton href={`/request/new?service=${def.slug}`} size="lg">{def.name} 견적 받기</LinkButton>
                <LinkButton href="/how-it-works" variant="secondary" size="lg">이용 방법</LinkButton>
              </div>
            </div>

            <div className="card p-6">
              <p className="text-[13px] font-bold text-ink-400">기준 단가</p>
              <p className="tnum mt-1 text-[26px] font-bold text-ink-900">
                {def.unit === "month" ? "월 " : "평당 "}
                {manwon(def.unitPriceMin)}~{manwon(def.unitPriceMax)}
              </p>
              <p className="tnum mt-1 text-[12.5px] text-ink-400">최소 시공가 {manwon(def.minPrice)}</p>

              <p className="mt-5 text-[13px] font-bold text-ink-800">포함 작업</p>
              <ul className="mt-2 space-y-2">
                {def.includes.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-[13.5px] text-ink-600">
                    <Icon name="check" className="mt-1 h-3 w-3 shrink-0 text-brand-600" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="text-[22px] font-bold text-ink-900">평수별 예상 가격표</h2>
        <p className="mt-2 text-[14.5px] text-ink-500">
          아파트 기준 예상 범위입니다. 실제 금액은 업체 견적으로 확정되며, 보통 이 범위 안에서 결정됩니다.
        </p>
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead className="border-b border-ink-100 bg-ink-50/70">
              <tr className="text-[12.5px] font-bold text-ink-500">
                <th className="px-5 py-3.5">면적</th>
                <th className="px-5 py-3.5 text-right">예상 최저</th>
                <th className="px-5 py-3.5 text-right">예상 최고</th>
                <th className="px-5 py-3.5 text-right">견적</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {table.map((row) => (
                <tr key={row.size} className="text-[14px]">
                  <td className="tnum px-5 py-3.5 font-bold text-ink-900">{row.size}평</td>
                  <td className="tnum px-5 py-3.5 text-right text-ink-700">{manwon(row.est.min)}</td>
                  <td className="tnum px-5 py-3.5 text-right text-ink-700">{manwon(row.est.max)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/request/new?service=${def.slug}&area=${row.size}`}
                      className="text-[13px] font-bold text-brand-700 hover:underline"
                    >
                      요청 →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <h3 className="text-[16px] font-bold text-ink-900">자주 추가되는 옵션</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {OPTIONS.slice(0, 8).map((o) => (
              <li key={o.key} className="rounded border border-ink-200 bg-white p-4">
                <p className="text-[13.5px] font-bold text-ink-900">{o.label}</p>
                <p className="mt-0.5 text-[12px] text-ink-400">{o.note}</p>
                <p className="tnum mt-2 text-[13px] font-semibold text-brand-700">
                  {o.addFlat ? `+${manwon(o.addFlat)}` : `+${Math.round((o.addRate ?? 0) * 100)}%`}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {partners.length > 0 && (
        <section className="border-y border-ink-100 bg-ink-50/60 py-16">
          <div className="container-page">
            <h2 className="text-[22px] font-bold text-ink-900">{def.name} 가능한 업체</h2>
            <p className="mt-2 text-[14.5px] text-ink-500">요청서를 보내면 이 업체들이 견적을 보냅니다.</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((p) => (
                <li key={p.id}>
                  <Link href={`/partners/${p.id}`} className="card block p-5 transition hover:border-brand-300 hover:shadow-soft">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[15px] font-bold text-ink-900">{p.companyName}</p>
                      <TierBadge tier={p.tier} />
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Stars rating={p.rating} />
                      <span className="tnum text-[13px] font-bold">{p.rating.toFixed(1)}</span>
                      <span className="tnum text-[12px] text-ink-400">완료 {p.completedJobs}건</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[13px] text-ink-500">{p.intro}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="container-page py-16">
        <h2 className="text-[22px] font-bold text-ink-900">{def.name} 자주 묻는 질문</h2>
        <div className="mt-6 max-w-3xl">
          <Faq
            items={[
              {
                q: `${def.name}은 얼마나 걸리나요?`,
                a: `보통 ${def.duration} 소요됩니다. 면적과 오염도, 투입 인원에 따라 달라지며 각 업체가 견적서에 예상 작업 시간을 적어 보냅니다.`,
              },
              {
                q: "견적 금액에 부가세가 포함되나요?",
                a: "청소모아에 올라오는 모든 견적은 부가세 포함 총액입니다. 현장에서 추가 금액을 요구하는 행위는 금지되어 있으며, 적발 시 이용이 제한됩니다.",
              },
              {
                q: "작업 당일에 취소하면 어떻게 되나요?",
                a: "작업 3일 전까지는 전액 환불됩니다. 이후에는 업체가 이미 인력을 배치한 상태라 위약금이 발생할 수 있으며, 구체적인 기준은 안심 보장 제도에 정리되어 있습니다.",
              },
              {
                q: "결과가 마음에 들지 않으면요?",
                a: "작업 확인 전에 재작업을 요청하세요. 모든 견적에는 최소 7일의 무상 A/S가 포함됩니다. 협의가 되지 않으면 청소모아가 예치금을 보관한 상태에서 분쟁을 조정합니다.",
              },
            ]}
          />
        </div>
      </section>

      <section className="container-page pb-20">
        <p className="text-[14px] font-bold text-ink-500">다른 청소도 찾고 계신가요?</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {others.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className="inline-flex items-center gap-1.5 rounded border border-ink-200 bg-white px-4 py-2.5 text-[13.5px] font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-700"
              >
                <Icon name={s.icon} className="h-3.5 w-3.5" />
                      {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
