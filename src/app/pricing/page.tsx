import type { Metadata } from "next";
import { getSettings } from "@/lib/service";
import { TIER_LABEL, TIER_RULE } from "@/lib/fees";
import { won } from "@/lib/format";
import { Badge, LinkButton, SectionHeading } from "@/components/ui";
import { Faq } from "@/components/faq";

export const metadata: Metadata = {
  title: "요금·수수료 정책",
  description: "고객은 시공 금액만 결제합니다. 업체 중개 수수료는 등급에 따라 10~15%이며 입점비·월 이용료는 없습니다.",
};

export const dynamic = "force-dynamic";

const EXAMPLE = 420000;

export default async function PricingPage() {
  const { feeRates: rates } = await getSettings();

  return (
    <>
      <section className="hero-mesh border-b border-ink-100 py-16">
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow="PRICING"
            title="숨은 비용이 없습니다"
            desc="고객은 선택한 업체의 시공 금액만 냅니다. 중개 수수료는 업체가 부담하며, 별도로 청구되지 않습니다."
          />
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-7">
            <Badge tone="brand">고객</Badge>
            <p className="mt-4 text-[22px] font-extrabold text-ink-900">이용료 0원</p>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-500">
              요청서 작성, 견적 비교, 업체 선택, 안전결제까지 모두 무료입니다. 결제하는 금액은 업체가 제시한 시공 금액뿐입니다.
            </p>
            <ul className="mt-5 space-y-2.5">
              {["요청서 작성 무료", "견적 비교 무료", "취소 수수료 없음 (작업 3일 전까지)", "안전결제·분쟁조정 무료"].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[14px] font-medium text-ink-700">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100 text-[11px] font-black text-brand-700">✓</span>
                  {t}
                </li>
              ))}
            </ul>
            <LinkButton href="/request/new" className="mt-6 w-full" size="lg">무료로 견적 받기</LinkButton>
          </div>

          <div className="card p-7">
            <Badge tone="dark">업체</Badge>
            <p className="mt-4 text-[22px] font-extrabold text-ink-900">성사된 건만 {Math.round(rates.premium * 100)}~{Math.round(rates.basic * 100)}%</p>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-500">
              입점비·월 이용료·견적 제출 비용은 모두 0원입니다. 실제로 계약이 성사되고 결제가 완료된 건에만 수수료가 발생합니다.
            </p>
            <ul className="mt-5 space-y-2.5">
              {["입점비 0원 / 월 이용료 0원", "견적 제출 무제한 무료", "카드·이체 수수료는 플랫폼 부담", "미낙찰 건은 비용 없음"].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[14px] font-medium text-ink-700">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink-900 text-[11px] font-black text-white">✓</span>
                  {t}
                </li>
              ))}
            </ul>
            <LinkButton href="/partner-signup" variant="dark" className="mt-6 w-full" size="lg">업체 등록 신청</LinkButton>
          </div>
        </div>
      </section>

      <section className="border-y border-ink-100 bg-ink-50/60 py-16">
        <div className="container-page">
          <h2 className="text-[24px] font-extrabold text-ink-900">등급별 수수료</h2>
          <p className="mt-2 text-[14.5px] text-ink-500">실적과 평점이 쌓일수록 수수료가 내려갑니다. 등급은 매 작업 완료 시 자동으로 재계산됩니다.</p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {(["basic", "good", "premium"] as const).map((t) => {
              const fee = Math.round(EXAMPLE * rates[t]);
              return (
                <div key={t} className={t === "premium" ? "card border-2 border-brand-500 p-6" : "card p-6"}>
                  <div className="flex items-center justify-between">
                    <p className="text-[16px] font-extrabold text-ink-900">{TIER_LABEL[t]}</p>
                    {t === "premium" && <Badge tone="dark">최대 혜택</Badge>}
                  </div>
                  <p className="tnum mt-3 text-[34px] font-extrabold leading-none text-brand-700">
                    {Math.round(rates[t] * 100)}
                    <span className="text-[18px]">%</span>
                  </p>
                  <p className="mt-2 text-[13px] text-ink-500">{TIER_RULE[t]}</p>
                  <dl className="tnum mt-5 space-y-2 border-t border-ink-100 pt-4 text-[13.5px]">
                    <div className="flex justify-between">
                      <dt className="text-ink-400">고객 결제</dt>
                      <dd className="font-semibold text-ink-800">{won(EXAMPLE)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink-400">중개 수수료</dt>
                      <dd className="font-semibold text-red-500">-{won(fee)}</dd>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-ink-100 pt-2">
                      <dt className="text-[14px] font-bold text-ink-900">실 정산액</dt>
                      <dd className="text-[18px] font-extrabold text-ink-900">{won(EXAMPLE - fee)}</dd>
                    </div>
                  </dl>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-[13px] text-ink-400">* 입주청소 32평 {won(EXAMPLE)} 시공 기준 예시</p>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="text-[24px] font-extrabold text-ink-900">수수료 관련 자주 묻는 질문</h2>
        <div className="mt-6 max-w-3xl">
          <Faq
            items={[
              {
                q: "고객이 수수료를 따로 내나요?",
                a: "아니요. 고객이 결제하는 금액은 업체가 제시한 시공 금액이 전부입니다.\n중개 수수료는 업체 정산액에서 차감되는 구조라 고객에게 별도로 청구되지 않습니다.",
              },
              {
                q: "업체가 수수료만큼 견적을 올려 부르면요?",
                a: "여러 업체가 같은 요청에 동시에 견적을 내기 때문에 가격이 스스로 조정됩니다.\n또한 카테고리별 기준 단가를 공개하고, 예상 범위를 크게 벗어난 견적에는 고객 화면에 안내가 표시됩니다.",
              },
              {
                q: "결제 수수료(PG 수수료)는 누가 내나요?",
                a: "청소모아가 부담합니다. 업체는 표시된 정산액을 그대로 받고, 정산 이체 수수료도 발생하지 않습니다.",
              },
              {
                q: "등급은 언제 올라가나요?",
                a: "작업이 완료될 때마다 누적 완료 건수와 평점으로 자동 재계산됩니다.\n우수 등급은 완료 20건·평점 4.5 이상, 프리미엄은 완료 60건·평점 4.7 이상이 기준입니다.",
              },
              {
                q: "취소하면 수수료는 어떻게 되나요?",
                a: "고객이 작업 3일 전까지 취소하면 전액 환불되고 수수료도 발생하지 않습니다.\n업체 귀책으로 취소되는 경우에도 고객에게 전액 환불되며, 반복되면 업체 노출이 제한됩니다.",
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
