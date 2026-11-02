// 檢查所有來源網址打不打得開（由 GitHub Actions 執行），結果寫到 data/commons/links.json。
import fs from 'node:fs';
import path from 'node:path';
import { loadAll, ROOT } from './lib/load.ts';

const data = loadAll();
const urls = new Map<string, string[]>();
const add = (u: string | undefined, where: string) => {
  if (!u || !/^https?:/.test(u)) return;
  if (!urls.has(u)) urls.set(u, []);
  urls.get(u)!.push(where);
};
for (const c of data.cards) for (const s of c.sources ?? []) add(s.url, `${c.id}/${s.id}`);
for (const t of data.today) for (const s of t.sources) add(s.url, t.id);
for (const p of data.places) for (const s of p.src) add(s.url, p.id);
for (const h of data.history) for (const s of h.src) add(s.url, h.label);
for (const r of data.odysseyRoute) for (const s of r.src) add(s.url, r.name);

const file = path.join(ROOT, 'data', 'commons', 'links.json');
const prev: Record<string, { status: number; checked: string }> = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
const out: Record<string, { status: number; checked: string; used: string[] }> = {};
const UA = 'Mozilla/5.0 (compatible; zl-myth-atlas link checker; +https://github.com/ZLO-25/zl-myth-atlas)';
const list = [...urls.keys()];
let i = 0;
async function worker() {
  while (i < list.length) {
    const u = list[i++];
    const old = prev[u];
    if (old && old.status >= 200 && old.status < 400) {
      out[u] = { ...old, used: urls.get(u)! };
      continue;
    }
    let status = 0;
    try {
      const r = await fetch(u, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(20000) });
      status = r.status;
    } catch {
      status = -1;
    }
    out[u] = { status, checked: new Date().toISOString().slice(0, 10), used: urls.get(u)! };
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify(out, null, 1));
const bad = Object.entries(out).filter(([, v]) => v.status < 200 || v.status >= 400);
console.log(`檢查 ${list.length} 個網址，打不開 ${bad.length} 個`);
for (const [u, v] of bad) console.log(`${v.status} ${u} ← ${v.used.join(', ')}`);
