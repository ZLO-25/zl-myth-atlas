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
  await page.goto('#/card/story-romulus-remus');
  await expect(page.locator('section.panels')).toBeVisible();
  await expect(page.locator('button.quick-start')).toHaveCount(0);
});

test('看短片：潘朵拉播的是一支連續短片', async ({ page }) => {
  await page.goto('#/card/story-pandora');
  await page.locator('button.quick-start').click();
  const v = page.locator('.qp .qp-video');
  await expect(v).toHaveAttribute('src', /videos\/ai\/story-pandora\/film-pandora\.mp4$/);
  await expect(page.locator('.qp .ai-badge')).toHaveText('AI 動畫');
  await expect.poll(() => v.evaluate((el: HTMLVideoElement) => el.currentTime), { timeout: 8000 }).toBeGreaterThan(0.5);
  expect(await v.evaluate((el: HTMLVideoElement) => el.muted)).toBe(true);
});

test('看短片：波瑟芬妮整支播放、進度條只有一條', async ({ page }) => {
  await page.goto('#/card/story-persephone');
  await page.locator('button.quick-start').click();
  const v = page.locator('.qp .qp-video');
  await expect(v).toHaveAttribute('src', /videos\/ai\/story-persephone\/film-persephone\.mp4$/);
  await expect.poll(() => v.evaluate((el: HTMLVideoElement) => el.currentTime), { timeout: 8000 }).toBeGreaterThan(0.5);
  await expect(page.locator('.qp .qp-bar button')).toHaveCount(1);
  await expect(page.locator('.qp .qp-ctl')).toContainText(/剩 \d+ 秒/);
});
