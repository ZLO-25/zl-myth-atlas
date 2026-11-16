import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';

// A 批：首頁、卡片列表、對照、今日影子、搜尋。三套神話並列，順序固定 希臘羅馬 → 北歐 → 中華。
const site = JSON.parse(fs.readFileSync('src/generated/site-data.json', 'utf8'));
type C = { id: string; type: string; myth_system: string[] };
type T = { id: string; cards: string[]; category: string };
const sysOf = (c?: C) => (c?.myth_system.includes('chinese') ? 'chinese' : c?.myth_system.includes('norse') ? 'norse' : 'west');
const cardsOf = (k: string) => (site.cards as C[]).filter((c) => sysOf(c) === k);
const cardById = new Map<string, C>((site.cards as C[]).map((c) => [c.id, c]));
const todayOf = (k: string) => (site.today as T[]).filter((t) => sysOf(cardById.get(t.cards[0])) === k);

const noHScroll = async (page: Page) => {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, '頁面不可橫向捲動').toBeLessThanOrEqual(1);
};

test('首頁：三張體系入口，順序希臘羅馬、北歐、中華，有張數、原典與三個連結', async ({ page }) => {
  await page.goto('#/');
  await expect(page.getByRole('heading', { name: '三套神話，從哪一套開始都可以' })).toBeVisible();
  const doors = page.locator('.sys-door');
  await expect(doors).toHaveCount(3);
  await expect(doors.locator('h3')).toHaveText(['希臘羅馬', '北歐', '中華']);
  const keys = ['west', 'norse', 'chinese'];
  for (let i = 0; i < 3; i++) {
    const d = doors.nth(i);
    await expect(d).toContainText(`${cardsOf(keys[i]).length} 張卡`);
    await expect(d).toContainText('主要原典');
    await expect(d.locator('.sys-door-links a')).toHaveCount(3);
    await expect(d.locator('.sys-door-links a').first()).toHaveAttribute('href', `#/cards?sys=${keys[i]}`);
  }
  await expect(doors.nth(1)).toContainText('《詩體埃達》');
  await noHScroll(page);
});

test('首頁：三條新手路線標題都帶神話名、順序固定、說明份量相當；精選每套 2 張', async ({ page }) => {
  await page.goto('#/');
  const heads = page.locator('main section > h2').filter({ hasText: '新手路線' });
  await expect(heads).toHaveText(['希臘羅馬新手路線：從蓋亞讀到埃涅阿斯', '北歐新手路線：從尤彌爾讀到諸神黃昏', '中華新手路線：從盤古讀到大禹']);
  const intros = await page.locator('.path-intro').allInnerTexts();
  expect(intros).toHaveLength(3);
  const lens = intros.map((t) => t.length);
  expect(Math.max(...lens) / Math.min(...lens), '三段說明份量不能差太多').toBeLessThan(1.6);
  expect(intros[2]).not.toMatch(/希臘/);
  await expect(page.getByRole('heading', { name: '三套神話各挑兩張：從這裡開始也可以' })).toBeVisible();
  const feat = await page.locator('.featured-grid a.tile').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href')));
  expect(feat).toHaveLength(6);
  const perSys: Record<string, number> = { west: 0, norse: 0, chinese: 0 };
  for (const h of feat) perSys[sysOf(cardById.get(decodeURIComponent(h!.replace('#/card/', ''))))]++;
  expect(perSys).toEqual({ west: 2, norse: 2, chinese: 2 });
  await expect(page.locator('main')).toContainText('《散文埃達》');
  // 精選的卡都有頭像圖（不是文字佔位）
  await expect(page.locator('.featured-grid .tile-img img')).toHaveCount(6);
});

test('卡片頁的路線名稱帶神話名', async ({ page }) => {
  await page.goto('#/card/god-zeus');
  await expect(page.locator('aside.path-step')).toContainText('希臘羅馬新手路線第 3/8 張');
  await page.goto('#/card/god-odin');
  await expect(page.locator('aside.path-step')).toContainText('北歐新手路線第 2/7 張');
});

test('卡片列表 ?sys=norse：只有北歐卡，類型與張數照北歐算', async ({ page }) => {
  await page.goto('#/cards?sys=norse');
  const norse = cardsOf('norse');
  await expect(page.locator('.sys-tabs button.on')).toHaveText(/北歐/);
  const hrefs = await page.locator('.card-grid a.tile').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href')!));
  expect(hrefs.map((h) => decodeURIComponent(h.replace('#/card/', ''))).sort()).toEqual(norse.map((c) => c.id).sort());
  const typeButtons = page.locator('.filters[aria-label="依類型篩選"] button');
  const types = [...new Set(norse.map((c) => c.type))];
  expect(await typeButtons.count()).toBe(types.length + 1);
  for (const t of types) {
    const n = norse.filter((c) => c.type === t).length;
    await expect(typeButtons.filter({ hasText: new RegExp(`^${t}\\s*${n}$`) })).toHaveCount(1);
  }
  await expect(page.locator('.sys-section-title')).toHaveCount(0);
  // 選類型：網址更新，重新整理仍在同一畫面
  await typeButtons.filter({ hasText: /^神/ }).first().click();
  await expect(page).toHaveURL(/#\/cards\?sys=norse&type=/);
  const n = norse.filter((c) => c.type === '神').length;
  await expect(page.locator('.card-grid a.tile')).toHaveCount(n);
  await page.reload();
  await expect(page.locator('.card-grid a.tile')).toHaveCount(n);
  // 切到沒有這個類型的神話，回到「全部」
  await page.goto('#/cards?sys=norse&type=凡人');
  await expect(page.locator('.card-grid a.tile')).toHaveCount(norse.length);
  await noHScroll(page);
});

test('卡片列表「全部」：分三段，小標題帶張數，順序希臘羅馬、北歐、中華', async ({ page }) => {
  await page.goto('#/cards');
  const titles = page.locator('.sys-section-title');
  await expect(titles).toHaveText([`希臘羅馬（${cardsOf('west').length} 張）`, `北歐（${cardsOf('norse').length} 張）`, `中華（${cardsOf('chinese').length} 張）`]);
  await expect(page.locator('.sys-tabs button')).toHaveText([/全部/, /希臘羅馬/, /北歐/, /中華/]);
  expect(await page.locator('.card-grid a.tile').count()).toBe(site.cards.length);
  // 在「全部」選類型，各段張數跟著變
  await page.locator('.filters[aria-label="依類型篩選"] button', { hasText: /^神 / }).click();
  const gods = (site.cards as C[]).filter((c) => c.type === '神');
  await expect(titles.first()).toHaveText(`希臘羅馬（${gods.filter((c) => sysOf(c) === 'west').length} 張）`);
  await noHScroll(page);
});

test('對照頁：第一個 h2 是三套神話對照，欄位順序希臘羅馬、北歐、中華；中西表只比兩邊', async ({ page }) => {
  await page.goto('#/compare');
  await expect(page.locator('main h2').first()).toHaveText('三套神話對照');
  await expect(page.locator('main h2')).toHaveText(['三套神話對照', '中華與希臘羅馬', '希臘 vs 羅馬', '羅馬怎麼借用希臘（真實歷史）']);
  await expect(page.locator('.jump-btns button')).toHaveText(['三套神話對照', '中華與希臘羅馬', '希臘 vs 羅馬']);
  const heads = page.locator('#norse-compare thead th');
  await expect(heads).toHaveText(['問題', '希臘羅馬神話', '北歐神話', '中華神話', '差在哪']);
  await expect(page.locator('#norse-compare pre.ascii')).toContainText('希臘羅馬神話怎麼回答');
  const ascii = await page.locator('#norse-compare pre.ascii').innerText();
  expect(ascii.indexOf('希臘羅馬')).toBeLessThan(ascii.indexOf('北歐'));
  expect(ascii.indexOf('北歐')).toBeLessThan(ascii.indexOf('中華'));
  await expect(page.locator('#norse-compare tbody tr')).toHaveCount(site.threeWay.length);
  for (const theme of ['大洪水', '龍']) await expect(page.locator('#norse-compare')).toContainText(theme);
  await expect(page.locator('#norse-compare a[href="#/card/primordial-ymir"]').first()).toBeVisible();
  await expect(page.locator('#norse-compare a[href="#/card/place-yggdrasil"]')).toBeVisible();
  await expect(page.locator('#cn-west')).toContainText('這幾題本站的北歐卡片沒有對應內容，所以只比兩邊');
  await expect(page.locator('#gr-rome')).toContainText('這一段只談希臘羅馬內部');
  await noHScroll(page);
});

test('今日影子：選「中華」只剩中華的條目，猜猜看也跟著；提示字三套各一例', async ({ page }) => {
  await page.goto('#/today');
  await expect(page.locator('.today-filter')).toHaveAttribute('placeholder', /一月.*Thursday.*嫦娥/);
  const tabs = page.locator('.sys-tabs button');
  await expect(tabs).toHaveText([/全部/, /希臘羅馬/, /北歐/, /中華/]);
  await tabs.filter({ hasText: '中華' }).click();
  const cn = todayOf('chinese');
  await expect(page.locator('.today-count')).toContainText(`共 ${cn.length} 條`);
  await expect(page.locator('.today-item')).toHaveCount(cn.length);
  await expect(page.locator('.today-item .sys-hit')).toHaveText(Array(cn.length).fill('中華'));
  // 提示字裡的三個例子，都真的搜得到
  await tabs.filter({ hasText: '全部' }).click();
  for (const w of ['一月', 'Thursday', '嫦娥']) {
    await page.locator('.today-filter').fill(w);
    await expect.poll(() => page.locator('.today-item').count(), w).toBeGreaterThan(0);
  }
  await page.locator('.today-filter').fill('');
  await tabs.filter({ hasText: '北歐' }).click();
  await expect(page.locator('.today-item')).toHaveCount(todayOf('norse').length);
  await page.getByRole('button', { name: '猜猜看' }).click();
  await expect(page.locator('.guess-box')).toContainText(/第 1 \/ \d+ 題/);
  const total = Number((await page.locator('.guess-box').innerText()).match(/第 1 \/ (\d+) 題/)![1]);
  expect(total).toBeLessThanOrEqual(todayOf('norse').length);
  await noHScroll(page);
});

test('搜尋：卡片與今日影子結果的副標都有神話體系', async ({ page }) => {
  await page.goto('#/');
  const box = page.getByLabel('搜尋卡片');
  await box.fill('奧丁');
  await expect(page.locator('.search-results li').first()).toContainText('神｜北歐｜Odin');
  await box.fill('宙斯');
  await expect(page.locator('.search-results li').first()).toContainText('神｜希臘羅馬｜Zeus｜羅馬：');
  await box.fill('女媧');
  await expect(page.locator('.search-results li').first()).toContainText('中華');
  await box.fill('嫦娥探月工程');
  await expect(page.locator('.search-results li').first()).toContainText('今日影子｜中華｜');
});

test('頁首「隱藏原文」的提示涵蓋三套', async ({ page }) => {
  await page.goto('#/');
  const title = await page.locator('.orig-toggle').getAttribute('title');
  for (const w of ['希臘文', '拉丁文', '古諾斯語', '拼音']) expect(title).toContain(w);
});
