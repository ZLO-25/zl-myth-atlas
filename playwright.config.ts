import { defineConfig } from '@playwright/test';

// 桌機 1280 與手機 390 兩種寬度都跑一次。先 npm run build:site，再用 vite preview 起站。
export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173/',
    // 雲端開發環境預裝的瀏覽器版本和套件不同時，用 PW_CHROMIUM 指定路徑；CI 與一般電腦不用設
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  projects: [
    { name: '桌機1280', use: { viewport: { width: 1280, height: 800 } } },
    { name: '手機390', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: true,
  },
});
