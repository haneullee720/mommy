import type { Page } from "@playwright/test";

export const DEMO_PASSWORD = "cheongso1234";

export const ACCOUNTS = {
  customer: "customer@demo.kr",
  partner: "partner@demo.kr",
  admin: "admin@demo.kr",
} as const;

/** 데모 계정으로 로그인하고 역할별 홈으로 이동할 때까지 기다린다. */
export async function login(page: Page, email: string, expectedPath: string) {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', DEMO_PASSWORD);
  await page.getByRole("button", { name: "로그인" }).click();
  await page.waitForURL(`**${expectedPath}`);
}

/** 견적을 받고 있는 내 요청 중 첫 번째를 연다. */
export async function openOpenRequest(page: Page) {
  await page.goto("/my");
  await page.locator('a[href*="/my/requests/"]').first().click();
  await page.waitForURL("**/my/requests/**");
}
