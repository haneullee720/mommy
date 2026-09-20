import { execFileSync } from "node:child_process";

/**
 * 매 실행 전에 DB를 시드 상태로 되돌린다.
 * 거래 상태를 바꾸는 테스트가 있어, 되돌리지 않으면 두 번째 실행부터 결과가 달라진다.
 */
export default function globalSetup() {
  if (!process.env.DATABASE_URL && !process.env.E2E_SKIP_SEED) {
    // .env.local 을 읽어 seed 스크립트가 알아서 쓰도록 둔다.
  }
  execFileSync("npm", ["run", "seed"], { stdio: "inherit" });
}
