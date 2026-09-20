import "server-only";
import {
  type Db,
  db,
  getSettings,
  nextCode,
  toOrder,
  toPartner,
  toQuote,
  toRequest,
  toReview,
  toUser,
  tx,
  uid,
} from "./db";
import { calcFee, evaluateTier } from "./fees";
import { estimate } from "./estimate";
import type {
  CleaningRequest,
  Order,
  Partner,
  PropertyType,
  Quote,
  Review,
  ServiceSlug,
  User,
} from "./types";

/* ------------------------------------------------------------------ 요청 */

export interface NewRequestInput {
  customerId: string;
  service: ServiceSlug;
  propertyType: PropertyType;
  areaPyeong: number;
  region: string;
  district: string;
  addressDetail: string;
  preferredDate: string;
  dateFlexible: boolean;
  options: string[];
  description: string;
  contactName: string;
  contactPhone: string;
}

export async function createRequest(input: NewRequestInput): Promise<CleaningRequest> {
  const est = estimate({
    service: input.service,
    propertyType: input.propertyType,
    areaPyeong: input.areaPyeong,
    options: input.options,
    dateFlexible: input.dateFlexible,
  });

  const sql = db();
  const code = await nextCode("request");
  const expiresAt = new Date(Date.now() + 3 * 864e5);

  const rows = await sql`
    insert into cleaning_requests (
      id, code, customer_id, service, property_type, area_pyeong, region, district,
      address_detail, preferred_date, date_flexible, options, description, photo_count,
      contact_name, contact_phone, estimate_min, estimate_max, status, expires_at
    ) values (
      ${uid("req")}, ${code}, ${input.customerId}, ${input.service}, ${input.propertyType},
      ${input.areaPyeong}, ${input.region}, ${input.district}, ${input.addressDetail},
      ${input.preferredDate}, ${input.dateFlexible}, ${input.options}, ${input.description}, 0,
      ${input.contactName}, ${input.contactPhone}, ${est.min}, ${est.max}, 'open', ${expiresAt}
    )
    returning *`;

  return toRequest(rows[0]);
}

export async function getRequest(id: string): Promise<CleaningRequest | null> {
  const rows = await db()`select * from cleaning_requests where id = ${id}`;
  return rows[0] ? toRequest(rows[0]) : null;
}

export async function listRequestsByCustomer(customerId: string): Promise<CleaningRequest[]> {
  const rows = await db()`
    select * from cleaning_requests
    where customer_id = ${customerId}
    order by created_at desc`;
  return rows.map(toRequest);
}

/** 업체에게 노출할 열린 요청: 담당 지역 + 취급 서비스 기준 */
export async function listOpenRequestsForPartner(partner: Partner): Promise<CleaningRequest[]> {
  if (partner.services.length === 0 || partner.regions.length === 0) return [];
  const rows = await db()`
    select * from cleaning_requests
    where status = 'open'
      and service = any(${partner.services})
      and (region = any(${partner.regions}) or region || ' ' || district = any(${partner.regions}))
    order by created_at desc`;
  return rows.map(toRequest);
}

/* ------------------------------------------------------------------ 견적 */

export interface NewQuoteInput {
  requestId: string;
  partnerId: string;
  amount: number;
  crewSize: number;
  workHours: number;
  availableDate: string;
  includes: string[];
  message: string;
  warrantyDays: number;
}

export function submitQuote(input: NewQuoteInput): Promise<Quote> {
  return tx(async (t) => {
    const reqRows = await t`
      select status from cleaning_requests where id = ${input.requestId} for update`;
    if (!reqRows[0]) throw new Error("REQUEST_NOT_FOUND");
    if (reqRows[0].status !== "open") throw new Error("REQUEST_CLOSED");

    // 이미 제출한 견적이 있으면 새로 만들지 않고 갱신한다.
    const existing = await t`
      select id from quotes
      where request_id = ${input.requestId} and partner_id = ${input.partnerId} and status = 'submitted'`;

    if (existing[0]) {
      const rows = await t`
        update quotes set
          amount = ${input.amount}, crew_size = ${input.crewSize}, work_hours = ${input.workHours},
          available_date = ${input.availableDate}, includes = ${input.includes},
          message = ${input.message}, warranty_days = ${input.warrantyDays}, created_at = now()
        where id = ${existing[0].id as string}
        returning *`;
      return toQuote(rows[0]);
    }

    const rows = await t`
      insert into quotes (
        id, request_id, partner_id, amount, crew_size, work_hours, available_date,
        includes, message, warranty_days, status
      ) values (
        ${uid("qot")}, ${input.requestId}, ${input.partnerId}, ${input.amount}, ${input.crewSize},
        ${input.workHours}, ${input.availableDate}, ${input.includes}, ${input.message},
        ${input.warrantyDays}, 'submitted'
      )
      returning *`;
    return toQuote(rows[0]);
  });
}

export async function listQuotes(requestId: string): Promise<Quote[]> {
  const rows = await db()`
    select * from quotes
    where request_id = ${requestId} and status <> 'withdrawn'
    order by amount asc`;
  return rows.map(toQuote);
}

export async function listQuotesByPartner(partnerId: string): Promise<Quote[]> {
  const rows = await db()`
    select * from quotes where partner_id = ${partnerId} order by created_at desc`;
  return rows.map(toQuote);
}

/* ------------------------------------------------------------------ 주문 */

/** 고객이 견적을 선택하면 결제 대기 상태의 주문이 생성된다. */
export function acceptQuote(requestId: string, quoteId: string, customerId: string): Promise<Order> {
  return tx(async (t) => {
    const reqRows = await t`select * from cleaning_requests where id = ${requestId} for update`;
    const req = reqRows[0];
    if (!req) throw new Error("REQUEST_NOT_FOUND");
    if (req.customerId !== customerId) throw new Error("FORBIDDEN");
    if (req.status !== "open" && req.status !== "selected") throw new Error("REQUEST_CLOSED");

    const quoteRows = await t`
      select * from quotes where id = ${quoteId} and request_id = ${requestId}`;
    const quote = quoteRows[0];
    if (!quote) throw new Error("QUOTE_NOT_FOUND");

    const partnerRows = await t`select * from partners where id = ${quote.partnerId as string}`;
    const partner = partnerRows[0];
    if (!partner) throw new Error("PARTNER_NOT_FOUND");

    // 선택을 바꾸는 경우: 기존 미결제 주문을 되돌린다.
    const prior = await t`
      select id, quote_id from orders
      where request_id = ${requestId} and status = 'pending_payment'`;
    if (prior[0]) {
      await t`update quotes set status = 'submitted' where id = ${prior[0].quoteId as string}`;
      await t`delete from orders where id = ${prior[0].id as string}`;
    }

    const settings = await getSettings(t);
    const fee = calcFee(quote.amount as number, settings.feeRates[partner.tier as Partner["tier"]]);
    const code = await nextCode("order", t);

    const rows = await t`
      insert into orders (
        id, code, request_id, quote_id, customer_id, partner_id,
        amount, fee_rate, fee_amount, payout_amount, status, scheduled_date
      ) values (
        ${uid("ord")}, ${code}, ${requestId}, ${quoteId}, ${customerId}, ${partner.id as string},
        ${fee.amount}, ${fee.feeRate}, ${fee.feeAmount}, ${fee.payoutAmount},
        'pending_payment', ${(quote.availableDate as string) || (req.preferredDate as string)}
      )
      returning *`;

    await t`update quotes set status = 'accepted' where id = ${quoteId}`;
    await t`
      update quotes set status = 'rejected'
      where request_id = ${requestId} and id <> ${quoteId} and status = 'submitted'`;
    await t`update cleaning_requests set status = 'selected' where id = ${requestId}`;

    return toOrder(rows[0]);
  });
}

/** 선결제 → 에스크로 보관 */
export function payOrder(orderId: string, customerId: string, method: string): Promise<Order> {
  return tx(async (t) => {
    const rows = await t`select * from orders where id = ${orderId} for update`;
    const order = rows[0];
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.customerId !== customerId) throw new Error("FORBIDDEN");
    if (order.status !== "pending_payment") throw new Error("ALREADY_PAID");

    const updated = await t`
      update orders set status = 'escrow', payment_method = ${method}, paid_at = now()
      where id = ${orderId}
      returning *`;
    await t`update cleaning_requests set status = 'paid' where id = ${order.requestId as string}`;
    return toOrder(updated[0]);
  });
}

export function startWork(orderId: string, partnerId: string): Promise<Order> {
  return advanceOrder(orderId, partnerId, "escrow", "in_progress", "started_at", "in_progress");
}

/** 업체 작업 완료 보고 → 고객 확인 대기 */
export function reportDone(orderId: string, partnerId: string): Promise<Order> {
  return advanceOrder(orderId, partnerId, "in_progress", "completed", "completed_at", "completed");
}

/** 업체가 주문 상태를 한 단계 진행시키는 공통 경로 */
function advanceOrder(
  orderId: string,
  partnerId: string,
  from: string,
  to: string,
  stampColumn: "started_at" | "completed_at",
  requestStatus: string,
): Promise<Order> {
  return tx(async (t) => {
    const rows = await t`select * from orders where id = ${orderId} for update`;
    const order = rows[0];
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.partnerId !== partnerId) throw new Error("FORBIDDEN");
    if (order.status !== from) throw new Error("INVALID_STATE");

    const updated =
      stampColumn === "started_at"
        ? await t`update orders set status = ${to}, started_at = now() where id = ${orderId} returning *`
        : await t`update orders set status = ${to}, completed_at = now() where id = ${orderId} returning *`;

    await t`
      update cleaning_requests set status = ${requestStatus}
      where id = ${order.requestId as string}`;
    return toOrder(updated[0]);
  });
}

/** 고객 작업 확인(구매확정) → 수수료 차감 후 업체 정산 */
export function confirmAndSettle(orderId: string, actorId: string, isAdmin = false): Promise<Order> {
  return tx(async (t) => {
    const rows = await t`select * from orders where id = ${orderId} for update`;
    const order = rows[0];
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (!isAdmin && order.customerId !== actorId) throw new Error("FORBIDDEN");
    if (order.status !== "completed") throw new Error("INVALID_STATE");

    const updated = await t`
      update orders set status = 'settled', settled_at = now()
      where id = ${orderId}
      returning *`;
    await t`update cleaning_requests set status = 'settled' where id = ${order.requestId as string}`;

    // 완료 건수가 늘었으니 등급을 다시 계산한다.
    const partnerRows = await t`
      update partners set completed_jobs = completed_jobs + 1
      where id = ${order.partnerId as string}
      returning completed_jobs, rating`;
    if (partnerRows[0]) {
      const tier = evaluateTier(
        partnerRows[0].completedJobs as number,
        partnerRows[0].rating as number,
      );
      await t`update partners set tier = ${tier} where id = ${order.partnerId as string}`;
    }

    return toOrder(updated[0]);
  });
}

export function cancelRequest(requestId: string, customerId: string): Promise<void> {
  return tx(async (t) => {
    const rows = await t`select * from cleaning_requests where id = ${requestId} for update`;
    const req = rows[0];
    if (!req) throw new Error("REQUEST_NOT_FOUND");
    if (req.customerId !== customerId) throw new Error("FORBIDDEN");
    if (["paid", "in_progress", "completed", "settled"].includes(req.status as string)) {
      throw new Error("INVALID_STATE");
    }

    await t`update cleaning_requests set status = 'canceled' where id = ${requestId}`;
    await t`update quotes set status = 'rejected' where request_id = ${requestId} and status = 'submitted'`;
    await t`delete from orders where request_id = ${requestId} and status = 'pending_payment'`;
  });
}

export async function listOrdersByCustomer(customerId: string): Promise<Order[]> {
  const rows = await db()`
    select * from orders where customer_id = ${customerId} order by created_at desc`;
  return rows.map(toOrder);
}

export async function listOrdersByPartner(partnerId: string): Promise<Order[]> {
  const rows = await db()`
    select * from orders where partner_id = ${partnerId} order by created_at desc`;
  return rows.map(toOrder);
}

export async function getOrder(id: string): Promise<Order | null> {
  const rows = await db()`select * from orders where id = ${id}`;
  return rows[0] ? toOrder(rows[0]) : null;
}

export async function getOrderByRequest(requestId: string): Promise<Order | null> {
  const rows = await db()`
    select * from orders where request_id = ${requestId} order by created_at desc limit 1`;
  return rows[0] ? toOrder(rows[0]) : null;
}

/* ------------------------------------------------------------------ 리뷰 */

export function createReview(input: {
  orderId: string;
  customerId: string;
  rating: number;
  scores: { kindness: number; detail: number; punctuality: number };
  content: string;
}): Promise<Review> {
  return tx(async (t) => {
    const orderRows = await t`select * from orders where id = ${input.orderId}`;
    const order = orderRows[0];
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.customerId !== input.customerId) throw new Error("FORBIDDEN");

    const dup = await t`select 1 from reviews where order_id = ${input.orderId}`;
    if (dup[0]) throw new Error("ALREADY_REVIEWED");

    const partnerId = order.partnerId as string;
    const rows = await t`
      insert into reviews (id, order_id, customer_id, partner_id, rating, scores, content)
      values (
        ${uid("rev")}, ${input.orderId}, ${input.customerId}, ${partnerId},
        ${input.rating}, ${t.json(input.scores)}, ${input.content}
      )
      returning *`;

    // 업체 평점·후기 수를 실제 리뷰 레코드에서 다시 집계한다.
    const agg = await t`
      select count(*)::int as cnt, avg(rating)::float8 as avg
      from reviews where partner_id = ${partnerId}`;
    const count = agg[0].cnt as number;
    const rating = Math.round(((agg[0].avg as number) ?? 0) * 10) / 10;

    const completed = await t`select completed_jobs from partners where id = ${partnerId}`;
    const tier = evaluateTier((completed[0]?.completedJobs as number) ?? 0, rating);

    await t`
      update partners set review_count = ${count}, rating = ${rating}, tier = ${tier}
      where id = ${partnerId}`;

    return toReview(rows[0]);
  });
}

export async function replyToReview(reviewId: string, partnerId: string, reply: string): Promise<void> {
  const rows = await db()`
    update reviews set reply = ${reply}
    where id = ${reviewId} and partner_id = ${partnerId}
    returning id`;
  if (!rows[0]) throw new Error("REVIEW_NOT_FOUND");
}

export async function listReviewsByPartner(partnerId: string): Promise<Review[]> {
  const rows = await db()`
    select * from reviews where partner_id = ${partnerId} order by created_at desc`;
  return rows.map(toReview);
}

export async function countReviewsByPartner(partnerId: string): Promise<number> {
  const rows = await db()`select count(*)::int as n from reviews where partner_id = ${partnerId}`;
  return rows[0].n as number;
}

export async function listRecentReviews(limit = 6): Promise<Review[]> {
  const rows = await db()`select * from reviews order by created_at desc limit ${limit}`;
  return rows.map(toReview);
}

/* ------------------------------------------------------------------ 조회 */

export async function getPartner(id: string): Promise<Partner | null> {
  const rows = await db()`select * from partners where id = ${id}`;
  return rows[0] ? toPartner(rows[0]) : null;
}

export async function listPartners(filter?: {
  service?: ServiceSlug;
  region?: string;
}): Promise<Partner[]> {
  const sql = db();
  const rows = await sql`
    select * from partners
    where status = 'approved'
      ${filter?.service ? sql`and ${filter.service} = any(services)` : sql``}
      ${
        filter?.region
          ? sql`and exists (select 1 from unnest(regions) r where r like ${filter.region + "%"})`
          : sql``
      }
    order by rating desc, completed_jobs desc`;
  return rows.map(toPartner);
}

export async function getUser(id: string): Promise<User | null> {
  const rows = await db()`select * from users where id = ${id}`;
  return rows[0] ? toUser(rows[0]) : null;
}

/** 여러 건을 한 번에 조회해 N+1 쿼리를 피한다. */
export async function getUsersByIds(ids: string[]): Promise<Map<string, User>> {
  if (ids.length === 0) return new Map();
  const rows = await db()`select * from users where id = any(${[...new Set(ids)]})`;
  return new Map(rows.map((r) => [r.id as string, toUser(r)]));
}

export async function getPartnersByIds(ids: string[]): Promise<Map<string, Partner>> {
  if (ids.length === 0) return new Map();
  const rows = await db()`select * from partners where id = any(${[...new Set(ids)]})`;
  return new Map(rows.map((r) => [r.id as string, toPartner(r)]));
}

export async function getRequestsByIds(ids: string[]): Promise<Map<string, CleaningRequest>> {
  if (ids.length === 0) return new Map();
  const rows = await db()`select * from cleaning_requests where id = any(${[...new Set(ids)]})`;
  return new Map(rows.map((r) => [r.id as string, toRequest(r)]));
}

/** 요청별 견적 개수 */
export async function countQuotesByRequest(requestIds: string[]): Promise<Map<string, number>> {
  if (requestIds.length === 0) return new Map();
  const rows = await db()`
    select request_id, count(*)::int as cnt from quotes
    where request_id = any(${[...new Set(requestIds)]}) and status <> 'withdrawn'
    group by request_id`;
  return new Map(rows.map((r) => [r.requestId as string, r.cnt as number]));
}

/** 요청별 최저 견적가 */
export async function minQuoteByRequest(requestIds: string[]): Promise<Map<string, number>> {
  if (requestIds.length === 0) return new Map();
  const rows = await db()`
    select request_id, min(amount)::int as low from quotes
    where request_id = any(${[...new Set(requestIds)]}) and status <> 'withdrawn'
    group by request_id`;
  return new Map(rows.map((r) => [r.requestId as string, r.low as number]));
}

export async function getReviewByOrder(orderId: string): Promise<Review | null> {
  const rows = await db()`select * from reviews where order_id = ${orderId}`;
  return rows[0] ? toReview(rows[0]) : null;
}

/* ------------------------------------------------------------------ 운영자 조회 */

/** 심사 대기 → 승인 → 정지 순으로 모든 업체 */
export async function listAllPartners(): Promise<Partner[]> {
  const rows = await db()`
    select * from partners
    order by case status when 'pending' then 0 when 'approved' then 1 else 2 end,
             created_at desc`;
  return rows.map(toPartner);
}

export async function listPendingPartners(limit = 5): Promise<Partner[]> {
  const rows = await db()`
    select * from partners where status = 'pending' order by created_at desc limit ${limit}`;
  return rows.map(toPartner);
}

export async function listAllOrders(limit = 200): Promise<Order[]> {
  const rows = await db()`select * from orders order by created_at desc limit ${limit}`;
  return rows.map(toOrder);
}

/** 서비스별 요청 건수 (많은 순) */
export async function requestCountByService(): Promise<{ service: ServiceSlug; count: number }[]> {
  const rows = await db()`
    select service, count(*)::int as count from cleaning_requests
    group by service order by count desc`;
  return rows.map((r) => ({ service: r.service as ServiceSlug, count: r.count as number }));
}

export interface EscrowSummary {
  heldAmount: number;
  heldCount: number;
  settleAmount: number;
  settleCount: number;
}

/** 에스크로 보관액과 정산 대기액 */
export async function escrowSummary(): Promise<EscrowSummary> {
  const rows = await db()`
    select
      coalesce(sum(amount) filter (where status in ('escrow','in_progress','completed')), 0)::bigint as held_amount,
      count(*) filter (where status in ('escrow','in_progress','completed'))::int as held_count,
      coalesce(sum(payout_amount) filter (where status = 'completed'), 0)::bigint as settle_amount,
      count(*) filter (where status = 'completed')::int as settle_count
    from orders`;
  const r = rows[0];
  return {
    heldAmount: Number(r.heldAmount),
    heldCount: r.heldCount as number,
    settleAmount: Number(r.settleAmount),
    settleCount: r.settleCount as number,
  };
}

/* ------------------------------------------------------------------ 통계 */

export interface PlatformStats {
  partnerCount: number;
  requestCount: number;
  completedCount: number;
  avgRating: number;
  avgQuotesPerRequest: number;
  gmv: number;
  revenue: number;
}

export async function platformStats(): Promise<PlatformStats> {
  const sql = db();
  const [[partners], [requests], [quotes], [orders], [settled], [ratings]] = await Promise.all([
    sql`select count(*)::int as n from partners where status = 'approved'`,
    sql`select count(*)::int as n from cleaning_requests`,
    sql`select count(*)::int as n from quotes`,
    sql`select
          coalesce(sum(amount), 0)::bigint as gmv,
          coalesce(sum(fee_amount), 0)::bigint as revenue
        from orders where paid_at is not null`,
    sql`select count(*)::int as n from orders where status = 'settled'`,
    sql`select coalesce(avg(rating), 0)::float8 as avg from partners where review_count > 0`,
  ]);

  const requestCount = requests.n as number;
  return {
    partnerCount: partners.n as number,
    requestCount,
    completedCount: settled.n as number,
    avgRating: Math.round(((ratings.avg as number) ?? 0) * 10) / 10,
    avgQuotesPerRequest: requestCount
      ? Math.round(((quotes.n as number) / requestCount) * 10) / 10
      : 0,
    gmv: Number(orders.gmv),
    revenue: Number(orders.revenue),
  };
}

export { getSettings } from "./db";
export type { Db };
