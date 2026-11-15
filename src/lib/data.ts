import raw from '../generated/site-data.json';
import type { Card, ImageItem, SiteData, TodayItem } from '../../scripts/lib/types';

export const site = raw as unknown as SiteData;
export const cardById = new Map<string, Card>(site.cards.map((c) => [c.id, c]));
export const imageById = new Map<string, ImageItem>(site.images.filter((i) => !i.pending).map((i) => [i.id, i]));
export const todayById = new Map<string, TodayItem>(site.today.map((t) => [t.id, t]));
export const eraById = new Map(site.eras.map((e) => [e.id, e]));

/** 圖片網址：http 開頭直接用，否則當作 public/ 底下的檔案 */
export function imgSrc(im: ImageItem): string {
  const u = im.kind === 'ai' ? (im.placeholder ? 'images/placeholders/ai-placeholder.svg' : im.file!) : im.file_url!;
  return /^https?:/.test(u) ? u : import.meta.env.BASE_URL + u.replace(/^\//, '');
}

/** 中華神話的卡片（其餘是希臘羅馬） */
export const isChinese = (c?: { myth_system: string[] }) => !!c?.myth_system.includes('chinese');

export const TYPE_ORDER = ['原始神', '泰坦', '神', '英雄', '凡人', '故事', '怪物', '地點', '物品'];

/** 卡片的「頭像」：第一張圖 */
export function avatarOf(c: Card): ImageItem | undefined {
  const id = c.images?.[0] ?? c.panels?.find((p) => p.image)?.image;
  return id ? imageById.get(id) : undefined;
}

/** 反向連結：哪些卡把我列為子女／父母／配偶 */
export function familyOf(id: string) {
  const c = cardById.get(id);
  const f = c?.family ?? {};
  type L = { id?: string; name?: string; variant?: string; src: string[]; from: string };
  const merge = (own: L[], extra: L[]) => {
    const seen = new Set(own.map((x) => x.id ?? x.name));
    return [...own, ...extra.filter((x) => !seen.has(x.id ?? x.name))];
  };
  const tag = (arr: { id?: string; name?: string; variant?: string; src: string[] }[] | undefined, from: string): L[] => (arr ?? []).map((x) => ({ ...x, from }));
  const parentsBack: L[] = [];
  const childrenBack: L[] = [];
  const consortsBack: L[] = [];
  const predBack: L[] = [];
  const succBack: L[] = [];
  const foesBack: L[] = [];
  for (const o of site.cards) {
    if (o.id === id) continue;
    for (const k of o.family?.successors ?? []) if (k.id === id) predBack.push({ id: o.id, variant: k.variant, src: k.src, from: o.id });
    for (const k of o.family?.predecessors ?? []) if (k.id === id) succBack.push({ id: o.id, variant: k.variant, src: k.src, from: o.id });
    for (const k of o.family?.foes ?? []) if (k.id === id) foesBack.push({ id: o.id, variant: k.variant, src: k.src, from: o.id });
    for (const k of o.family?.children ?? []) if (k.id === id) parentsBack.push({ id: o.id, variant: k.variant, src: k.src, from: o.id });
    for (const k of o.family?.parents ?? []) if (k.id === id) childrenBack.push({ id: o.id, variant: k.variant, src: k.src, from: o.id });
    for (const k of o.family?.consorts ?? []) if (k.id === id) consortsBack.push({ id: o.id, variant: k.variant, src: k.src, from: o.id });
  }
  return {
    parents: merge(tag(f.parents, id), parentsBack),
    consorts: merge(tag(f.consorts, id), consortsBack),
    children: merge(tag(f.children, id), childrenBack),
    predecessors: merge(tag(f.predecessors, id), predBack),
    successors: merge(tag(f.successors, id), succBack),
    foes: merge(tag(f.foes, id), foesBack),
  };
}
