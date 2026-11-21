import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';

const site = JSON.parse(fs.readFileSync('src/generated/site-data.json', 'utf8'));
type C = { id: string; name_zh: string; body: string; myth_system: string[]; sources: { id: string }[] };
const norse: C[] = site.cards.filter((c: C) => c.myth_system.includes('norse'));
const DEMO = ['primordial-ymir', 'god-odin', 'god-thor', 'god-loki', 'story-ragnarok'];
// 最初的 15 張核心卡；北歐現在共 43 張，這 15 張必須還在
const CORE15 = [
  'primordial-ymir', 'god-odin', 'god-thor', 'god-loki', 'god-freyja', 'god-frigg', 'god-baldr', 'god-tyr',
  'god-heimdall', 'monster-fenrir', 'monster-jormungandr', 'place-yggdrasil', 'story-baldr-death', 'story-thor-bride', 'story-ragnarok',
];
const norseEras = site.eras.filter((e: { system?: string }) => e.system === 'norse').length;
const PATH7 = ['primordial-ymir', 'god-odin', 'god-thor', 'god-loki', 'story-thor-bride', 'story-baldr-death', 'story-ragnarok'];

const noHScroll = async (page: Page) => {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, '頁面不可橫向捲動').toBeLessThanOrEqual(1);
};

const brokenImages = (page: Page) =>
  page.evaluate(async () => {
    const imgs = [...document.images];
    imgs.forEach((i) => { i.loading = 'eager'; });
    await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = () => r(null); setTimeout(() => r(null), 4000); }))));
    return imgs.filter((i) => !i.complete || i.naturalWidth === 0).length;
  });

test('北歐 43 張卡都在（含最初 15 張），正文每句都標來源，來源代號都存在', () => {
  expect(norse.length).toBe(43);
  expect(norse.map((c) => c.id)).toEqual(expect.arrayContaining(CORE15));
  for (const c of norse) {
    // 正文每個段落都要標來源；``` 圍起來的 ASCII 圖表（對照表、流程圖）不是句子，不在此限，其內容由前後段落與來源清單負責
    let inFence = false;
    const lines = c.body.split('\n').filter((l) => {
      if (l.startsWith('```')) { inFence = !inFence; return false; }
      return !inFence && l.trim() && !l.startsWith('#');
    });
    for (const l of lines) expect(l, `${c.id} 這一段沒有標來源：${l.slice(0, 20)}`).toMatch(/\[s\d+\]/);
    const ids = new Set(c.sources.map((s) => s.id));
    for (const m of c.body.matchAll(/\[(s\d+)\]/g)) expect(ids.has(m[1]), `${c.id} 引用不存在的 ${m[1]}`).toBe(true);
  }
});

test('北歐：卡片列表可篩選「北歐」；沒有圖也正常顯示', async ({ page }) => {
  await page.goto('#/cards');
  await page.locator('.sys-tabs button', { hasText: '北歐' }).click();
  await expect(page).toHaveURL(/#\/cards\?sys=norse$/);
  await expect(page.locator('.card-grid .tile')).toHaveCount(norse.length);
  // 有圖的卡顯示封面，沒圖的顯示文字縮寫；兩者加起來等於全部（張數從資料算）
  const nImg = await page.locator('.card-grid .tile img').count();
  const nInit = await page.locator('.card-grid .tile .tile-initial').count();
  expect(nImg + nInit).toBe(norse.length);
  expect(nImg).toBeGreaterThanOrEqual(3);
  expect(nInit).toBeGreaterThan(0);
  for (const n of ['芙蕾雅', '芙麗嘉', '巴德爾', '提爾', '海姆達爾', '芬里爾', '耶夢加得', '世界樹', '巴德爾之死', '索爾扮新娘']) await expect(page.locator('.card-grid')).toContainText(n);
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

test('北歐：首頁有北歐新手路線（7 張），讀完會記已讀', async ({ page }) => {
  await page.goto('');
  await expect(page.getByRole('heading', { name: /北歐新手路線/ })).toBeVisible();
  const list = page.locator('section', { has: page.getByRole('heading', { name: /北歐新手路線/ }) });
  await expect(list.locator('ol.path li')).toHaveCount(7);
  await expect(list.locator('.path-count')).toContainText('已讀 0/7');
  await expect(list.locator('.path-continue')).toContainText('尤彌爾');
  await page.goto('#/card/god-odin');
  await expect(page.locator('aside.path-step')).toContainText('北歐新手路線第 2/7 張');
  await expect(page.locator('aside.path-step a.path-prev')).toContainText('尤彌爾');
  await expect(page.locator('aside.path-step a.path-next')).toContainText('索爾');
  await page.goto('');
  await expect(page.locator('.lead').first()).toContainText('北歐');
  await list.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/norse-path.png' });
});

test('北歐：新手路線 7 張，卡片頁的上一張／下一張照路線走到底', async ({ page }) => {
  await page.goto('#/card/' + PATH7[0]);
  for (let i = 0; i < PATH7.length; i++) {
    await expect(page).toHaveURL(new RegExp('#/card/' + PATH7[i] + '$'));
    const step = page.locator('aside.path-step').filter({ hasText: '北歐新手路線' });
    await expect(step).toContainText(`第 ${i + 1}/7 張`);
    if (i === 0) await expect(step.locator('a.path-prev')).toHaveCount(0);
    else await expect(step.locator('a.path-prev')).toHaveAttribute('href', new RegExp('#/card/' + PATH7[i - 1] + '$'));
    if (i === PATH7.length - 1) await expect(step.locator('a.path-next')).toHaveCount(0);
    else {
      await expect(step.locator('a.path-next')).toHaveAttribute('href', new RegExp('#/card/' + PATH7[i + 1] + '$'));
      await step.locator('a.path-next').click();
    }
  }
  await expect(page.locator('h1').first()).toContainText('諸神黃昏');
});

test('北歐：神話年代有北歐分頁，卡片的年代標籤會跳到北歐分頁', async ({ page }) => {
  await page.goto('#/timeline');
  await page.getByRole('button', { name: /北歐/ }).click();
  await expect(page.locator('ol.eras > li')).toHaveCount(norseEras);
  await expect(page.locator('#era-no-creation')).toContainText('尤彌爾');
  await expect(page.locator('#era-no-gods')).toContainText('洛基');
  await expect(page.locator('#era-no-ragnarok')).toContainText('諸神黃昏');
  await page.goto('#/card/god-thor');
  await page.locator('.era-chip').click();
  await expect(page).toHaveURL(/#\/timeline\?era=no-gods/);
  await expect(page.locator('ol.eras > li')).toHaveCount(norseEras);
  await expect(page.locator('#era-no-gods')).toContainText('索爾');
  await noHScroll(page);
});

test('北歐：族譜「北歐神話」模式以奧丁為中心，模式寫進網址', async ({ page }) => {
  await page.goto('#/family');
  await page.locator('.sys-tabs').getByRole('button', { name: '北歐' }).click();
  await expect(page).toHaveURL(/#\/family\/god-odin\?mode=norse$/);
  await expect(page.locator('.family-svg .fnode.role-focus')).toContainText('奧丁');
  await expect(page.locator('.family-svg .fname', { hasText: '包爾' })).toBeVisible();
  await expect(page.locator('.family-svg .fname', { hasText: '索爾' })).toBeVisible();
  await expect(page.locator('.family-svg .fname', { hasText: '芙麗嘉' })).toBeVisible();
  // 北歐角色陸續有肖像了，族譜節點可以有圖（不再要求 0 張）
  await page.reload();
  await expect(page.locator('.sys-tabs button.on')).toHaveText('北歐');
  // 點索爾 → 以索爾為中心，仍是北歐模式
  await page.locator('.family-svg .fnode.clickable', { hasText: '索爾' }).dispatchEvent('click');
  await expect(page).toHaveURL(/#\/family\/god-thor\?mode=norse$/);
  await expect(page.locator('.family-svg .fnode.role-focus')).toContainText('索爾');
  await expect(page.locator('.family-svg .fname', { hasText: '約爾德' })).toBeVisible();
  await page.goBack();
  await expect(page.locator('.family-svg .fnode.role-focus')).toContainText('奧丁');
  // 從卡片頁的「在族譜裡展開」進來，預設就是北歐模式
  await page.goto('#/family/god-loki');
  await expect(page.locator('.sys-tabs button.on')).toHaveText('北歐');
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
    const broken = await brokenImages(page);
    expect(broken, c.id).toBe(0);
  }
});

test('北歐：今日影子有 8 條北歐項目，連得回卡片，每條有「和原典差在哪」', async ({ page }) => {
  const norseToday = site.today.filter((t: { cards: string[] }) => t.cards.some((id) => CORE15.includes(id)));
  expect(norseToday.length).toBeGreaterThanOrEqual(8);
  for (const t of norseToday) {
    expect(t.diff.length, t.id).toBeGreaterThan(20);
    expect(t.sources.every((x: { url: string }) => /^https?:\/\//.test(x.url)), t.id).toBe(true);
  }
  await page.goto('#/today/tuesday-tyr');
  const hl = page.locator('.today-item.hl');
  await expect(hl).toContainText('星期二');
  await expect(hl.locator('.diff')).toContainText('和原典差在哪');
  await hl.locator('a', { hasText: '提爾' }).first().click();
  await expect(page).toHaveURL(/#\/card\/god-tyr$/);
  await expect(page.locator('#sec-today')).toContainText('星期二');
  // 卡片頁的「今日影子」連到那一條
  await page.goto('#/today');
  await page.locator('.today-filter').fill('漫威');
  await expect(page.locator('.today-item', { hasText: '漫威的索爾與洛基' })).toBeVisible();
  await page.goto('#/today/marvel-thor-loki');
  await expect(page.locator('.today-item.hl .diff')).toContainText('血盟兄弟');
});

test('北歐：對照頁有「三套神話對照」三方表格，跳轉鈕可用，手機版可橫滑', async ({ page, viewport }) => {
  await page.goto('#/compare');
  const btns = page.locator('.jump-btns button');
  await expect(btns).toHaveText(['三套神話對照', '中華與希臘羅馬', '希臘 vs 羅馬']);
  await btns.nth(0).click();
  await expect.poll(async () => (await page.locator('#norse-compare').boundingBox())!.y).toBeLessThan(250);
  const sec = page.locator('#norse-compare');
  await expect(sec.locator('h2')).toHaveText('三套神話對照');
  await expect(sec.locator('tbody tr')).toHaveCount(site.threeWay.length);
  expect(site.threeWay.length).toBeGreaterThanOrEqual(6);
  await expect(sec.locator('thead')).toContainText('北歐神話');
  for (const theme of ['世界怎麼開始', '世界會不會結束', '誰是主神', '愛搗蛋的角色', '大洪水', '龍']) await expect(sec).toContainText(theme);
  await expect(sec).toContainText('不是說哪一邊影響了哪一邊');
  await expect(sec).toContainText('沒有世界末日的故事');
  await expect(sec.locator('a[href="#/card/primordial-ymir"]').first()).toBeVisible();
  await expect(sec.locator('a[href="#/card/story-ragnarok"]')).toBeVisible();
  await expect(sec.locator('a[href="#/card/god-odin"]')).toBeVisible();
  await expect(sec.locator('a[href="#/card/god-loki"]')).toBeVisible();
  await noHScroll(page);
  if (viewport && viewport.width < 500) {
    await expect(sec.locator('.scroll-hint, .table-scroll').first()).toContainText('左右滑動');
    const wide = await sec.locator('table').evaluate((t) => t.getBoundingClientRect().width > window.innerWidth);
    expect(wide, '表格比螢幕寬，靠 ScrollTable 橫滑').toBe(true);
  }
  await sec.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/norse-compare.png' });
});

test('北歐：盤古卡的「尤彌爾」是連結；三句話裡的連結在搜尋與小卡裡是純文字', async ({ page }) => {
  await page.goto('#/card/primordial-pangu');
  const link = page.locator('.three-lines a', { hasText: '尤彌爾' });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/#\/card\/primordial-ymir$/);
  await page.goto('');
  const box = page.locator('.search input');
  await box.fill('盤古');
  await expect(page.locator('.search-results li').first()).toContainText('盤古');
  await expect(page.locator('.search-results')).not.toContainText('[[');
});

test('北歐：世界樹卡明講「九個世界沒有一致的名單」', async ({ page }) => {
  await page.goto('#/card/place-yggdrasil');
  await expect(page.locator('article')).toContainText('沒有列出名字');
  await expect(page.locator('#sec-disputed')).toContainText('九個世界');
  await expect(page.locator('#sec-disputed')).toContainText('後人整理');
  await page.screenshot({ path: 'test-results/norse-yggdrasil.png', fullPage: true });
});

test('北歐：三張故事卡有 5 格分格，沒有壞圖（還沒生圖的格子顯示佔位圖），可以翻頁', async ({ page }) => {
  for (const id of ['story-ragnarok', 'story-baldr-death', 'story-thor-bride']) {
    await page.goto('#/card/' + id);
    const panels = page.locator('#sec-panels');
    await expect(panels, id).toBeVisible();
    await expect(panels.locator('.panel-frame img').first()).toBeVisible();
    // 諸神黃昏 5 張都已生圖；巴德爾之死第 4 格、索爾扮新娘第 5 格還在等重生，仍是佔位圖
    const waiting: Record<string, number> = { 'story-baldr-death': 4, 'story-thor-bride': 5 };
    for (let n = 1; n <= 5; n++) {
      await panels.getByRole('button', { name: `第 ${n} 格` }).click();
      if (waiting[id] === n) await expect(panels, `${id} 第 ${n} 格`).toContainText('尚未生圖');
      else await expect(panels, `${id} 第 ${n} 格`).not.toContainText('尚未生圖');
    }
    await panels.getByRole('button', { name: '第 1 格' }).click();
    const broken = await brokenImages(page);
    expect(broken, id).toBe(0);
    await noHScroll(page);
  }
  await page.goto('#/card/story-baldr-death');
  await page.screenshot({ path: 'test-results/norse-story.png', fullPage: false });
});

test('北歐：搜尋 Odin／Thor／洛基 都找得到，Tyr 也找得到', async ({ page }) => {
  await page.goto('');
  const box = page.locator('.search input');
  const items = page.locator('.search-results li');
  for (const [q, n] of [['Odin', '奧丁'], ['Thor', '索爾'], ['洛基', '洛基'], ['Tyr', '提爾'], ['Yggdrasil', '世界樹'], ['Fenrir', '芬里爾'], ['Jormungand', '耶夢加得'], ['Heimdall', '海姆達爾'], ['Freyja', '芙蕾雅'], ['Frigg', '芙麗嘉'], ['Baldr', '巴德爾']]) {
    await box.fill(q);
    await expect(items.first(), q).toContainText(n);
  }
});
