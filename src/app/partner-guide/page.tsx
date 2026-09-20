import type { Metadata } from "next";
import { LinkButton, SectionHeading } from "@/components/ui";
import { Icon } from "@/components/icons";

export const metadata: Metadata = {
  title: "파트너 운영 가이드",
  description: "낙찰률을 높이는 견적 작성법, 등급 올리는 방법, 정산 관리 팁을 정리했습니다.",
};

const WIN_TIPS = [
  { t: "30분 안에 답하세요", d: "먼저 도착한 견적이 열람률이 가장 높습니다. 평균 응답 시간은 업체 프로필에 그대로 표시됩니다." },
  { t: "금액보다 '포함 범위'", d: "같은 금액이라도 포함 작업을 구체적으로 적은 견적이 선택됩니다. 새시 분리, 후드 내부 같은 항목을 명시하세요." },
  { t: "메시지에 현장 얘기를 쓰세요", d: "'요청하신 3층 엘리베이터 없는 조건 확인했습니다' 같은 한 줄이 템플릿 문구보다 훨씬 강합니다." },
  { t: "A/S 기간을 늘려보세요", d: "7일이 기본입니다. 14일·30일로 적으면 같은 금액에서 선택될 확률이 눈에 띄게 올라갑니다." },
  { t: "무리한 저가는 손해입니다", d: "낙찰돼도 품질이 떨어지면 평점이 내려가고, 평점이 내려가면 수수료 등급이 올라가지 않습니다." },
];

const GRADE = [
  { t: "일반 → 우수", d: "완료 20건 & 평점 4.5 이상", fee: "15% → 12%" },
  { t: "우수 → 프리미엄", d: "완료 60건 & 평점 4.7 이상 & 분쟁 0건", fee: "12% → 10%" },
];

const RULES = [
  "현장에서 견적 외 추가 금액을 요구하지 마세요. 적발 시 이용이 제한됩니다.",
  "고객 연락처를 플랫폼 외부 거래 유도에 쓰지 마세요. 1회 적발 시 정지, 2회 퇴출입니다.",
  "작업 시작·완료를 반드시 앱에 기록하세요. 정산과 분쟁 판단의 근거가 됩니다.",
  "작업 전후 사진을 남겨두면 분쟁에서 업체가 유리합니다.",
  "일정을 지킬 수 없게 되면 최소 2일 전에 고객에게 알리고 협의하세요. 노쇼는 즉시 노출 제한입니다.",
];

export default function PartnerGuidePage() {
  return (
    <>
      <section className="border-b border-ink-100 py-14">
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow="PARTNER GUIDE"
            title="낙찰률을 올리는 방법"
            desc="같은 지역, 같은 금액인데 왜 저 업체가 선택될까요? 데이터로 확인된 차이를 정리했습니다."
          />
        </div>
      </section>

      <section className="container-page py-14">
        <h2 className="text-[22px] font-bold text-ink-900">견적 작성 5원칙</h2>
        <ol className="mt-6 space-y-3">
          {WIN_TIPS.map((t, i) => (
            <li key={t.t} className="card flex gap-4 p-5">
              <span className="tnum grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-[14px] font-semibold text-brand-700">
                {i + 1}
              </span>
              <div>
                <p className="text-[15.5px] font-bold text-ink-900">{t.t}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-500">{t.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-ink-100 bg-ink-50/60 py-14">
        <div className="container-page">
          <h2 className="text-[22px] font-bold text-ink-900">등급 올리기</h2>
          <p className="mt-2 text-[14.5px] text-ink-500">등급은 작업이 완료될 때마다 자동으로 재계산됩니다.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {GRADE.map((g) => (
              <div key={g.t} className="card p-6">
                <p className="text-[16px] font-bold text-ink-900">{g.t}</p>
                <p className="mt-2 text-[13.5px] text-ink-500">{g.d}</p>
                <p className="tnum mt-4 text-[20px] font-bold text-brand-700">{g.fee}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <h2 className="text-[22px] font-bold text-ink-900">지켜야 할 운영 규정</h2>
        <ul className="mt-6 space-y-2.5">
          {RULES.map((r) => (
            <li key={r} className="flex items-start gap-3 rounded border border-ink-200 bg-white p-4 text-[14px] leading-relaxed text-ink-700">
              <Icon name="certificate" className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
              {r}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/partner-signup" size="lg">업체 등록 신청</LinkButton>
          <LinkButton href="/pricing" variant="secondary" size="lg">수수료 정책 보기</LinkButton>
        </div>
      </section>
    </>
  );
}
