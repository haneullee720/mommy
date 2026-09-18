import type { Metadata } from "next";
import { Faq } from "@/components/faq";
import { LinkButton, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "자주 묻는 질문",
  description: "견적, 결제, 환불, 업체 검증, 수수료까지 청소모아 이용 중 궁금한 점을 모았습니다.",
};

const CUSTOMER = [
  { q: "견적을 받는 데 돈이 드나요?", a: "아니요. 요청서 작성부터 견적 비교, 업체 선택까지 모두 무료입니다.\n고객이 내는 금액은 선택한 업체의 시공 금액뿐입니다." },
  { q: "견적은 얼마나 빨리 오나요?", a: "평균 30분에서 3시간 안에 첫 견적이 도착합니다.\n요청은 3일간 열려 있고, 보통 3~7개 업체가 견적을 보냅니다." },
  { q: "주소와 전화번호가 바로 공개되나요?", a: "아니요. 업체에는 시/군/구까지만 보입니다.\n상세 주소와 연락처는 결제가 완료된 업체에게만 공개됩니다." },
  { q: "선결제한 돈은 언제 업체에 넘어가나요?", a: "결제 즉시 넘어가지 않습니다. 청소모아가 예치(에스크로)하고 있다가,\n작업 후 고객이 '작업 확인'을 누른 뒤 정산됩니다. 7일간 확인이 없으면 자동 확정됩니다." },
  { q: "청소가 마음에 들지 않으면?", a: "작업 확인 전에 재작업을 요청하세요. 모든 계약에 최소 7일의 무상 A/S가 포함됩니다.\n협의가 되지 않으면 청소모아 분쟁조정팀이 예치금을 보관한 채로 조정합니다." },
  { q: "취소하면 환불되나요?", a: "작업 3일 전까지는 전액 환불됩니다. 이후에는 시점에 따라 환불 비율이 달라집니다.\n업체 귀책이나 노쇼는 언제든 전액 환불입니다." },
  { q: "특정 업체를 지정할 수 있나요?", a: "직접 지정은 불가능합니다. 다만 요청서를 보내면 조건에 맞는 업체들이 견적을 보내고,\n그중에서 원하는 업체를 고르는 방식이라 결과적으로 같습니다." },
];

const PARTNER = [
  { q: "입점 비용이 있나요?", a: "없습니다. 입점비, 월 이용료, 견적 제출 비용 모두 0원입니다.\n실제로 계약이 성사되고 결제가 완료된 건에만 수수료가 발생합니다." },
  { q: "수수료는 얼마인가요?", a: "결제 금액 기준 10~15%입니다. 등급에 따라 달라집니다.\n일반 15%, 우수 12%(완료 20건·평점 4.5 이상), 프리미엄 10%(완료 60건·평점 4.7 이상)." },
  { q: "정산은 언제 받나요?", a: "고객이 작업을 확인하면 정산 대기로 잡히고, 영업일 3일 내 등록 계좌로 입금됩니다.\n고객 미확인 건도 7일 뒤 자동 확정되어 정산됩니다." },
  { q: "심사는 얼마나 걸리나요?", a: "보통 1영업일입니다. 사업자등록증과 배상책임보험 가입 여부를 확인합니다.\n심사 중에도 요청 목록은 둘러볼 수 있고, 승인 후 견적 제출이 열립니다." },
  { q: "견적을 여러 번 수정할 수 있나요?", a: "요청이 마감되기 전까지는 금액과 조건을 자유롭게 수정해 다시 보낼 수 있습니다.\n수정해도 추가 비용은 없습니다." },
  { q: "고객이 결제를 안 하면요?", a: "결제가 완료된 건만 수주 작업으로 배정됩니다.\n결제 전에는 주소와 연락처가 열리지 않으므로 헛걸음할 일이 없습니다." },
];

export default function FaqPage() {
  return (
    <>
      <section className="hero-mesh border-b border-ink-100 py-14">
        <div className="container-page">
          <SectionHeading align="left" eyebrow="FAQ" title="자주 묻는 질문" desc="찾는 답이 없으면 고객센터로 문의해 주세요." />
        </div>
      </section>

      <div className="container-page grid gap-10 py-14 lg:grid-cols-2">
        <section>
          <h2 className="mb-5 text-[20px] font-extrabold text-ink-900">고객</h2>
          <Faq items={CUSTOMER} />
        </section>
        <section>
          <h2 className="mb-5 text-[20px] font-extrabold text-ink-900">청소 업체</h2>
          <Faq items={PARTNER} />
        </section>
      </div>

      <div className="container-page pb-20">
        <div className="card flex flex-col items-center gap-4 p-10 text-center">
          <p className="text-[18px] font-extrabold text-ink-900">아직 궁금한 점이 남았나요?</p>
          <p className="text-[14px] text-ink-500">이용 방법과 안심 보장 제도 페이지에 더 자세한 내용이 있습니다.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <LinkButton href="/how-it-works" variant="secondary">이용 방법</LinkButton>
            <LinkButton href="/safety" variant="secondary">안심 보장 제도</LinkButton>
            <LinkButton href="/request/new">견적 요청하기</LinkButton>
          </div>
        </div>
      </div>
    </>
  );
}
