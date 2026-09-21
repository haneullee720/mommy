import Link from "next/link";
import type { Metadata } from "next";
import { SERVICES } from "@/lib/catalog";
import { manwon } from "@/lib/format";
import { Icon } from "@/components/icons";
import { Media } from "@/components/media";
import { Badge, LinkButton, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "청소 서비스 종류와 가격",
  description: "입주청소·이사청소·계단청소·사무실청소·준공청소·특수청소까지. 평당 단가와 포함 작업을 공개합니다.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="section-sm">
        <div className="container-page">
          <SectionHeading
            eyebrow="Services"
            title="청소 서비스와 실제 시공 단가"
            desc="업체마다 부르는 값이 다른 이유는 포함 범위가 다르기 때문입니다. 청소모아는 카테고리별 기준 단가와 포함 작업을 먼저 공개합니다."
          />
          <div className="mt-8">
            <LinkButton href="/request/new" size="lg">내 조건으로 견적 받기</LinkButton>
          </div>
        </div>
      </section>

      <div className="container-page pb-24">
        <div className="border-t border-ink-100">
          {SERVICES.map((s) => (
            <section
              key={s.slug}
              className="grid gap-8 border-b border-ink-100 py-12 lg:grid-cols-[260px_1fr_280px] lg:gap-12"
            >
              <Media name={s.slug} alt={`${s.name} 시공 현장`} className="rounded" />

              <div>
                <div className="flex items-center gap-3">
                  <Icon name={s.icon} className="h-6 w-6 text-ink-400" />
                  <h2 className="t-h3 text-[22px] text-ink-900">{s.name}</h2>
                  {s.popular && <Badge tone="amber">인기</Badge>}
                </div>
                <p className="mt-1.5 text-[14px] text-ink-400">{s.short}</p>

                <p className="mt-5 max-w-2xl text-[15px] leading-[1.8] text-ink-600">{s.description}</p>

                <p className="t-eyebrow mt-8">기본 포함 작업</p>
                <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2.5">
                  {s.includes.map((i) => (
                    <li key={i} className="flex items-center gap-2 text-[13.5px] text-ink-600">
                      <Icon name="check" className="h-3 w-3 shrink-0 text-brand-600" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:border-l lg:border-ink-100 lg:pl-10">
                <p className="t-eyebrow">{s.unit === "month" ? "월 기준 단가" : "평당 단가"}</p>
                <p className="tnum mt-2 text-[24px] font-bold tracking-[-0.03em] text-ink-900">
                  {manwon(s.unitPriceMin)} ~ {manwon(s.unitPriceMax)}
                </p>

                <dl className="tnum mt-6 space-y-2.5 border-t border-ink-100 pt-5 text-[13.5px]">
                  <div className="flex justify-between">
                    <dt className="text-ink-400">최소 시공가</dt>
                    <dd className="font-semibold text-ink-800">{manwon(s.minPrice)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-400">평균 소요</dt>
                    <dd className="font-semibold text-ink-800">{s.duration}</dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href={`/request/new?service=${s.slug}`}
                    className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 text-[14px] font-semibold text-white transition-colors hover:bg-brand-700"
                  >
                    견적 요청
                  </Link>
                  <Link
                    href={`/services/${s.slug}`}
                    className="inline-flex h-11 items-center justify-center rounded-md border border-ink-200 text-[14px] font-semibold text-ink-900 transition-colors hover:border-ink-400"
                  >
                    자세히 보기
                  </Link>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
