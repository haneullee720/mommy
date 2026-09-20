import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import {
  countQuotesByRequest,
  listOrdersByCustomer,
  listRequestsByCustomer,
  minQuoteByRequest,
} from "@/lib/service";
import { SERVICE_MAP } from "@/lib/catalog";
import { manwon, timeAgo, untilDeadline } from "@/lib/format";
import { EmptyState, LinkButton, OrderStatusBadge, RequestStatusBadge } from "@/components/ui";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "내 견적 요청" };
export const dynamic = "force-dynamic";

export default async function MyPage() {
  const user = await requireUser("customer");
  const requests = await listRequestsByCustomer(user.id);
  const orders = await listOrdersByCustomer(user.id);

  // 목록에서 쓰는 집계는 렌더링 전에 한 번에 모아 온다 (요청 건마다 쿼리하지 않도록).
  const requestIds = requests.map((r) => r.id);
  const [quoteCounts, lowestQuotes] = await Promise.all([
    countQuotesByRequest(requestIds),
    minQuoteByRequest(requestIds),
  ]);
  const orderByRequest = new Map(orders.map((o) => [o.requestId, o]));

  const active = orders.filter((o) => ["escrow", "in_progress", "completed"].includes(o.status));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-ink-900">내 견적 요청</h1>
          <p className="mt-1 text-sm text-ink-500">요청별로 도착한 견적을 비교하고 업체를 선택하세요.</p>
        </div>
        <LinkButton href="/request/new">새 견적 요청</LinkButton>
      </div>

      {active.length > 0 && (
        <section className="rounded border border-brand-200 bg-brand-50/60 p-5">
          <p className="text-sm font-semibold text-brand-800">진행 중인 작업 {active.length}건</p>
          <ul className="mt-3 space-y-2">
            {active.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/my/orders/${o.id}`}
                  className="flex items-center justify-between gap-3 rounded bg-white px-4 py-3 transition hover:shadow-soft"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-bold text-ink-900">{o.code}</span>
                    <span className="tnum block text-[12.5px] text-ink-500">
                      {o.scheduledDate} 예정 · {manwon(o.amount)}
                    </span>
                  </span>
                  <OrderStatusBadge status={o.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {requests.length === 0 ? (
        <EmptyState
          icon={<Icon name="broom" className="h-7 w-7" />}
          title="아직 요청한 견적이 없어요"
          desc="3분이면 요청서가 완성됩니다. 우리 동네 업체들이 견적을 보내드려요."
          action={<LinkButton href="/request/new" className="mt-2">첫 견적 요청하기</LinkButton>}
        />
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => {
            const quoteCount = quoteCounts.get(r.id) ?? 0;
            const lowest = lowestQuotes.get(r.id);
            const order = orderByRequest.get(r.id);
            return (
              <li key={r.id}>
                <Link
                  href={r.status === "open" || r.status === "selected" ? `/my/requests/${r.id}` : order ? `/my/orders/${order.id}` : `/my/requests/${r.id}`}
                  className="card block p-5 transition hover:border-brand-300 hover:shadow-soft"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Icon name={SERVICE_MAP[r.service].icon} className="h-[18px] w-[18px] text-ink-400" />
                    <span className="text-[15.5px] font-bold text-ink-900">{SERVICE_MAP[r.service].name}</span>
                    <RequestStatusBadge status={r.status} />
                    <span className="tnum ml-auto text-[12px] font-semibold text-ink-400">{r.code}</span>
                  </div>

                  <p className="tnum mt-2 text-[13.5px] text-ink-500">
                    {r.region} {r.district} · {r.areaPyeong}평 · 희망일 {r.preferredDate}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-3">
                    <div className="flex items-center gap-4">
                      <span className="tnum text-[13.5px] font-semibold text-brand-700">견적 {quoteCount}개</span>
                      {lowest !== undefined && (
                        <span className="tnum text-[13px] text-ink-500">최저 {manwon(lowest)}</span>
                      )}
                    </div>
                    <span className="text-[12.5px] font-semibold text-ink-400">
                      {r.status === "open" ? `견적 마감 ${untilDeadline(r.expiresAt)}` : `${timeAgo(r.createdAt)} 요청`}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
