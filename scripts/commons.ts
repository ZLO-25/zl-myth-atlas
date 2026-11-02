// 用 Wikimedia Commons API 取得圖片授權資料並下載成 WebP。
// 由 GitHub Actions（.github/workflows/commons.yml）執行，因為部分雲端開發環境連不到 Commons。
//
//   1. data/commons-queries.yaml 的每個搜尋 → 候選圖清單寫到 data/commons/candidates.json（給人挑圖用）
//   2. data/images.yaml 裡有 commons: File:… 的圖 → 授權資料寫到 data/commons/meta.json，
//      圖檔縮成寬 1200px 的 WebP 存到 public/images/works/<id>.webp
//
// 授權、署名一律以 API 回傳為準，不自己猜。
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import YAML from 'yaml';
import { ROOT } from './lib/load.ts';

const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'zl-myth-atlas/0.1 (https://github.com/ZLO-25/zl-myth-atlas; educational, non-commercial)';
const outDir = path.join(ROOT, 'data', 'commons');
fs.mkdirSync(outDir, { recursive: true });

const strip = (html?: string) =>
  (html ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

async function api(params: Record<string, string>) {
  const u = new URL(API);
  for (const [k, v] of Object.entries({ format: 'json', formatversion: '2', ...params })) u.searchParams.set(k, v);
  for (let i = 0; i < 4; i++) {
    const r = await fetch(u, { headers: { 'User-Agent': UA } });
    if (r.ok) return r.json();
    await new Promise((res) => setTimeout(res, 1500 * (i + 1)));
  }
  throw new Error(`Commons API 失敗：${u}`);
}

interface Meta {
  file: string;
  descriptionurl: string;
  original: string;
  thumb: string;
  width: number;
  height: number;
  license: string;
  license_url: string;
  author: string;
  credit: string;
  date: string;
  description: string;
  object: string;
  restrictions: string;
}

function toMeta(p: any): Meta | null {
  const ii = p.imageinfo?.[0];
  if (!ii) return null;
  const m = ii.extmetadata ?? {};
  return {
    file: p.title,
    descriptionurl: ii.descriptionurl,
    original: ii.url,
    thumb: ii.thumburl ?? ii.url,
    width: ii.width,
    height: ii.height,
    license: strip(m.LicenseShortName?.value),
    license_url: strip(m.LicenseUrl?.value),
    author: strip(m.Artist?.value),
    credit: strip(m.Credit?.value),
    date: strip(m.DateTimeOriginal?.value),
    description: strip(m.ImageDescription?.value).slice(0, 600),
    object: strip(m.ObjectName?.value),
    restrictions: strip(m.Restrictions?.value),
  };
}

async function candidates() {
  const qf = path.join(ROOT, 'data', 'commons-queries.yaml');
  if (!fs.existsSync(qf)) return;
  const queries = (YAML.parse(fs.readFileSync(qf, 'utf8')) ?? []) as { key: string; q: string }[];
  const cf = path.join(outDir, 'candidates.json');
  const prev: Record<string, Meta[]> = fs.existsSync(cf) ? JSON.parse(fs.readFileSync(cf, 'utf8')) : {};
  const out: Record<string, Meta[]> = {};
  for (const { key, q } of queries) {
    if (prev[key]?.length) {
      out[key] = prev[key];
      continue;
    }
    const j = await api({ action: 'query', generator: 'search', gsrnamespace: '6', gsrsearch: q, gsrlimit: '10', prop: 'imageinfo', iiprop: 'url|extmetadata|size', iiurlwidth: '400' });
    const pages = (j.query?.pages ?? []).sort((a: any, b: any) => a.index - b.index);
    out[key] = pages.map(toMeta).filter(Boolean);
    console.log(`搜尋 ${key}：${out[key].length} 張`);
  }
  fs.writeFileSync(cf, JSON.stringify(out, null, 1));
}

async function fetchImages() {
  const images = (YAML.parse(fs.readFileSync(path.join(ROOT, 'data', 'images.yaml'), 'utf8')) ?? []) as { id: string; commons?: string }[];
  const mf = path.join(outDir, 'meta.json');
  const meta: Record<string, Meta> = fs.existsSync(mf) ? JSON.parse(fs.readFileSync(mf, 'utf8')) : {};
  const imgDir = path.join(ROOT, 'public', 'images', 'works');
  fs.mkdirSync(imgDir, { recursive: true });
  const missing: string[] = [];
  for (const im of images) {
    if (!im.commons) continue;
    const file = im.commons.startsWith('File:') ? im.commons : `File:${im.commons}`;
    const webp = path.join(imgDir, `${im.id}.webp`);
    if (meta[im.id]?.file === file.replace(/_/g, ' ') && fs.existsSync(webp)) continue;
    const j = await api({ action: 'query', titles: file, prop: 'imageinfo', iiprop: 'url|extmetadata|size', iiurlwidth: '1200' });
    const p = j.query?.pages?.[0];
    const m = p && !p.missing ? toMeta(p) : null;
    if (!m) {
      missing.push(`${im.id}：${file}`);
      continue;
    }
    const r = await fetch(m.thumb, { headers: { 'User-Agent': UA } });
    if (!r.ok) {
      missing.push(`${im.id}：下載失敗 ${r.status}`);
      continue;
    }
    const buf = Buffer.from(await r.arrayBuffer());
    await sharp(buf).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 80 }).toFile(webp);
    meta[im.id] = m;
    console.log(`下載 ${im.id} ← ${m.file}（${m.license}）`);
  }
  fs.writeFileSync(mf, JSON.stringify(meta, null, 1));
  fs.writeFileSync(path.join(outDir, 'missing.txt'), missing.join('\n') + '\n');
  if (missing.length) console.log(`找不到 ${missing.length} 張：\n${missing.join('\n')}`);
}

await candidates();
await fetchImages();
