// npm run validate：檢查卡片、圖片、今日影子、地點的資料是否完整一致。
// 錯誤（✖）會讓建置失敗；警告（△）是「還沒做完」的提醒，第 1 期驗收時要清到 0。
import fs from 'node:fs';
import path from 'node:path';
import { loadAll, ROOT } from './lib/load.ts';
import { CARD_TYPES, CAUSE_RELS, MYTH_SYSTEMS, REALITY_LEVELS, TODAY_CATEGORIES, type Card, type FamilyLink } from './lib/types.ts';

const errors: string[] = [];
const warnings: string[] = [];
const err = (where: string, msg: string) => errors.push(`✖ ${where}：${msg}`);
const warn = (where: string, msg: string) => warnings.push(`△ ${where}：${msg}`);

let data;
try {
  data = loadAll();
} catch (e) {
  console.error(`✖ ${(e as Error).message}`);
  process.exit(1);
}
const { cards, images, today, eras, places, topics } = data;

const cardIds = new Set<string>();
const imageById = new Map(images.map((i) => [i.id, i]));
const todayIds = new Set(today.map((t) => t.id));
const placeIds = new Set(places.map((p) => p.id));
const eraIds = new Set(eras.map((e) => e.id));
const topicNames = new Set(topics.map((t) => t.name));
const isWiki = (u: string) => /wikipedia\.org/.test(u);
const usedImages = new Set<string>();

for (const c of cards) {
  if (cardIds.has(c.id)) err(c.file!, `id 重複：${c.id}`);
  cardIds.add(c.id);
}

const GOD_TYPES = new Set(['神', '原始神', '泰坦']);

for (const c of cards) {
  const w = c.file ?? c.id;
  if (!/^[a-z0-9]+(-[a-z0-9]+)+$/.test(c.id ?? '')) err(w, `id 要是英文小寫加連字號，例如 god-zeus（現在是 ${c.id}）`);
  const expectFile = path.basename(c.file!, '.md');
  if (expectFile !== c.id) err(w, `檔名要和 id 一樣（${c.id}.md）`);
  if (!CARD_TYPES.includes(c.type)) err(w, `type 必須是 ${CARD_TYPES.join('／')}`);
  if (!Array.isArray(c.myth_system) || !c.myth_system.length || c.myth_system.some((s) => !MYTH_SYSTEMS.includes(s))) err(w, 'myth_system 要列出 greek／roman／norse');
  for (const k of ['name_zh', 'name_en', 'name_orig', 'hook', 'era'] as const) if (!c[k]) err(w, `缺少 ${k}`);
  if (!Array.isArray(c.aliases) || !c.aliases.length) err(w, 'aliases 至少 1 個（其他譯名、英文、稱號）');
  if (!Array.isArray(c.three_lines) || c.three_lines.length !== 3) err(w, 'three_lines 要剛好 3 句');
  if (!c.reality || !REALITY_LEVELS.includes(c.reality.level)) err(w, `reality.level 必須是 ${REALITY_LEVELS.join('／')}`);
  else if (c.reality.level !== '純神話' && (!c.reality.evidence || !c.reality.src?.length)) err(w, 'reality 不是純神話時要寫 evidence 與 src');
  if (c.era && !eraIds.has(c.era)) err(w, `era「${c.era}」不在 data/eras.yaml`);
  if (!c.topics?.length) err(w, 'topics 至少 1 個');
  for (const t of c.topics ?? []) if (!topicNames.has(t)) err(w, `主題標籤「${t}」不在 data/topics.yaml`);
  if (!c.body || !/##\s*故事/.test(c.body)) err(w, '正文要有「## 故事」段落');

  // 來源
  const srcIds = new Set<string>();
  for (const s of c.sources ?? []) {
    if (srcIds.has(s.id)) err(w, `來源代號重複：${s.id}`);
    srcIds.add(s.id);
    if (!/^s\d+$/.test(s.id)) err(w, `來源代號要是 s1、s2…（現在是 ${s.id}）`);
    if (!s.url || !/^https?:\/\//.test(s.url)) err(w, `${s.id} 缺少可點的網址`);
    if (!s.cite) err(w, `${s.id} 缺少 cite（作者＋作品＋卷行數）`);
    if (s.kind !== 'ancient' && s.kind !== 'modern') err(w, `${s.id} kind 要是 ancient 或 modern`);
  }
  const anc = (c.sources ?? []).filter((s) => s.kind === 'ancient');
  const mod = (c.sources ?? []).filter((s) => s.kind === 'modern' && !isWiki(s.url));
  if (!anc.length) err(w, '至少要 1 個古代原典來源');
  if (!mod.length) err(w, '至少要 1 個現代可靠來源（維基百科不算）');
  const checkSrc = (where: string, ids: string[] | undefined) => {
    if (!ids?.length) return err(w, `${where} 沒有標來源`);
    for (const id of ids) if (!srcIds.has(id)) err(w, `${where} 引用了不存在的來源 ${id}`);
  };
  for (const m of (c.body ?? '').matchAll(/\[(s\d+)\]/g)) if (!srcIds.has(m[1])) err(w, `正文引用了不存在的來源 ${m[1]}`);
  for (const id of srcIds) if (!(c.body ?? '').includes(`[${id}]`) && !JSON.stringify({ ...c, body: '', sources: [] }).includes(`"${id}"`)) warn(w, `來源 ${id} 列了但沒被引用`);

  // 族譜
  const fam = c.family ?? {};
  for (const rel of ['parents', 'consorts', 'children', 'siblings'] as const) {
    for (const f of (fam[rel] ?? []) as FamilyLink[]) {
      if (!f.id && !f.name) err(w, `family.${rel} 每筆要有 id 或 name`);
      if (f.id && !cardIds.has(f.id)) err(w, `family.${rel} 的 ${f.id} 沒有這張卡（沒有卡的人物改用 name）`);
      if (f.id === c.id) err(w, `family.${rel} 不能是自己`);
      checkSrc(`family.${rel}（${f.id ?? f.name}）`, f.src);
    }
  }

  // 前因後果
  for (const k of ['causes', 'effects'] as const) {
    for (const l of c[k] ?? []) {
      if (!cardIds.has(l.id)) err(w, `${k} 的 ${l.id} 沒有這張卡`);
      if (!CAUSE_RELS.includes(l.rel)) err(w, `${k} 的 rel 要是 ${CAUSE_RELS.join('｜')}`);
      if (!l.why || [...l.why].length > 80) err(w, `${k}（${l.id}）的 why 要有內容且 ≤80 字`);
      checkSrc(`${k}（${l.id}）`, l.src);
    }
  }

  // 圖片
  for (const id of c.images ?? []) {
    if (!imageById.has(id)) err(w, `images 的 ${id} 不在 data/images.yaml`);
    usedImages.add(id);
  }
  for (const [i, p] of (c.panels ?? []).entries()) {
    if (p.image) {
      if (!imageById.has(p.image)) err(w, `panels 第 ${i + 1} 格的圖 ${p.image} 不在 data/images.yaml`);
      usedImages.add(p.image);
    }
    checkSrc(`panels 第 ${i + 1} 格`, p.src);
  }
  if (c.panels && (c.panels.length < 4 || c.panels.length > 8)) err(w, `分格故事要 4–8 格（現在 ${c.panels.length} 格）`);

  // 其他連結
  if (c.roman?.card && !cardIds.has(c.roman.card)) err(w, `roman.card ${c.roman.card} 沒有這張卡`);
  for (const t of c.today ?? []) if (!todayIds.has(t)) err(w, `today 的 ${t} 不在 data/today/`);
  for (const p of c.places ?? []) if (!placeIds.has(p) && !cardIds.has(p)) err(w, `places 的 ${p} 不在 data/places.yaml 也不是卡片`);
  if (c.greek_vs_roman) checkSrc('greek_vs_roman', c.greek_vs_roman.src);
  for (const d of c.disputed ?? []) for (const v of d.views) checkSrc(`disputed「${d.claim}」`, v.src);

  // 完整度（警告）
  if (GOD_TYPES.has(c.type)) {
    const works = (c.images ?? []).map((id) => imageById.get(id)).filter((i) => i?.kind === 'work' && !i.pending);
    if (works.length < 2) warn(w, `神祇卡至少要 2 張真實作品圖（現在 ${works.length} 張）`);
    if (!c.how_to_recognize) warn(w, '神祇卡要寫 how_to_recognize（名畫裡怎麼認出他）');
    if (!c.domains) warn(w, '神祇卡要寫 domains（掌管什麼、象徵物）');
  }
  if (c.type === '神' && c.myth_system.includes('greek') && !c.greek_vs_roman) warn(w, '奧林帕斯神要寫 greek_vs_roman');
  if (!c.today?.length) warn(w, '還沒連到任何今日影子');
}

// 反向族譜一致性：A 說 B 是父母，B 的子女清單（若有寫）應包含 A
const byId = new Map(cards.map((c) => [c.id, c]));
for (const c of cards) {
  for (const p of c.family?.parents ?? []) {
    const parent = p.id ? byId.get(p.id) : undefined;
    if (parent?.family?.children && !parent.family.children.some((k) => k.id === c.id)) warn(c.file!, `${p.id} 的 children 沒有列 ${c.id}（族譜兩邊要一致）`);
    if (parent?.family?.parents?.some((pp) => pp.id === c.id && !pp.variant && !p.variant)) err(c.file!, `族譜矛盾：${c.id} 與 ${p.id} 互為父母`);
  }
}

// 圖片
const creditBySource = new Map<string, string>();
for (const im of images) {
  const w = `data/images.yaml（${im.id}）`;
  if (!im.title) err(w, '缺少 title');
  if (!im.look) err(w, '缺少 look（「看這張圖：」解說）');
  else if (im.look === 'TODO') warn(w, '還沒寫 look（「看這張圖：」解說）');
  if (im.kind === 'work' && im.pending) {
    warn(w, `等待 GitHub Actions 從 Commons 抓回 ${im.commons}`);
  } else if (im.kind === 'work') {
    for (const k of ['artist', 'date', 'license', 'source_url', 'file_url', 'credit'] as const) if (!im[k]) err(w, `真實作品缺少 ${k}`);
    if (im.ai) err(w, '真實作品不能標 ai: true');
    if (im.source_url) {
      const prev = creditBySource.get(im.source_url);
      if (prev !== undefined && prev !== im.credit) err(w, `同一張圖（${im.source_url}）署名不一致`);
      creditBySource.set(im.source_url, im.credit ?? '');
    }
  } else if (im.kind === 'ai') {
    if (im.ai !== true) err(w, 'AI 插畫一定要標 ai: true');
    for (const k of ['tool', 'prompt'] as const) if (!im[k]) err(w, `AI 插畫缺少 ${k}`);
    if (!im.placeholder && (!im.file || !fs.existsSync(path.join(ROOT, 'public', im.file)))) err(w, `AI 插畫檔案不存在：public/${im.file}`);
    if (im.placeholder) warn(w, 'AI 插畫還是佔位圖，等生圖放回');
  } else err(w, 'kind 要是 work 或 ai');
  if (!usedImages.has(im.id)) warn(w, '沒有任何卡片用到這張圖');
}

// 今日影子
const seenToday = new Set<string>();
for (const t of today) {
  const w = `data/today（${t.id}）`;
  if (seenToday.has(t.id)) err(w, 'id 重複');
  seenToday.add(t.id);
  if (!TODAY_CATEGORIES.includes(t.category)) err(w, `category 要是 ${TODAY_CATEGORIES.join('／')}`);
  if (!t.cards?.length) err(w, '至少連到 1 張卡');
  for (const id of t.cards ?? []) if (!cardIds.has(id)) err(w, `卡片 ${id} 不存在`);
  if (!t.what || !t.diff) err(w, '要有 what 與 diff（和原典差在哪）');
  if (t.status !== '已查證' && t.status !== '說法未證實') err(w, 'status 要是 已查證 或 說法未證實');
  if (!t.sources?.length || t.sources.some((s) => !/^https?:\/\//.test(s.url ?? ''))) err(w, '至少 1 個有網址的來源');
}

// 地點
for (const p of places) {
  const w = `data/places.yaml（${p.id}）`;
  if (p.kind === 'real' && (typeof p.lat !== 'number' || typeof p.lng !== 'number')) err(w, '真實地點要有 lat／lng');
  if (!p.src?.length) err(w, '缺少來源');
  for (const id of p.cards ?? []) if (!cardIds.has(id)) err(w, `卡片 ${id} 不存在`);
}

const strict = process.argv.includes('--strict');
for (const m of warnings) console.log(m);
for (const m of errors) console.log(m);
console.log(`\n卡片 ${cards.length} 張｜圖片 ${images.length} 張｜今日影子 ${today.length} 條｜地點 ${places.length} 個`);
console.log(`錯誤 ${errors.length} 筆｜警告 ${warnings.length} 筆${strict ? '（--strict：警告也算失敗）' : ''}`);
if (errors.length || (strict && warnings.length)) process.exit(1);
