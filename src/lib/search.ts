import { site, stripLinks } from './data';
import { sysLabel, sysOf, sysOfToday } from './systems';

export interface Hit {
  kind: 'card' | 'today';
  id: string;
  title: string;
  sub: string;
  /** 正文命中時，命中處前後文的一小段（前後加「…」），讓人知道為什麼出現 */
  snippet?: string;
}

/**
 * 搜尋分三級，依序合併（最多 12 筆、不重複）：
 *  1. 名字（中文、英文、原文、別名、羅馬名、簡體）：完全相同 > 開頭相同 > 包含；英文打錯一兩個字母也找得到。
 *     查詢是 3 個字以上的中日韓文字、而且名字完全沒命中時，改比「長度相同、只差 1 個字」的名字（阿波蘿 → 阿波羅），排在名字級最後。
 *  2. 三句話、一句話記住他、主題（含主題說明）、今日影子的說明：只做「照字比對」。
 *  3. 正文（去掉程式區塊與標記的純文字）、領域、怎麼認出他、今日影子的 diff：同樣只做「照字比對」，並附命中處前後文。
 *  後兩級不做模糊比對，所以不相干的詞（例如 Thor）會乾淨地回傳「找不到」，不會有雜訊。
 *  名字級若有「完全相同」的命中（搜宙斯、女媧），代表使用者要找的是那個東西，不再補內文級，免得被正文裡的提及淹沒。
 */
interface Entry extends Hit {
  names: string[];
  /** 名字裡的英文單字，打錯字時一個一個比 */
  tokens: string[];
  /** 第二級：三句話、hook、主題 */
  text: string[];
  /** 第三級：正文、領域、怎麼認出他（保留原文，命中後才截前後文） */
  deep: { raw: string; n: string }[];
}

/** 正文轉純文字：去掉 ``` 程式區塊、markdown 標題與粗體符號、[[id|文字]] 只留文字、[s1] 來源代號 */
function plainBody(md: string): string {
  return stripLinks(md.replace(/```[\s\S]*?```/g, ' '))
    .replace(/\[s\d+(?:[,，、\s]*s?\d+)*\]/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*|__/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const deepOf = (parts: (string | undefined)[]) => parts.filter((x): x is string => !!x).map((raw) => ({ raw, n: norm(raw) }));

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
      sub: [c.type, sysLabel(sysOf(c)), c.name_en, c.roman ? `羅馬：${c.roman.name_zh}` : ''].filter(Boolean).join('｜'),
      names,
      tokens: tokensOf(names),
      text: [...c.three_lines.map(stripLinks), c.hook, ...(c.topics ?? []).flatMap((t) => [t, topicDesc.get(t) ?? ''])].filter(Boolean).map(norm),
      deep: deepOf([c.body ? plainBody(c.body) : '', ...(c.domains?.roles ?? []), ...(c.domains?.symbols ?? []), c.how_to_recognize ? stripLinks(c.how_to_recognize) : '']),
    };
  }),
  ...site.today.map((t) => {
    const names = [t.title, ...(t.search_simp ?? [])].filter(Boolean).map(norm);
    return { kind: 'today' as const, id: t.id, title: t.title, sub: `今日影子｜${sysLabel(sysOfToday(t))}｜${t.category}`,
      names, tokens: tokensOf(names), text: [t.what].filter(Boolean).map(norm), deep: deepOf([t.diff ? stripLinks(t.diff) : '']) };
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

/** 內文比對：一個中文字太常見，至少 2 個字；英文要從單字開頭比（Thor 不會配到 authority）。回傳命中位置，沒有回傳 -1 */
function findIn(t: string, q: string): number {
  if (isLatin(q)) {
    if (q.length < 3) return -1;
    const m = new RegExp('(^|[^a-z0-9])' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).exec(t);
    return m ? m.index + m[1].length : -1;
  }
  return q.length < 2 ? -1 : t.indexOf(q);
}

const textScore = (e: Entry, q: string) => (e.text.some((t) => findIn(t, q) >= 0) ? 10 : Infinity);

/** 正文命中處前後各約 20 字；正規化沒改變長度時用原文（保留大小寫與重音） */
function snippetOf(d: { raw: string; n: string }, q: string): string | undefined {
  const at = findIn(d.n, q);
  if (at < 0) return undefined;
  const src = d.raw.length === d.n.length ? d.raw : d.n;
  const from = Math.max(0, at - 20);
  const to = Math.min(src.length, at + q.length + 20);
  return (from > 0 ? '…' : '') + src.slice(from, to) + (to < src.length ? '…' : '');
}

const CJK = /^[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]+$/;

/** 中文容錯：長度相同、只差 1 個字（換字）；3 個字時只接受最後一字打錯。查詢比名字多或少 1 個字不做：3、4 字的名字太多，誤配遠多於救回的打錯字 */
function fuzzyZh(e: Entry, q: string): boolean {
  return e.names.some((n) => {
    if (n.length !== q.length || !CJK.test(n)) return false;
    // 3 個字的名字太短，錯在前兩個字會配到一堆不相干的（索爾斯 → 馬爾斯）：只接受打錯最後一個字
    if (q.length === 3 && n.slice(0, 2) !== q.slice(0, 2)) return false;
    let diff = 0;
    for (let i = 0; i < n.length && diff < 2; i++) if (n[i] !== q[i]) diff++;
    return diff === 1;
  });
}

const toHit = (e: Entry, extra: Partial<Hit> = {}): Hit => ({ kind: e.kind, id: e.id, title: e.title, sub: e.sub, ...extra });

export function search(raw: string): Hit[] {
  const q = norm(raw);
  if (!q) return [];
  const LIMIT = 12;
  const out: Hit[] = [];
  const seen = new Set<string>();
  const push = (e: Entry, extra?: Partial<Hit>) => {
    const key = e.kind + e.id;
    if (seen.has(key) || out.length >= LIMIT) return;
    seen.add(key);
    out.push(toHit(e, extra));
  };

  // 第一級：名字
  const byName: { e: Entry; s: number; i: number }[] = [];
  entries.forEach((e, i) => {
    const s = nameScore(e, q);
    if (s < Infinity) byName.push({ e, s, i });
  });
  byName.sort((a, b) => a.s - b.s || a.i - b.i);
  byName.forEach(({ e }) => push(e));
  if (!byName.length && q.length >= 3 && CJK.test(q)) entries.filter((e) => fuzzyZh(e, q)).forEach((e) => push(e));
  // 完全相同就是要找它，不再補內文
  if (byName.some((b) => b.s === 0)) return out;

  // 第二級：三句話、hook、主題
  for (const e of entries) if (textScore(e, q) < Infinity) push(e, { sub: `內文提到｜${e.sub}` });
  // 第三級：正文，附命中處前後文
  for (const e of entries) {
    for (const d of e.deep) {
      const snippet = snippetOf(d, q);
      if (snippet) {
        push(e, { sub: `內文提到｜${e.sub}`, snippet });
        break;
      }
    }
  }
  return out;
}
