import { test, expect } from '@playwright/test';

test('點圖放大：分格故事的圖可開燈箱、左右切換、關閉', async ({ page, isMobile }) => {
  await page.goto('#/card/story-pandora');
  const panels = page.locator('section.panels');
  await panels.locator('.fig-zoom').first().click();
  const lb = page.locator('.lb');
  await expect(lb).toBeVisible();
  await expect(lb.locator('.lb-count')).toHaveText('1 / 6');
  await expect(lb.locator('.lb-cap')).toContainText('AI 插畫');
  // 圖要塞進螢幕裡，不能超出
  const box = await lb.locator('.lb-stage img').boundingBox();
  const vp = page.viewportSize()!;
  expect(box!.width).toBeLessThanOrEqual(vp.width + 1);
  expect(box!.height).toBeLessThanOrEqual(vp.height);
  await lb.getByRole('button', { name: '下一張' }).click();
  await expect(lb.locator('.lb-count')).toHaveText('2 / 6');
  await lb.getByRole('button', { name: '上一張' }).click();
  await lb.getByRole('button', { name: '上一張' }).click();
  await expect(lb.locator('.lb-count')).toHaveText('6 / 6');
  if (!isMobile) {
    await page.keyboard.press('ArrowRight');
    await expect(lb.locator('.lb-count')).toHaveText('1 / 6');
    // 燈箱裡按左右鍵不會順便翻後面的分格
    await expect(panels.locator('.panel-nav')).toContainText('1 / 6');
    await page.keyboard.press('Escape');
  } else {
    await lb.getByRole('button', { name: /關閉/ }).click();
  }
  await expect(lb).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('點圖放大：名畫區可開燈箱、看原尺寸、點背景關閉', async ({ page }) => {
  await page.goto('#/card/god-zeus');
  const gallery = page.locator('#sec-gallery');
  const n = await gallery.locator('.fig-zoom').count();
  expect(n).toBeGreaterThan(1);
  // 名畫是延遲載入：先捲到那裡，等圖載好才有大小可以點
  await gallery.locator('.fig-zoom').nth(1).evaluate((el) => el.scrollIntoView());
  await expect.poll(() => gallery.locator('.fig-zoom img').nth(1).evaluate((im: HTMLImageElement) => im.complete && im.naturalWidth)).toBeGreaterThan(0);
  await gallery.locator('.fig-zoom').nth(1).click();
  const lb = page.locator('.lb');
  await expect(lb.locator('.lb-count')).toHaveText(`2 / ${n}`);
  await expect(lb.locator('.lb-cap a').first()).toBeVisible();
  await lb.getByRole('button', { name: '看原尺寸' }).click();
  await expect(lb.locator('.lb-stage')).toHaveClass(/zoomed/);
  await lb.getByRole('button', { name: '縮回整張' }).click();
  await lb.locator('.lb-stage').click({ position: { x: 5, y: 5 } });
  await expect(lb).toHaveCount(0);
});
