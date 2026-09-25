import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";

const LINKS = [
  { href: "/services", label: "청소 서비스" },
  { href: "/how-it-works", label: "이용 방법" },
  { href: "/partners", label: "업체 찾기" },
  { href: "/pricing", label: "요금·수수료" },
  { href: "/partner-signup", label: "업체 등록" },
];

export async function SiteHeader() {
  const user = await currentUser();
  const home = user?.role === "partner" ? "/partner" : user?.role === "admin" ? "/admin" : "/my";

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100 bg-white/90 backdrop-blur-md">
      <div className="container-page flex h-[72px] items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden items-center gap-7 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[14px] font-semibold text-ink-600 transition-colors hover:text-brand-600"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-5">
          {user ? (
            <>
              <Link href={home} className="hidden text-[14px] font-medium text-ink-700 hover:text-ink-900 sm:inline">
                {user.name}님
              </Link>
              <form action={logoutAction} className="hidden sm:block">
                <button type="submit" className="text-[14px] font-medium text-ink-400 transition-colors hover:text-ink-700">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="hidden text-[14px] font-medium text-ink-700 hover:text-ink-900 sm:inline">
              로그인
            </Link>
          )}
          <Link
            href="/request/new"
            className="hidden h-10 items-center rounded-xl bg-brand-600 px-4 text-[14px] font-bold text-white shadow-soft transition-colors hover:bg-brand-700 sm:inline-flex"
          >
            무료 견적받기
          </Link>
          <MobileNav links={LINKS} isLoggedIn={Boolean(user)} />
        </div>
      </div>
    </header>
  );
}
