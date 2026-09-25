import "server-only";
import { db, toRequest } from "./db";
import { SERVICES } from "./catalog";
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

/**
 * 랜딩에 노출하는 실시간 요청 피드 (개인정보 컬럼은 읽지 않는다).
 *
 * service 는 text 컬럼이라 카탈로그에서 뺀 종류의 옛 요청이 남아 있을 수 있다.
 * 그런 행이 섞이면 SERVICE_MAP 조회가 undefined 가 되어 랜딩 전체가 500 이 된다.
 * 취급하지 않는 종류는 애초에 공개 피드에 띄울 이유도 없으므로 질의에서 거른다.
 */
export async function readOpenFeed(limit = 6): Promise<FeedItem[]> {
  const rows = await db()`
    select r.*, (
      select count(*)::int from quotes q
      where q.request_id = r.id and q.status <> 'withdrawn'
    ) as quote_count
    from cleaning_requests r
    where r.status = 'open'
      and r.service in ${db()(SERVICES.map((s) => s.slug))}
    order by r.created_at desc
    limit ${limit}`;
  return rows.map((r) => ({ ...toRequest(r), quoteCount: r.quoteCount as number }));
}
