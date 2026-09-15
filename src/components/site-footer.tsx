import Link from "next/link";
import { Logo } from "./logo";
import { SERVICES } from "@/lib/catalog";

const COLUMNS = [
  {
    title: "서비스",
    links: SERVICES.slice(0, 5).map((s) => ({ href: `/services/${s.slug}`, label: s.name })),
  },
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
    <footer className="mt-24 border-t border-ink-100 bg-ink-50/60">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
              전국 검증된 청소 업체의 견적을 한 번에 모아 비교하고, 안전결제로 맡기는 청소 도급 중개 플랫폼입니다.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-ink-500">
              <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-ink-200">안전결제(에스크로)</span>
              <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-ink-200">배상책임보험 업체</span>
              <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-ink-200">무상 재작업 A/S</span>
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-sm font-bold text-ink-900">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-sm text-ink-500 transition hover:text-brand-700">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-ink-200 pt-8 text-xs leading-relaxed text-ink-400">
          <p className="font-semibold text-ink-500">청소모아 (CheongsoMoa)</p>
          <p className="mt-2">
            청소모아는 통신판매중개자로서 청소 서비스의 당사자가 아니며, 개별 업체가 등록한 견적·서비스의 이행에 대한 책임은
            해당 업체에 있습니다. 다만 안전결제 예치금 보관과 분쟁 조정은 청소모아가 직접 처리합니다.
          </p>
          <p className="mt-3">© {new Date().getFullYear()} CheongsoMoa. 데모 목적의 샘플 데이터가 포함되어 있습니다.</p>
        </div>
      </div>
    </footer>
  );
}
