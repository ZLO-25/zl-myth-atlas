import { test, expect } from '@playwright/test';

test('30 秒看完：潘朵拉可自動播放、有字幕、可暫停與離開', async ({ page }) => {
  await page.goto('#/card/story-pandora');
  const panels = page.locator('section.panels');
  await panels.locator('button.quick-start').click();
  const qp = panels.locator('.qp');
  await expect(qp.locator('.qp-cap')).toContainText('宙斯決定回一份');
  await expect(qp.locator('.ai-badge')).toBeVisible();
  // 每格 5 秒：6 秒後應已換到第 2 格
  await page.waitForTimeout(6000);
  await expect(qp.locator('.qp-cap')).toContainText('造出第一個女人');
  // 暫停後不再前進
  await qp.getByRole('button', { name: /暫停/ }).click();
  await page.waitForTimeout(5500);
  await expect(qp.locator('.qp-cap')).toContainText('造出第一個女人');
  // 離開後回到同一格的逐格閱讀
  await qp.getByRole('button', { name: /離開/ }).click();
  await expect(qp).toHaveCount(0);
  await expect(panels.locator('.panel-nav')).toContainText('2 / 6');
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over).toBeLessThanOrEqual(1);
});

test('30 秒看完：沒寫字幕的故事不出現播放鈕', async ({ page }) => {
  await page.goto('#/card/story-persephone');
  await expect(page.locator('section.panels')).toBeVisible();
  await expect(page.locator('button.quick-start')).toHaveCount(0);
});
