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
    <header className="sticky top-0 z-50 border-b border-ink-100 bg-white/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-[14.5px] font-semibold text-ink-600 transition hover:bg-ink-50 hover:text-ink-900"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href={home}
                className="hidden rounded-lg px-3 py-2 text-[14.5px] font-semibold text-ink-700 hover:bg-ink-50 sm:inline-flex"
              >
                {user.name}님
              </Link>
              <form action={logoutAction} className="hidden sm:block">
                <button type="submit" className="rounded-lg px-3 py-2 text-[14.5px] font-semibold text-ink-400 hover:text-ink-700">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-lg px-3 py-2 text-[14.5px] font-semibold text-ink-700 hover:bg-ink-50 sm:inline-flex"
            >
              로그인
            </Link>
          )}
          <Link
            href="/request/new"
            className="hidden h-10 items-center rounded-xl bg-brand-600 px-4 text-[14.5px] font-bold text-white shadow-soft transition hover:bg-brand-700 sm:inline-flex"
          >
            무료 견적받기
          </Link>
          <MobileNav links={LINKS} isLoggedIn={Boolean(user)} />
        </div>
      </div>
    </header>
  );
}
