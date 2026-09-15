import "server-only";
import { readDB } from "./db";
import type { CleaningRequest } from "./types";

export { listPartners, listRecentReviews, platformStats, getUser } from "./service";

export interface FeedItem extends CleaningRequest {
  quoteCount: number;
}

/** 랜딩에 노출하는 실시간 요청 피드 (개인정보는 제외한 필드만 사용) */
export function readOpenFeed(limit = 6): FeedItem[] {
  const db = readDB();
  return db.requests
    .filter((r) => r.status === "open")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((r) => ({ ...r, quoteCount: db.quotes.filter((q) => q.requestId === r.id && q.status !== "withdrawn").length }));
}
