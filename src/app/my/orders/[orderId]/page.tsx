import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getOrder, getPartner, getRequest, getUser, countReviewsByPartner, getReviewByOrder } from "@/lib/service";
import { OPTION_MAP, PROPERTY_LABEL, SERVICE_MAP } from "@/lib/catalog";
import { dateFull, maskPhone, won } from "@/lib/format";
import { Alert, Badge, LinkButton, OrderStatusBadge, Stars, TierBadge } from "@/components/ui";
import { OrderTimeline } from "@/components/order-timeline";
import { ConfirmWorkButton, ReviewForm } from "@/components/order-actions";

export const metadata: Metadata = { title: "주문 상세" };
export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const { orderId } = await params;
  const sp = await searchParams;
  const user = await requireUser("customer");

  const order = await getOrder(orderId);
  if (!order || order.customerId !== user.id) notFound();

  const req = await getRequest(order.requestId);
  const partner = await getPartner(order.partnerId);
  if (!req || !partner) notFound();

  const partnerUser = await getUser(partner.userId);
  const def = SERVICE_MAP[req.service];
  const [myReview, partnerReviews] = await Promise.all([
    getReviewByOrder(order.id),
    countReviewsByPartner(partner.id),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/my/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-500 hover:text-ink-900">
        ← 결제·작업 내역
      </Link>

      {sp.paid && (
        <Alert tone="success">
          결제가 완료되었습니다. 금액은 청소모아가 안전하게 보관하며, 업체에 주소와 연락처가 전달되었습니다.
        </Alert>
      )}

      <section className="card p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl">{def.emoji}</span>
          <h1 className="text-[20px] font-extrabold text-ink-900">{def.name}</h1>
          <OrderStatusBadge status={order.status} />
          <span className="tnum ml-auto text-[12.5px] font-semibold text-ink-400">{order.code}</span>
        </div>
        <div className="mt-6">
          <OrderTimeline status={order.status} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {order.status === "completed" && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
              <p className="text-[15px] font-extrabold text-amber-900">업체가 작업 완료를 보고했습니다</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-amber-800">
                결과를 확인하고 문제가 없으면 아래 버튼을 눌러주세요. 확인하면 수수료를 제외한 금액이 업체에 정산됩니다.
                <br />
                미흡한 부분이 있다면 확인 전에 업체에 재작업을 요청하세요. 7일간 무상 A/S가 적용됩니다.
              </p>
              <div className="mt-4">
                <ConfirmWorkButton orderId={order.id} />
              </div>
            </section>
          )}

          {order.status === "escrow" && (
            <Alert tone="info">
              결제가 완료되어 업체가 작업을 준비하고 있습니다. 작업 시작 시 상태가 자동으로 바뀝니다.
            </Alert>
          )}

          <section className="card p-6">
            <h2 className="text-[16px] font-extrabold text-ink-900">작업 정보</h2>
            <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {[
                ["공간", `${PROPERTY_LABEL[req.propertyType]} · ${req.areaPyeong}평`],
                ["작업 예정일", order.scheduledDate],
                ["주소", `${req.region} ${req.district} ${req.addressDetail}`],
                ["연락처", `${req.contactName} · ${req.contactPhone}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-ink-100 pb-2 text-[13.5px]">
                  <dt className="shrink-0 text-ink-400">{k}</dt>
                  <dd className="text-right font-semibold text-ink-800">{v}</dd>
                </div>
              ))}
            </dl>
            {req.options.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {req.options.map((o) => (
                  <Badge key={o} tone="brand">{OPTION_MAP[o]?.label ?? o}</Badge>
                ))}
              </div>
            )}
            {req.description && (
              <p className="mt-4 whitespace-pre-line rounded-xl bg-ink-50 p-4 text-[13.5px] leading-relaxed text-ink-600">
                {req.description}
              </p>
            )}
          </section>

          {(order.status === "settled" || myReview) && (
            <section className="card p-6">
              <h2 className="text-[16px] font-extrabold text-ink-900">{myReview ? "작성한 후기" : "후기 남기기"}</h2>
              {myReview ? (
                <div className="mt-4 rounded-xl bg-ink-50 p-4">
                  <Stars rating={myReview.rating} size={16} />
                  <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink-700">{myReview.content}</p>
                  {myReview.reply && (
                    <div className="mt-3 rounded-lg border-l-2 border-brand-400 bg-white p-3">
                      <p className="text-[12px] font-bold text-brand-700">업체 답변</p>
                      <p className="mt-1 text-[13px] text-ink-600">{myReview.reply}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4">
                  <ReviewForm orderId={order.id} />
                </div>
              )}
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <p className="text-[13px] font-bold text-ink-400">시공 업체</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Link href={`/partners/${partner.id}`} className="text-[16px] font-extrabold text-ink-900 hover:underline">
                {partner.companyName}
              </Link>
              <TierBadge tier={partner.tier} />
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <Stars rating={partner.rating} />
              <span className="tnum text-[13px] font-bold">{partner.rating.toFixed(1)}</span>
              <span className="text-[12px] text-ink-400">후기 {partnerReviews}</span>
            </div>
            {order.paidAt && partnerUser && (
              <p className="tnum mt-3 border-t border-ink-100 pt-3 text-[13px] text-ink-600">
                담당 연락처 {maskPhone(partnerUser.phone)}
              </p>
            )}
          </div>

          <div className="card p-5">
            <p className="text-[13px] font-bold text-ink-400">결제 내역</p>
            <dl className="tnum mt-3 space-y-2 text-[13.5px]">
              <div className="flex justify-between">
                <dt className="text-ink-500">시공 금액</dt>
                <dd className="font-semibold text-ink-800">{won(order.amount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">결제 수단</dt>
                <dd className="font-semibold text-ink-800">{methodLabel(order.paymentMethod)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">결제일</dt>
                <dd className="font-semibold text-ink-800">{order.paidAt ? dateFull(order.paidAt) : "미결제"}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-ink-100 pt-2">
                <dt className="text-[14px] font-bold text-ink-900">총 결제 금액</dt>
                <dd className="text-[18px] font-extrabold text-ink-900">{won(order.amount)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[11.5px] leading-relaxed text-ink-400">
              고객이 내는 금액은 시공 금액뿐입니다. 중개 수수료는 업체가 부담하며 별도로 청구되지 않습니다.
            </p>
          </div>

          {order.status === "pending_payment" && (
            <LinkButton href={`/my/pay/${order.id}`} size="lg" className="w-full">
              결제 계속하기
            </LinkButton>
          )}
        </aside>
      </div>
    </div>
  );
}

function methodLabel(method: string) {
  return (
    { card: "신용·체크카드", transfer: "계좌이체", vbank: "가상계좌", easy: "간편결제" } as Record<string, string>
  )[method] ?? "-";
}
