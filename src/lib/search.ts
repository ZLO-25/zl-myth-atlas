import { site, stripLinks } from './data';

export interface Hit {
  kind: 'card' | 'today';
  id: string;
  title: string;
  sub: string;
}

/**
 * 搜尋分兩層，名字永遠排在內文前面：
 *  1. 名字（中文、英文、原文、別名、羅馬名、簡體）：完全相同 > 開頭相同 > 包含；英文打錯一兩個字母也找得到。
 *  2. 內文（三句話、一句話記住他、主題、今日影子的說明）：只做「照字比對」，不做模糊比對，
 *     所以不相干的詞（例如 Thor）會乾淨地回傳「找不到」，不會有雜訊。
 */
interface Entry extends Hit {
  names: string[];
  /** 名字裡的英文單字，打錯字時一個一個比 */
  tokens: string[];
  text: string[];
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const isLatin = (s: string) => /^[a-z0-9 .'’\-]+$/.test(s);

/** 主題的說明也算內文：「用神話解釋四季、收成…」讓 四季 找得到季節與農業的卡 */
const topicDesc = new Map(site.topics.map((t) => [t.name, t.desc]));

const entries: Entry[] = [
  ...site.cards.map((c) => {
    const names = [c.name_zh, c.name_en, c.name_orig, ...(c.aliases ?? []), c.roman?.name_zh ?? '', c.roman?.name_la ?? '', c.roman?.name_en ?? '', ...(c.search_simp ?? [])].filter(Boolean).map(norm);
    return {
      kind: 'card' as const,
      id: c.id,
      title: c.name_zh,
      sub: [c.type, c.name_en, c.roman ? `羅馬：${c.roman.name_zh}` : ''].filter(Boolean).join('｜'),
      names,
      tokens: tokensOf(names),
      text: [...c.three_lines.map(stripLinks), c.hook, ...(c.topics ?? []).flatMap((t) => [t, topicDesc.get(t) ?? ''])].filter(Boolean).map(norm),
    };
  }),
  ...site.today.map((t) => {
    const names = [t.title, ...(t.search_simp ?? [])].filter(Boolean).map(norm);
    return { kind: 'today' as const, id: t.id, title: t.title, sub: `今日影子｜${t.category}`, names, tokens: tokensOf(names), text: [t.what].filter(Boolean).map(norm) };
  }),
];

function tokensOf(names: string[]): string[] {
  return [...new Set(names.flatMap((n) => n.split(/[^a-z0-9]+/)).filter((w) => w.length >= 4))];
}

/** 編輯距離（插入、刪除、換字、相鄰兩字對調都算 1） */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

function nameScore(e: Entry, q: string): number {
  let best = Infinity;
  for (const n of e.names) {
    // 差的字數放在小數：同一級裡，名字越接近搜尋詞越前面（特洛伊戰爭 比 特洛伊木馬並列時，短的在前）
    const gap = Math.min(n.length - q.length, 99) / 100;
    if (n === q) best = Math.min(best, 0);
    else if (n.startsWith(q)) best = Math.min(best, 1 + gap);
    else if (q.length >= 2 && n.includes(q)) best = Math.min(best, 2 + gap);
  }
  if (best < Infinity) return best;
  // 英文打錯字：整個名字或其中一個單字，差一兩個字母就算
  const compact = q.replace(/\s+/g, ' ');
  if (isLatin(compact) && compact.length >= 4) {
    const max = compact.length >= 7 ? 2 : 1;
    // 4 個字母的名字很短，只接受相鄰兩字對調（zues → zeus），免得 Thor 配到 Thoas
    const ok = (a: string, b: string) => {
      const d = distance(a, b, max);
      return d <= max && (a.length > 4 || d === 0 || isTransposition(a, b));
    };
    for (const t of [...e.tokens, ...e.names.filter((n) => n.includes(' '))]) if (ok(compact, t)) best = Math.min(best, 3);
  }
  return best;
}

function isTransposition(a: string, b: string) {
  if (a.length !== b.length) return false;
  const diff = [...a].map((ch, i) => (ch === b[i] ? -1 : i)).filter((i) => i >= 0);
  return diff.length === 2 && diff[1] === diff[0] + 1 && a[diff[0]] === b[diff[1]] && a[diff[1]] === b[diff[0]];
}

function textScore(e: Entry, q: string): number {
  // 一個中文字太常見，內文比對至少 2 個字；英文要從單字開頭比（Thor 不會配到 authority）
  if (isLatin(q)) {
    if (q.length < 3) return Infinity;
    const re = new RegExp('(^|[^a-z0-9])' + q.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'));
    return e.text.some((t) => re.test(t)) ? 10 : Infinity;
  }
  if (q.length < 2) return Infinity;
  return e.text.some((t) => t.includes(q)) ? 10 : Infinity;
}

export function search(raw: string): Hit[] {
  const q = norm(raw);
  if (!q) return [];
  const byName: { e: Entry; s: number; i: number }[] = [];
  entries.forEach((e, i) => {
    const s = nameScore(e, q);
    if (s < Infinity) byName.push({ e, s, i });
  });
  byName.sort((a, b) => a.s - b.s || a.i - b.i);
  if (byName.length) return byName.slice(0, 12).map(({ e }) => ({ kind: e.kind, id: e.id, title: e.title, sub: e.sub }));
  // 名字都對不上，才去翻內文；內文也沒有就是真的找不到
  return entries.filter((e) => textScore(e, q) < Infinity).slice(0, 12).map((e) => ({ kind: e.kind, id: e.id, title: e.title, sub: `內文提到｜${e.sub}` }));
}
