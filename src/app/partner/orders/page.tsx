import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentPartner } from "@/lib/auth";
import { getRequest, getUser, listOrdersByPartner } from "@/lib/service";
import { OPTION_MAP, PROPERTY_LABEL, SERVICE_MAP } from "@/lib/catalog";
import { dateFull, won } from "@/lib/format";
import { Badge, EmptyState, LinkButton, OrderStatusBadge } from "@/components/ui";
import { ReportDoneButton, StartWorkButton } from "@/components/partner-order-actions";

export const metadata: Metadata = { title: "수주 작업" };
export const dynamic = "force-dynamic";

export default async function PartnerOrdersPage() {
  const ctx = await currentPartner();
  if (!ctx) redirect("/partner-signup");

  const orders = listOrdersByPartner(ctx.partner.id).filter((o) => o.status !== "pending_payment");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-extrabold text-ink-900">수주 작업</h1>
        <p className="mt-1 text-sm text-ink-500">결제가 완료된 건만 표시됩니다. 노쇼 걱정 없이 일정만 챙기세요.</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon="🧹"
          title="아직 수주한 작업이 없습니다"
          desc="견적을 보내고 고객에게 선택되면 이곳에 표시됩니다."
          action={<LinkButton href="/partner/requests" className="mt-2">새 요청 보기</LinkButton>}
        />
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => {
            const req = getRequest(o.requestId);
            const customer = getUser(o.customerId);
            const revealed = Boolean(o.paidAt);
            return (
              <li key={o.id} className="card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  {req && (
                    <span className="text-[15.5px] font-extrabold text-ink-900">
                      {SERVICE_MAP[req.service].emoji} {SERVICE_MAP[req.service].name}
                    </span>
                  )}
                  <OrderStatusBadge status={o.status} />
                  <span className="tnum ml-auto text-[12px] font-semibold text-ink-400">{o.code}</span>
                </div>

                {req && (
                  <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                    {[
                      ["작업 예정일", o.scheduledDate],
                      ["공간", `${PROPERTY_LABEL[req.propertyType]} · ${req.areaPyeong}평`],
                      ["주소", revealed ? `${req.region} ${req.district} ${req.addressDetail}` : `${req.region} ${req.district} (결제 후 공개)`],
                      ["고객 연락처", revealed ? `${req.contactName} · ${req.contactPhone}` : customer?.name ?? "-"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-3 border-b border-ink-100 pb-2 text-[13.5px]">
                        <dt className="shrink-0 text-ink-400">{k}</dt>
                        <dd className="tnum text-right font-semibold text-ink-800">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {req && req.options.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {req.options.map((x) => (
                      <Badge key={x} tone="brand">{OPTION_MAP[x]?.label ?? x}</Badge>
                    ))}
                  </div>
                )}

                {req?.description && (
                  <p className="mt-3 whitespace-pre-line rounded-xl bg-ink-50 p-3.5 text-[13px] leading-relaxed text-ink-600">
                    {req.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
                  <div className="tnum text-[13px] text-ink-500">
                    결제 {won(o.amount)} · 수수료 {Math.round(o.feeRate * 100)}% ·{" "}
                    <strong className="text-ink-900">정산 {won(o.payoutAmount)}</strong>
                    {o.settledAt && <span className="ml-2 text-ink-400">{dateFull(o.settledAt)} 지급</span>}
                  </div>
                  <div>
                    {o.status === "escrow" && <StartWorkButton orderId={o.id} />}
                    {o.status === "in_progress" && <ReportDoneButton orderId={o.id} />}
                    {o.status === "completed" && <span className="text-[13px] font-bold text-amber-600">고객 확인 대기 중</span>}
                    {o.status === "settled" && <span className="text-[13px] font-bold text-emerald-600">정산 완료</span>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
