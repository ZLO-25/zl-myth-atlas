// 依 data/today/*.yaml 的 cards 欄位，回填每張卡片 frontmatter 的 today: [...]
import fs from 'node:fs';
import path from 'node:path';
import { loadAll, ROOT } from './lib/load.ts';
const { cards, today } = loadAll();
const map = new Map<string, string[]>();
for (const t of today) for (const c of t.cards) map.set(c, [...(map.get(c) ?? []), t.id]);
let n = 0;
for (const c of cards) {
  const ids = map.get(c.id) ?? [];
  const file = path.join(ROOT, c.file!);
  const src = fs.readFileSync(file, 'utf8');
  const out = src.replace(/^today: \[.*\]$/m, `today: [${ids.join(', ')}]`);
  if (out !== src) { fs.writeFileSync(file, out); n++; }
}
console.log(`更新 ${n} 張卡片`);
