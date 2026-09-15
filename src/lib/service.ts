import "server-only";
import { makeCode, mutate, readDB, uid } from "./db";
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

export function createRequest(input: NewRequestInput): CleaningRequest {
  const est = estimate({
    service: input.service,
    propertyType: input.propertyType,
    areaPyeong: input.areaPyeong,
    options: input.options,
    dateFlexible: input.dateFlexible,
  });
  return mutate((db) => {
    const now = new Date();
    const req: CleaningRequest = {
      id: uid("req"),
      code: makeCode("CM", db.requests.length + 1),
      customerId: input.customerId,
      service: input.service,
      propertyType: input.propertyType,
      areaPyeong: input.areaPyeong,
      region: input.region,
      district: input.district,
      addressDetail: input.addressDetail,
      preferredDate: input.preferredDate,
      dateFlexible: input.dateFlexible,
      options: input.options,
      description: input.description,
      photoCount: 0,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
      estimateMin: est.min,
      estimateMax: est.max,
      status: "open",
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 3 * 864e5).toISOString(),
    };
    db.requests.push(req);
    return req;
  });
}

export function getRequest(id: string): CleaningRequest | null {
  return readDB().requests.find((r) => r.id === id) ?? null;
}

export function listRequestsByCustomer(customerId: string): CleaningRequest[] {
  return readDB()
    .requests.filter((r) => r.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** 업체에게 노출할 열린 요청: 담당 지역 + 취급 서비스 기준 */
export function listOpenRequestsForPartner(partner: Partner): CleaningRequest[] {
  const db = readDB();
  return db.requests
    .filter((r) => r.status === "open")
    .filter((r) => partner.services.includes(r.service))
    .filter((r) => partner.regions.includes(r.region) || partner.regions.includes(`${r.region} ${r.district}`))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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

export function submitQuote(input: NewQuoteInput): Quote {
  return mutate((db) => {
    const req = db.requests.find((r) => r.id === input.requestId);
    if (!req) throw new Error("REQUEST_NOT_FOUND");
    if (req.status !== "open") throw new Error("REQUEST_CLOSED");
    const existing = db.quotes.find((q) => q.requestId === req.id && q.partnerId === input.partnerId && q.status === "submitted");
    if (existing) {
      existing.amount = input.amount;
      existing.crewSize = input.crewSize;
      existing.workHours = input.workHours;
      existing.availableDate = input.availableDate;
      existing.includes = input.includes;
      existing.message = input.message;
      existing.warrantyDays = input.warrantyDays;
      existing.createdAt = new Date().toISOString();
      return existing;
    }
    const quote: Quote = {
      id: uid("qot"),
      requestId: input.requestId,
      partnerId: input.partnerId,
      amount: input.amount,
      crewSize: input.crewSize,
      workHours: input.workHours,
      availableDate: input.availableDate,
      includes: input.includes,
      message: input.message,
      warrantyDays: input.warrantyDays,
      status: "submitted",
      createdAt: new Date().toISOString(),
    };
    db.quotes.push(quote);
    return quote;
  });
}

export function listQuotes(requestId: string): Quote[] {
  return readDB()
    .quotes.filter((q) => q.requestId === requestId && q.status !== "withdrawn")
    .sort((a, b) => a.amount - b.amount);
}

export function listQuotesByPartner(partnerId: string): Quote[] {
  return readDB()
    .quotes.filter((q) => q.partnerId === partnerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* ------------------------------------------------------------------ 주문 */

/** 고객이 견적을 선택하면 결제 대기 상태의 주문이 생성된다. */
export function acceptQuote(requestId: string, quoteId: string, customerId: string): Order {
  return mutate((db) => {
    const req = db.requests.find((r) => r.id === requestId);
    if (!req) throw new Error("REQUEST_NOT_FOUND");
    if (req.customerId !== customerId) throw new Error("FORBIDDEN");
    if (req.status !== "open" && req.status !== "selected") throw new Error("REQUEST_CLOSED");
    const quote = db.quotes.find((q) => q.id === quoteId && q.requestId === requestId);
    if (!quote) throw new Error("QUOTE_NOT_FOUND");
    const partner = db.partners.find((p) => p.id === quote.partnerId);
    if (!partner) throw new Error("PARTNER_NOT_FOUND");

    // 기존 미결제 주문이 있으면 되돌린다 (선택 변경 허용)
    const prior = db.orders.find((o) => o.requestId === requestId && o.status === "pending_payment");
    if (prior) {
      const priorQuote = db.quotes.find((q) => q.id === prior.quoteId);
      if (priorQuote) priorQuote.status = "submitted";
      db.orders = db.orders.filter((o) => o.id !== prior.id);
    }

    const feeRate = db.settings.feeRates[partner.tier];
    const fee = calcFee(quote.amount, feeRate);
    const order: Order = {
      id: uid("ord"),
      code: makeCode("ORD", db.orders.length + 1),
      requestId,
      quoteId,
      customerId,
      partnerId: partner.id,
      amount: fee.amount,
      feeRate: fee.feeRate,
      feeAmount: fee.feeAmount,
      payoutAmount: fee.payoutAmount,
      status: "pending_payment",
      paymentMethod: "",
      paidAt: null,
      startedAt: null,
      completedAt: null,
      settledAt: null,
      scheduledDate: quote.availableDate || req.preferredDate,
      createdAt: new Date().toISOString(),
    };
    db.orders.push(order);
    quote.status = "accepted";
    for (const q of db.quotes) {
      if (q.requestId === requestId && q.id !== quoteId && q.status === "submitted") q.status = "rejected";
    }
    req.status = "selected";
    return order;
  });
}

/** 선결제 → 에스크로 보관 */
export function payOrder(orderId: string, customerId: string, method: string): Order {
  return mutate((db) => {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.customerId !== customerId) throw new Error("FORBIDDEN");
    if (order.status !== "pending_payment") throw new Error("ALREADY_PAID");
    order.status = "escrow";
    order.paymentMethod = method;
    order.paidAt = new Date().toISOString();
    const req = db.requests.find((r) => r.id === order.requestId);
    if (req) req.status = "paid";
    return order;
  });
}

export function startWork(orderId: string, partnerId: string): Order {
  return mutate((db) => {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.partnerId !== partnerId) throw new Error("FORBIDDEN");
    if (order.status !== "escrow") throw new Error("INVALID_STATE");
    order.status = "in_progress";
    order.startedAt = new Date().toISOString();
    const req = db.requests.find((r) => r.id === order.requestId);
    if (req) req.status = "in_progress";
    return order;
  });
}

/** 업체 작업 완료 보고 → 고객 확인 대기 */
export function reportDone(orderId: string, partnerId: string): Order {
  return mutate((db) => {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.partnerId !== partnerId) throw new Error("FORBIDDEN");
    if (order.status !== "in_progress") throw new Error("INVALID_STATE");
    order.status = "completed";
    order.completedAt = new Date().toISOString();
    const req = db.requests.find((r) => r.id === order.requestId);
    if (req) req.status = "completed";
    return order;
  });
}

/** 고객 작업 확인(구매확정) → 수수료 차감 후 업체 정산 */
export function confirmAndSettle(orderId: string, actorId: string, isAdmin = false): Order {
  return mutate((db) => {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (!isAdmin && order.customerId !== actorId) throw new Error("FORBIDDEN");
    if (order.status !== "completed") throw new Error("INVALID_STATE");
    order.status = "settled";
    order.settledAt = new Date().toISOString();
    const req = db.requests.find((r) => r.id === order.requestId);
    if (req) req.status = "settled";
    const partner = db.partners.find((p) => p.id === order.partnerId);
    if (partner) {
      partner.completedJobs += 1;
      partner.tier = evaluateTier(partner.completedJobs, partner.rating);
    }
    return order;
  });
}

export function cancelRequest(requestId: string, customerId: string): void {
  mutate((db) => {
    const req = db.requests.find((r) => r.id === requestId);
    if (!req) throw new Error("REQUEST_NOT_FOUND");
    if (req.customerId !== customerId) throw new Error("FORBIDDEN");
    if (["paid", "in_progress", "completed", "settled"].includes(req.status)) throw new Error("INVALID_STATE");
    req.status = "canceled";
    for (const q of db.quotes) if (q.requestId === requestId && q.status === "submitted") q.status = "rejected";
    db.orders = db.orders.filter((o) => !(o.requestId === requestId && o.status === "pending_payment"));
  });
}

export function listOrdersByCustomer(customerId: string): Order[] {
  return readDB().orders.filter((o) => o.customerId === customerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listOrdersByPartner(partnerId: string): Order[] {
  return readDB().orders.filter((o) => o.partnerId === partnerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getOrder(id: string): Order | null {
  return readDB().orders.find((o) => o.id === id) ?? null;
}

export function getOrderByRequest(requestId: string): Order | null {
  const orders = readDB().orders.filter((o) => o.requestId === requestId);
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}

/* ------------------------------------------------------------------ 리뷰 */

export function createReview(input: {
  orderId: string;
  customerId: string;
  rating: number;
  scores: { kindness: number; detail: number; punctuality: number };
  content: string;
}): Review {
  return mutate((db) => {
    const order = db.orders.find((o) => o.id === input.orderId);
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.customerId !== input.customerId) throw new Error("FORBIDDEN");
    if (db.reviews.some((r) => r.orderId === input.orderId)) throw new Error("ALREADY_REVIEWED");
    const review: Review = {
      id: uid("rev"),
      orderId: input.orderId,
      customerId: input.customerId,
      partnerId: order.partnerId,
      rating: input.rating,
      scores: input.scores,
      content: input.content,
      reply: null,
      createdAt: new Date().toISOString(),
    };
    db.reviews.push(review);
    const partner = db.partners.find((p) => p.id === order.partnerId);
    if (partner) {
      const mine = db.reviews.filter((r) => r.partnerId === partner.id);
      partner.reviewCount = mine.length;
      partner.rating = Math.round((mine.reduce((s, r) => s + r.rating, 0) / mine.length) * 10) / 10;
      partner.tier = evaluateTier(partner.completedJobs, partner.rating);
    }
    return review;
  });
}

export function replyToReview(reviewId: string, partnerId: string, reply: string): void {
  mutate((db) => {
    const review = db.reviews.find((r) => r.id === reviewId);
    if (!review) throw new Error("REVIEW_NOT_FOUND");
    if (review.partnerId !== partnerId) throw new Error("FORBIDDEN");
    review.reply = reply;
  });
}

export function listReviewsByPartner(partnerId: string): Review[] {
  return readDB().reviews.filter((r) => r.partnerId === partnerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listRecentReviews(limit = 6): Review[] {
  return readDB().reviews.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

/* ------------------------------------------------------------------ 조회 */

export function getPartner(id: string): Partner | null {
  return readDB().partners.find((p) => p.id === id) ?? null;
}

export function listPartners(filter?: { service?: ServiceSlug; region?: string }): Partner[] {
  let list = readDB().partners.filter((p) => p.status === "approved");
  if (filter?.service) list = list.filter((p) => p.services.includes(filter.service!));
  if (filter?.region) list = list.filter((p) => p.regions.some((r) => r.startsWith(filter.region!)));
  return list.sort((a, b) => b.rating - a.rating || b.completedJobs - a.completedJobs);
}

export function getUser(id: string): User | null {
  return readDB().users.find((u) => u.id === id) ?? null;
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

export function platformStats(): PlatformStats {
  const db = readDB();
  const settled = db.orders.filter((o) => o.status === "settled");
  const paid = db.orders.filter((o) => o.paidAt);
  const ratings = db.partners.filter((p) => p.reviewCount > 0);
  const openish = db.requests.length;
  return {
    partnerCount: db.partners.filter((p) => p.status === "approved").length,
    requestCount: db.requests.length,
    completedCount: settled.length,
    avgRating: ratings.length ? Math.round((ratings.reduce((s, p) => s + p.rating, 0) / ratings.length) * 10) / 10 : 0,
    avgQuotesPerRequest: openish ? Math.round((db.quotes.length / openish) * 10) / 10 : 0,
    gmv: paid.reduce((s, o) => s + o.amount, 0),
    revenue: paid.reduce((s, o) => s + o.feeAmount, 0),
  };
}
