import type { Metadata } from "next";
import { EscrowFlow } from "@/components/escrow-flow";
import { StepFlow, type Step } from "@/components/step-flow";
import { Media } from "@/components/media";
import { LinkButton, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "이용 방법",
  description: "요청서 작성 → 견적 비교 → 업체 선택 → 안전결제 → 작업 → 확인 → 정산. 청소모아 거래 흐름을 단계별로 안내합니다.",
};

const CUSTOMER: Step[] = [
  { icon: "document", title: "요청서 작성", note: "종류·평수·희망일만 입력하면 3분" },
  { icon: "inbox", title: "견적 도착", note: "평균 5곳, 보통 30분 안에" },
  { icon: "scale", title: "비교 후 선택", note: "가격·평점·A/S를 한 화면에서" },
  { icon: "shield", title: "안전결제", note: "결제해야 주소가 공개됩니다" },
];

const PARTNER: Step[] = [
  { icon: "certificate", title: "입점 신청", note: "지역·종목·계좌 등록, 5분" },
  { icon: "check", title: "심사 승인", note: "사업자·보험 확인, 1영업일" },
  { icon: "send", title: "견적 제출", note: "무료, 횟수 제한 없음" },
  { icon: "wallet", title: "정산 수령", note: "확인 후 영업일 3일 내" },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="section-sm">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <SectionHeading eyebrow="How it works" title="요청부터 정산까지" desc="전화 돌리기 없이 화면 안에서 끝납니다." />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/request/new" size="lg">견적 요청하기</LinkButton>
              <LinkButton href="/partner-signup" variant="secondary" size="lg">업체로 등록하기</LinkButton>
            </div>
          </div>
          <Media name="hero" alt="청소를 마친 밝은 거실" ratio="16 / 9" className="rounded" />
        </div>
      </section>

      <section className="section border-t border-ink-100">
        <div className="container-page">
          <h2 className="t-h2 text-ink-900">고객</h2>
          <StepFlow steps={CUSTOMER} className="mt-12" />
        </div>
      </section>

      <section className="bg-ink-900 text-white">
        <div className="container-page section">
          <div className="max-w-xl">
            <p className="t-eyebrow text-ink-400">Escrow</p>
            <h2 className="t-h2 mt-4">돈은 어디에 머무나</h2>
          </div>
          <div className="mt-14">
            <EscrowFlow tone="dark" />
          </div>
          <p className="mt-12 border-t border-white/10 pt-8 text-[15px] text-ink-300">
            고객이 확인하지 않아도 7일 뒤 자동으로 확정되어 정산됩니다.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <h2 className="t-h2 text-ink-900">청소 업체</h2>
          <StepFlow steps={PARTNER} className="mt-12" />
          <div className="mt-12">
            <LinkButton href="/partner-signup" size="lg" variant="dark">업체 등록 신청 (무료)</LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
