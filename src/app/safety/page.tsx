import type { Metadata } from "next";
import { LinkButton, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "안심 보장 제도",
  description: "안전결제(에스크로), 배상책임보험 확인, 무상 재작업 A/S, 분쟁 조정까지. 청소모아가 거래를 보호하는 방법.",
};

const FLOW = [
  { t: "고객 결제", d: "결제 금액이 청소모아 예치 계좌로 들어갑니다. 업체에 지급되지 않습니다." },
  { t: "업체 배정", d: "결제가 확인되면 업체에 주소와 연락처가 공개됩니다." },
  { t: "작업 진행", d: "업체가 작업 시작·완료를 기록하고, 고객은 상태를 실시간으로 확인합니다." },
  { t: "고객 확인", d: "결과에 문제가 없으면 확인 버튼을 누릅니다. 미흡하면 이 단계에서 재작업을 요청합니다." },
  { t: "업체 정산", d: "수수료를 제외한 금액이 영업일 3일 내 업체 계좌로 입금됩니다." },
];

const POLICIES = [
  {
    emoji: "🔒",
    title: "안전결제 (에스크로)",
    items: [
      "결제 금액은 작업 확인 전까지 청소모아가 보관합니다.",
      "업체가 나타나지 않으면 100% 환불됩니다.",
      "고객이 7일 동안 확인하지 않으면 자동으로 구매확정되어 정산됩니다.",
    ],
  },
  {
    emoji: "📄",
    title: "업체 검증",
    items: [
      "사업자등록증과 대표자 실명을 확인한 업체만 등록됩니다.",
      "배상책임보험 가입 여부를 표시하고, 시공 중 파손은 보험으로 처리합니다.",
      "평점 4.0 미만이 누적되거나 노쇼가 발생하면 노출이 제한되고, 반복 시 퇴출됩니다.",
    ],
  },
  {
    emoji: "🔁",
    title: "무상 재작업 A/S",
    items: [
      "모든 견적에는 최소 7일의 무상 A/S가 포함됩니다.",
      "작업 확인 전이라면 재작업 요청이 우선입니다.",
      "업체가 A/S를 거부하면 청소모아가 예치금에서 부분 환불을 진행합니다.",
    ],
  },
  {
    emoji: "⚖️",
    title: "분쟁 조정",
    items: [
      "협의가 되지 않으면 청소모아 분쟁조정팀이 개입합니다.",
      "작업 전후 사진, 견적서에 명시된 포함 범위, 후기 이력을 근거로 판단합니다.",
      "조정 결과에 따라 전액 환불·부분 환불·정산 진행 중 하나로 처리됩니다.",
    ],
  },
];

const REFUND = [
  ["작업 3일 전까지", "전액 환불", "위약금 없음"],
  ["작업 2일~1일 전", "80% 환불", "인력 배치 비용 차감"],
  ["작업 당일 취소", "50% 환불", "업체 이동·대기 비용 차감"],
  ["업체 귀책 취소·노쇼", "전액 환불", "업체 노출 제한 조치"],
];

export default function SafetyPage() {
  return (
    <>
      <section className="border-b border-ink-100 bg-ink-900 py-16 text-white">
        <div className="container-page">
          <p className="mb-3 text-sm font-bold tracking-wide text-brand-300">TRUST &amp; SAFETY</p>
          <h1 className="max-w-2xl text-[32px] font-extrabold leading-tight sm:text-[42px]">
            모르는 업체에 선결제,
            <br />
            불안하지 않게 만들었습니다
          </h1>
          <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-ink-300">
            청소모아는 돈을 대신 들고 있는 역할을 합니다. 작업이 끝나고 고객이 확인하기 전까지 업체에는 한 푼도 넘어가지 않습니다.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading align="left" title="결제 금액은 이렇게 움직입니다" />
        <ol className="mt-8 grid gap-3 md:grid-cols-5">
          {FLOW.map((f, i) => (
            <li key={f.t} className="card p-5">
              <span className="tnum text-[12px] font-extrabold text-brand-300">STEP {i + 1}</span>
              <p className="mt-2 text-[15px] font-extrabold text-ink-900">{f.t}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-500">{f.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-ink-100 bg-ink-50/60 py-16">
        <div className="container-page">
          <SectionHeading align="left" title="네 가지 보장" />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {POLICIES.map((p) => (
              <div key={p.title} className="card p-6">
                <span className="text-2xl">{p.emoji}</span>
                <p className="mt-3 text-[17px] font-extrabold text-ink-900">{p.title}</p>
                <ul className="mt-3 space-y-2">
                  {p.items.map((i) => (
                    <li key={i} className="flex items-start gap-2 text-[13.5px] leading-relaxed text-ink-600">
                      <span className="mt-0.5 text-brand-600">·</span>
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading align="left" title="취소·환불 기준" desc="취소 시점에 따라 환불 비율이 달라집니다. 업체 귀책이면 언제든 전액 환불입니다." />
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead className="border-b border-ink-100 bg-ink-50/70">
              <tr className="text-[12.5px] font-bold text-ink-500">
                <th className="px-5 py-3.5">취소 시점</th>
                <th className="px-5 py-3.5">환불 비율</th>
                <th className="px-5 py-3.5">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {REFUND.map((r) => (
                <tr key={r[0]} className="text-[14px]">
                  <td className="px-5 py-3.5 font-bold text-ink-900">{r[0]}</td>
                  <td className="tnum px-5 py-3.5 font-semibold text-brand-700">{r[1]}</td>
                  <td className="px-5 py-3.5 text-ink-500">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-10 text-white">
          <p className="text-[20px] font-extrabold">안심하고 맡기세요</p>
          <p className="mt-2 max-w-lg text-[14.5px] leading-relaxed text-brand-100">
            견적 비교는 무료, 결제는 안전하게. 문제가 생기면 청소모아가 예치금을 쥔 채로 조정합니다.
          </p>
          <div className="mt-6">
            <LinkButton href="/request/new" variant="secondary" size="lg">무료 견적 받기</LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
