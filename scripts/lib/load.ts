// 讀取 cards/ 與 data/ 底下的所有資料，給 validate 與 build-index 共用。
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import type { Card, Era, GreekRomanRow, HistoryRef, ImageItem, Place, RouteStop, SiteData, TodayItem, Topic } from './types.ts';

export const ROOT = path.resolve(import.meta.dirname, '..', '..');

function walk(dir: string, ext: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, ext));
    else if (e.name.endsWith(ext)) out.push(p);
  }
  return out.sort();
}

function readYaml<T>(rel: string, fallback: T): T {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return fallback;
  return (YAML.parse(fs.readFileSync(p, 'utf8')) ?? fallback) as T;
}

export function parseCard(file: string): Card {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`${path.relative(ROOT, file)}：找不到 YAML frontmatter（開頭與結尾都要有 ---）`);
  const fm = YAML.parse(m[1]) as Card;
  fm.body = m[2].trim();
  fm.file = path.relative(ROOT, file);
  return fm;
}

/** 把 GitHub Actions 從 Commons 抓回來的授權資料（data/commons/meta.json）併進圖片清單 */
function mergeCommons(images: ImageItem[]): ImageItem[] {
  const mf = path.join(ROOT, 'data', 'commons', 'meta.json');
  const meta: Record<string, { descriptionurl: string; license: string; license_url: string; author: string }> = fs.existsSync(mf) ? JSON.parse(fs.readFileSync(mf, 'utf8')) : {};
  return images.map((im) => {
    if (!im.commons) return im;
    const m = meta[im.id];
    if (!m) return { ...im, pending: true };
    return {
      ...im,
      file_url: `images/works/${im.id}.webp`,
      source_url: m.descriptionurl,
      license: m.license || im.license,
      license_url: m.license_url || im.license_url,
      credit: im.credit ?? (m.author ? `${m.author}／Wikimedia Commons` : 'Wikimedia Commons'),
    };
  });
}

export function loadAll(): SiteData {
  const cards = walk(path.join(ROOT, 'cards'), '.md').map(parseCard);
  const today = walk(path.join(ROOT, 'data', 'today'), '.yaml').flatMap((f) => (YAML.parse(fs.readFileSync(f, 'utf8')) ?? []) as TodayItem[]);
  return {
    cards,
    images: mergeCommons(readYaml<ImageItem[]>('data/images.yaml', [])),
    today,
    eras: readYaml<Era[]>('data/eras.yaml', []),
    history: readYaml<HistoryRef[]>('data/history.yaml', []),
    places: readYaml<Place[]>('data/places.yaml', []),
    topics: readYaml<Topic[]>('data/topics.yaml', []),
    greekRoman: readYaml<GreekRomanRow[]>('data/greek-roman.yaml', []),
    odysseyRoute: readYaml<RouteStop[]>('data/odyssey-route.yaml', []),
    builtAt: new Date().toISOString(),
  };
}
