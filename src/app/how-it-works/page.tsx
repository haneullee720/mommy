import type { Metadata } from "next";
import { LinkButton, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "이용 방법",
  description: "요청서 작성 → 견적 비교 → 업체 선택 → 안전결제 → 작업 → 확인 → 정산. 청소모아 거래 흐름을 단계별로 안내합니다.",
};

const CUSTOMER_STEPS = [
  {
    n: "1",
    title: "요청서 작성 (3분)",
    desc: "청소 종류, 면적, 지역, 희망일만 입력하면 됩니다. 작성하는 동안 예상 견적 범위가 실시간으로 계산됩니다.",
    detail: ["상세 주소와 연락처는 결제 전까지 업체에 공개되지 않습니다", "회원가입은 요청서 마지막 단계에서 두 칸이면 끝납니다"],
  },
  {
    n: "2",
    title: "견적 도착 (평균 30분~3시간)",
    desc: "조건에 맞는 업체들에게 알림이 갑니다. 업체는 금액, 투입 인원, 작업 시간, 무상 A/S 기간을 적어 견적을 보냅니다.",
    detail: ["보통 3~7개 업체가 견적을 보냅니다", "견적은 부가세 포함 총액이며, 현장 추가금 요구는 금지입니다"],
  },
  {
    n: "3",
    title: "비교하고 선택",
    desc: "금액만 보지 마세요. 평점, 완료 건수, A/S 기간, 업체가 쓴 메시지까지 한 화면에서 비교할 수 있습니다.",
    detail: ["최저가·평점 1위 견적에는 배지가 붙습니다", "선택해도 결제 전까지는 비용이 발생하지 않습니다"],
  },
  {
    n: "4",
    title: "안전결제",
    desc: "결제한 금액은 청소모아가 예치합니다. 업체에 바로 넘어가지 않습니다. 결제가 확인되면 업체에 주소와 연락처가 전달됩니다.",
    detail: ["카드·계좌이체·가상계좌·간편결제 지원", "작업 3일 전까지 취소 시 전액 환불"],
  },
  {
    n: "5",
    title: "작업 진행",
    desc: "업체가 현장에서 작업을 진행하고, 앱에서 작업 시작·완료를 기록합니다. 고객은 진행 상태를 실시간으로 확인합니다.",
    detail: ["작업 전후 사진 리포트를 제공하는 업체가 많습니다"],
  },
  {
    n: "6",
    title: "확인하고 정산",
    desc: "결과를 확인하고 '작업 확인'을 누르면 수수료를 제외한 금액이 업체에 정산됩니다. 미흡하면 확인 전에 재작업을 요청하세요.",
    detail: ["7일간 무상 A/S", "7일 동안 확인이 없으면 자동 구매확정", "협의 불가 시 청소모아 분쟁조정팀이 개입"],
  },
];

const PARTNER_STEPS = [
  { n: "1", title: "입점 신청", desc: "업체명·사업자등록번호·담당 지역·취급 종목·정산 계좌를 등록합니다. 5분이면 끝납니다." },
  { n: "2", title: "심사 승인", desc: "사업자등록증과 배상책임보험 가입 여부를 확인합니다. 보통 1영업일 내 승인됩니다." },
  { n: "3", title: "요청 확인 & 견적 제출", desc: "담당 지역·종목에 맞는 요청만 알림으로 받습니다. 견적 제출은 무료이고 횟수 제한이 없습니다." },
  { n: "4", title: "낙찰 & 작업", desc: "고객이 결제를 마치면 주소와 연락처가 열립니다. 결제된 건만 배정되므로 노쇼 걱정이 없습니다." },
  { n: "5", title: "정산 수령", desc: "고객 확인 후 영업일 3일 내 등록 계좌로 입금됩니다. 수수료는 등급에 따라 10~15%입니다." },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="border-b border-ink-100 py-16">
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow="HOW IT WORKS"
            title="요청부터 정산까지, 이렇게 진행됩니다"
            desc="전화 돌리기도, 현장 실사 약속도 없습니다. 화면 안에서 비교하고 결정하세요."
          />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/request/new" size="lg">견적 요청하기</LinkButton>
            <LinkButton href="/partner-signup" variant="secondary" size="lg">업체로 등록하기</LinkButton>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="text-[24px] font-bold text-ink-900">고객 이용 흐름</h2>
        <ol className="mt-8 space-y-4">
          {CUSTOMER_STEPS.map((s) => (
            <li key={s.n} className="card flex gap-5 p-6">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-[15px] font-bold text-white">
                {s.n}
              </span>
              <div className="min-w-0">
                <p className="text-[17px] font-bold text-ink-900">{s.title}</p>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-500">{s.desc}</p>
                <ul className="mt-3 space-y-1.5">
                  {s.detail.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-[13px] text-ink-500">
                      <span className="mt-0.5 text-brand-600">·</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-ink-100 bg-ink-50/60 py-16">
        <div className="container-page">
          <h2 className="text-[24px] font-bold text-ink-900">업체 이용 흐름</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-5">
            {PARTNER_STEPS.map((s) => (
              <li key={s.n} className="card p-5">
                <span className="tnum text-sm font-semibold text-brand-300">STEP {s.n}</span>
                <p className="mt-2 text-[15.5px] font-bold text-ink-900">{s.title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-500">{s.desc}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <LinkButton href="/partner-signup" size="lg" variant="dark">업체 등록 신청 (무료)</LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
