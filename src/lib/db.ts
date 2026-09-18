import "server-only";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DEFAULT_FEE_RATES } from "./fees";
import type { DB } from "./types";

/**
 * 파일 기반 JSON 저장소.
 * 도메인 로직이 이 모듈의 인터페이스에만 의존하므로,
 * 운영 단계에서 Postgres/Prisma 어댑터로 교체해도 상위 코드는 그대로 둘 수 있다.
 */

/**
 * 쓰기 가능한 데이터 경로를 고른다.
 * 서버리스(Vercel 등)는 프로젝트 디렉터리가 읽기 전용이므로 임시 디렉터리를 쓴다.
 * 임시 디렉터리의 데이터는 인스턴스가 재활용되면 사라지므로 데모 용도로만 유효하다.
 */
function resolveDataDir(): string {
  if (process.env.CM_DATA_DIR) return process.env.CM_DATA_DIR;
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "cheongsomoa");
  }
  return path.join(process.cwd(), "data");
}

const DATA_DIR = resolveDataDir();
const DB_FILE = path.join(DATA_DIR, "db.json");

/** 배포 번들에 함께 실리는 읽기 전용 초기 스냅샷 (빌드 시 scripts/seed.mjs 가 생성) */
const SEED_FILE = path.join(process.cwd(), "data", "db.json");

const EMPTY: DB = {
  users: [],
  partners: [],
  requests: [],
  quotes: [],
  orders: [],
  reviews: [],
  sessions: [],
  settings: {
    feeRates: { ...DEFAULT_FEE_RATES },
    escrowHoldDays: 3,
    autoConfirmDays: 7,
  },
};

let cache: DB | null = null;
let cacheMtime = 0;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readDB(): DB {
  ensureDir();
  if (!fs.existsSync(DB_FILE)) {
    // 초기 스냅샷이 있으면 그것으로 시작하고, 없으면 빈 상태로 만든다.
    const initial =
      SEED_FILE !== DB_FILE && fs.existsSync(SEED_FILE)
        ? fs.readFileSync(SEED_FILE, "utf8")
        : JSON.stringify(EMPTY, null, 2);
    fs.writeFileSync(DB_FILE, initial, "utf8");
  }
  const mtime = fs.statSync(DB_FILE).mtimeMs;
  if (cache && mtime === cacheMtime) return cache;
  const raw = fs.readFileSync(DB_FILE, "utf8");
  const parsed = JSON.parse(raw) as Partial<DB>;
  cache = { ...structuredClone(EMPTY), ...parsed } as DB;
  cacheMtime = mtime;
  return cache;
}

export function writeDB(db: DB): void {
  ensureDir();
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(tmp, DB_FILE);
  cache = db;
  cacheMtime = fs.statSync(DB_FILE).mtimeMs;
}

/** 읽기 → 수정 → 저장을 한 번에. */
export function mutate<T>(fn: (db: DB) => T): T {
  const db = structuredClone(readDB());
  const result = fn(db);
  writeDB(db);
  return result;
}

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
