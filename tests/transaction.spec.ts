import { expect, test } from "@playwright/test";
import { ACCOUNTS, DEMO_PASSWORD, login, openOpenRequest } from "./helpers";

/**
 * 견적 선택 → 선결제 → 작업 → 고객 확인 → 정산 → 후기까지,
 * 플랫폼의 핵심 거래 흐름을 세 역할을 오가며 끝까지 확인한다.
 */
test("거래 전 과정: 견적 선택부터 정산·후기까지", async ({ browser }) => {
  const customerCtx = await browser.newContext();
  const partnerCtx = await browser.newContext();
  const customer = await customerCtx.newPage();
  const partner = await partnerCtx.newPage();

  // 1. 고객이 견적을 비교하고 특정 업체를 선택한다.
  await login(customer, ACCOUNTS.customer, "/my");
  await openOpenRequest(customer);

  const card = customer.locator('li:has-text("클린메이트 서울")');
  await expect(card).toBeVisible();
  const quoted = await card.locator(".tnum").filter({ hasText: "원" }).first().innerText();
  const amount = Number(quoted.replace(/[^\d]/g, ""));
  expect(amount).toBeGreaterThan(0);

  await card.getByRole("button", { name: "이 업체로 결정하기" }).click();
  await customer.waitForURL("**/my/pay/**");

  // 2. 안전결제. 동의 전에는 결제 버튼이 눌리지 않아야 한다.
  const payButton = customer.getByRole("button", { name: /안전결제하기/ });
  await expect(payButton).toBeDisabled();
  await customer.getByRole("button", { name: "간편결제" }).click();
  await customer.locator('main input[type="checkbox"]').check();
  await expect(payButton).toBeEnabled();
  await payButton.click();

  await customer.waitForURL("**/my/orders/**");
  const orderUrl = customer.url();
  const orderId = orderUrl.split("/my/orders/")[1].split("?")[0];
  await expect(customer.getByText("결제가 완료되었습니다", { exact: false })).toBeVisible();

  // 3. 업체가 작업 시작 → 완료를 보고한다.
  //    상태가 바뀌면 버튼 자체가 다음 단계 버튼으로 교체되므로, 그 교체를 확인한다.
  await login(partner, ACCOUNTS.partner, "/partner");
  await partner.goto("/partner/orders");
  await partner.getByRole("button", { name: "작업 시작" }).first().click();
  await expect(partner.getByRole("button", { name: "작업 완료 보고" }).first()).toBeVisible();

  partner.once("dialog", (d) => d.accept());
  await partner.getByRole("button", { name: "작업 완료 보고" }).first().click();
  await expect(partner.getByText("고객 확인 대기 중").first()).toBeVisible();

  // 4. 고객이 작업을 확인하면 정산이 진행된다.
  await customer.goto(`/my/orders/${orderId}`);
  customer.once("dialog", (d) => d.accept());
  await customer.getByRole("button", { name: "작업 확인하고 정산 승인" }).click();
  await expect(customer.getByText("정산 완료").first()).toBeVisible();

  // 5. 정산액이 결제액에서 등급 수수료를 뺀 값과 일치하는지 업체 화면에서 검산한다.
  await partner.goto("/partner/settlement");
  const row = partner.locator("tbody tr").first();
  const cells = await row.locator("td").allInnerTexts();
  // 수수료 칸에는 금액 뒤에 "(10%)" 가 함께 있어, 첫 숫자 그룹만 읽는다.
  const firstNumber = (text: string) => Number(text.match(/[\d,]+/)![0].replace(/,/g, ""));
  const paid = firstNumber(cells[2]);
  const fee = firstNumber(cells[3]);
  const payout = firstNumber(cells[4]);

  expect(payout).toBe(paid - fee);
  // 클린메이트 서울은 프리미엄 등급 → 수수료 10%
  expect(Math.round((fee / paid) * 100)).toBe(10);

  // 6. 후기를 남긴다.
  const reviewText = "견적서에 적힌 대로 새시 분리까지 해주셨고 시간도 정확했습니다. 만족합니다!";
  await customer.goto(`/my/orders/${orderId}`);
  await customer.locator('textarea[name="content"]').fill(reviewText);
  await customer.getByRole("button", { name: "후기 등록하기" }).click();
  // 등록되면 폼이 "작성한 후기" 표시로 교체된다.
  await expect(customer.getByText("작성한 후기")).toBeVisible();
  await expect(customer.getByText(reviewText)).toBeVisible();

  await customerCtx.close();
  await partnerCtx.close();
});

/**
 * 파일 저장소에서 Postgres 로 옮긴 이유가 이것이다.
 * 새로 만든 데이터가 다음 요청에서도 남아 있어야 한다.
 */
test("비회원 요청이 접수되고, 다시 불러와도 남아 있다", async ({ browser }) => {
  const guestCtx = await browser.newContext();
  const partnerCtx = await browser.newContext();
  const guest = await guestCtx.newPage();
  const partner = await partnerCtx.newPage();

  // 히어로 하단의 예상 견적 바에서 종류를 고르고 요청서로 넘어간다.
  await guest.goto("/");
  await guest.locator("select").first().selectOption("office");
  await guest.getByRole("link", { name: "견적 요청", exact: true }).click();
  await guest.waitForURL("**/request/new**");

  await guest.getByRole("button", { name: "다음" }).click();
  await guest.fill('input[placeholder*="○○로"]', "테헤란로 152, 8층");
  await guest.getByRole("button", { name: "다음" }).click();
  await guest.fill("textarea", "야간 7시 이후 진행 희망합니다.");
  await guest.getByRole("button", { name: "다음" }).click();

  const email = `guest${Date.now()}@demo.kr`;
  await guest.fill('input[placeholder="홍길동"]', "신규고객");
  await guest.fill('input[placeholder="010-1234-5678"]', "010-1111-2222");
  await guest.fill('input[name="email"]', email);
  await guest.fill('input[name="password"]', DEMO_PASSWORD);
  await guest.getByRole("button", { name: "견적 요청 완료하기" }).click();

  await guest.waitForURL("**/my/requests/**");
  const requestUrl = guest.url().split("?")[0];
  await expect(guest.getByText("요청이 접수되었습니다", { exact: false })).toBeVisible();

  // 새 세션으로 다시 로그인해도 요청이 그대로 있어야 한다.
  const revisitCtx = await browser.newContext();
  const revisit = await revisitCtx.newPage();
  await login(revisit, email, "/my");
  await revisit.goto(requestUrl);
  await expect(revisit.getByText("사무실청소").first()).toBeVisible();

  // 업체가 이 요청에 견적을 보내면 고객 화면에 바로 보인다.
  await login(partner, "office@demo.kr", "/partner");
  await partner.goto(`/partner/requests/${requestUrl.split("/my/requests/")[1]}`);
  await partner.fill('input[name="amount"]', "390000");
  await partner.fill(
    'textarea[name="message"]',
    "데일리오피스 클린입니다. 야간 3인 투입으로 3시간 내 마감하겠습니다.",
  );
  await partner.getByRole("button", { name: "견적 보내기" }).click();
  await partner.waitForURL("**/partner/quotes**");

  await revisit.reload();
  await expect(revisit.getByRole("button", { name: "이 업체로 결정하기" })).toHaveCount(1);

  await guestCtx.close();
  await partnerCtx.close();
  await revisitCtx.close();
});

test("운영자 화면에 거래·정산 현황이 집계된다", async ({ page }) => {
  await login(page, ACCOUNTS.admin, "/admin");
  await expect(page.getByText("거래액 (GMV)")).toBeVisible();
  await expect(page.getByText("에스크로 보관액")).toBeVisible();

  await page.goto("/admin/partners");
  await expect(page.getByText("반짝반짝 청소단")).toBeVisible();
  await expect(page.getByText("심사 대기").first()).toBeVisible();
});
