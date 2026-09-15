import type { Metadata } from "next";
import { readDB } from "@/lib/db";
import { SERVICE_MAP } from "@/lib/catalog";
import { dateFull } from "@/lib/format";
import { Badge, Stars, TierBadge } from "@/components/ui";
import { PartnerStatusForm } from "@/components/admin-controls";

export const metadata: Metadata = { title: "업체 심사" };
export const dynamic = "force-dynamic";

const STATUS_TONE = { pending: "amber", approved: "green", suspended: "red" } as const;
const STATUS_LABEL = { pending: "심사 대기", approved: "승인", suspended: "정지" } as const;

export default function AdminPartnersPage() {
  const db = readDB();
  const partners = db.partners.slice().sort((a, b) => {
    const order = { pending: 0, approved: 1, suspended: 2 };
    return order[a.status] - order[b.status] || b.createdAt.localeCompare(a.createdAt);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-extrabold text-ink-900">업체 심사</h1>
        <p className="mt-1 text-sm text-ink-500">
          사업자등록증과 배상책임보험을 확인한 뒤 승인하세요. 승인된 업체만 견적을 제출할 수 있습니다.
        </p>
      </div>

      <ul className="space-y-3">
        {partners.map((p) => {
          const user = db.users.find((u) => u.id === p.userId);
          return (
            <li key={p.id} className="card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[16px] font-extrabold text-ink-900">{p.companyName}</span>
                <Badge tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                <TierBadge tier={p.tier} />
                {p.hasInsurance ? <Badge tone="blue">보험 가입</Badge> : <Badge tone="red">보험 미가입</Badge>}
                <span className="tnum ml-auto text-[12px] text-ink-400">{dateFull(p.createdAt)} 신청</span>
              </div>

              <dl className="tnum mt-4 grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
                {[
                  ["사업자번호", p.bizNo],
                  ["대표자", `${p.ceoName} (${user?.email ?? "-"})`],
                  ["연락처", user?.phone ?? "-"],
                  ["설립·인력", `${p.since}년 · ${p.crewSize}명`],
                  ["지역", p.regions.join(", ")],
                  ["종목", p.services.map((s) => SERVICE_MAP[s].name).join(", ")],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-ink-100 pb-1.5">
                    <dt className="shrink-0 text-ink-400">{k}</dt>
                    <dd className="text-right font-semibold text-ink-800">{v}</dd>
                  </div>
                ))}
              </dl>

              {p.intro && <p className="mt-3 rounded-xl bg-ink-50 p-3.5 text-[13px] leading-relaxed text-ink-600">{p.intro}</p>}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
                <div className="flex items-center gap-2">
                  <Stars rating={p.rating} />
                  <span className="tnum text-[13px] font-bold text-ink-900">{p.rating.toFixed(1)}</span>
                  <span className="tnum text-[12.5px] text-ink-400">완료 {p.completedJobs}건 · 후기 {p.reviewCount}</span>
                </div>
                <PartnerStatusForm partnerId={p.id} status={p.status} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
