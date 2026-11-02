// 一次性工具：把看過圖之後寫下的作者、年代、館藏與「看點」寫回 data/images.yaml。
import fs from 'node:fs';
import { parseDocument } from 'yaml';
const file = 'data/images.yaml';
const patch: Record<string, Record<string, string>> = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const doc = parseDocument(fs.readFileSync(file, 'utf8'));
const seq: any = doc.contents;
const drop = new Set(Object.entries(patch).filter(([, v]) => v.drop).map(([k]) => k));
seq.items = seq.items.filter((it: any) => !drop.has(it.get('id')));
let n = 0;
for (const it of seq.items) {
  const p = patch[it.get('id')];
  if (!p) continue;
  for (const [k, v] of Object.entries(p)) it.set(k, v);
  n++;
}
fs.writeFileSync(file, doc.toString({ lineWidth: 0 }));
console.log(`更新 ${n} 筆，刪除 ${drop.size} 筆`);
