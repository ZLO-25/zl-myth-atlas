// 替每張有實體檔的圖產生小縮圖 public/images/thumbs/<id>.webp（寬 480px），
// 卡片磚塊、小卡浮窗、族譜節點改載縮圖，手機滑卡片列表不必下載整批原圖。
// 縮圖是建置產物（已加進 .gitignore）；來源檔沒變就跳過，重跑很快。
// 跑完會把「有縮圖」的圖片在 src/generated/site-data.json 標上 thumb: true，必須接在 build-index 之後。
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { loadAll, ROOT } from './lib/load.ts';

const WIDTH = 480;
const QUALITY = 60; // 70 時手機滑完卡片頁的縮圖仍有 5.6 MB，降到 60 並用較慢的壓縮（effort 6），肉眼看不出差別
const outDir = path.join(ROOT, 'public', 'images', 'thumbs');
fs.mkdirSync(outDir, { recursive: true });

const data = loadAll();
let made = 0;
let skipped = 0;
let missing = 0;
const withThumb = new Set<string>();
for (const im of data.images) {
  // 作品圖只認 public/images/works/<id>.webp；AI 圖要不是佔位圖才有實體檔
  const rel = im.kind === 'work' ? (im.file_url === `images/works/${im.id}.webp` ? im.file_url : undefined) : im.placeholder ? undefined : im.file;
  if (!rel || im.pending) continue;
  const src = path.join(ROOT, 'public', rel);
  if (!fs.existsSync(src)) {
    missing++;
    continue;
  }
  const dest = path.join(outDir, `${im.id}.webp`);
  if (fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= fs.statSync(src).mtimeMs) {
    skipped++;
  } else {
    await sharp(src).resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY, effort: 6 }).toFile(dest);
    made++;
  }
  withThumb.add(im.id);
}

// 移除已不存在的圖留下的舊縮圖
for (const f of fs.readdirSync(outDir)) {
  if (f.endsWith('.webp') && !withThumb.has(f.slice(0, -5))) fs.rmSync(path.join(outDir, f));
}

// 在 site-data.json 標記哪些圖有縮圖（thumbSrc 靠它判斷）
const jf = path.join(ROOT, 'src', 'generated', 'site-data.json');
const site = JSON.parse(fs.readFileSync(jf, 'utf8')) as { images: { id: string; thumb?: boolean }[] };
for (const im of site.images) if (withThumb.has(im.id)) im.thumb = true;
fs.writeFileSync(jf, JSON.stringify(site));
console.log(`縮圖：新增 ${made}、略過 ${skipped}、來源檔不存在 ${missing}，共 ${withThumb.size} 張`);
