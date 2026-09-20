import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getOrder, getPartner, getRequest } from "@/lib/service";
import { PROPERTY_LABEL, SERVICE_MAP } from "@/lib/catalog";
import { won } from "@/lib/format";
import { PayForm } from "@/components/pay-form";
import { Stars, TierBadge } from "@/components/ui";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "안전결제" };
export const dynamic = "force-dynamic";

export default async function PayPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await requireUser("customer");

  const order = await getOrder(orderId);
  if (!order || order.customerId !== user.id) notFound();
  if (order.status !== "pending_payment") redirect(`/my/orders/${order.id}`);

  const req = await getRequest(order.requestId);
  const partner = await getPartner(order.partnerId);
  if (!req || !partner) notFound();

  const def = SERVICE_MAP[req.service];

  return (
    <div className="space-y-6">
      <Link href={`/my/requests/${req.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-ink-500 hover:text-ink-900">
        ← 견적 다시 보기
      </Link>

      <div>
        <h1 className="text-[24px] font-bold text-ink-900">안전결제</h1>
        <p className="mt-1 text-sm text-ink-500">
          결제 금액은 작업 완료를 확인할 때까지 청소모아가 보관합니다.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="card p-6">
          <h2 className="text-[16px] font-bold text-ink-900">결제 수단 선택</h2>
          <div className="mt-5">
            <PayForm orderId={order.id} amount={order.amount} />
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <p className="text-[13px] font-bold text-ink-400">시공 업체</p>
            <div className="mt-2 flex items-center gap-2">
              <p className="text-[16px] font-bold text-ink-900">{partner.companyName}</p>
              <TierBadge tier={partner.tier} />
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <Stars rating={partner.rating} />
              <span className="tnum text-[13px] font-bold">{partner.rating.toFixed(1)}</span>
              <span className="text-[12px] text-ink-400">완료 {partner.completedJobs}건</span>
            </div>

            <dl className="mt-4 space-y-2 border-t border-ink-100 pt-4 text-[13.5px]">
              {[
                ["서비스", def.name],
                ["공간", `${PROPERTY_LABEL[req.propertyType]} ${req.areaPyeong}평`],
                ["작업 예정일", order.scheduledDate],
                ["장소", `${req.region} ${req.district}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-ink-400">{k}</dt>
                  <dd className="text-right font-semibold text-ink-800">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex items-baseline justify-between border-t border-ink-100 pt-4">
              <span className="text-[14px] font-bold text-ink-900">결제 금액</span>
              <span className="tnum text-[22px] font-bold text-ink-900">{won(order.amount)}</span>
            </div>
            <p className="mt-1 text-right text-[12px] text-ink-400">부가세 포함 · 추가 비용 없음</p>
          </div>

          <div className="rounded border border-brand-200 bg-brand-50/60 p-5">
            <p className="flex items-center gap-2 text-[13.5px] font-semibold text-brand-800"><Icon name="lock" className="h-4 w-4" />안전결제로 보호됩니다</p>
            <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-brand-800/80">
              <li>· 업체가 오지 않으면 100% 환불</li>
              <li>· 작업 3일 전까지 취소 시 전액 환불</li>
              <li>· 작업 후 7일간 무상 재작업 A/S</li>
              <li>· 분쟁 시 청소모아가 직접 조정</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
