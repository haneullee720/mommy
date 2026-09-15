import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getPartner, getRequest, listOrdersByCustomer } from "@/lib/service";
import { SERVICE_MAP } from "@/lib/catalog";
import { dateFull, won } from "@/lib/format";
import { EmptyState, LinkButton, OrderStatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "결제·작업 내역" };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await requireUser("customer");
  const orders = listOrdersByCustomer(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-extrabold text-ink-900">결제·작업 내역</h1>
        <p className="mt-1 text-sm text-ink-500">결제한 건의 진행 상태와 영수증을 확인할 수 있습니다.</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon="🧾"
          title="아직 결제 내역이 없어요"
          desc="견적을 비교하고 업체를 선택하면 이곳에 표시됩니다."
          action={<LinkButton href="/my" className="mt-2">내 견적 요청 보기</LinkButton>}
        />
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const req = getRequest(o.requestId);
            const partner = getPartner(o.partnerId);
            return (
              <li key={o.id}>
                <Link href={`/my/orders/${o.id}`} className="card block p-5 transition hover:border-brand-300 hover:shadow-soft">
                  <div className="flex flex-wrap items-center gap-2">
                    {req && <span className="text-lg">{SERVICE_MAP[req.service].emoji}</span>}
                    <span className="text-[15.5px] font-extrabold text-ink-900">
                      {req ? SERVICE_MAP[req.service].name : "청소"} · {partner?.companyName}
                    </span>
                    <OrderStatusBadge status={o.status} />
                    <span className="tnum ml-auto text-[12px] font-semibold text-ink-400">{o.code}</span>
                  </div>
                  <div className="tnum mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-3 text-[13px]">
                    <span className="text-ink-500">작업 예정일 {o.scheduledDate}</span>
                    <span className="font-extrabold text-ink-900">{won(o.amount)}</span>
                  </div>
                  {o.paidAt && <p className="tnum mt-1 text-[12px] text-ink-400">{dateFull(o.paidAt)} 결제</p>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
