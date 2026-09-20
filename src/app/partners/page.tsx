import Link from "next/link";
import type { Metadata } from "next";
import { listPartners } from "@/lib/service";
import { REGION_LIST, SERVICES, SERVICE_MAP } from "@/lib/catalog";
import { Icon } from "@/components/icons";
import { EmptyState, LinkButton, Rating, Row, SectionHeading, TierBadge } from "@/components/ui";
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
  const partners = await listPartners({ service, region });

  const qs = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries({ service, region, ...patch })) if (v) params.set(k, v);
    const s = params.toString();
    return s ? `/partners?${s}` : "/partners";
  };

  return (
    <>
      <section className="section-sm">
        <div className="container-page">
          <SectionHeading
            eyebrow="Partners"
            title="검증된 청소 업체"
            desc="사업자등록증·배상책임보험을 확인한 업체만 등록됩니다. 광고비로 순서를 바꾸지 않고, 평점과 완료 건수로만 정렬합니다."
          />
        </div>
      </section>

      <div className="container-page pb-24">
        <div className="space-y-5 border-y border-ink-100 py-7">
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <span className="t-eyebrow w-16 shrink-0">종류</span>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <FilterLink href={qs({ service: undefined })} active={!service}>전체</FilterLink>
              {SERVICES.map((s) => (
                <FilterLink key={s.slug} href={qs({ service: s.slug })} active={service === s.slug}>
                  {s.name}
                </FilterLink>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <span className="t-eyebrow w-16 shrink-0">지역</span>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <FilterLink href={qs({ region: undefined })} active={!region}>전국</FilterLink>
              {REGION_LIST.map((r) => (
                <FilterLink key={r} href={qs({ region: r })} active={region === r}>{r}</FilterLink>
              ))}
            </div>
          </div>
        </div>

        <p className="tnum mt-8 text-[14px] text-ink-500">
          총 <span className="font-semibold text-ink-900">{partners.length}</span>개 업체
        </p>

        {partners.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<Icon name="pin" className="h-7 w-7" />}
              title="조건에 맞는 업체가 없습니다"
              desc="필터를 넓혀보시거나, 견적을 요청하면 인근 업체에게 자동으로 알림이 갑니다."
              action={<LinkButton href="/request/new" className="mt-2">견적 요청하기</LinkButton>}
            />
          </div>
        ) : (
          <div className="mt-4 border-t border-ink-100">
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
                  <>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Rating value={p.rating} count={p.reviewCount} />
                      <span className="tnum text-ink-400">완료 {p.completedJobs}건</span>
                      <span className="text-ink-400">
                        {p.regions.slice(0, 2).join(", ")}
                        {p.regions.length > 2 ? ` 외 ${p.regions.length - 2}곳` : ""}
                      </span>
                    </span>
                    <span className="mt-1.5 block line-clamp-1 text-ink-500">{p.intro}</span>
                  </>
                }
                trailing={
                  <span className="hidden text-[13px] text-ink-400 lg:block">
                    {p.services.slice(0, 3).map((s) => SERVICE_MAP[s].name).join(" · ")}
                  </span>
                }
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "text-[13.5px] transition-colors",
        active ? "font-semibold text-ink-900 underline underline-offset-4" : "text-ink-400 hover:text-ink-700",
      )}
    >
      {children}
    </Link>
  );
}
