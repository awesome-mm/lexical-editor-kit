import { test, expect } from "@playwright/test";

/**
 * 에디터 기본 로드 테스트
 *
 * 담당: Agent B (빌드 후 번들 검증), Agent C (런타임 검증)
 * 목적: 에디터가 에러 없이 정상 로드되는지 확인
 */

test.describe("에디터 기본 로드", () => {
  const consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    page.on("pageerror", (err) => {
      consoleErrors.push(`[pageerror] ${err.message}`);
    });

    await page.goto("/");
  });

  test("페이지가 로드된다", async ({ page }) => {
    await expect(page).toHaveTitle(/.+/);
  });

  test("에디터 컨테이너가 렌더된다", async ({ page }) => {
    await expect(page.locator(".editor-container")).toBeVisible({ timeout: 10_000 });
  });

  test("contenteditable 영역이 존재한다", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    await expect(editor).toBeVisible({ timeout: 10_000 });
  });

  test("툴바가 렌더된다", async ({ page }) => {
    await expect(page.locator(".toolbar")).toBeVisible({ timeout: 10_000 });
  });

  test("콘솔 에러가 없다", async ({ page }) => {
    // 에디터가 완전히 로드될 때까지 대기
    await page.locator(".editor-container").waitFor({ timeout: 10_000 });
    await page.waitForTimeout(500); // 비동기 import 완료 대기

    const moduleErrors = consoleErrors.filter(
      (e) =>
        e.includes("Cannot find module") ||
        e.includes("Failed to fetch") ||
        e.includes("SyntaxError") ||
        e.includes("ReferenceError"),
    );

    expect(moduleErrors, `콘솔 에러 발생:\n${moduleErrors.join("\n")}`).toHaveLength(0);
  });

  test("optional 패키지 관련 모듈 로드 에러가 없다", async ({ page }) => {
    await page.locator(".editor-container").waitFor({ timeout: 10_000 });

    const optionalErrors = consoleErrors.filter(
      (e) =>
        e.includes("@lexical/code") ||
        e.includes("@lexical/list") ||
        e.includes("@lexical/table"),
    );

    expect(
      optionalErrors,
      `optional 패키지 모듈 에러 발생:\n${optionalErrors.join("\n")}`,
    ).toHaveLength(0);
  });
});
