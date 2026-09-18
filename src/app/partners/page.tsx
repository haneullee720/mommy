import Link from "next/link";
import type { Metadata } from "next";
import { listPartners } from "@/lib/service";
import { REGION_LIST, SERVICES, SERVICE_MAP } from "@/lib/catalog";
import { EmptyState, LinkButton, SectionHeading, Stars, TierBadge } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { ServiceSlug } from "@/lib/types";

export const metadata: Metadata = {
  title: "등록 청소 업체",
  description: "사업자등록증과 배상책임보험을 확인한 청소 업체 목록. 평점과 완료 건수로만 정렬합니다.",
};

export const dynamic = "force-dynamic";

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; region?: string }>;
}) {
  const sp = await searchParams;
  const service = sp.service as ServiceSlug | undefined;
  const region = sp.region;

  const partners = listPartners({ service, region });

  const qs = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { service, region, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const s = params.toString();
    return s ? `/partners?${s}` : "/partners";
  };

  return (
    <>
      <section className="hero-mesh border-b border-ink-100 py-14">
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow="PARTNERS"
            title="검증된 청소 업체"
            desc="사업자등록증·배상책임보험을 확인한 업체만 등록됩니다. 광고비로 순서를 바꾸지 않고, 평점과 완료 건수로만 정렬합니다."
          />
        </div>
      </section>

      <div className="container-page py-12">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[13px] font-bold text-ink-700">청소 종류</p>
            <div className="flex flex-wrap gap-1.5">
              <Link href={qs({ service: undefined })} className={chip(!service)}>전체</Link>
              {SERVICES.map((s) => (
                <Link key={s.slug} href={qs({ service: s.slug })} className={chip(service === s.slug)}>
                  {s.emoji} {s.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[13px] font-bold text-ink-700">지역</p>
            <div className="flex flex-wrap gap-1.5">
              <Link href={qs({ region: undefined })} className={chip(!region)}>전국</Link>
              {REGION_LIST.map((r) => (
                <Link key={r} href={qs({ region: r })} className={chip(region === r)}>{r}</Link>
              ))}
            </div>
          </div>
        </div>

        <p className="tnum mt-8 text-[14px] font-bold text-ink-900">총 {partners.length}개 업체</p>

        {partners.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon="🔍"
              title="조건에 맞는 업체가 없습니다"
              desc="필터를 넓혀보시거나, 견적을 요청하면 인근 업체에게 자동으로 알림이 갑니다."
              action={<LinkButton href="/request/new" className="mt-2">견적 요청하기</LinkButton>}
            />
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((p) => (
              <li key={p.id}>
                <Link href={`/partners/${p.id}`} className="card flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift">
                  <div className="flex items-start justify-between gap-2">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-lg font-extrabold text-brand-700">
                      {p.companyName.slice(0, 1)}
                    </div>
                    <TierBadge tier={p.tier} />
                  </div>
                  <p className="mt-3 text-[16px] font-extrabold text-ink-900">{p.companyName}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Stars rating={p.rating} />
                    <span className="tnum text-[13px] font-bold text-ink-900">{p.rating.toFixed(1)}</span>
                    <span className="tnum text-[12px] text-ink-400">({p.reviewCount})</span>
                  </div>
                  <p className="mt-3 line-clamp-2 flex-1 text-[13px] leading-relaxed text-ink-500">{p.intro}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.services.slice(0, 3).map((s) => (
                      <span key={s} className="rounded-md bg-ink-100 px-2 py-1 text-[11.5px] font-semibold text-ink-600">
                        {SERVICE_MAP[s].name}
                      </span>
                    ))}
                    {p.services.length > 3 && (
                      <span className="rounded-md bg-ink-100 px-2 py-1 text-[11.5px] font-semibold text-ink-400">
                        +{p.services.length - 3}
                      </span>
                    )}
                  </div>
                  <p className="tnum mt-3 border-t border-ink-100 pt-3 text-[12.5px] font-semibold text-ink-400">
                    완료 {p.completedJobs}건 · {p.regions.slice(0, 2).join(", ")}
                    {p.regions.length > 2 ? ` 외 ${p.regions.length - 2}곳` : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function chip(active: boolean) {
  return cn(
    "inline-flex items-center rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition",
    active ? "border-brand-500 bg-brand-600 text-white" : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
  );
}
