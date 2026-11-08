import { select } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { avatarOf, cardById, eraById, familyOf, imgSrc, isChinese, site } from '../lib/data';
import { href } from '../lib/router';
import { cardNames, looseNames, type NameParts } from '../lib/names';

const TWELVE = ['god-zeus', 'god-hera', 'god-poseidon', 'god-demeter', 'god-athena', 'god-apollo', 'god-artemis', 'god-ares', 'god-aphrodite', 'god-hephaestus', 'god-hermes', 'god-hestia', 'god-dionysus'];
const HEROES = site.cards.filter((c) => c.type === '英雄' && !isChinese(c)).map((c) => c.id);

interface Node {
  key: string;
  id?: string;
  name: string;
  x: number;
  y: number;
  role: 'focus' | 'parent' | 'consort' | 'child' | 'ancestor';
}
interface Edge {
  a: string;
  b: string;
  variant?: string;
  /** 中華神話傳承圖用：血緣、夫妻、傳位、對戰 */
  kind?: 'blood' | 'consort' | 'succ' | 'foe';
}

const W = 148;
const H = 68;

/** 族譜：中間是焦點人物，上面父母、兩側配偶、下面子女；點任何人就換成他當焦點 */
export function Family({ focus }: { focus?: string }) {
  const [mode, setMode] = useState<'root' | 'all' | 'twelve' | 'hero' | 'cn'>(focus && cardById.has(focus) ? (isChinese(cardById.get(focus)) ? 'cn' : 'all') : 'root');
  const [hero, setHero] = useState(HEROES[0] ?? '');
  const start = focus && cardById.has(focus) ? focus : 'god-zeus';
  const [cur, setCur] = useState(start);
  useEffect(() => setCur(start), [start]);

  const { nodes, edges } = useMemo(() => (mode === 'cn' ? chineseGraph() : mode === 'hero' ? lineage(hero) : mode === 'root' ? fromRoots() : around(cur, mode === 'twelve')), [cur, mode, hero]);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const svg = select(svgRef.current);
    const g = select(gRef.current);
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.5])
      .on('zoom', (e) => g.attr('transform', e.transform.toString()));
    svg.call(z);
    const box = svgRef.current.getBoundingClientRect();
    const xs = nodes.map((n) => n.x);
    // 中華傳承圖左邊有年代名稱，要一起框進畫面
    if (nodes.some((n) => n.key.startsWith('n:')) || nodes.some((n) => n.id && isChinese(cardById.get(n.id)))) xs.push(Math.min(...xs) - 120);
    const ys = nodes.map((n) => n.y);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const span = Math.max(Math.max(...xs) - Math.min(...xs) + W + 40, 300);
    const spanY = Math.max(Math.max(...ys) - Math.min(...ys) + H + 40, 200);
    const k = Math.min(1.2, box.width / span, box.height / spanY);
    if (box.width < 600 && nodes.length > 12) {
      // 手機：全部縮進去字會小到看不清，改成可讀大小、從最上面（蓋亞）開始，往下拖曳瀏覽
      const k2 = 0.8;
      svg.call(z.transform, zoomIdentity.translate(box.width / 2 - cx * k2, 30 - (Math.min(...ys) - H / 2) * k2).scale(k2));
      return () => {
        svg.on('.zoom', null);
      };
    }
    svg.call(z.transform, zoomIdentity.translate(box.width / 2 - cx * k, box.height / 2 - cy * k).scale(k));
    return () => {
      svg.on('.zoom', null);
    };
  }, [nodes]);

  const pos = new Map(nodes.map((n) => [n.key, n]));
  const c = cardById.get(cur);
  return (
    <div className="page family-page">
      <h1>族譜</h1>
      <p className="lead">「完整家譜」從卡厄斯、蓋亞、烏拉諾斯一路往下排到奧林帕斯諸神；點任何一位，就切換成「以他為中心」展開父母、配偶與子女。可以拖曳、用滾輪或兩指縮放。虛線＝「另有一說」。中華神話請按「中華神話：家族、傳位與對戰」。</p>
      <div className="filters">
        <button className={mode === 'root' ? 'on' : ''} onClick={() => setMode('root')}>從原始神開始（完整家譜）</button>
        <button className={mode === 'all' ? 'on' : ''} onClick={() => setMode('all')}>以一位為中心</button>
        <button className={mode === 'twelve' ? 'on' : ''} onClick={() => setMode('twelve')}>只看奧林帕斯十二神</button>
        <button className={mode === 'hero' ? 'on' : ''} onClick={() => setMode('hero')}>看英雄的血統</button>
        <button className={mode === 'cn' ? 'on' : ''} onClick={() => setMode('cn')}>中華神話：家族、傳位與對戰</button>
        {mode === 'hero' && (
          <select value={hero} onChange={(e) => setHero(e.target.value)} aria-label="選擇英雄">
            {HEROES.map((h) => (
              <option key={h} value={h}>{cardById.get(h)?.name_zh} {cardById.get(h)?.name_en}</option>
            ))}
          </select>
        )}
      </div>
      <div className="family-wrap">
        <svg ref={svgRef} className="family-svg" role="img" aria-label="族譜圖">
          <defs>
            <marker id="succ-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" className="succ-arrow" />
            </marker>
          </defs>
          <g ref={gRef}>
            {mode === 'cn' && rowLabels(nodes).map((r) => (
              <text key={r.label} x={r.x} y={r.y + 4} textAnchor="end" className="row-label">{r.label}</text>
            ))}
            {edges.map((e, i) => {
              const a = pos.get(e.a.replace(/^m:/, ''))!;
              const b = pos.get(e.b)!;
              if (e.kind) return <CnEdge key={i} e={e} a={a} b={b} />;
              const consort = (e.a === 'focus' && e.b.startsWith('c')) || e.a.startsWith('m:');
              const vertical = !consort && Math.abs(a.y - b.y) > 10;
              const d = vertical ? `M${a.x},${a.y + H / 2} C${a.x},${(a.y + b.y) / 2} ${b.x},${(a.y + b.y) / 2} ${b.x},${b.y - H / 2}` : `M${a.x + (b.x > a.x ? W / 2 : -W / 2)},${a.y} L${b.x + (b.x > a.x ? -W / 2 : W / 2)},${b.y}`;
              return (
                <g key={i}>
                  <path d={d} className={`edge${e.variant ? ' edge-variant' : ''}${vertical ? '' : ' edge-consort'}`} />
                  {e.variant && (
                    <text x={(a.x + b.x) / 2 + 4} y={(a.y + b.y) / 2} className="edge-label">
                      另有一說
                    </text>
                  )}
                </g>
              );
            })}
            {nodes.map((n) => {
              const card = n.id ? cardById.get(n.id) : undefined;
              const av = card ? avatarOf(card) : undefined;
              const nm: NameParts = card ? cardNames(card) : looseNames(n.name);
              const tx = av ? 56 : W / 2;
              const anchor = av ? 'start' : 'middle';
              return (
                <g
                  key={n.key}
                  className={`fnode role-${n.role}${card ? ' clickable' : ''}${TWELVE.includes(n.id ?? '') ? ' twelve' : ''}`}
                  transform={`translate(${n.x - W / 2},${n.y - H / 2})`}
                  onClick={() => {
                    if (card && mode === 'cn') location.hash = href('card', card.id);
                    else if (card && (mode === 'all' || mode === 'twelve')) setCur(card.id);
                    else if (card) {
                      setMode('all');
                      setCur(card.id);
                    }
                  }}
                  tabIndex={card ? 0 : -1}
                  onKeyDown={(e) => e.key === 'Enter' && card && setCur(card.id)}
                >
                  <title>{[nm.zh, nm.en, nm.orig].filter(Boolean).join(' · ') + (card ? `｜${card.type}` : '｜（無卡片）')}</title>
                  <rect width={W} height={H} rx={10} />
                  {av && <image href={imgSrc(av)} x={6} y={(H - 44) / 2} width={44} height={44} preserveAspectRatio="xMidYMid slice" clipPath="inset(0 round 8px)" />}
                  <text x={tx} y={22} textAnchor={anchor} className="fname">{n.name}</text>
                  {nm.en && <text x={tx} y={39} textAnchor={anchor} className="fen">{nm.en}</text>}
                  {nm.orig && nm.orig !== nm.en && <text x={tx} y={56} textAnchor={anchor} className="forig">{nm.orig}</text>}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      {mode === 'cn' && (
        <>
          <p className="family-legend">
            <span className="lg lg-blood">── 血緣</span>
            <span className="lg lg-consort">══ 夫妻</span>
            <span className="lg lg-succ">┈▶ 傳位（王位交給誰）</span>
            <span className="lg lg-foe">✖ 對戰</span>
            <span className="lg">虛線框＝還沒有卡片的人物</span>
          </p>
          <p className="muted small">中華神話沒有一本《神譜》定下全家譜，血緣多半來自《史記》替古帝王排的世系，所以除了血緣，這裡也畫出「王位傳給誰」和「誰跟誰打過」。每一列大致對應一個神話年代（左邊的名稱），越往下越接近歷史；沒有卡片的人物（虛線框）放在和他相連的人物上一列或下一列。點有卡片的人物會打開他的卡片。</p>
        </>
      )}
      {c && (mode === 'all' || mode === 'twelve') && (
        <p>
          目前焦點：<a href={href('card', c.id)}>{c.name_zh}的卡片 →</a>
        </p>
      )}
    </div>
  );
}

function label(id?: string, name?: string) {
  return id ? cardById.get(id)?.name_zh ?? id : name ?? '?';
}

function around(id: string, twelveOnly: boolean): { nodes: Node[]; edges: Edge[] } {
  const f = familyOf(id);
  const keep = (x: { id?: string }) => !twelveOnly || (x.id && (TWELVE.includes(x.id) || ['primordial-chaos', 'primordial-gaia', 'primordial-uranus', 'titan-cronus', 'titan-rhea'].includes(x.id)));
  const parents = f.parents.filter(keep);
  const consorts = f.consorts.filter(keep);
  const children = f.children.filter(keep);
  const nodes: Node[] = [{ key: 'focus', id, name: label(id), x: 0, y: 0, role: 'focus' }];
  const edges: Edge[] = [];
  const row = <T extends { id?: string; name?: string; variant?: string }>(list: T[], y: number, role: Node['role'], prefix: string) => {
    const gap = W + 18;
    const perRow = 7;
    list.forEach((p, i) => {
      const r = Math.floor(i / perRow);
      const inRow = Math.min(perRow, list.length - r * perRow);
      const x = (i % perRow - (inRow - 1) / 2) * gap;
      const key = prefix + i;
      nodes.push({ key, id: p.id, name: label(p.id, p.name), x, y: y + Math.sign(y) * r * (H + 24), role });
      edges.push(role === 'parent' ? { a: key, b: 'focus', variant: p.variant } : { a: 'focus', b: key, variant: p.variant });
    });
  };
  // 配偶多到疊成兩排時，父母要再往上移一排，免得和第二排配偶重疊
  row(parents, consorts.length > 4 ? -130 - (H + 14) : -130, 'parent', 'p');
  // 配偶放在焦點兩側；超過 4 位就往上疊第二排，免得圖太寬、字太小
  consorts.forEach((p, i) => {
    const side = i % 2 === 0 ? 1 : -1;
    const j = Math.floor(i / 2);
    const col = Math.floor(j / 2) + 1;
    const row = consorts.length > 4 ? j % 2 : 0;
    const key = 'c' + i;
    nodes.push({ key, id: p.id, name: label(p.id, p.name), x: side * col * (W + 22), y: -row * (H + 14), role: 'consort' });
    edges.push({ a: 'focus', b: key, variant: p.variant });
  });
  row(children, 140, 'child', 'k');
  return { nodes, edges };
}

/** 英雄血統：一路往上找父母 */
function lineage(id: string): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const levels: { id?: string; name?: string; key: string; variant?: string; child?: string }[][] = [[{ id, key: 'h0' }]];
  const seen = new Set([id]);
  for (let depth = 0; depth < 5; depth++) {
    const next: (typeof levels)[number] = [];
    for (const n of levels[depth]) {
      if (!n.id) continue;
      for (const p of familyOf(n.id).parents) {
        const k = p.id ?? p.name!;
        if (seen.has(k)) continue;
        seen.add(k);
        next.push({ id: p.id, name: p.name, key: `h${depth + 1}-${next.length}`, variant: p.variant, child: n.key });
      }
    }
    if (!next.length) break;
    levels.push(next);
  }
  levels.forEach((lv, d) =>
    lv.forEach((n, i) => {
      nodes.push({ key: n.key, id: n.id, name: label(n.id, n.name), x: (i - (lv.length - 1) / 2) * (W + 18), y: -d * 120, role: d === 0 ? 'focus' : 'ancestor' });
      if (n.child) edges.push({ a: n.key, b: n.child, variant: n.variant });
    }),
  );
  return { nodes, edges };
}

/** 完整家譜：從卡厄斯、蓋亞出發，往下一代一代排（只放原始神、泰坦、神與地點以外的人物，不含英雄） */
function fromRoots(): { nodes: Node[]; edges: Edge[] } {
  const KINDS = new Set(['原始神', '泰坦', '神']);
  const ids = new Set(site.cards.filter((c) => KINDS.has(c.type)).map((c) => c.id));
  const kids = new Map<string, { id: string; variant?: string }[]>();
  for (const id of ids) {
    kids.set(id, familyOf(id).children.filter((k): k is typeof k & { id: string } => !!k.id && ids.has(k.id) && k.id !== id));
  }
  // 蓋亞與烏拉諾斯互為母子又是夫妻：只留「蓋亞 → 烏拉諾斯」，避免出現環
  kids.set('primordial-uranus', (kids.get('primordial-uranus') ?? []).filter((k) => k.id !== 'primordial-gaia'));
  const depth = new Map<string, number>();
  const visit = (id: string, d: number) => {
    if ((depth.get(id) ?? -1) >= d) return;
    depth.set(id, d);
    for (const k of kids.get(id) ?? []) visit(k.id, d + 1);
  };
  visit('primordial-chaos', 0);
  // 卡厄斯 → 蓋亞：資料裡用 causes 記錄，這裡補上
  visit('primordial-gaia', 1);
  const layers: string[][] = [];
  for (const [id, d] of depth) (layers[d] ??= []).push(id);
  // 同一層裡，依父母位置排序，減少線條交叉
  const xOf = new Map<string, number>();
  const nodes: Node[] = [];
  const GAP = W + 18;
  layers.forEach((lv, d) => {
    const parentsX = (id: string) => {
      const xs = [...(depth.keys())].filter((p) => (kids.get(p) ?? []).some((k) => k.id === id) && xOf.has(p)).map((p) => xOf.get(p)!);
      return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
    };
    const rank = (id: string) => (id === 'titan-rhea' ? 0.5 : 0);
    lv.sort((a, b) => parentsX(a) + rank(a) - (parentsX(b) + rank(b)));
    // 奧林帕斯十二神集中排在一起：同一層最多 7 個一排，其餘換下一排
    lv.forEach((id, i) => {
      const x = (i - (lv.length - 1) / 2) * GAP;
      xOf.set(id, x);
      const c = cardById.get(id)!;
      nodes.push({ key: id, id, name: c.name_zh, x, y: d * 120, role: d === 0 ? 'focus' : d <= 2 ? 'ancestor' : 'child' });
    });
  });
  const edges: Edge[] = [];
  for (const [p, list] of kids) if (depth.has(p)) for (const k of list) edges.push({ a: p, b: k.id, variant: k.variant });
  edges.push({ a: 'primordial-chaos', b: 'primordial-gaia' });
  // 夫妻（同一層、彼此相鄰）畫一條短橫線
  const seenPair = new Set<string>();
  for (const id of depth.keys()) {
    for (const s of familyOf(id).consorts) {
      if (!s.id || !depth.has(s.id) || depth.get(s.id) !== depth.get(id)) continue;
      const key = [id, s.id].sort().join('|');
      if (seenPair.has(key) || Math.abs(xOf.get(id)! - xOf.get(s.id)!) > GAP + 1) continue;
      seenPair.add(key);
      const [l, r] = xOf.get(id)! < xOf.get(s.id)! ? [id, s.id] : [s.id, id];
      edges.push({ a: 'm:' + l, b: r });
    }
  }
  return { nodes: nodes.map((n) => ({ ...n, key: n.key })), edges };
}

/** 中華神話傳承圖：每列是一個神話年代（越往下越接近歷史）；沒有卡片的人物放在和他相連的卡片的上一列或下一列 */
const ROW_GAP = 130;
const CN_KINDS = new Set(['原始神', '神', '英雄', '凡人']);

function chineseGraph(): { nodes: Node[]; edges: Edge[] } {
  const cards = site.cards.filter((c) => isChinese(c) && CN_KINDS.has(c.type));
  const row = new Map<string, number>();
  const order: string[] = [];
  /** next：放在某人旁邊（同一列的配偶放右邊、對手放左邊），免得連線要繞過別人 */
  const put = (key: string, r: number, next?: { to: string; side: 'left' | 'right' }) => {
    if (row.has(key)) return;
    row.set(key, r);
    const at = next ? order.indexOf(next.to) : -1;
    if (at < 0) order.push(key);
    else order.splice(next!.side === 'right' ? at + 1 : at, 0, key);
  };
  const edges: Edge[] = [];
  const seen = new Set<string>();
  const link = (a: string, b: string, kind: Edge['kind'], variant?: string) => {
    const k = kind === 'consort' || kind === 'foe' ? [a, b].sort().join('|') + kind : `${a}>${b}${kind}`;
    if (seen.has(k)) return;
    seen.add(k);
    edges.push({ a, b, kind, variant });
  };
  const sorted = [...cards].sort((x, y) => (eraById.get(x.era)?.order ?? 0) - (eraById.get(y.era)?.order ?? 0));
  for (const c of sorted) put(c.id, (eraById.get(c.era)?.order ?? 1) - 1);
  for (const c of sorted) {
    const r = row.get(c.id)!;
    const f = familyOf(c.id);
    const keyOf = (x: { id?: string; name?: string }) => (x.id && cardById.has(x.id) ? x.id : 'n:' + x.name);
    for (const p of f.parents) { put(keyOf(p), r - 1); link(keyOf(p), c.id, 'blood', p.variant); }
    for (const p of f.children) { put(keyOf(p), r + 1); link(c.id, keyOf(p), 'blood', p.variant); }
    for (const p of f.predecessors) { put(keyOf(p), r - 1); link(keyOf(p), c.id, 'succ', p.variant); }
    for (const p of f.successors) { put(keyOf(p), r + 1); link(c.id, keyOf(p), 'succ', p.variant); }
    for (const p of f.consorts) {
      const k = keyOf(p);
      // 夫妻都已經有位置、又在同一列：把配偶移到旁邊
      if (row.get(k) === r && Math.abs(order.indexOf(k) - order.indexOf(c.id)) > 1) {
        order.splice(order.indexOf(k), 1);
        order.splice(order.indexOf(c.id) + 1, 0, k);
      }
      put(k, r, { to: c.id, side: 'right' });
      link(c.id, k, 'consort', p.variant);
    }
    const mates = new Set(f.consorts.map(keyOf));
    for (const p of f.foes) {
      const i = order.indexOf(c.id);
      const leftIsMate = mates.has(order.at(i - 1) ?? '');
      put(keyOf(p), r, { to: c.id, side: leftIsMate ? 'right' : 'left' });
      link(c.id, keyOf(p), 'foe', p.variant);
    }
  }
  const rows = new Map<number, string[]>();
  for (const k of order) (rows.get(row.get(k)!) ?? rows.set(row.get(k)!, []).get(row.get(k)!)!).push(k);
  const nodes: Node[] = [];
  const GAP = W + 26;
  for (const [r, keys] of rows) {
    keys.forEach((k, i) => {
      const id = k.startsWith('n:') ? undefined : k;
      nodes.push({ key: k, id, name: id ? cardById.get(id)!.name_zh : k.slice(2), x: (i - (keys.length - 1) / 2) * GAP, y: r * ROW_GAP, role: id ? 'ancestor' : 'child' });
    });
  }
  return { nodes, edges };
}

/** 每一列左邊標上神話年代名稱 */
function rowLabels(nodes: Node[]) {
  const eras = site.eras.filter((e) => e.system === 'chinese');
  const minX = Math.min(...nodes.map((n) => n.x)) - W / 2 - 16;
  const ys = [...new Set(nodes.map((n) => n.y))];
  return ys.map((y) => ({ y, x: minX, label: eras.find((e) => e.order - 1 === Math.round(y / ROW_GAP))?.name ?? '' })).filter((r) => r.label);
}

function CnEdge({ e, a, b }: { e: Edge; a: Node; b: Node }) {
  const sameRow = Math.abs(a.y - b.y) < 10;
  let d: string;
  let mid: [number, number];
  if (sameRow) {
    const [l, r] = a.x < b.x ? [a, b] : [b, a];
    const adjacent = r.x - l.x <= W + 30;
    if (adjacent) {
      d = `M${l.x + W / 2},${l.y} L${r.x - W / 2},${r.y}`;
      mid = [(l.x + r.x) / 2, l.y];
    } else {
      // 不相鄰：從框的上緣拱過去，免得穿過中間的人
      const lift = 40 + (r.x - l.x) / 12;
      d = `M${l.x},${l.y - H / 2} C${l.x},${l.y - H / 2 - lift} ${r.x},${r.y - H / 2 - lift} ${r.x},${r.y - H / 2}`;
      mid = [(l.x + r.x) / 2, l.y - H / 2 - lift * 0.75];
    }
  } else {
    const [t, u] = a.y < b.y ? [a, b] : [b, a];
    d = `M${t.x},${t.y + H / 2} C${t.x},${(t.y + u.y) / 2} ${u.x},${(t.y + u.y) / 2} ${u.x},${u.y - H / 2}`;
    mid = [(t.x + u.x) / 2, (t.y + u.y) / 2];
  }
  return (
    <g className={`cn-edge cn-${e.kind}`}>
      <path d={d} className={`edge edge-${e.kind}${e.variant ? ' edge-variant' : ''}`} markerEnd={e.kind === 'succ' ? 'url(#succ-arrow)' : undefined} />
      {e.kind === 'consort' && <path d={d} className="edge edge-consort-inner" />}
      {e.kind === 'foe' && <text x={mid[0]} y={mid[1] + 5} textAnchor="middle" className="foe-mark">✖</text>}
      {e.kind === 'succ' && <text x={mid[0] + 6} y={mid[1]} className="edge-label">傳位</text>}
      {e.variant && <text x={mid[0] + 6} y={mid[1] + 14} className="edge-label">另有一說</text>}
    </g>
  );
}
