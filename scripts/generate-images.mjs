#!/usr/bin/env node
/**
 * 청소모아 이미지 생성
 *
 *   OPENAI_API_KEY=sk-... npm run images              # 없는 것만 전부
 *   OPENAI_API_KEY=sk-... npm run images -- --force   # 있어도 다시 생성
 *   OPENAI_API_KEY=sk-... npm run images -- hero after before
 *   npm run images -- --dry-run                       # 호출 없이 계획만 출력
 *
 * 저장 위치는 public/images/<키>.webp 이고, 파일명이 곧 슬롯 키다.
 * src/lib/media.ts 가 이 폴더를 읽어 사진이 있으면 사진을, 없으면 일러스트를 그린다.
 *
 * 생성한 키는 public/images/generated.json 에 기록되고,
 * 화면에는 "예시 이미지" 배지가 붙는다. 실제 시공 사진으로 교체한 뒤
 * 그 키를 지우면 배지가 사라진다.
 */
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "public", "images");
const MANIFEST = path.join(OUT_DIR, "generated.json");
const ENDPOINT = "https://api.openai.com/v1/images/generations";

// 모델명은 바뀔 수 있다. 실패하면 이 환경변수로 교체한다.
const MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

/** 12장이 한 세트로 보이도록 모든 프롬프트에 공통으로 붙인다. */
const STYLE = [
  "Photorealistic interior photograph.",
  "Bright natural daylight, no people, minimal and tidy composition.",
  "Warm off-white palette with one or two muted deep-green accents.",
  "Eye-level 35mm lens, soft realistic shadows.",
  "No text, no logos, no watermark, no wide-angle distortion, no over-processed HDR.",
].join(" ");

const SPECS = [
  {
    key: "hero",
    size: "1536x1024",
    note: "청소 직후 밝은 거실",
    prompt:
      "A freshly cleaned Korean apartment living room. Sunlight streams through a large window onto a spotless floor. A simple low sofa and one potted plant, everything neatly arranged.",
  },
  {
    key: "move-in",
    size: "1024x1024",
    note: "입주청소 — 가구 없는 빈집",
    prompt:
      "An empty Korean apartment room with no furniture at all, immaculate flooring, spotless window frames and sills, just after a move-in cleaning.",
  },
  {
    key: "move-out",
    size: "1024x1024",
    note: "이사청소 — 이삿짐 박스가 놓인 빈 방",
    prompt:
      "An empty Korean apartment room with a few stacked cardboard moving boxes against one wall. The floor is swept clean, the room is otherwise bare.",
  },
  {
    key: "stairs",
    size: "1024x1024",
    note: "계단청소 — 공동주택 계단·복도",
    prompt:
      "A clean stairwell and corridor of a Korean low-rise residential building. Spotless steps and handrail, dry floor, daylight from a corridor window.",
  },
  {
    key: "office",
    size: "1024x1024",
    note: "사무실청소 — 정돈된 책상 열",
    prompt:
      "A tidy small office interior with a row of empty desks and monitors, clean floor, window blinds letting in daylight.",
  },
  {
    key: "commercial",
    size: "1024x1024",
    note: "상가·매장청소 — 영업 전 카페 홀",
    prompt:
      "The interior of a small cafe before opening hours. Chairs neatly placed at wooden tables, the counter wiped down, the floor clean and slightly reflective.",
  },
  {
    key: "construction",
    size: "1024x1024",
    note: "준공청소 — 인테리어 직후 현장",
    prompt:
      "A newly finished Korean apartment interior right after renovation. A protective floor sheet partially rolled up, a step ladder and neatly stacked materials to one side, fine dust already cleared.",
  },
  {
    key: "home-regular",
    size: "1024x1024",
    note: "가정 정기청소 — 생활감 있는 깔끔한 거실",
    prompt:
      "A lived-in but very tidy Korean apartment living room. A folded blanket on the sofa, a small plant on a side table, clean floor, warm afternoon light.",
  },
  {
    key: "special",
    size: "1024x1024",
    note: "특수청소 — 전문 장비",
    prompt:
      "Professional cleaning equipment — a compact sprayer unit and two canisters — placed on the floor of an empty neutral interior room.",
  },
  {
    key: "after",
    size: "1536x1024",
    note: "청소 후 (먼저 생성할 것)",
    prompt:
      "A Korean apartment room, spotless and bright after a deep cleaning. Clean floor, clean walls, sunlight from a window on the right. Viewed from the room corner at eye level.",
  },
  {
    key: "before",
    size: "1536x1024",
    note: "청소 전 (after 와 같은 구도여야 함)",
    prompt:
      "The SAME Korean apartment room as a matching 'after' photo, but before cleaning: dusty floor, smudges and marks on the walls, dull flat lighting, some scattered debris in the corner. " +
      "Identical camera position, identical composition and framing, viewed from the room corner at eye level with a window on the right.",
  },
];

/* ------------------------------------------------------------------ 실행 */

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const only = args.filter((a) => !a.startsWith("--"));

const targets = only.length ? SPECS.filter((s) => only.includes(s.key)) : SPECS;

if (only.length) {
  const unknown = only.filter((k) => !SPECS.some((s) => s.key === k));
  if (unknown.length) {
    console.error(`알 수 없는 키: ${unknown.join(", ")}`);
    console.error(`사용 가능: ${SPECS.map((s) => s.key).join(", ")}`);
    process.exit(1);
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".avif"];
const existingFor = (key) =>
  IMAGE_EXT.map((e) => path.join(OUT_DIR, key + e)).filter((f) => fs.existsSync(f));

if (dryRun) {
  console.log(`모델: ${MODEL}  (OPENAI_IMAGE_MODEL 로 교체 가능)`);
  console.log(`저장 위치: ${OUT_DIR}\n`);
  for (const s of targets) {
    const have = existingFor(s.key);
    console.log(`▸ ${s.key}  ${s.size}  ${s.note}`);
    console.log(`  → ${path.join(OUT_DIR, s.key + ".webp")}${have.length ? "  (이미 있음, --force 필요)" : ""}`);
    console.log(`  ${s.prompt} ${STYLE}\n`);
  }
  console.log(`총 ${targets.length}장. 실제 생성은 --dry-run 없이 실행하세요.`);
  process.exit(0);
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY 환경변수가 없습니다.");
  console.error("  예)  OPENAI_API_KEY=sk-... npm run images");
  process.exit(1);
}

/** sharp 가 있으면 webp 로 줄여 저장한다. 없으면 원본 그대로 둔다. */
let sharp = null;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  console.warn("! sharp 가 없어 원본 PNG 로 저장합니다. (용량이 큽니다)");
  console.warn("  줄이려면:  npm i -D sharp   후 다시 실행\n");
}

async function generate(spec) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      prompt: `${spec.prompt} ${STYLE}`,
      size: spec.size,
      n: 1,
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    // API 가 알려주는 원인을 그대로 보여준다 (모델명·사이즈·권한 등)
    throw new Error(`HTTP ${res.status}\n${text}`);
  }

  const body = JSON.parse(text);
  const item = body?.data?.[0];
  if (!item) throw new Error(`예상과 다른 응답 형식:\n${text.slice(0, 400)}`);

  if (item.b64_json) return Buffer.from(item.b64_json, "base64");
  if (item.url) {
    const img = await fetch(item.url);
    if (!img.ok) throw new Error(`이미지 내려받기 실패: HTTP ${img.status}`);
    return Buffer.from(await img.arrayBuffer());
  }
  throw new Error(`응답에 b64_json 도 url 도 없습니다:\n${text.slice(0, 400)}`);
}

async function save(key, buffer) {
  // 같은 키의 다른 확장자가 남아 있으면 지운다 (media.ts 가 알파벳 순으로 먼저 오는 걸 쓴다)
  for (const f of existingFor(key)) fs.unlinkSync(f);

  if (sharp) {
    const out = path.join(OUT_DIR, `${key}.webp`);
    await sharp(buffer).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
    return out;
  }
  const out = path.join(OUT_DIR, `${key}.png`);
  fs.writeFileSync(out, buffer);
  return out;
}

function readManifest() {
  try {
    const parsed = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

console.log(`모델: ${MODEL}\n`);

const done = new Set(readManifest());
let made = 0;
let skipped = 0;

for (const spec of targets) {
  if (!force && existingFor(spec.key).length) {
    console.log(`· ${spec.key} — 이미 있음 (건너뜀)`);
    skipped += 1;
    continue;
  }
  process.stdout.write(`· ${spec.key} 생성 중... `);
  try {
    const buffer = await generate(spec);
    const out = await save(spec.key, buffer);
    done.add(spec.key);
    made += 1;
    console.log(`완료 → ${path.relative(process.cwd(), out)}`);
  } catch (err) {
    console.log("실패");
    console.error(`\n[${spec.key}] ${err.message}\n`);
    if (String(err.message).includes("model")) {
      console.error("모델명 문제로 보입니다. 다른 모델로 다시 시도해 보세요:");
      console.error("  OPENAI_IMAGE_MODEL=dall-e-3 OPENAI_API_KEY=sk-... npm run images\n");
    }
    process.exit(1);
  }
}

fs.writeFileSync(MANIFEST, `${JSON.stringify([...done].sort(), null, 2)}\n`, "utf8");

console.log(`\n생성 ${made}장, 건너뜀 ${skipped}장.`);
console.log(`"예시 이미지" 표기 대상: ${[...done].length}개 (${path.relative(process.cwd(), MANIFEST)})`);
console.log("개발 서버가 떠 있었다면 재시작해야 반영됩니다.");
