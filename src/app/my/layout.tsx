import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { DashNav } from "@/components/dash-nav";

const NAV = [
  { href: "/my", label: "내 견적 요청", icon: "document" },
  { href: "/my/orders", label: "결제·작업 내역", icon: "receipt" },
  { href: "/request/new", label: "새 견적 요청", icon: "plus" },
] as const;

export default async function MyLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login?next=/my");
  if (user.role === "partner") redirect("/partner");

  return (
    <div className="bg-ink-50/40">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[220px_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <div className="mb-4 hidden rounded border border-ink-200 bg-white p-4 md:block">
            <p className="text-[13px] text-ink-400">안녕하세요</p>
            <p className="mt-0.5 text-[16px] font-bold text-ink-900">{user.name} 님</p>
          </div>
          <DashNav items={NAV} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
