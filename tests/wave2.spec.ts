import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';

const site = JSON.parse(fs.readFileSync('src/generated/site-data.json', 'utf8'));
type C = { id: string; name_zh: string; name_en: string; aliases: string[]; roman?: { name_zh: string; name_la: string; name_en?: string } };

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

test('第二波 3：考考自己，題目自動產生、遮掉名字、選了立刻看對錯、可以重做', async ({ page }) => {
  await page.goto('#/card/god-zeus');
  const quiz = page.locator('section#sec-quiz');
  await expect(quiz.locator('h2')).toHaveText('考考自己');
  await expect(quiz.locator('.quiz-q')).toHaveCount(3);
  await expect(page.locator('.toc a', { hasText: '考考自己' })).toBeVisible();
  // 放在來源之前
  expect((await quiz.boundingBox())!.y).toBeLessThan((await page.locator('#sec-sources').boundingBox())!.y);
  const q1 = quiz.locator('.quiz-q').nth(0);
  const stem = await q1.locator('.quiz-stem').innerText();
  expect(stem).toContain('＿＿');
  expect(stem).not.toMatch(/宙斯|Zeus|Jupiter|朱比特/i);
  await expect(q1.locator('.quiz-opt')).toHaveCount(4);
  const labels = await q1.locator('.quiz-opt').allInnerTexts();
  expect(labels.some((l) => l.trim() === '宙斯')).toBe(true);

  // 答錯：顯示正解
  await q1.locator('.quiz-opt', { hasNotText: '宙斯' }).first().click();
  await expect(q1.locator('.quiz-result')).toContainText('答錯了，正解是「宙斯」');
  await expect(q1.locator('.quiz-opt.right')).toContainText('宙斯');
  await expect(q1.locator('.quiz-opt.wrong')).toHaveCount(1);
  await expect(q1.locator('.quiz-opt:not([disabled])')).toHaveCount(0);
  // 答對
  const q2 = quiz.locator('.quiz-q').nth(1);
  await q2.locator('.quiz-opt', { hasText: '宙斯' }).click();
  await expect(q2.locator('.quiz-result')).toContainText('答對了');
  // 第三題是今日影子，答完附連結
  const q3 = quiz.locator('.quiz-q').nth(2);
  await q3.locator('.quiz-opt').first().click();
  await expect(q3.locator('.quiz-result a')).toHaveAttribute('href', /#\/today\//);
  await expect(quiz.locator('.quiz-foot')).toContainText('/ 3 題');
  // 重做
  await quiz.getByRole('button', { name: '重做' }).click();
  await expect(quiz.locator('.quiz-result')).toHaveCount(0);
  await expect(quiz.locator('.quiz-opt:not([disabled])')).toHaveCount(12);

  // 同一張卡每次題目與選項順序都一樣
  const snap = () => quiz.locator('.quiz-q').evaluateAll((qs) => qs.map((q) => q.textContent));
  const before = await snap();
  await page.reload();
  expect(await snap()).toEqual(before);
});

test('第二波 3：中華卡也有題目；資料不夠的卡不顯示這一區', async ({ page }) => {
  await page.goto('#/card/primordial-nuwa');
  const q = page.locator('section#sec-quiz .quiz-q').first();
  await expect(q.locator('.quiz-stem')).not.toContainText('女媧');
  const labels = await q.locator('.quiz-opt').allInnerTexts();
  expect(labels).toContain('女媧');
  // 一句話裡沒有名字的卡：略過「看一句話」那題，沒有其他題型時整區不出現
  const noName = site.cards.filter((c: C & { hook: string }) => !c.hook.includes(c.name_zh));
  expect(noName.length).toBeGreaterThan(0);
  await page.goto('#/card/story-buzhou');
  await expect(page.locator('h1').first()).toContainText('不周山');
  await expect(page.locator('#sec-quiz')).toHaveCount(0);
  await expect(page.locator('.toc a', { hasText: '考考自己' })).toHaveCount(0);
});

test('第二波 3：全部卡片的題目都遮掉名字與別名，錯誤選項不含正解的別名', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('');
  for (const c of site.cards as C[]) {
    await page.evaluate((id) => (location.hash = '#/card/' + id), c.id);
    await expect(page.locator('article.card-page h1').first()).toContainText(c.name_zh);
    const qs = await page.locator('#sec-quiz .quiz-q').evaluateAll((els) =>
      els.map((e) => ({ stem: e.querySelector('.quiz-stem')!.textContent ?? '', opts: [...e.querySelectorAll('.quiz-opt')].map((o) => (o.textContent ?? '').trim()) })),
    );
    expect(qs.length, c.id).toBeLessThanOrEqual(3);
    const names = [c.name_zh, c.name_en, ...c.aliases, c.roman?.name_zh, c.roman?.name_la, c.roman?.name_en].filter((x): x is string => !!x && x.length > 0);
    for (const q of qs) {
      expect(q.opts.length, c.id).toBe(4);
      expect(new Set(q.opts).size, c.id).toBe(4);
      expect(q.opts, c.id).toContain(c.name_zh);
      for (const n of names) {
        if (/^[\x00-\x7f]+$/.test(n)) expect(q.stem.toLowerCase().includes(n.toLowerCase()) && new RegExp(`(?<![A-Za-z])${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z])`, 'i').test(q.stem), `${c.id} 題幹漏了 ${n}`).toBe(false);
        else expect(q.stem.includes(n), `${c.id} 題幹漏了 ${n}`).toBe(false);
      }
      // 錯誤選項不能是正解的別名或羅馬名
      for (const o of q.opts.filter((x) => x !== c.name_zh)) {
        expect(names.map((n) => n.toLowerCase()), `${c.id} 錯誤選項 ${o} 是正解的別名`).not.toContain(o.toLowerCase());
      }
    }
  }
});

test('第二波 4：分格故事可以切成只看圖、蓋住說明，每格能翻開看原文', async ({ page }) => {
  await page.goto('#/card/story-pandora');
  const panels = page.locator('[aria-label="分格故事"]');
  const toggle = panels.getByRole('button', { name: /講給別人聽/ });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(panels.locator('.panel-text')).toBeVisible();
  const text1 = await panels.locator('.panel-text').innerText();

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(panels.locator('.panel-text')).toHaveCount(0);
  await expect(panels.locator('.panel-frame img').first()).toBeVisible(); // 圖還在
  const reveal = panels.getByRole('button', { name: '翻開看原文' });
  await expect(reveal).toHaveAttribute('aria-expanded', 'false');
  expect((await reveal.boundingBox())!.height).toBeGreaterThanOrEqual(24);
  await reveal.click();
  await expect(panels.locator('.panel-text')).toHaveText(text1);

  // 下一格仍然是蓋住的：每格各自翻開
  await panels.getByRole('button', { name: '下一格' }).click();
  await expect(panels.locator('.panel-text')).toHaveCount(0);
  await expect(panels.getByRole('button', { name: '翻開看原文' })).toBeVisible();
  // 回第一格：剛翻開的還開著，可以再蓋起來
  await panels.getByRole('button', { name: '上一格' }).click();
  await expect(panels.locator('.panel-text')).toBeVisible();
  await panels.getByRole('button', { name: '再蓋起來' }).click();
  await expect(panels.locator('.panel-text')).toHaveCount(0);

  // 關掉模式：說明文字回來
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(panels.locator('.panel-text')).toHaveText(text1);
  await noHScroll(page);
  // 沒有分格故事的卡沒有這個按鈕
  const noPanels = site.cards.find((c: C & { panels?: unknown[] }) => !c.panels?.length);
  expect(noPanels).toBeTruthy();
  await page.goto('#/card/' + noPanels.id);
  await expect(page.locator('article.card-page h1').first()).toContainText(noPanels.name_zh);
  await expect(page.getByRole('button', { name: /講給別人聽/ })).toHaveCount(0);
});

test('第二波 5：今日影子預設收合，點了展開，可篩選，單條連結進來是展開的', async ({ page, viewport }) => {
  await page.goto('#/today');
  const items = page.locator('.today-list .today-item');
  expect(await items.count()).toBe(site.today.length);
  // 預設全部收合：看不到「和原典差在哪」，每條只有按鈕與第一句
  await expect(page.locator('.today-item .diff')).toHaveCount(0);
  const first = items.first();
  const btn = first.getByRole('button', { name: '展開' });
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  expect((await btn.boundingBox())!.height).toBeGreaterThanOrEqual(24);
  // 頁面高度：手機上原本約 31,000px，收合後要短得多
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(h, '收合後頁面高度').toBeLessThan(viewport!.width < 500 ? 15000 : 8000);
  // 展開：說明、和原典差在哪、相關卡片、來源都在
  await btn.click();
  await expect(first.getByRole('button', { name: '收合' })).toHaveAttribute('aria-expanded', 'true');
  await expect(first.locator('.diff')).toContainText('和原典差在哪');
  await expect(first).toContainText('相關卡片：');
  await expect(first).toContainText('來源：');
  await first.getByRole('button', { name: '收合' }).click();
  await expect(first.locator('.diff')).toHaveCount(0);

  // 篩選
  const box = page.getByLabel('篩選今日影子');
  await box.fill('Nike');
  await expect.poll(() => items.count()).toBeLessThan(site.today.length);
  expect(await items.count()).toBeGreaterThan(0);
  await expect(page.locator('.today-count')).toContainText('共');
  await box.fill('完全不存在的詞xyzzy');
  await expect(items).toHaveCount(0);
  await expect(page.getByText('沒有符合的梗')).toBeVisible();
  await box.fill('');
  await expect(items).toHaveCount(site.today.length);

  // 全部展開
  await page.getByRole('button', { name: '全部展開' }).click();
  expect(await page.locator('.today-item .diff').count()).toBe(site.today.length);
  await page.getByRole('button', { name: '全部收合' }).click();
  await expect(page.locator('.today-item .diff')).toHaveCount(0);

  // 單條連結：那一條是展開的
  const t = site.today[3];
  await page.goto('#/today/' + t.id);
  const hl = page.locator('.today-item.hl');
  await expect(hl).toContainText(t.title);
  await expect(hl.locator('.diff')).toBeVisible();
  await expect(hl).toContainText('相關卡片：');
  await noHScroll(page);
});

test('第二波 5：今日影子「猜猜看」四選一，答完顯示說明，標題裡的名字被遮掉', async ({ page }) => {
  await page.goto('#/today');
  await page.getByRole('button', { name: '猜猜看' }).click();
  await expect(page.locator('.today-list')).toHaveCount(0);
  const q = page.locator('.guess-box .quiz-q');
  await expect(q).toBeVisible();
  await expect(q.locator('.quiz-opt')).toHaveCount(4);
  const stem = await q.locator('.quiz-stem').innerText();
  expect(stem.length).toBeGreaterThan(0);
  // 答完才出現說明與下一題
  await expect(page.locator('.guess-explain')).toHaveCount(0);
  await q.locator('.quiz-opt').first().click();
  await expect(q.locator('.quiz-result')).toBeVisible();
  await expect(page.locator('.guess-explain .diff')).toContainText('和原典差在哪');
  await page.getByRole('button', { name: '下一題' }).click();
  await expect(page.locator('.guess-explain')).toHaveCount(0);
  await expect(page.locator('.guess-box .quiz-stem')).not.toHaveText(stem);
  // 分類篩選也套用在猜猜看
  await page.getByRole('button', { name: '時間', exact: true }).click();
  await expect(page.locator('.guess-box .muted.small').first()).toContainText('分類：時間');
  // 切回逐條看
  await page.getByRole('button', { name: '逐條看' }).click();
  await expect(page.locator('.today-list')).toHaveCount(1);
  await noHScroll(page);
});

test('第二波 6：隱藏原文開關：預設顯示原文，切換後全站只剩中文與英文，並記住', async ({ page }) => {
  const greek = /[Ͱ-Ͽἀ-῿]/;
  const toggle = page.locator('button.orig-toggle');
  // 預設：和以前一樣，有原文
  await page.goto('#/card/god-zeus');
  await expect(toggle).toHaveText('隱藏原文');
  await expect(page.locator('h1').first()).toContainText('Ζεύς');
  await expect(page.locator('.name-orig')).toContainText('原文：');
  await page.goto('#/cards');
  await expect(page.locator('a.tile', { hasText: '宙斯' }).first()).toContainText('Zeus（Ζεύς）');

  // 切換（不重新整理）
  await toggle.click();
  await expect(toggle).toHaveText('顯示原文');
  const tile = page.locator('a.tile', { hasText: '宙斯' }).first();
  await expect(tile).toContainText('Zeus');
  expect(await tile.innerText()).not.toMatch(greek);
  expect(await tile.innerText()).not.toContain('Ζεύς');
  expect(await page.locator('.card-grid').first().innerText()).not.toMatch(greek);
  await page.goto('#/card/god-zeus');
  await expect(page.locator('h1').first()).toContainText('宙斯');
  await expect(page.locator('h1').first()).toContainText('Zeus');
  expect(await page.locator('h1').first().innerText()).not.toMatch(greek);
  await expect(page.locator('.name-orig')).not.toContainText('原文：');
  await expect(page.locator('.name-orig')).toContainText('羅馬：');
  // 中華卡：拼音括號也拿掉
  await page.goto('#/card/primordial-nuwa');
  expect(await page.locator('h1').first().innerText()).not.toContain('（');
  // 族譜與對照表
  await page.goto('#/compare');
  await expect(page.locator('th', { hasText: '希臘原文' })).toBeHidden();
  expect(await page.locator('table.compare').first().innerText()).not.toMatch(greek);
  await page.goto('#/family');
  await expect(page.locator('.family-svg .fname', { hasText: '蓋亞' })).toBeVisible();
  expect(await page.locator('.family-svg .forig').evaluateAll((els) => els.every((e) => getComputedStyle(e).display === 'none'))).toBe(true);

  // 重新整理還記得；再切回來就恢復原樣
  await page.reload();
  await expect(toggle).toHaveText('顯示原文');
  await toggle.click();
  await expect(toggle).toHaveText('隱藏原文');
  await page.goto('#/compare');
  await expect(page.locator('th', { hasText: '希臘原文' })).toBeVisible();
  await page.goto('#/card/god-zeus');
  await expect(page.locator('h1').first()).toContainText('Ζεύς');
  await noHScroll(page);
});

test('第二波 6：讀不到 localStorage 時開關照樣能用', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
  });
  await page.goto('#/card/god-zeus');
  await page.locator('button.orig-toggle').click();
  expect(await page.locator('h1').first().innerText()).not.toMatch(/[Ͱ-Ͽἀ-῿]/);
});

test('第二波 7：總覽每幕結尾先問問題，按「看答案」才展開回顧', async ({ page }) => {
  await page.goto('#/overview');
  const recaps = page.locator('aside.recap');
  await expect(recaps).toHaveCount(17); // 希臘羅馬 8＋北歐 4＋中華 5
  // 預設：每一幕都只有問題與按鈕，沒有答案
  await expect(page.getByText('讀到這裡你已經知道')).toHaveCount(0);
  for (const r of await recaps.all()) {
    await expect(r.locator('.recap-q')).toContainText('先想一想');
    expect((await r.locator('.recap-q').innerText()).length).toBeGreaterThan(12);
    await expect(r.getByRole('button', { name: '看答案' })).toHaveAttribute('aria-expanded', 'false');
  }
  // 問題在回顧之前（問題文字出現在答案文字之前）
  const first = recaps.first();
  const btn = first.getByRole('button', { name: '看答案' });
  expect((await btn.boundingBox())!.height).toBeGreaterThanOrEqual(24);
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await expect(first.getByRole('button', { name: '收起答案' })).toHaveAttribute('aria-expanded', 'true');
  await expect(first.locator('.recap-body')).toContainText('讀到這裡你已經知道');
  await expect(first.locator('.recap-body li')).toHaveCount(3);
  const qY = (await first.locator('.recap-q').boundingBox())!.y;
  const bodyY = (await first.locator('.recap-body').boundingBox())!.y;
  expect(qY).toBeLessThan(bodyY);
  // 其他幕不受影響
  await expect(page.getByText('讀到這裡你已經知道')).toHaveCount(1);
  // 再按一次收起
  await first.getByRole('button', { name: '收起答案' }).click();
  await expect(page.getByText('讀到這裡你已經知道')).toHaveCount(0);
  await noHScroll(page);
});
