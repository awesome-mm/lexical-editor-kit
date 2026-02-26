import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E 테스트 설정
 *
 * 테스트 대상: apps/website (실제 사용자가 라이브러리를 설치해서 쓰는 환경)
 * dev  모드: pnpm dev    → http://localhost:5174
 * preview 모드: pnpm preview → http://localhost:4173
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // 에디터 DOM 상태가 공유되므로 순차 실행
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* preview 서버 대상 (pnpm test:e2e:preview) */
  webServer: process.env.PLAYWRIGHT_NO_SERVER
    ? undefined
    : {
        command: "pnpm preview",
        url: "http://localhost:4173",
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
