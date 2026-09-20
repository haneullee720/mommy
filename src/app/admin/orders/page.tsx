import type { Metadata } from "next";
import {
  getPartnersByIds,
  getRequestsByIds,
  getSettings,
  getUsersByIds,
  listAllOrders,
} from "@/lib/service";
import { SERVICE_MAP } from "@/lib/catalog";
import { dateFull, won } from "@/lib/format";
import { EmptyState, OrderStatusBadge } from "@/components/ui";
import { ForceSettleButton } from "@/components/admin-controls";

export const metadata: Metadata = { title: "거래·정산" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const [orders, settings] = await Promise.all([listAllOrders(200), getSettings()]);
  const [requests, partners, customers] = await Promise.all([
    getRequestsByIds(orders.map((o) => o.requestId)),
    getPartnersByIds(orders.map((o) => o.partnerId)),
    getUsersByIds(orders.map((o) => o.customerId)),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-extrabold text-ink-900">거래·정산</h1>
        <p className="mt-1 text-sm text-ink-500">
          고객 확인이 지연된 건은 자동 구매확정 기간({settings.autoConfirmDays}일) 이후 강제 정산할 수 있습니다.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon="💳" title="거래 내역이 없습니다" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="border-b border-ink-100 bg-ink-50/70">
              <tr className="text-[12px] font-bold text-ink-500">
                <th className="px-4 py-3">주문번호</th>
                <th className="px-4 py-3">서비스</th>
                <th className="px-4 py-3">업체 / 고객</th>
                <th className="px-4 py-3 text-right">결제액</th>
                <th className="px-4 py-3 text-right">수수료</th>
                <th className="px-4 py-3 text-right">정산액</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">처리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {orders.map((o) => {
                const req = requests.get(o.requestId);
                const partner = partners.get(o.partnerId);
                const customer = customers.get(o.customerId);
                return (
                  <tr key={o.id} className="text-[13px]">
                    <td className="tnum px-4 py-3 font-semibold text-ink-700">
                      {o.code}
                      {o.paidAt && <span className="block text-[11px] font-normal text-ink-400">{dateFull(o.paidAt)}</span>}
                    </td>
                    <td className="px-4 py-3 text-ink-600">{req ? SERVICE_MAP[req.service].name : "-"}</td>
                    <td className="px-4 py-3 text-ink-600">
                      {partner?.companyName ?? "-"}
                      <span className="block text-[11px] text-ink-400">{customer?.name ?? "-"}</span>
                    </td>
                    <td className="tnum px-4 py-3 text-right text-ink-700">{won(o.amount)}</td>
                    <td className="tnum px-4 py-3 text-right font-bold text-brand-700">
                      {won(o.feeAmount)}
                      <span className="block text-[11px] font-normal text-ink-400">{Math.round(o.feeRate * 100)}%</span>
                    </td>
                    <td className="tnum px-4 py-3 text-right text-ink-700">{won(o.payoutAmount)}</td>
                    <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-4 py-3">{o.status === "completed" && <ForceSettleButton orderId={o.id} />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
