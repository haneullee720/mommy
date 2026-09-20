import { redirect } from "next/navigation";
import { currentUser, currentPartner } from "@/lib/auth";
import { DashNav } from "@/components/dash-nav";
import { TierBadge } from "@/components/ui";
import { TIER_LABEL } from "@/lib/fees";
import { getSettings } from "@/lib/service";

const NAV = [
  { href: "/partner", label: "대시보드", icon: "chart" },
  { href: "/partner/requests", label: "새 요청", icon: "bell" },
  { href: "/partner/quotes", label: "보낸 견적", icon: "send" },
  { href: "/partner/orders", label: "수주 작업", icon: "broom" },
  { href: "/partner/settlement", label: "정산", icon: "wallet" },
  { href: "/partner/reviews", label: "후기 관리", icon: "star" },
] as const;

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login?next=/partner");
  if (user.role === "customer") redirect("/my");
  if (user.role === "admin") redirect("/admin");

  const ctx = await currentPartner();
  if (!ctx) redirect("/partner-signup");

  const feeRate = (await getSettings()).feeRates[ctx.partner.tier];

  return (
    <div className="bg-ink-50/40">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[230px_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <div className="mb-4 hidden rounded border border-ink-200 bg-white p-4 md:block">
            <p className="text-[13px] text-ink-400">파트너</p>
            <p className="mt-0.5 truncate text-[16px] font-bold text-ink-900">{ctx.partner.companyName}</p>
            <div className="mt-2 flex items-center gap-2">
              <TierBadge tier={ctx.partner.tier} />
              <span className="tnum text-[12px] font-bold text-ink-500">수수료 {Math.round(feeRate * 100)}%</span>
            </div>
            {ctx.partner.status !== "approved" && (
              <p className="mt-3 rounded bg-amber-50 px-2.5 py-2 text-[11.5px] font-semibold text-amber-700">
                {ctx.partner.status === "pending" ? "심사 진행 중입니다" : "이용이 제한된 계정입니다"}
              </p>
            )}
            <p className="mt-3 text-[11.5px] text-ink-400">
              다음 등급: {ctx.partner.tier === "premium" ? "최고 등급 달성" : TIER_LABEL[ctx.partner.tier === "basic" ? "good" : "premium"]}
            </p>
          </div>
          <DashNav items={NAV} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
