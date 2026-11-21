import { test, expect } from '@playwright/test';

// 搜尋改良：搜正文、名字之外再補內文、中文打錯一個字也找得到。

test('搜尋 2：亞特蘭提斯（只在正文裡）找得到波賽頓，標示內文提到並附前後文', async ({ page }) => {
  await page.goto('');
  await page.locator('.search input').fill('亞特蘭提斯');
  const first = page.locator('.search-results li').first();
  await expect(first).toContainText('波賽頓');
  await expect(first).toContainText('內文提到');
  await expect(first.locator('.snippet')).toContainText('亞特蘭提斯');
  await expect(first.locator('.snippet')).toContainText('…');
});

test('搜尋 2：月亮 第一筆仍是名字命中，後面補上三句話裡有月亮的卡', async ({ page }) => {
  await page.goto('');
  await page.locator('.search input').fill('月亮');
  const items = page.locator('.search-results li');
  await expect(items.first()).toContainText('阿提米絲');
  await expect(items.first()).not.toContainText('內文提到');
  const text = await page.locator('.search-results').innerText();
  expect(text).toMatch(/嫦娥|月宮裡有什麼/);
  expect(await items.count()).toBeLessThanOrEqual(12);
});

test('搜尋 2：中文打錯一個字（阿波蘿、黑帝司）也找得到', async ({ page }) => {
  await page.goto('');
  const box = page.locator('.search input');
  await box.fill('阿波蘿');
  await expect(page.locator('.search-results li').first()).toContainText('阿波羅');
  await box.fill('黑帝司');
  await expect(page.locator('.search-results li').first()).toContainText('黑帝斯');
});

test('搜尋 2：兩個字的查詢不做容錯，不會亂配', async ({ page }) => {
  await page.goto('');
  await page.locator('.search input').fill('宙司');
  await expect(page.locator('.search-results li')).toHaveCount(1);
  await expect(page.locator('.search-results li').first()).toContainText('找不到「宙司」');
});

test('搜尋 2：宙斯 第一筆還是宙斯，完全相同時不被正文提及淹沒', async ({ page }) => {
  await page.goto('');
  await page.locator('.search input').fill('宙斯');
  const items = page.locator('.search-results li');
  await expect(items.first()).toContainText('宙斯');
  expect(await items.count()).toBeLessThan(10);
});

test('搜尋 2：不存在的詞顯示找不到', async ({ page }) => {
  await page.goto('');
  await page.locator('.search input').fill('咖哩飯');
  const items = page.locator('.search-results li');
  await expect(items).toHaveCount(1);
  await expect(items.first()).toContainText('找不到「咖哩飯」');
});

test('搜尋 2：手機寬度（390）下結果清單不超出畫面，也不左右捲動', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('');
  for (const q of ['特洛伊', '月亮', '亞特蘭提斯']) {
    await page.locator('.search input').fill(q);
    const list = page.locator('.search-results');
    await expect(list).toBeVisible();
    const box = (await list.boundingBox())!;
    expect(box.x, q).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width, q).toBeLessThanOrEqual(391);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(over, q).toBeLessThanOrEqual(1);
    // 每一筆內容都不能比清單寬
    const wide = await list.evaluate((el) => [...el.querySelectorAll('li button')].filter((b) => b.scrollWidth > b.clientWidth + 1).length);
    expect(wide, q).toBe(0);
  }
});
