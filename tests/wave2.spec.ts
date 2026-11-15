import { test, expect, type Page } from '@playwright/test';

const noHScroll = async (page: Page) => {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, '頁面不可橫向捲動').toBeLessThanOrEqual(1);
};

test('第二波 2：卡片頁顯示新手路線第幾張、上一張與下一張', async ({ page }) => {
  await page.goto('#/card/story-persephone');
  const step = page.locator('aside.path-step');
  await expect(step).toContainText('新手路線第 5/8 張');
  await expect(step.locator('a.path-prev')).toContainText('普羅米修斯');
  await expect(step.locator('a.path-next')).toContainText('特洛伊戰爭');
  // 放在「接著讀」上方
  const y1 = (await step.boundingBox())!.y;
  const y2 = (await page.locator('section.next-cards').boundingBox())!.y;
  expect(y1).toBeLessThan(y2);
  await step.locator('a.path-next').click();
  await expect(page).toHaveURL(/#\/card\/story-trojan-war/);
  await expect(page.locator('aside.path-step')).toContainText('第 6/8 張');
  // 第一張沒有上一張；最後一張沒有下一張
  await page.goto('#/card/primordial-gaia');
  await expect(page.locator('aside.path-step a.path-prev')).toHaveCount(0);
  await page.goto('#/card/hero-yu');
  await expect(page.locator('aside.path-step')).toContainText('中華神話新手路線第 7/7 張');
  await expect(page.locator('aside.path-step a.path-next')).toHaveCount(0);
  // 不在路線裡的卡不顯示
  await page.goto('#/card/god-apollo');
  await expect(page.locator('aside.path-step')).toHaveCount(0);
  await noHScroll(page);
});
