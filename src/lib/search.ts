import Fuse from 'fuse.js';
import { site } from './data';

export interface Hit {
  kind: 'card' | 'today';
  id: string;
  title: string;
  sub: string;
}

const entries: (Hit & { keys: string[] })[] = [
  ...site.cards.map((c) => ({
    kind: 'card' as const,
    id: c.id,
    title: c.name_zh,
    sub: [c.type, c.name_en, c.roman ? `羅馬：${c.roman.name_zh}` : ''].filter(Boolean).join('｜'),
    keys: [c.name_zh, c.name_en, c.name_orig, ...(c.aliases ?? []), c.roman?.name_zh ?? '', c.roman?.name_la ?? '', c.roman?.name_en ?? '', ...(c.search_simp ?? [])].filter(Boolean),
  })),
  ...site.today.map((t) => ({ kind: 'today' as const, id: t.id, title: t.title, sub: `今日影子｜${t.category}`, keys: [t.title, ...(t.search_simp ?? [])] })),
];

const fuse = new Fuse(entries, { keys: ['keys'], threshold: 0.32, ignoreLocation: true, includeScore: true });

export function search(q: string): Hit[] {
  q = q.trim();
  if (!q) return [];
  return fuse.search(q, { limit: 12 }).map((r) => r.item);
}
