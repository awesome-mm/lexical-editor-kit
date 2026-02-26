import { test, expect } from "@playwright/test";

/**
 * 툴바 & ComponentPicker 기능 노출 테스트
 *
 * 담당: Agent C (런타임 기능 검증)
 * 목적: optional 패키지 설치 시 관련 UI가 정상 노출되는지 확인
 *
 * 전제: apps/website에 @lexical/code, @lexical/list, @lexical/table 설치됨
 */

test.describe("툴바 기능 노출 (optional 패키지 설치됨)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator(".editor-container").waitFor({ timeout: 10_000 });
    // loadFeatures() 비동기 완료 대기
    await page.waitForTimeout(800);
  });

  test("툴바에 Undo/Redo 버튼이 있다", async ({ page }) => {
    const toolbar = page.locator(".toolbar");
    await expect(toolbar).toBeVisible();

    // 기본 기능 버튼 (항상 노출)
    await expect(
      toolbar.locator('[title="Undo (Ctrl+Z)"], [aria-label="Undo"]').first(),
    ).toBeVisible();
  });

  test("툴바에 Bold/Italic 서식 버튼이 있다", async ({ page }) => {
    const toolbar = page.locator(".toolbar");
    await expect(
      toolbar.locator('[title*="Bold"], [aria-label*="Bold"]').first(),
    ).toBeVisible();
  });

  test("툴바 블록 타입 드롭다운이 있다", async ({ page }) => {
    // 블록 타입 드롭다운 (Paragraph, Heading 등 포함)
    await expect(
      page
        .locator(".toolbar button")
        .filter({ hasText: /paragraph|Paragraph|Normal/i })
        .first(),
    ).toBeVisible();
  });
});

test.describe("ComponentPicker 슬래시 메뉴 (optional 패키지 설치됨)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator('[contenteditable="true"]').first().waitFor({ timeout: 10_000 });
    await page.waitForTimeout(800);
  });

  test("슬래시(/) 입력 시 ComponentPicker 메뉴가 열린다", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type("/");

    await expect(page.locator('[role="listbox"], .typeahead-popover').first()).toBeVisible({
      timeout: 3_000,
    });
  });

  test("슬래시 메뉴에 Heading 항목이 있다", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type("/");
    await page
      .locator('[role="listbox"], .typeahead-popover')
      .first()
      .waitFor({ timeout: 3_000 });

    await expect(
      page
        .locator('[role="option"]')
        .filter({ hasText: /^Heading/ })
        .first(),
    ).toBeVisible();
  });

  test("@lexical/code 설치 시 슬래시 메뉴에 Code Block 항목이 있다", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type("/code");
    await page
      .locator('[role="listbox"], .typeahead-popover')
      .first()
      .waitFor({ timeout: 3_000 });

    await expect(
      page.locator('[role="option"]').filter({ hasText: /code/i }).first(),
    ).toBeVisible();
  });

  test("@lexical/list 설치 시 슬래시 메뉴에 Bullet List 항목이 있다", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type("/bullet");
    await page
      .locator('[role="listbox"], .typeahead-popover')
      .first()
      .waitFor({ timeout: 3_000 });

    await expect(
      page
        .locator('[role="option"]')
        .filter({ hasText: /bullet/i })
        .first(),
    ).toBeVisible();
  });

  test("@lexical/table 설치 시 슬래시 메뉴에 Table 항목이 있다", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type("/table");
    await page
      .locator('[role="listbox"], .typeahead-popover')
      .first()
      .waitFor({ timeout: 3_000 });

    await expect(
      page.locator('[role="option"]').filter({ hasText: /table/i }).first(),
    ).toBeVisible();
  });

  test("Esc 키로 슬래시 메뉴를 닫을 수 있다", async ({ page }) => {
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click();
    await page.keyboard.type("/");
    await page
      .locator('[role="listbox"], .typeahead-popover')
      .first()
      .waitFor({ timeout: 3_000 });

    await page.keyboard.press("Escape");

    await expect(page.locator('[role="listbox"], .typeahead-popover').first()).not.toBeVisible({
      timeout: 2_000,
    });
  });
});
