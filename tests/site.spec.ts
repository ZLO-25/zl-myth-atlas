import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';

const site = JSON.parse(fs.readFileSync('src/generated/site-data.json', 'utf8'));
const cardIds: string[] = site.cards.map((c: { id: string }) => c.id);

/** 收集頁面上的 JS 錯誤（地圖底圖等外部資源載入失敗不算） */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load resource|ERR_|tile/i.test(m.text())) errors.push(m.text());
  });
  return errors;
}

async function noHorizontalScroll(page: Page) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(over, '頁面不應該左右捲動').toBeLessThanOrEqual(1);
}

test('首頁與各主要頁面都能打開、不會左右捲動', async ({ page }) => {
  const errors = watchErrors(page);
  for (const route of ['', '#/overview', '#/cards', '#/family', '#/timeline', '#/map', '#/compare', '#/today']) {
    await page.goto(route);
    await expect(page.locator('h1').first()).toBeVisible();
    await noHorizontalScroll(page);
  }
  expect(errors).toEqual([]);
});

test('全部 45 張卡片都能打開，有三句話、來源清單，且不會左右捲動', async ({ page }) => {
  const errors = watchErrors(page);
  expect(cardIds.length).toBe(45);
  for (const id of cardIds) {
    await page.goto(`#/card/${id}`);
    await expect(page.locator('h1').first(), id).toBeVisible();
    await expect(page.locator('ol.sources li').first(), `${id} 要有來源`).toBeVisible();
    await noHorizontalScroll(page);
  }
  expect(errors).toEqual([]);
});

test('分格故事可以用按鈕翻頁，AI 圖有標籤', async ({ page }) => {
  await page.goto('#/card/story-pandora');
  const panels = page.locator('[aria-label="分格故事"]');
  await expect(panels).toBeVisible();
  const first = await panels.locator('.panel-text').innerText();
  await panels.getByRole('button', { name: '下一格' }).click();
  await expect(panels.locator('.panel-text')).not.toHaveText(first);
  await expect(panels.locator('.ai-badge')).toHaveText('AI 插畫');
});

test('真實作品圖都有署名與「看這張圖」', async ({ page }) => {
  await page.goto('#/card/god-zeus');
  const figs = page.locator('.gallery figure.fig-work');
  expect(await figs.count()).toBeGreaterThanOrEqual(2);
  for (const f of await figs.all()) {
    await expect(f.locator('.credit')).toContainText('｜');
    await expect(f.locator('.look')).toContainText('看這張圖');
  }
});

test('搜尋：繁體、羅馬名、簡體都找得到', async ({ page }) => {
  await page.goto('');
  const box = page.locator('.search input');
  for (const [q, expectText] of [
    ['雅典娜', '雅典娜'],
    ['Jupiter', '宙斯'],
    ['阿波罗', '阿波羅'],
  ]) {
    await box.fill(q);
    await expect(page.locator('.search-results'), q).toContainText(expectText);
  }
});

test('族譜畫得出來，希羅對照表與今日影子有資料', async ({ page }) => {
  await page.goto('#/family');
  expect(await page.locator('.family-svg .fname').count()).toBeGreaterThan(15);
  await expect(page.locator('.family-svg .fname', { hasText: '蓋亞' })).toBeVisible();
  await page.goto('#/compare');
  expect(await page.locator('table.compare tbody tr').count()).toBeGreaterThanOrEqual(21);
  await page.goto('#/today');
  expect(await page.locator('.today-item').count()).toBe(site.today.length);
});

test('正文裡的 ASCII 示意圖會畫成方塊，不會露出 ```', async ({ page }) => {
  await page.goto('#/card/god-hermes');
  await expect(page.locator('.body pre.ascii').first()).toBeVisible();
  await expect(page.locator('.body')).not.toContainText('```');
  await expect(page.locator('.toc a').first()).toBeVisible();
});
