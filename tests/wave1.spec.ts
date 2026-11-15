import { test, expect } from '@playwright/test';

test('第一波 1：總覽時間標示與極短版', async ({ page }) => {
  await page.goto('');
  await expect(page.locator('.overview-cta')).toContainText('約 20 分鐘');
  await expect(page.locator('.overview-cta')).not.toContainText('五分鐘');
  await page.goto('#/overview');
  await expect(page.locator('h1').first()).toContainText('二十分鐘');
  const quick = page.locator('aside.quick');
  await expect(quick).toBeVisible();
  expect(await quick.locator('li').count()).toBeLessThanOrEqual(8);
  expect(await quick.locator('li a').count()).toBe(8);
  // 極短版在八幕導覽之前
  const quickY = (await quick.boundingBox())!.y;
  const actsY = (await page.locator('nav.acts').boundingBox())!.y;
  expect(quickY).toBeLessThan(actsY);
  await quick.locator('li a').nth(2).click();
  await expect(page).toHaveURL(/#\/card\/god-zeus/);
});

test('第一波 2：導覽列在窄螢幕有橫滑提示，目前項目會捲進可視範圍', async ({ page, viewport }) => {
  const narrow = viewport!.width < 500;
  await page.goto('#/today');
  const nav = page.locator('.site-header nav');
  const on = nav.locator('a.on');
  await expect(on).toHaveText('今日影子');
  // 目前項目整個在導覽列的可視範圍內
  const inView = async () => {
    const [n, a] = await Promise.all([nav.boundingBox(), on.boundingBox()]);
    return a!.x >= n!.x - 1 && a!.x + a!.width <= n!.x + n!.width + 1;
  };
  await expect.poll(inView).toBe(true);
  if (!narrow) {
    await expect(page.locator('.nav-wrap')).not.toHaveClass(/more-right|more-left/);
    return;
  }
  // 窄螢幕：導覽列確實放不下，而且左邊有「還有東西」的提示、右邊已到底
  expect(await nav.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(true);
  await expect(page.locator('.nav-wrap')).toHaveClass(/more-left/);
  await expect(page.locator('.nav-wrap')).not.toHaveClass(/more-right/);
  // 回到首頁：從最左開始，右邊有提示；漸層真的畫出來（opacity 1）
  await page.goto('#/overview');
  await expect(page.locator('.nav-wrap')).toHaveClass(/more-right/);
  await expect.poll(() => page.locator('.nav-wrap').evaluate((e) => getComputedStyle(e, '::after').opacity)).toBe('1');
  // 換到「年代」之類中間的頁面，它也要在可視範圍內
  await page.goto('#/map');
  await expect(nav.locator('a.on')).toHaveText('地圖');
  await expect.poll(inView).toBe(true);
});

test('第一波 3：導覽與首頁磚塊改叫「對照」，頁內有兩個跳轉鈕', async ({ page }) => {
  await page.goto('');
  await expect(page.locator('.site-header nav a[href="#/compare"]')).toHaveText('對照');
  await expect(page.locator('.site-header nav')).not.toContainText('希臘 vs 羅馬');
  await expect(page.locator('.tiles a[href="#/compare"] strong')).toHaveText('對照');
  await page.locator('.tiles a[href="#/compare"]').click();
  await expect(page).toHaveURL(/#\/compare$/);
  await expect(page.locator('h1')).toHaveText('對照');
  const btns = page.locator('.jump-btns button');
  await expect(btns).toHaveText(['希臘 vs 羅馬', '中西神話對照']);
  await btns.nth(1).click();
  await expect.poll(async () => (await page.locator('#cn-west').boundingBox())!.y).toBeLessThan(250);
  await btns.nth(0).click();
  await expect.poll(async () => (await page.locator('#gr-rome').boundingBox())!.y).toBeLessThan(250);
  await expect(page).toHaveURL(/#\/compare$/);
});

test('第一波 4：搜尋容錯、搜內文、不相干的詞顯示找不到', async ({ page }) => {
  await page.goto('');
  const box = page.locator('.search input');
  const items = page.locator('.search-results li');
  // 英文打錯字：第一筆是宙斯
  await box.fill('zues');
  await expect(items.first()).toContainText('宙斯');
  await box.fill('Posiedon');
  await expect(items.first()).toContainText('波賽頓');
  // 內文（主題說明）：四季 → 波瑟芬妮被擄
  await box.fill('四季');
  await expect(page.locator('.search-results')).toContainText('波瑟芬妮被擄');
  // 不相干：找不到，沒有雜訊
  await box.fill('Thor');
  await expect(items).toHaveCount(1);
  await expect(items.first()).toContainText('找不到「Thor」');
  // 原本就對的搜尋結果不變
  await box.fill('Jupiter');
  await expect(items).toHaveCount(1);
  await expect(items.first()).toContainText('宙斯');
  await box.fill('維納斯');
  await expect(items).toHaveCount(2);
  await expect(items.nth(0)).toContainText('阿芙蘿黛蒂');
  await expect(items.nth(1)).toContainText('波提且利');
  await box.fill('女媧');
  await expect(items).toHaveCount(2);
  await expect(items.nth(0)).toContainText('女媧');
  await expect(items.nth(1)).toContainText('女媧補天');
  // 按 Enter 開第一筆
  await box.fill('zues');
  await box.press('Enter');
  await expect(page).toHaveURL(/#\/card\/god-zeus/);
});
