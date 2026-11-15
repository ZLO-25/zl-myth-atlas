// 「考考自己」：題目全部從卡片現有欄位自動產生，不手寫。
// 同一張卡每次產生的題目、選項順序都一樣（用卡片 id 當亂數種子）。
import type { Card, TodayItem } from '../../scripts/lib/types';
import { origOf } from './names';
import { site, todayById } from './data';

export interface QuizOption {
  id: string;
  label: string;
}
export interface Question {
  kind: 'hook' | 'domains' | 'today';
  prompt: string; // 題目說明：「這是誰？」
  stem: string; // 題幹：已遮掉名字的句子
  options: QuizOption[];
  answer: string; // 正解的卡片 id
  todayId?: string; // 今日影子題：答完連回那一條
}

const BLANK = '＿＿';

/** 字串 → 32 位元種子（FNV-1a） */
function seedOf(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 可重現的亂數（mulberry32） */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 這張卡所有叫得出來的名字：中文、英文、別名、羅馬名、原文 */
export function allNames(c: Card): string[] {
  const out = [c.name_zh, c.name_en, ...(c.aliases ?? []), c.roman?.name_zh, c.roman?.name_la, c.roman?.name_en, origOf(c.name_orig), c.name_orig?.split(' / ')[1]?.trim()];
  return [...new Set(out.filter((x): x is string => !!x && x.trim().length > 0).map((x) => x.trim()))];
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** 把文字裡出現的名字遮成「＿＿」；英文名要整個字才算（不會把 along 裡的 long 遮掉） */
export function maskNames(text: string, names: string[]): string {
  let out = text;
  for (const n of [...names].sort((a, b) => b.length - a.length)) {
    out = /^[\x00-\x7f]+$/.test(n) ? out.replace(new RegExp(`(?<![A-Za-z])${esc(n)}(?![A-Za-z])`, 'gi'), BLANK) : out.split(n).join(BLANK);
  }
  return out.replace(new RegExp(`(?:${BLANK}){2,}`, 'g'), BLANK);
}

/** 兩張卡其實是同一個名字（別名、羅馬名重疊）：不能互相當錯誤選項 */
function sameName(a: Card, b: Card): boolean {
  if (a.roman?.card === b.id || b.roman?.card === a.id) return true;
  const set = new Set(allNames(a).map((n) => n.toLowerCase()));
  return allNames(b).some((n) => set.has(n.toLowerCase()));
}

/** 從同神話系統、同類型的卡挑錯誤選項；不夠再放寬（先放寬類型，再放寬系統） */
function pickDistractors(answer: Card, rand: () => number, ok: (o: Card) => boolean, n = 3): Card[] {
  const pool = site.cards.filter((o) => o.id !== answer.id && !sameName(answer, o) && ok(o)).sort((a, b) => (a.id < b.id ? -1 : 1));
  const sameSys = (o: Card) => o.myth_system.some((s) => answer.myth_system.includes(s));
  const tiers = [pool.filter((o) => sameSys(o) && o.type === answer.type), pool.filter(sameSys), pool.filter((o) => o.type === answer.type)];
  const picked: Card[] = [];
  for (const t of tiers) {
    for (const o of shuffle(t, rand)) if (picked.length < n && !picked.includes(o)) picked.push(o);
  }
  return picked;
}

function options(answer: Card, ds: Card[], rand: () => number): QuizOption[] {
  return shuffle([answer, ...ds], rand).map((o) => ({ id: o.id, label: o.name_zh }));
}

/** 題幹裡已經出現的名字不能再出現在選項裡：不然看到就知道不是它 */
const leaks = (stem: string) => (o: Card) => ![o.name_zh, o.name_en].some((n) => n && stem.includes(n));

/** 今日影子的標題：遮掉相關卡片的名字（「維納斯的誕生」→「＿＿的誕生」）；遮完沒剩什麼就不能出題 */
export function maskedTitle(t: TodayItem): string | undefined {
  const names = t.cards.flatMap((id) => {
    const c = site.cards.find((x) => x.id === id);
    return c ? allNames(c) : [];
  });
  const m = maskNames(t.title, names);
  return m.replace(new RegExp(BLANK, 'g'), '').replace(/[\s「」〈〉《》（）()\-–—：:、,·]/g, '').length >= 2 ? m : undefined;
}

/** 「這個今日影子來自誰」：給今日影子與正解卡，傳回題目（資料不夠回 undefined） */
export function todayQuestion(t: TodayItem, answer: Card, seedKey: string): Question | undefined {
  const stem = maskedTitle(t);
  if (!stem) return undefined;
  const rand = rng(seedOf(`${seedKey}|today|${t.id}`));
  const ds = pickDistractors(answer, rand, (o) => !t.cards.includes(o.id) && leaks(stem)(o));
  if (ds.length < 3) return undefined;
  return { kind: 'today', prompt: '這個你在生活裡看過的東西，來自誰？', stem, options: options(answer, ds, rand), answer: answer.id, todayId: t.id };
}

/** 最多 3 題：一句話認人、象徵物認人、今日影子認人。資料不夠的題型直接略過。 */
export function buildQuiz(c: Card): Question[] {
  const qs: Question[] = [];
  const names = allNames(c);

  // 1. 一句話記住他（hook 裡沒有名字就沒辦法遮，略過）
  if (c.hook && c.hook.includes(c.name_zh)) {
    const stem = maskNames(c.hook, names);
    const rand = rng(seedOf(`${c.id}|hook`));
    const ds = pickDistractors(c, rand, leaks(stem));
    if (ds.length >= 3) qs.push({ kind: 'hook', prompt: '這句話在說誰？', stem, options: options(c, ds, rand), answer: c.id });
  }

  // 2. 掌管與象徵物（只有有 domains 的卡）
  if (c.domains && (c.domains.roles.length || c.domains.symbols.length)) {
    const stem = maskNames(
      [c.domains.roles.length ? `掌管：${c.domains.roles.join('、')}` : '', c.domains.symbols.length ? `象徵物：${c.domains.symbols.join('、')}` : ''].filter(Boolean).join('；'),
      names,
    );
    const rand = rng(seedOf(`${c.id}|domains`));
    const mine = new Set([...c.domains.roles, ...c.domains.symbols]);
    const ds = pickDistractors(c, rand, (o) => leaks(stem)(o) && ![...(o.domains?.roles ?? []), ...(o.domains?.symbols ?? [])].some((x) => mine.has(x)));
    if (ds.length >= 3) qs.push({ kind: 'domains', prompt: '有這些掌管範圍與象徵物的是誰？', stem, options: options(c, ds, rand), answer: c.id });
  }

  // 3. 今日影子（只有有 today 的卡；第一條做不成題就試下一條）
  for (const id of c.today ?? []) {
    const t = todayById.get(id);
    if (!t || !t.cards.includes(c.id)) continue;
    const q = todayQuestion(t, c, c.id);
    if (q) {
      qs.push(q);
      break;
    }
  }
  return qs.slice(0, 3);
}
