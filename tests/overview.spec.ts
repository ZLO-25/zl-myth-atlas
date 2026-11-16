import { test, expect } from '@playwright/test';

test('總覽：三套神話並列（開頭的來源說明、三部、極短版可切換）', async ({ page }) => {
  await page.goto('#/overview');
  // 開頭先說三套神話各是怎麼留下來的，表格有三欄
  const guide = page.locator('#ov-sources-guide');
  await expect(guide.locator('h2')).toContainText('怎麼留到今天');
  await expect(guide.locator('table.src-table thead th')).toHaveText(['', '希臘羅馬', '北歐', '中華']);
  await expect(guide).toContainText('可信度');
  // 三部的開頭橫幅，順序是希臘羅馬 → 北歐 → 中華
  await expect(page.locator('.part-title')).toHaveText(['希臘羅馬神話：八幕', '北歐神話：四幕', '中華神話：五幕']);
  // 目錄：上排三套神話一直看得到，下排只列目前這套的幕；目錄本身不需要橫向捲動
  const nav = page.locator('nav.acts');
  const tabs = nav.locator('.part-tab');
  await expect(tabs).toHaveCount(3);
  await expect(tabs).toContainText(['希臘羅馬', '北歐', '中華']);
  await expect(nav.locator('.act-chips a')).toHaveCount(8);
  const noScroll = () => nav.evaluate((e) => [e, ...e.querySelectorAll('div')].every((x) => x.scrollWidth <= x.clientWidth + 1));
  expect(await noScroll()).toBe(true);
  // 點「北歐」：跳到北歐，下排換成北歐四幕
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveClass(/on/);
  await expect(nav.locator('.act-chips a')).toHaveCount(4);
  // 用滾輪捲到中華第三幕：目錄跟著換（不必等標題捲到畫面中間）
  await page.locator('#ov-c3').evaluate((e) => e.scrollIntoView());
  await expect(tabs.nth(2)).toHaveClass(/on/);
  await expect(nav.locator('.act-chips a')).toHaveCount(5);
  await expect(nav.locator('.act-chips a.on')).toContainText('涿鹿之戰');
  expect(await noScroll()).toBe(true);
  // 下排每一幕都有短標題；點一下立刻亮起，標題就在目錄正下方、沒被擋住
  await expect(nav.locator('.act-chips .act-title')).toHaveText(['開天補天', '發明家', '涿鹿之戰', '射日奔月', '大禹治水']);
  await nav.locator('.act-chips a').nth(4).click();
  await expect(nav.locator('.act-chips a.on')).toContainText('大禹治水', { timeout: 300 });
  const gap = await page.evaluate(() => document.querySelector('#ov-c5 h2')!.getBoundingClientRect().top - document.querySelector('nav.acts')!.getBoundingClientRect().bottom);
  expect(gap).toBeGreaterThanOrEqual(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  // 極短版：預設希臘羅馬 8 行，切到北歐 7 行、中華 7 行
  const quick = page.locator('aside.quick');
  await expect(quick.locator('li a')).toHaveCount(8);
  await quick.getByRole('button', { name: '北歐' }).click();
  await expect(quick.locator('li a')).toHaveCount(7);
  await expect(quick.locator('li a').first()).toHaveText('尤彌爾');
  await quick.getByRole('button', { name: '中華' }).click();
  await expect(quick.locator('li a').first()).toHaveText('盤古');
  // 北歐、中華各幕裡的卡片連結都點得到
  await page.locator('#ov-n3 a[href="#/card/god-loki"]').first().click();
  await expect(page).toHaveURL(/#\/card\/god-loki/);
  // 整頁不會左右捲動
  await page.goto('#/overview');
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(over).toBeLessThanOrEqual(1);
});
