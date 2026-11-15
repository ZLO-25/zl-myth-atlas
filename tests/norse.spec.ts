import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';

const site = JSON.parse(fs.readFileSync('src/generated/site-data.json', 'utf8'));
type C = { id: string; name_zh: string; body: string; myth_system: string[]; sources: { id: string }[] };
const norse: C[] = site.cards.filter((c: C) => c.myth_system.includes('norse'));
const DEMO = ['primordial-ymir', 'god-odin', 'god-thor', 'god-loki', 'story-ragnarok'];

const noHScroll = async (page: Page) => {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, '頁面不可橫向捲動').toBeLessThanOrEqual(1);
};

test('北歐 A 批：5 張示範卡都在，正文每句都標來源，來源代號都存在', () => {
  expect(norse.map((c) => c.id).sort()).toEqual([...DEMO].sort());
  for (const c of norse) {
    const lines = c.body.split('\n').filter((l) => l.trim() && !l.startsWith('#') && !l.startsWith('```'));
    for (const l of lines) expect(l, `${c.id} 這一段沒有標來源：${l.slice(0, 20)}`).toMatch(/\[s\d+\]/);
    const ids = new Set(c.sources.map((s) => s.id));
    for (const m of c.body.matchAll(/\[(s\d+)\]/g)) expect(ids.has(m[1]), `${c.id} 引用不存在的 ${m[1]}`).toBe(true);
  }
});

test('北歐：卡片列表可篩選「北歐」；沒有圖也正常顯示', async ({ page }) => {
  await page.goto('#/cards');
  await page.getByRole('button', { name: '北歐', exact: true }).click();
  await expect(page.locator('.card-grid .tile')).toHaveCount(5);
  await expect(page.locator('.card-grid .tile img')).toHaveCount(0);
  await expect(page.locator('.card-grid .tile .tile-initial')).toHaveCount(5);
  await expect(page.locator('.card-grid')).toContainText('尤彌爾');
  await noHScroll(page);
  // 名稱格式：中文 English（原文）
  await expect(page.locator('.card-grid')).toContainText('Odin（Óðinn）');
  await page.screenshot({ path: 'test-results/norse-cards.png' });
});

test('北歐：卡片頁名稱格式、體系標籤、年代、沒有圖時的說明', async ({ page }) => {
  await page.goto('#/card/god-odin');
  await expect(page.locator('h1').first()).toContainText('奧丁');
  await expect(page.locator('h1').first()).toContainText('Odin');
  await expect(page.locator('h1').first()).toContainText('Óðinn');
  await expect(page.locator('.sys-chip').first()).toHaveText('北歐');
  await expect(page.locator('.era-chip')).toContainText('眾神的時代');
  await expect(page.locator('.facts')).toContainText('故事裡怎麼認出奧丁');
  await expect(page.locator('.facts')).toContainText('胡金與穆寧');
  await expect(page.locator('#sec-disputed')).toContainText('奧丁的那隻眼睛');
  await expect(page.locator('article img')).toHaveCount(0);
  // 家族：沒有卡片的人物也顯示「中文 English」
  await expect(page.locator('#sec-family')).toContainText('包爾 Borr');
  await expect(page.locator('#sec-family a', { hasText: '索爾' }).first()).toBeVisible();
  await noHScroll(page);
  await page.goto('#/card/primordial-ymir');
  await expect(page.locator('h1').first()).toContainText('尤彌爾');
  await expect(page.locator('#sec-sources')).toContainText('Bellows 英譯');
  await page.goto('#/card/story-ragnarok');
  await expect(page.locator('h1').first()).toContainText('諸神黃昏');
  await expect(page.locator('#sec-disputed')).toContainText('芬里爾是怎麼死的');
  await noHScroll(page);
});

test('北歐：首頁有北歐新手路線（5 張），讀完會記已讀', async ({ page }) => {
  await page.goto('');
  await expect(page.getByRole('heading', { name: /北歐神話新手路線/ })).toBeVisible();
  const list = page.locator('section', { has: page.getByRole('heading', { name: /北歐神話新手路線/ }) });
  await expect(list.locator('ol.path li')).toHaveCount(5);
  await expect(list.locator('.path-count')).toContainText('已讀 0/5');
  await expect(list.locator('.path-continue')).toContainText('尤彌爾');
  await page.goto('#/card/god-odin');
  await expect(page.locator('aside.path-step')).toContainText('北歐神話新手路線第 2/5 張');
  await expect(page.locator('aside.path-step a.path-prev')).toContainText('尤彌爾');
  await expect(page.locator('aside.path-step a.path-next')).toContainText('索爾');
  await page.goto('');
  await expect(page.locator('.lead').first()).toContainText('北歐');
});

test('北歐：神話年代有北歐分頁，卡片的年代標籤會跳到北歐分頁', async ({ page }) => {
  await page.goto('#/timeline');
  await page.getByRole('button', { name: /北歐/ }).click();
  await expect(page.locator('ol.eras > li')).toHaveCount(4);
  await expect(page.locator('#era-no-creation')).toContainText('尤彌爾');
  await expect(page.locator('#era-no-gods')).toContainText('洛基');
  await expect(page.locator('#era-no-ragnarok')).toContainText('諸神黃昏');
  await page.goto('#/card/god-thor');
  await page.locator('.era-chip').click();
  await expect(page).toHaveURL(/#\/timeline\?era=no-gods/);
  await expect(page.locator('ol.eras > li')).toHaveCount(4);
  await expect(page.locator('#era-no-gods')).toContainText('索爾');
  await noHScroll(page);
});

test('北歐：族譜「北歐神話」模式以奧丁為中心，模式寫進網址', async ({ page }) => {
  await page.goto('#/family');
  await page.getByRole('button', { name: /北歐神話（以奧丁為中心）/ }).click();
  await expect(page).toHaveURL(/#\/family\/god-odin\?mode=norse$/);
  await expect(page.locator('.family-svg .fnode.role-focus')).toContainText('奧丁');
  await expect(page.locator('.family-svg .fname', { hasText: '包爾' })).toBeVisible();
  await expect(page.locator('.family-svg .fname', { hasText: '索爾' })).toBeVisible();
  await expect(page.locator('.family-svg .fname', { hasText: '芙麗嘉' })).toBeVisible();
  await expect(page.locator('.family-svg image')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.filters button.on')).toContainText('北歐神話');
  // 點索爾 → 以索爾為中心，仍是北歐模式
  await page.locator('.family-svg .fnode.clickable', { hasText: '索爾' }).dispatchEvent('click');
  await expect(page).toHaveURL(/#\/family\/god-thor\?mode=norse$/);
  await expect(page.locator('.family-svg .fnode.role-focus')).toContainText('索爾');
  await expect(page.locator('.family-svg .fname', { hasText: '約爾德' })).toBeVisible();
  await page.goBack();
  await expect(page.locator('.family-svg .fnode.role-focus')).toContainText('奧丁');
  // 從卡片頁的「在族譜裡展開」進來，預設就是北歐模式
  await page.goto('#/family/god-loki');
  await expect(page.locator('.filters button.on')).toContainText('北歐神話');
  await expect(page.locator('.family-svg .fname', { hasText: '西格恩' })).toBeVisible();
  await expect(page.locator('.family-legend')).toContainText('夫妻');
  await page.screenshot({ path: 'test-results/norse-family.png' });
  await noHScroll(page);
});

test('北歐：搜尋找得到（中文、英文、原文）', async ({ page }) => {
  await page.goto('');
  const box = page.locator('.search input');
  const items = page.locator('.search-results li');
  await box.fill('奧丁');
  await expect(items.first()).toContainText('奧丁');
  await box.fill('Thor');
  await expect(items.first()).toContainText('索爾');
  await box.fill('Loki');
  await expect(items.first()).toContainText('洛基');
  await box.fill('Ragnarok');
  await expect(items.first()).toContainText('諸神黃昏');
  await box.fill('Óðinn');
  await expect(items.first()).toContainText('奧丁');
  await box.fill('Ymir');
  await expect(items.first()).toContainText('尤彌爾');
});

test('北歐：考考自己在沒有圖的卡上也能出題，且遮掉名字', async ({ page }) => {
  for (const id of DEMO) {
    await page.goto('#/card/' + id);
    const q = page.locator('#sec-quiz .quiz-q').first();
    await expect(q, id).toBeVisible();
    const card = site.cards.find((c: C) => c.id === id);
    await expect(q.locator('.quiz-stem')).not.toContainText(card.name_zh);
    expect(await q.locator('.quiz-opt').count()).toBe(4);
    expect(await q.locator('.quiz-opt').allInnerTexts()).toContain(card.name_zh);
  }
  await page.goto('#/card/god-odin');
  const q = page.locator('#sec-quiz .quiz-q').first();
  await q.locator('.quiz-opt', { hasText: '奧丁' }).click();
  await expect(q.locator('.quiz-result')).toContainText('答對了');
  await page.locator('#sec-quiz').screenshot({ path: 'test-results/norse-quiz.png' });
});

test('北歐：每張卡打得開、不橫向捲動、沒有壞圖', async ({ page }) => {
  for (const c of norse) {
    await page.goto('#/card/' + c.id);
    await expect(page.locator('h1').first()).toContainText(c.name_zh);
    await expect(page.locator('ol.sources li').first()).toBeVisible();
    await noHScroll(page);
    const broken = await page.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).length);
    expect(broken, c.id).toBe(0);
  }
});
