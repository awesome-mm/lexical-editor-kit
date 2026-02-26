import { test, expect } from "@playwright/test";

/**
 * optional 기능 삽입 동작 테스트
 *
 * 담당: Agent C (런타임 기능 검증)
 * 목적: optional 패키지 설치 시 실제 삽입이 동작하는지 확인
 *
 * 전제: apps/website에 @lexical/code, @lexical/list, @lexical/table 설치됨
 */

test.describe("Code Block 삽입 (@lexical/code 설치됨)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator('[contenteditable="true"]').first().waitFor({ timeout: 10_000 });
    await page.waitForTimeout(800);
  });

  test("슬래시 메뉴로 Code Block을 삽입한다", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type("/code");

    const codeOption = page.locator('[role="option"]').filter({ hasText: /code/i }).first();
    await codeOption.waitFor({ timeout: 3_000 });
    await codeOption.click();

    // code 블록 노드 확인 — Lexical은 code 블록을 <code> 태그로 렌더
    await expect(page.locator(".editor-container code").first()).toBeVisible({
      timeout: 3_000,
    });
  });

  test("code 블록 안에서 텍스트를 입력할 수 있다", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type("/code");

    const codeOption = page.locator('[role="option"]').filter({ hasText: /code/i }).first();
    await codeOption.waitFor({ timeout: 3_000 });
    await codeOption.click();

    await page.keyboard.type("const hello = 'world';");

    await expect(page.locator(".editor-container code").first()).toContainText("const hello");
  });
});

test.describe("List 삽입 (@lexical/list 설치됨)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator('[contenteditable="true"]').first().waitFor({ timeout: 10_000 });
    await page.waitForTimeout(800);
  });

  test("슬래시 메뉴로 Bullet List를 삽입한다", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type("/bullet");

    const option = page
      .locator('[role="option"]')
      .filter({ hasText: /bullet/i })
      .first();
    await option.waitFor({ timeout: 3_000 });
    await option.click();

    // Lexical 리스트는 <ul> 태그로 렌더
    await expect(page.locator(".editor-container ul").first()).toBeVisible({ timeout: 3_000 });
  });

  test("슬래시 메뉴로 Numbered List를 삽입한다", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type("/numbered");

    const option = page
      .locator('[role="option"]')
      .filter({ hasText: /numbered/i })
      .first();
    await option.waitFor({ timeout: 3_000 });
    await option.click();

    // Lexical 순서 있는 리스트는 <ol> 태그로 렌더
    await expect(page.locator(".editor-container ol").first()).toBeVisible({ timeout: 3_000 });
  });

  test("리스트 항목에 텍스트를 입력할 수 있다", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type("/bullet");

    const option = page
      .locator('[role="option"]')
      .filter({ hasText: /bullet/i })
      .first();
    await option.waitFor({ timeout: 3_000 });
    await option.click();

    await page.keyboard.type("첫 번째 항목");
    await expect(page.locator(".editor-container ul li").first()).toContainText("첫 번째 항목");
  });
});

test.describe("Table 삽입 (@lexical/table 설치됨)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator('[contenteditable="true"]').first().waitFor({ timeout: 10_000 });
    await page.waitForTimeout(800);
  });

  test("슬래시 메뉴에서 Table을 선택하면 다이얼로그가 열린다", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type("/table");

    const option = page.locator('[role="option"]').filter({ hasText: /table/i }).first();
    await option.waitFor({ timeout: 3_000 });
    await option.click();

    // LazyInsertTableDialog 또는 모달이 열려야 함
    await expect(page.locator('[role="dialog"], .modal, .editor-modal').first()).toBeVisible({
      timeout: 3_000,
    });
  });

  test("Table 삽입 후 table 요소가 렌더된다", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type("/table");

    const option = page.locator('[role="option"]').filter({ hasText: /table/i }).first();
    await option.waitFor({ timeout: 3_000 });
    await option.click();

    // 다이얼로그에서 확인 버튼 클릭 (기본값으로 삽입)
    const confirmBtn = page
      .locator("button")
      .filter({ hasText: /confirm|확인|insert|삽입/i })
      .first();
    if (await confirmBtn.isVisible({ timeout: 2_000 })) {
      await confirmBtn.click();
    }

    await expect(page.locator(".editor-container table").first()).toBeVisible({
      timeout: 3_000,
    });
  });
});
