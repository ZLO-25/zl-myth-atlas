import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';

// B 批：族譜、神話年代、地圖。三套神話並列，順序固定 希臘羅馬 → 北歐 → 中華。
const site = JSON.parse(fs.readFileSync('src/generated/site-data.json', 'utf8'));
const histOf = (k: string) => (site.history as { system?: string }[]).filter((h) => (h.system ?? 'west') === k);

const noHScroll = async (page: Page) => {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, '頁面不可橫向捲動').toBeLessThanOrEqual(1);
};

test('族譜：三顆體系分頁；選北歐沒有希臘的第二排；舊網址 ?mode=cn 仍是中華圖', async ({ page }) => {
  await page.goto('#/family');
  const tabs = page.locator('.sys-tabs button');
  await expect(tabs).toHaveText(['希臘羅馬', '北歐', '中華']);
  await expect(tabs.first()).toHaveAttribute('aria-pressed', 'true');
  // 希臘羅馬：有第二排四個看法，預設完整家譜
  const sub = page.getByRole('group', { name: '希臘羅馬族譜的看法' });
  await expect(sub.locator('button')).toHaveText(['完整家譜', '以一位為中心', '只看奧林帕斯十二神', '看英雄的血統']);
  await expect(page.locator('.family-svg .fname', { hasText: '蓋亞' })).toBeVisible();
  // 北歐
  await tabs.nth(1).click();
  await expect(page).toHaveURL(/#\/family\/god-odin\?mode=norse$/);
  await expect(page.locator('.family-svg .fnode.role-focus')).toContainText('奧丁');
  await expect(page.getByRole('group', { name: '希臘羅馬族譜的看法' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '完整家譜' })).toHaveCount(0);
  await expect(page.locator('.family-svg .fname', { hasText: '宙斯' })).toHaveCount(0);
  await noHScroll(page);
  // 中華
  await tabs.nth(2).click();
  await expect(page).toHaveURL(/#\/family\?mode=cn$/);
  await expect(page.locator('.family-svg .fname', { hasText: '蚩尤' })).toBeVisible();
  await expect(page.getByRole('group', { name: '希臘羅馬族譜的看法' })).toHaveCount(0);
  await expect(page.locator('.sys-tabs button').nth(2)).toHaveAttribute('aria-pressed', 'true');
  await noHScroll(page);
});

test('族譜：舊網址全部有效，直接開就停在對應的體系', async ({ page }) => {
  await page.goto('#/family?mode=cn');
  await expect(page.locator('.sys-tabs button').nth(2)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.family-svg .fname', { hasText: '蚩尤' })).toBeVisible();
  await page.goto('#/family/god-zeus?mode=twelve');
  await expect(page.locator('.sys-tabs button').first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '只看奧林帕斯十二神' })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('#/family?mode=hero&hero=hero-perseus');
  await expect(page.locator('.family-svg .fnode.role-focus')).toContainText('柏修斯');
  // 英雄清單只有希臘羅馬的英雄
  const opts = await page.locator('.family-sub select option').allInnerTexts();
  const heroes = (site.cards as { id: string; type: string; myth_system: string[] }[]).filter((c) => c.type === '英雄' && c.myth_system.every((m) => m === 'greek' || m === 'roman'));
  expect(opts.length).toBe(heroes.length);
  await page.goto('#/family/god-loki');
  await expect(page.locator('.sys-tabs button').nth(1)).toHaveAttribute('aria-pressed', 'true');
});

test('年代：三套都有「故事何時被寫下來」，每筆有來源，北歐與中華各至少 3 筆', async ({ page }) => {
  for (const [i, k] of ['west', 'norse', 'chinese'].entries()) {
    const want = histOf(k);
    expect(want.length, `${k} 筆數`).toBeGreaterThanOrEqual(3);
    await page.goto('#/timeline');
    await page.locator('.sys-tabs button').nth(i).click();
    await expect(page.getByRole('heading', { name: /真實歷史參照：故事何時被寫下來/ })).toBeVisible();
    await expect(page.locator('.hist-row')).toHaveCount(want.length);
    for (const row of await page.locator('.hist-row').all()) await expect(row.locator('.hist-text a').first()).toHaveAttribute('href', /^https?:\/\//);
  }
  // 北歐只出現北歐的書，不混進荷馬
  await page.goto('#/timeline');
  await page.locator('.sys-tabs button').nth(1).click();
  await expect(page.locator('.hist-row', { hasText: '斯諾里寫《散文埃達》' })).toBeVisible();
  await expect(page.locator('.hist-row', { hasText: '荷馬' })).toHaveCount(0);
  await noHScroll(page);
});

test('年代：舊網址 ?era=no-creation、cn-creation、heroes 仍切到對應體系並強調', async ({ page }) => {
  await page.goto('#/timeline?era=no-creation');
  await expect(page.locator('.sys-tabs button').nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#era-no-creation')).toBeVisible();
  await page.goto('#/timeline?era=cn-creation');
  await expect(page.locator('.sys-tabs button').nth(2)).toHaveAttribute('aria-pressed', 'true');
  await page.goto('#/timeline?era=heroes');
  await expect(page.locator('.sys-tabs button').first()).toHaveAttribute('aria-pressed', 'true');
});

test('地圖：三套都有兩個子分頁，網址帶體系與子分頁，沒參數是希臘羅馬真實地圖', async ({ page }) => {
  await page.goto('#/map');
  await expect(page.locator('.sys-tabs button')).toHaveText(['希臘羅馬', '北歐', '中華']);
  await expect(page.getByRole('button', { name: '真實地圖：地中海' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.leaflet-box')).toBeVisible();
  await expect(page.getByRole('button', { name: '神話世界：冥界' })).toBeVisible();
  for (const [k, real, myth] of [['norse', '真實地圖：冰島與瑞典', '神話世界：世界樹'], ['chinese', '真實地圖：中國', '神話世界：古書裡的仙境']]) {
    await page.goto(`#/map?sys=${k}`);
    await expect(page.getByRole('button', { name: real })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: myth })).toBeVisible();
    await page.getByRole('button', { name: myth }).click();
    await expect(page).toHaveURL(new RegExp(`#/map\\?sys=${k}&view=myth$`));
  }
  await noHScroll(page);
});

test('地圖：#/map?sys=chinese 顯示中國地圖，列出中華的地點、不含希臘', async ({ page }) => {
  await page.goto('#/map?sys=chinese');
  await expect(page.locator('.leaflet-box')).toBeVisible();
  await expect(page.locator('.place-list')).toContainText('涿鹿');
  await expect(page.locator('.place-list')).not.toContainText('德爾菲');
  await expect(page.locator('.place-list li')).toHaveCount((site.places as { system?: string }[]).filter((p) => p.system === 'chinese').length);
});

test('地圖：北歐真實地圖列出北歐地點，每筆有卡片連結與來源', async ({ page }) => {
  await page.goto('#/map?sys=norse&view=real');
  await expect(page.locator('.leaflet-box')).toBeVisible();
  const n = (site.places as { system?: string }[]).filter((p) => p.system === 'norse').length;
  expect(n).toBeGreaterThanOrEqual(2);
  await expect(page.locator('.place-list li')).toHaveCount(n);
  await expect(page.locator('.place-list')).toContainText('雷克霍特');
  await expect(page.locator('.place-list')).toContainText('舊烏普薩拉');
  await expect(page.locator('.place-list')).not.toContainText('德爾菲');
  for (const p of (site.places as { system?: string; cards: string[]; src: unknown[]; lat: number }[]).filter((p) => p.system === 'norse')) {
    expect(p.cards.length).toBeGreaterThanOrEqual(1);
    expect(p.src.length).toBeGreaterThanOrEqual(1);
    expect(typeof p.lat).toBe('number');
  }
});

test('地圖：北歐神話世界有世界樹示意圖，只畫卡片寫到的東西，不畫九界，文字不超出框', async ({ page }) => {
  await page.goto('#/map?sys=norse&view=myth');
  const svg = page.locator('svg.yggdrasil');
  await expect(svg).toBeVisible();
  for (const t of ['世界樹', '松鼠', '拉塔托斯克', '四頭鹿', '尼德霍格', '諾恩女神', '烏爾德之泉', '密米爾之泉', '鷹', '隼']) await expect(svg).toContainText(t);
  for (const t of ['阿斯嘉特', '米德加爾德', '約頓海姆', '華納海姆']) await expect(svg).not.toContainText(t);
  await expect(page.getByText('沒有一致的名單').first()).toBeVisible();
  await expect(page.locator('.realm-names li')).toHaveCount(8);
  await expect(page.getByText('欺騙古魯菲')).toBeVisible();
  await expect(page.locator('a[href="#/card/place-yggdrasil"]').first()).toBeVisible();
  // 每段文字都要在自己的框裡（SVG 座標），且整張圖在 viewBox 內
  const bad = await svg.evaluate((el) => {
    const s = el as unknown as SVGSVGElement;
    const vb = s.viewBox.baseVal;
    const rects = [...s.querySelectorAll('rect')].map((r) => (r as SVGGraphicsElement).getBBox());
    const out: string[] = [];
    s.querySelectorAll('text').forEach((t) => {
      const b = (t as SVGGraphicsElement).getBBox();
      const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      const host = rects.find((r) => cx >= r.x && cx <= r.x + r.width && cy >= r.y && cy <= r.y + r.height);
      if (!host || b.x < host.x + 2 || b.x + b.width > host.x + host.width - 2 || b.y < host.y || b.y + b.height > host.y + host.height) out.push(t.textContent ?? '');
      if (b.x < vb.x || b.x + b.width > vb.x + vb.width) out.push('出界：' + t.textContent);
    });
    return out;
  });
  expect(bad, '文字超出框').toEqual([]);
  await noHScroll(page);
});

test('地圖：中華神話世界只列清單、連到卡片、不畫圖', async ({ page }) => {
  await page.goto('#/map?sys=chinese&view=myth');
  await expect(page.getByText('沒有真實位置，所以不畫在地圖上')).toBeVisible();
  await expect(page.locator('.myth-world-list li')).toHaveCount(3);
  for (const id of ['place-kunlun', 'place-fusang', 'story-buzhou']) await expect(page.locator(`.myth-world-list a[href="#/card/${id}"]`).first()).toBeVisible();
  await expect(page.locator('svg.yggdrasil, svg.underworld')).toHaveCount(0);
  await expect(page.locator('.leaflet-box')).toHaveCount(0);
  await noHScroll(page);
});

test('地圖：希臘羅馬冥界示意圖還在；首頁地圖磚的說法符合實際', async ({ page }) => {
  await page.goto('#/map?sys=west&view=myth');
  await expect(page.locator('svg.underworld')).toBeVisible();
  await page.goto('#/');
  await expect(page.locator('a[href="#/map"]', { hasText: '真實地點' })).toContainText('地中海、北歐、中國的真實地點');
});
