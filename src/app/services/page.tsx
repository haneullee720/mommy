import Link from "next/link";
import type { Metadata } from "next";
import { SERVICES } from "@/lib/catalog";
import { manwon } from "@/lib/format";
import { Badge, LinkButton, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "청소 서비스 종류와 가격",
  description: "입주청소·이사청소·계단청소·사무실청소·준공청소·특수청소까지. 평당 단가와 포함 작업을 공개합니다.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="hero-mesh border-b border-ink-100 py-16">
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow="SERVICES"
            title="청소 서비스와 실제 시공 단가"
            desc="업체마다 부르는 값이 다른 이유는 포함 범위가 다르기 때문입니다. 청소모아는 카테고리별 기준 단가와 포함 작업을 먼저 공개합니다."
          />
          <div className="mt-6">
            <LinkButton href="/request/new" size="lg">내 조건으로 견적 받기</LinkButton>
          </div>
        </div>
      </section>

      <div className="container-page py-16">
        <ul className="space-y-4">
          {SERVICES.map((s) => (
            <li key={s.slug} className="card p-6 transition hover:border-brand-300 hover:shadow-soft sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-2xl">{s.emoji}</span>
                    <h2 className="text-[20px] font-extrabold text-ink-900">{s.name}</h2>
                    {s.popular && <Badge tone="amber">인기</Badge>}
                  </div>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-ink-500">{s.description}</p>

                  <p className="mt-5 text-[13px] font-bold text-ink-800">기본 포함 작업</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {s.includes.map((i) => (
                      <li key={i} className="rounded-md bg-brand-50 px-2.5 py-1.5 text-[12.5px] font-semibold text-brand-700">
                        ✓ {i}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl bg-ink-50 p-5">
                  <p className="text-[12.5px] font-semibold text-ink-400">
                    {s.unit === "month" ? "월 기준" : "평당"} 시공 단가
                  </p>
                  <p className="tnum mt-1 text-[22px] font-extrabold text-ink-900">
                    {manwon(s.unitPriceMin)} ~ {manwon(s.unitPriceMax)}
                  </p>
                  <dl className="tnum mt-4 space-y-2 border-t border-ink-200 pt-4 text-[13px]">
                    <div className="flex justify-between">
                      <dt className="text-ink-400">최소 시공가</dt>
                      <dd className="font-semibold text-ink-800">{manwon(s.minPrice)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink-400">평균 소요</dt>
                      <dd className="font-semibold text-ink-800">{s.duration}</dd>
                    </div>
                  </dl>
                  <Link
                    href={`/services/${s.slug}`}
                    className="mt-4 flex h-11 items-center justify-center rounded-xl bg-white text-[14px] font-bold text-ink-900 ring-1 ring-ink-200 transition hover:ring-brand-300"
                  >
                    자세히 보기
                  </Link>
                  <Link
                    href={`/request/new?service=${s.slug}`}
                    className="mt-2 flex h-11 items-center justify-center rounded-xl bg-brand-600 text-[14px] font-bold text-white transition hover:bg-brand-700"
                  >
                    견적 요청
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
