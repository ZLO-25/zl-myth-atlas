// 把 cards/ 與 data/ 編成一個 src/generated/site-data.json，讓網站一次載入。
import fs from 'node:fs';
import path from 'node:path';
import { loadAll, ROOT } from './lib/load.ts';

import * as OpenCC from 'opencc-js/t2cn';

const data = loadAll();
// 搜尋用：把每張卡的名字、別名轉成簡體一起存，輸入簡體也找得到（網站不必再下載轉換字典）
const t2cn = OpenCC.Converter({ from: 'tw', to: 'cn' }) as (s: string) => string;
for (const c of data.cards) {
  const keys = [c.name_zh, ...(c.aliases ?? []), c.roman?.name_zh ?? ''].filter(Boolean);
  c.search_simp = [...new Set(keys.map(t2cn).filter((k) => !keys.includes(k)))];
}
for (const t of data.today) t.search_simp = [t2cn(t.title)].filter((k) => k !== t.title);
const out = path.join(ROOT, 'src', 'generated');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'site-data.json'), JSON.stringify(data));
console.log(`已輸出 src/generated/site-data.json：卡片 ${data.cards.length}、圖片 ${data.images.length}、今日影子 ${data.today.length}`);
