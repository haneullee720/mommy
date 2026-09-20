import "server-only";
import postgres from "postgres";
import type {
  CleaningRequest,
  Order,
  Partner,
  Quote,
  Review,
  Settings,
  User,
} from "./types";

/**
 * Postgres 저장소.
 *
 * 도메인 로직(src/lib/service.ts)이 이 모듈의 인터페이스에만 의존하므로,
 * 다른 DB로 옮기더라도 상위 코드는 그대로 둘 수 있다.
 *
 * 컬럼명은 snake_case, 앱은 camelCase — postgres 드라이버의 camel 변환이 양방향으로 처리한다.
 * 매퍼가 하는 일은 timestamptz(Date) → ISO 문자열 변환뿐이다.
 * 앱 전체가 시각을 ISO 문자열로 다루기 때문에(localeCompare 정렬 포함) 여기서 형식을 고정한다.
 */

export type Sql = postgres.Sql<Record<string, unknown>>;
export type Db = Sql | postgres.TransactionSql<Record<string, unknown>>;

declare global {
  // eslint-disable-next-line no-var
  var __cheongsomoaSql: Sql | undefined;
}

export function db(): Sql {
  if (globalThis.__cheongsomoaSql) return globalThis.__cheongsomoaSql;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL 환경변수가 없습니다. 로컬은 .env.local, 배포는 프로젝트 환경변수를 확인하세요.",
    );
  }

  globalThis.__cheongsomoaSql = postgres(url, {
    // 서버리스는 인스턴스마다 커넥션을 잡으므로 1개로 제한한다.
    max: process.env.VERCEL ? 1 : 10,
    idle_timeout: 20,
    connect_timeout: 10,
    // 트랜잭션 풀러(pgbouncer) 뒤에서는 prepared statement 를 쓸 수 없다.
    prepare: false,
    transform: postgres.camel,
  });

  return globalThis.__cheongsomoaSql;
}

/** 여러 행을 원자적으로 바꿔야 하는 작업을 트랜잭션으로 감싼다. */
export function tx<T>(fn: (t: Db) => Promise<T>): Promise<T> {
  return db().begin((t) => fn(t)) as Promise<T>;
}

/* ------------------------------------------------------------------ 식별자 */

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** CM-YYMMDD-XXXX 형태의 고객 노출용 코드 */
export function makeCode(prefix: string, seq: number): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${prefix}-${yy}${mm}${dd}-${String(seq).padStart(4, "0")}`;
}

/** 시퀀스에서 번호를 받아 코드를 만든다. 동시 접수에도 번호가 겹치지 않는다. */
export async function nextCode(kind: "request" | "order", t: Db = db()): Promise<string> {
  const rows =
    kind === "request"
      ? await t`select nextval('request_code_seq')::int as n`
      : await t`select nextval('order_code_seq')::int as n`;
  return makeCode(kind === "request" ? "CM" : "ORD", rows[0].n as number);
}

/* ------------------------------------------------------------------ 매퍼 */

type Row = Record<string, unknown>;

const iso = (v: unknown): string => (v instanceof Date ? v.toISOString() : String(v ?? ""));
const isoOrNull = (v: unknown): string | null => (v == null ? null : iso(v));

export const toUser = (r: Row): User => ({
  id: r.id as string,
  role: r.role as User["role"],
  name: r.name as string,
  email: r.email as string,
  phone: r.phone as string,
  passwordHash: r.passwordHash as string,
  createdAt: iso(r.createdAt),
});

export const toPartner = (r: Row): Partner => ({
  id: r.id as string,
  userId: r.userId as string,
  companyName: r.companyName as string,
  bizNo: r.bizNo as string,
  ceoName: r.ceoName as string,
  regions: (r.regions as string[]) ?? [],
  services: (r.services as Partner["services"]) ?? [],
  intro: r.intro as string,
  since: r.since as number,
  crewSize: r.crewSize as number,
  hasInsurance: r.hasInsurance as boolean,
  certifications: (r.certifications as string[]) ?? [],
  status: r.status as Partner["status"],
  tier: r.tier as Partner["tier"],
  rating: r.rating as number,
  reviewCount: r.reviewCount as number,
  completedJobs: r.completedJobs as number,
  responseMinutes: r.responseMinutes as number,
  bankAccount: r.bankAccount as Partner["bankAccount"],
  createdAt: iso(r.createdAt),
});

export const toRequest = (r: Row): CleaningRequest => ({
  id: r.id as string,
  code: r.code as string,
  customerId: r.customerId as string,
  service: r.service as CleaningRequest["service"],
  propertyType: r.propertyType as CleaningRequest["propertyType"],
  areaPyeong: r.areaPyeong as number,
  region: r.region as string,
  district: r.district as string,
  addressDetail: r.addressDetail as string,
  preferredDate: r.preferredDate as string,
  dateFlexible: r.dateFlexible as boolean,
  options: (r.options as string[]) ?? [],
  description: r.description as string,
  photoCount: r.photoCount as number,
  contactName: r.contactName as string,
  contactPhone: r.contactPhone as string,
  estimateMin: r.estimateMin as number,
  estimateMax: r.estimateMax as number,
  status: r.status as CleaningRequest["status"],
  createdAt: iso(r.createdAt),
  expiresAt: iso(r.expiresAt),
});

export const toQuote = (r: Row): Quote => ({
  id: r.id as string,
  requestId: r.requestId as string,
  partnerId: r.partnerId as string,
  amount: r.amount as number,
  crewSize: r.crewSize as number,
  workHours: r.workHours as number,
  availableDate: r.availableDate as string,
  includes: (r.includes as string[]) ?? [],
  message: r.message as string,
  warrantyDays: r.warrantyDays as number,
  status: r.status as Quote["status"],
  createdAt: iso(r.createdAt),
});

export const toOrder = (r: Row): Order => ({
  id: r.id as string,
  code: r.code as string,
  requestId: r.requestId as string,
  quoteId: r.quoteId as string,
  customerId: r.customerId as string,
  partnerId: r.partnerId as string,
  amount: r.amount as number,
  feeRate: r.feeRate as number,
  feeAmount: r.feeAmount as number,
  payoutAmount: r.payoutAmount as number,
  status: r.status as Order["status"],
  paymentMethod: r.paymentMethod as string,
  paidAt: isoOrNull(r.paidAt),
  startedAt: isoOrNull(r.startedAt),
  completedAt: isoOrNull(r.completedAt),
  settledAt: isoOrNull(r.settledAt),
  scheduledDate: r.scheduledDate as string,
  createdAt: iso(r.createdAt),
});

export const toReview = (r: Row): Review => ({
  id: r.id as string,
  orderId: r.orderId as string,
  customerId: r.customerId as string,
  partnerId: r.partnerId as string,
  rating: r.rating as number,
  scores: r.scores as Review["scores"],
  content: r.content as string,
  reply: (r.reply as string | null) ?? null,
  createdAt: iso(r.createdAt),
});

export const toSettings = (r: Row): Settings => ({
  feeRates: r.feeRates as Settings["feeRates"],
  escrowHoldDays: r.escrowHoldDays as number,
  autoConfirmDays: r.autoConfirmDays as number,
});

/** 수수료 정책. 모든 주문 생성 경로가 이 값을 읽는다. */
export async function getSettings(t: Db = db()): Promise<Settings> {
  const rows = await t`select * from settings where id = 1`;
  return toSettings(rows[0]);
}
