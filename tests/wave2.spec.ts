import { test, expect, type Page } from '@playwright/test';

const noHScroll = async (page: Page) => {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, '頁面不可橫向捲動').toBeLessThanOrEqual(1);
};

/** 打開卡片並捲到來源：IntersectionObserver 是非同步的，等一下再離開 */
const readToEnd = async (page: Page, id: string) => {
  await page.goto('#/card/' + id);
  await page.locator('#sec-sources').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
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

test('第二波 1：讀到底記為已讀，磚塊與首頁路線顯示進度，可繼續讀與清除', async ({ page }) => {
  await page.goto('');
  await expect(page.locator('.path-count').first()).toHaveText('已讀 0/8');
  await expect(page.locator('.path-continue').first()).toContainText('從第一張開始：蓋亞');
  await expect(page.locator('.progress-box')).toHaveCount(0);

  // 只是打開卡片、還沒讀到底：不算已讀
  await page.goto('#/card/primordial-gaia');
  await page.waitForTimeout(300);
  await page.goto('');
  await expect(page.locator('.path-count').first()).toHaveText('已讀 0/8');

  // 讀到來源 → 已讀
  await readToEnd(page, 'primordial-gaia');
  await page.goto('');
  await expect(page.locator('.path-count').first()).toHaveText('已讀 1/8');
  await expect(page.locator('.path li.is-read')).toHaveCount(1);
  await expect(page.locator('.path-continue').first()).toContainText('繼續讀下一張：克羅諾斯');
  await expect(page.locator('.progress-box')).toContainText('1 /');

  // 卡片磚塊（首頁「最多人認識的 6 張」與卡片列表）也有勾勾
  await readToEnd(page, 'god-zeus');
  await page.goto('#/cards');
  await expect(page.locator('a.tile.is-read .read-badge')).toHaveCount(2);
  await expect(page.locator('a.tile', { hasText: '宙斯' }).first().locator('.read-badge')).toHaveText('✓ 已讀');

  // 首頁「繼續讀下一張」會跳過已讀的（蓋亞已讀、宙斯也已讀，下一張是克羅諾斯）
  await page.goto('');
  await page.locator('.path-continue').first().click();
  await expect(page).toHaveURL(/#\/card\/titan-cronus/);

  // 在同一個分頁內不用重新整理，首頁就會更新
  await page.locator('#sec-sources').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.evaluate(() => (location.hash = '#/'));
  await expect(page.locator('.path-count').first()).toHaveText('已讀 3/8');

  // 清除
  await page.getByRole('button', { name: '清除讀書進度' }).click();
  await page.getByRole('button', { name: '確定清除' }).click();
  await expect(page.locator('.path-count').first()).toHaveText('已讀 0/8');
  await expect(page.locator('.progress-box')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.path-count').first()).toHaveText('已讀 0/8');
});

test('第二波 1：讀不到 localStorage 時網站照常運作', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
  });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('');
  await expect(page.locator('.path-count').first()).toHaveText('已讀 0/8');
  await readToEnd(page, 'primordial-gaia');
  await page.evaluate(() => (location.hash = '#/'));
  // 存不進瀏覽器，但這次瀏覽還是記得
  await expect(page.locator('.path-count').first()).toHaveText('已讀 1/8');
  expect(errors).toEqual([]);
});
