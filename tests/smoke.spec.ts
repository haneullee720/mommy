import { expect, test } from "@playwright/test";

const PUBLIC_PAGES = [
  ["/", "청소 견적"],
  ["/services", "청소 서비스와 실제 시공 단가"],
  ["/services/move-in", "입주청소"],
  ["/partners", "검증된 청소 업체"],
  ["/how-it-works", "요청부터 정산까지"],
  ["/pricing", "숨은 비용이 없습니다"],
  ["/safety", "안심하고 맡기세요"],
  ["/faq", "자주 묻는 질문"],
  ["/request/new", "견적 요청서 작성"],
] as const;

test.describe("공개 페이지", () => {
  for (const [path, text] of PUBLIC_PAGES) {
    test(`${path} 이 열린다`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.getByText(text).first()).toBeVisible();
    });
  }

  test("랜딩 통계가 DB 값으로 채워진다", async ({ page }) => {
    await page.goto("/");
    // 시드에 업체 8곳이 승인 상태로 들어 있다. 0 이면 DB 연결이 끊긴 것.
    await expect(page.getByText(/지금 \d+개 업체가 견적 대기중/)).toBeVisible();
    const badge = await page.getByText(/지금 \d+개 업체가 견적 대기중/).innerText();
    expect(Number(badge.match(/\d+/)![0])).toBeGreaterThan(0);
  });

  test("없는 경로는 404", async ({ page }) => {
    const res = await page.goto("/이런페이지는없다");
    expect(res?.status()).toBe(404);
  });
});
