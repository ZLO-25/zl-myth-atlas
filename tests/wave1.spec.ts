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
