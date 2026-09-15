import type { Metadata } from "next";
import { readDB } from "@/lib/db";
import { SettingsForm } from "@/components/admin-controls";

export const metadata: Metadata = { title: "정책 설정" };
export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  const { settings } = readDB();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-extrabold text-ink-900">정책 설정</h1>
        <p className="mt-1 text-sm text-ink-500">
          수수료율은 신규 계약(견적 선택 시점)부터 적용됩니다. 이미 체결된 주문의 수수료는 변하지 않습니다.
        </p>
      </div>

      <div className="card p-6">
        <SettingsForm rates={settings.feeRates} escrowHoldDays={settings.escrowHoldDays} autoConfirmDays={settings.autoConfirmDays} />
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-5">
        <p className="text-[14px] font-extrabold text-ink-900">수익 구조 메모</p>
        <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-ink-600">
          <li>· 고객은 시공 금액만 결제하고, 중개 수수료는 업체 정산액에서 차감됩니다.</li>
          <li>· PG 결제 수수료와 정산 이체 수수료는 플랫폼이 부담하므로, 실질 마진은 표시 수수료율보다 2~3%p 낮습니다.</li>
          <li>· 등급 인하는 재계약률을 높이는 장치입니다. 프리미엄 업체 비중이 높아질수록 평균 수수료율은 내려가지만 거래액이 커집니다.</li>
        </ul>
      </div>
    </div>
  );
}
