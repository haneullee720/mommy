import Link from "next/link";
import { Logo } from "./logo";
import { SERVICES } from "@/lib/catalog";

const COLUMNS = [
  { title: "서비스", links: SERVICES.slice(0, 5).map((s) => ({ href: `/services/${s.slug}`, label: s.name })) },
  {
    title: "고객 지원",
    links: [
      { href: "/how-it-works", label: "이용 방법" },
      { href: "/pricing", label: "요금·수수료 안내" },
      { href: "/faq", label: "자주 묻는 질문" },
      { href: "/safety", label: "안심 보장 제도" },
    ],
  },
  {
    title: "파트너",
    links: [
      { href: "/partner-signup", label: "업체 등록 신청" },
      { href: "/partners", label: "등록 업체 보기" },
      { href: "/partner-guide", label: "파트너 운영 가이드" },
      { href: "/login", label: "파트너 로그인" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-ink-100">
      <div className="container-page py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-ink-500">
              전국 검증된 청소 업체의 견적을 한 번에 모아 비교하고, 안전결제로 맡기는 청소 도급 중개 플랫폼입니다.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="t-eyebrow mb-5">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-[14px] text-ink-500 transition-colors hover:text-ink-900">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-ink-100 pt-8">
          <p className="max-w-3xl text-[12.5px] leading-relaxed text-ink-400">
            청소모아는 통신판매중개자로서 청소 서비스의 당사자가 아니며, 개별 업체가 등록한 견적·서비스의 이행에 대한 책임은
            해당 업체에 있습니다. 다만 안전결제 예치금 보관과 분쟁 조정은 청소모아가 직접 처리합니다.
          </p>
          <p className="mt-4 text-[12.5px] text-ink-300">
            © {new Date().getFullYear()} CheongsoMoa
          </p>
        </div>
      </div>
    </footer>
  );
}
