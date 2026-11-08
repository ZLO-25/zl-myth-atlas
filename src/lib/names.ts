// 名稱格式：中文 English（原文），例如「宙斯 Zeus（Ζεύς）」「朱比特 Jupiter（Iuppiter）」。
// 卡片的 name_orig 寫成「原文 / 拉丁字母轉寫」（Ζεύς / Zeus），這裡只取斜線前的原文。
// 沒有卡片的人物（族譜裡的配偶、子女）查 data/names.yaml。
import type { Card } from '../../scripts/lib/types';
import { site } from './data';

export interface NameParts {
  zh: string;
  en?: string;
  orig?: string;
}

/** 原文：取「Ζεύς / Zeus」斜線前那段 */
export function origOf(nameOrig?: string): string | undefined {
  const o = nameOrig?.split(' / ')[0]?.trim();
  return o || undefined;
}

/** 原文是哪種文字：用來在卡片頁標「希臘文」「拉丁文」 */
export function origLang(orig: string, systems: string[] = []): string {
  if (/[Ͱ-Ͽἀ-῿]/.test(orig)) return '希臘文';
  if (/[一-鿿]/.test(orig)) return '漢字';
  if (systems.includes('norse') || /[ðþæǫ]/i.test(orig)) return '古諾斯語';
  return '拉丁文';
}

/** 原文和中文名一樣（中華神話「女媧 / Nǚwā」）時，括號改放斜線後的拼音：女媧 Nuwa（Nǚwā） */
export function cardNames(c: Card): NameParts {
  const orig = origOf(c.name_orig);
  const translit = c.name_orig?.split(' / ')[1]?.trim();
  return { zh: c.name_zh, en: c.name_en, orig: orig === c.name_zh && translit ? translit : orig };
}

export function romanNames(c: Card): NameParts | undefined {
  if (!c.roman) return undefined;
  return { zh: c.roman.name_zh, en: c.roman.name_en ?? c.roman.name_la, orig: c.roman.name_la };
}

const extra = new Map(Object.entries(site.names ?? {}));
/** 沒有卡片的人物：「墨提斯（智慧女神）」→ Metis（Μῆτις） */
export function looseNames(label: string): NameParts {
  const n = extra.get(label);
  return { zh: label, en: n?.en, orig: n?.orig };
}

/** 「Zeus（Ζεύς）」：原文和英文一樣時就不重複 */
export function enOrig({ en, orig }: NameParts): string {
  if (!en && !orig) return '';
  if (!orig || orig === en) return en ?? '';
  if (!en) return `（${orig}）`;
  return `${en}（${orig}）`;
}

/** 「宙斯 Zeus（Ζεύς）」 */
export function fullName(p: NameParts): string {
  const tail = enOrig(p);
  return tail ? `${p.zh} ${tail}` : p.zh;
}
