import type { Metadata } from "next";

export const metadata: Metadata = { title: "개인정보 처리방침" };

const ITEMS = [
  { h: "수집 항목", p: "이름, 휴대전화번호, 이메일, 서비스 요청 주소(시/도·시/군/구·상세주소), 결제 수단 정보. 업체의 경우 사업자등록번호, 대표자명, 정산 계좌 정보를 추가로 수집합니다." },
  { h: "이용 목적", p: "견적 요청 중개, 업체 매칭, 결제 및 정산 처리, 분쟁 조정, 고객 응대, 서비스 품질 개선." },
  { h: "주소·연락처 공개 범위", p: "요청 단계에서 업체에게는 시/군/구까지만 제공됩니다. 상세 주소와 연락처는 결제가 완료되어 계약이 확정된 업체에게만 공개됩니다." },
  { h: "보유 기간", p: "회원 탈퇴 시 지체 없이 파기합니다. 다만 전자상거래법 등 관계 법령에 따라 계약 및 결제 기록은 5년, 소비자 불만·분쟁 처리 기록은 3년간 보관합니다." },
  { h: "제3자 제공", p: "결제 대행(PG) 및 정산 이체를 위한 금융기관 외에는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다." },
  { h: "이용자의 권리", p: "이용자는 언제든지 자신의 개인정보를 조회·수정하거나 처리 정지 및 삭제를 요청할 수 있습니다." },
];

export default function PrivacyPage() {
  return (
    <div className="container-page max-w-3xl py-16">
      <h1 className="text-[28px] font-extrabold text-ink-900">개인정보 처리방침</h1>
      <p className="mt-2 text-[13.5px] text-ink-400">데모용으로 작성된 예시 문안입니다. 실제 서비스 운영 시에는 법률 검토가 필요합니다.</p>
      <div className="mt-10 space-y-8">
        {ITEMS.map((s) => (
          <section key={s.h}>
            <h2 className="text-[16px] font-extrabold text-ink-900">{s.h}</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-600">{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
