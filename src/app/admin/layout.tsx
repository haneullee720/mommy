import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { DashNav } from "@/components/dash-nav";

const NAV = [
  { href: "/admin", label: "운영 현황", icon: "chart" },
  { href: "/admin/partners", label: "업체 심사", icon: "building" },
  { href: "/admin/orders", label: "거래·정산", icon: "card" },
  { href: "/admin/settings", label: "정책 설정", icon: "gear" },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/");

  return (
    <div className="bg-ink-50/40">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[220px_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <div className="mb-4 hidden rounded border border-ink-200 bg-white p-4 md:block">
            <p className="text-[13px] text-ink-400">운영자</p>
            <p className="mt-0.5 text-[16px] font-bold text-ink-900">{user.name}</p>
          </div>
          <DashNav items={NAV} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
