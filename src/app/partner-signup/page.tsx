import type { Metadata } from "next";
import { PartnerSignupForm } from "./partner-form";
import { getSettings } from "@/lib/service";
import { TIER_LABEL, TIER_RULE } from "@/lib/fees";
import { Badge } from "@/components/ui";
import { Icon } from "@/components/icons";

export const metadata: Metadata = {
  title: "업체 등록 신청",
  description: "입점비·월 이용료 0원. 성사된 건에만 수수료 10~15%. 선결제된 일감만 배정받는 청소 도급 파트너 등록.",
};

export const dynamic = "force-dynamic";

const BENEFITS = [
  { icon: "receipt", title: "입점비·월 이용료 0원", desc: "견적 제출도 무료입니다. 실제 성사된 건에만 수수료가 발생합니다." },
  { icon: "lock", title: "대금 미지급 걱정 없음", desc: "고객이 먼저 결제한 건만 배정됩니다. 노쇼·먹튀 리스크가 없습니다." },
  { icon: "scale", title: "등급제 수수료", desc: "실적과 평점이 쌓일수록 수수료가 15%에서 10%까지 내려갑니다." },
  { icon: "pin", title: "우리 지역만 알림", desc: "담당 지역과 취급 종목에 맞는 요청만 골라서 받아봅니다." },
] as const;

export default async function PartnerSignupPage() {
  const { feeRates: rates } = await getSettings();

  return (
    <div className="bg-ink-50/40">
      <section className="border-b border-ink-100 bg-white">
        <div className="container-page py-14">
          <div className="max-w-2xl">
            <Badge tone="brand">청소 업체 파트너 모집</Badge>
            <h1 className="mt-4 text-[30px] font-bold leading-tight text-ink-900 sm:text-[40px]">
              일감 찾는 시간에
              <br />
              현장 한 곳 더 가세요
            </h1>
            <p className="mt-4 text-[15.5px] leading-relaxed text-ink-500">
              청소모아는 고객이 먼저 결제한 일감만 연결합니다. 입점비도, 월 이용료도 없습니다.
              등록은 5분, 심사는 보통 1영업일이면 끝납니다.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="card p-5">
                <Icon name={b.icon} className="h-6 w-6 text-ink-400" />
                <p className="mt-3 text-[15px] font-bold text-ink-900">{b.title}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">{b.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {(["basic", "good", "premium"] as const).map((t) => (
              <div key={t} className="rounded border border-ink-200 bg-white p-5">
                <p className="text-[13.5px] font-semibold text-ink-900">{TIER_LABEL[t]} 등급</p>
                <p className="tnum mt-1 text-[24px] font-bold text-brand-700">{Math.round(rates[t] * 100)}%</p>
                <p className="mt-1 text-[12px] text-ink-500">{TIER_RULE[t]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-[22px] font-bold text-ink-900">입점 신청서</h2>
          <p className="mt-1.5 text-sm text-ink-500">
            신청 후 사업자등록증·배상책임보험 확인을 거쳐 승인됩니다. 승인 전에도 요청 목록은 둘러볼 수 있습니다.
          </p>
          <div className="mt-6">
            <PartnerSignupForm />
          </div>
        </div>
      </div>
    </div>
  );
}
