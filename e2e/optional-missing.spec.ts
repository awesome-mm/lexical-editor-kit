import { test, expect } from "@playwright/test";

/**
 * Optional 패키지 미설치 시나리오 테스트
 *
 * 담당: Agent C (런타임 검증 — optional 미설치 케이스)
 * 목적: optional 패키지가 없어도 에디터가 정상 로드되고,
 *       해당 기능 UI만 숨겨지는지 확인
 *
 * 실행 조건: PLAYWRIGHT_BASE_URL 환경변수로 optional 미설치 빌드 URL 지정
 *   예) PLAYWRIGHT_BASE_URL=http://localhost:4174 pnpm test:e2e:no-optional
 *
 * 주의: 이 테스트는 optional peer가 제거된 별도 빌드 환경에서 실행한다.
 *       일반 빌드에서 실행하면 "optional 패키지가 없다" 검증이 실패할 수 있다.
 */

test.describe("optional 패키지 미설치 시 에디터 기본 동작", () => {
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
    await page.locator(".editor-container").waitFor({ timeout: 10_000 });
    await page.waitForTimeout(800);
  });

  test("에디터가 에러 없이 로드된다", async ({ page }) => {
    await expect(page.locator(".editor-container")).toBeVisible();

    const fatalErrors = consoleErrors.filter(
      (e) =>
        e.includes("Cannot find module") ||
        e.includes("Failed to resolve import") ||
        e.includes("SyntaxError") ||
        e.includes("ReferenceError"),
    );

    expect(fatalErrors, `모듈 로드 에러 발생:\n${fatalErrors.join("\n")}`).toHaveLength(0);
  });

  test("contenteditable 영역이 존재하고 입력 가능하다", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    await expect(editor).toBeVisible();

    await editor.click();
    await page.keyboard.type("테스트 입력");
    await expect(editor).toContainText("테스트 입력");
  });

  test("슬래시 메뉴에 기본 항목(Heading, Paragraph)은 노출된다", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type("/");

    await page
      .locator('[role="listbox"], .typeahead-popover')
      .first()
      .waitFor({ timeout: 3_000 });

    // 기본 항목 (optional 패키지와 무관)
    await expect(
      page
        .locator('[role="option"]')
        .filter({ hasText: /heading|paragraph/i })
        .first(),
    ).toBeVisible();
  });
});

test.describe("optional 패키지 미설치 시 기능 UI 비노출", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator(".editor-container").waitFor({ timeout: 10_000 });
    await page.waitForTimeout(800);
  });

  test("@lexical/code 미설치 시 Code Block 항목이 없다", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type("/code");

    // 메뉴가 열리더라도 code 항목이 없어야 함
    const codeOption = page.locator('[role="option"]').filter({ hasText: /^code block$/i });
    await expect(codeOption).toHaveCount(0);
  });

  test("@lexical/list 미설치 시 Bullet List 항목이 없다", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type("/bullet");

    const bulletOption = page.locator('[role="option"]').filter({ hasText: /^bullet list$/i });
    await expect(bulletOption).toHaveCount(0);
  });

  test("@lexical/table 미설치 시 Table 항목이 없다", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type("/table");

    const tableOption = page.locator('[role="option"]').filter({ hasText: /^table$/i });
    await expect(tableOption).toHaveCount(0);
  });
});
