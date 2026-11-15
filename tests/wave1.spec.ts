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
