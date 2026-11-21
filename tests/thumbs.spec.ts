import { test, expect } from '@playwright/test';

test('小縮圖：卡片列表的磚塊圖都指到 thumbs，整頁滑到底沒有壞圖', async ({ page }) => {
  await page.goto('#/cards');
  const imgs = page.locator('.card-grid a.tile .tile-img img');
  await expect(imgs.first()).toBeVisible();
  const srcs = await imgs.evaluateAll((els) => els.map((e) => (e as HTMLImageElement).getAttribute('src')!));
  expect(srcs.length).toBeGreaterThan(50);
  for (const s of srcs) expect(s, '磚塊圖要用縮圖').toMatch(/images\/thumbs\/[^/]+\.webp$/);

  // 一路滑到底，讓所有延遲載入的圖都載入
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo(0, document.body.scrollHeight);
  });
  const broken = await page.evaluate(async () => {
    const list = [...document.querySelectorAll<HTMLImageElement>('.card-grid a.tile .tile-img img')];
    list.forEach((i) => { i.loading = 'eager'; });
    await Promise.all(list.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = () => r(null); setTimeout(() => r(null), 8000); }))));
    return list.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src);
  });
  expect(broken, '縮圖不可有壞圖').toEqual([]);
});

test('小縮圖：卡片頁的大圖（分格故事、名畫圖廊）仍是原圖', async ({ page }) => {
  await page.goto('#/card/story-pandora');
  const panelImgs = page.locator('section.panels img');
  await expect(panelImgs.first()).toBeVisible();
  const srcs = await panelImgs.evaluateAll((els) => els.map((e) => (e as HTMLImageElement).getAttribute('src')!));
  expect(srcs.length).toBeGreaterThan(0);
  for (const s of srcs) {
    expect(s).toMatch(/images\/ai\//);
    expect(s).not.toContain('/thumbs/');
  }

  await page.goto('#/card/god-zeus');
  const gal = await page.locator('#sec-gallery .fig-zoom img').evaluateAll((els) => els.map((e) => (e as HTMLImageElement).getAttribute('src')!));
  expect(gal.length).toBeGreaterThan(0);
  for (const s of gal) expect(s).not.toContain('/thumbs/');
});
