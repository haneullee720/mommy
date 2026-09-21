import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * 사진 슬롯.
 *
 * public/images/<key>.(jpg|jpeg|png|webp|avif) 가 있으면 그 사진을 쓰고,
 * 없으면 같은 자리에 SVG 일러스트를 그린다.
 * 사진을 나중에 넣어도 코드를 고칠 필요가 없다.
 *
 * 디렉터리 스캔은 프로세스당 한 번만 한다 (요청마다 파일시스템을 훑지 않는다).
 * 개발 중 사진을 추가했다면 dev 서버를 다시 띄워야 반영된다.
 */

const DIR = path.join(process.cwd(), "public", "images");
const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

let cache: Map<string, string> | null = null;

function manifest(): Map<string, string> {
  if (cache) return cache;
  const found = new Map<string, string>();
  try {
    for (const file of fs.readdirSync(DIR).sort()) {
      const ext = path.extname(file).toLowerCase();
      if (!EXTENSIONS.includes(ext)) continue;
      const key = path.basename(file, ext);
      if (!found.has(key)) found.set(key, `/images/${file}`);
    }
  } catch {
    // public/images 가 아직 없으면 사진이 하나도 없는 상태로 둔다.
  }
  cache = found;
  return cache;
}

/** 사진이 있으면 경로, 없으면 null */
export function photoSrc(name: string): string | null {
  return manifest().get(name) ?? null;
}

/** 현재 등록된 사진 수 (README·점검용) */
export function photoCount(): number {
  return manifest().size;
}
