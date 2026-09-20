import "server-only";
import { db, toRequest } from "./db";
import type { CleaningRequest } from "./types";

export {
  listPartners,
  listRecentReviews,
  platformStats,
  getUser,
  getUsersByIds,
} from "./service";

export interface FeedItem extends CleaningRequest {
  quoteCount: number;
}

/** 랜딩에 노출하는 실시간 요청 피드 (개인정보 컬럼은 읽지 않는다) */
export async function readOpenFeed(limit = 6): Promise<FeedItem[]> {
  const rows = await db()`
    select r.*, (
      select count(*)::int from quotes q
      where q.request_id = r.id and q.status <> 'withdrawn'
    ) as quote_count
    from cleaning_requests r
    where r.status = 'open'
    order by r.created_at desc
    limit ${limit}`;
  return rows.map((r) => ({ ...toRequest(r), quoteCount: r.quoteCount as number }));
}
