import { select } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { avatarOf, cardById, familyOf, imgSrc, site } from '../lib/data';
import { href } from '../lib/router';

const TWELVE = ['god-zeus', 'god-hera', 'god-poseidon', 'god-demeter', 'god-athena', 'god-apollo', 'god-artemis', 'god-ares', 'god-aphrodite', 'god-hephaestus', 'god-hermes', 'god-hestia', 'god-dionysus'];
const HEROES = site.cards.filter((c) => c.type === '英雄').map((c) => c.id);

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
}

const W = 132;
const H = 52;

/** 族譜：中間是焦點人物，上面父母、兩側配偶、下面子女；點任何人就換成他當焦點 */
export function Family({ focus }: { focus?: string }) {
  const [mode, setMode] = useState<'all' | 'twelve' | 'hero'>('all');
  const [hero, setHero] = useState(HEROES[0] ?? '');
  const start = focus && cardById.has(focus) ? focus : 'god-zeus';
  const [cur, setCur] = useState(start);
  useEffect(() => setCur(start), [start]);

  const { nodes, edges } = useMemo(() => (mode === 'hero' ? lineage(hero) : around(cur, mode === 'twelve')), [cur, mode, hero]);
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
    const ys = nodes.map((n) => n.y);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const span = Math.max(Math.max(...xs) - Math.min(...xs) + W + 40, 300);
    const k = Math.min(1.2, box.width / span);
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
      <p className="lead">點任何一位，就以他為中心展開父母、配偶與子女。可以拖曳、用滾輪或兩指縮放。虛線＝「另有一說」。</p>
      <div className="filters">
        <button className={mode === 'all' ? 'on' : ''} onClick={() => setMode('all')}>全部家族</button>
        <button className={mode === 'twelve' ? 'on' : ''} onClick={() => setMode('twelve')}>只看奧林帕斯十二神</button>
        <button className={mode === 'hero' ? 'on' : ''} onClick={() => setMode('hero')}>看英雄的血統</button>
        {mode === 'hero' && (
          <select value={hero} onChange={(e) => setHero(e.target.value)} aria-label="選擇英雄">
            {HEROES.map((h) => (
              <option key={h} value={h}>{cardById.get(h)?.name_zh}</option>
            ))}
          </select>
        )}
      </div>
      <div className="family-wrap">
        <svg ref={svgRef} className="family-svg" role="img" aria-label="族譜圖">
          <g ref={gRef}>
            {edges.map((e, i) => {
              const a = pos.get(e.a)!;
              const b = pos.get(e.b)!;
              const consort = e.a === 'focus' && e.b.startsWith('c');
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
              return (
                <g
                  key={n.key}
                  className={`fnode role-${n.role}${card ? ' clickable' : ''}${TWELVE.includes(n.id ?? '') ? ' twelve' : ''}`}
                  transform={`translate(${n.x - W / 2},${n.y - H / 2})`}
                  onClick={() => {
                    if (card && mode !== 'hero') setCur(card.id);
                    else if (card) {
                      setMode('all');
                      setCur(card.id);
                    }
                  }}
                  tabIndex={card ? 0 : -1}
                  onKeyDown={(e) => e.key === 'Enter' && card && setCur(card.id)}
                >
                  <rect width={W} height={H} rx={10} />
                  {av && <image href={imgSrc(av)} x={6} y={6} width={40} height={40} preserveAspectRatio="xMidYMid slice" clipPath="inset(0 round 8px)" />}
                  <text x={av ? 54 : W / 2} y={22} textAnchor={av ? 'start' : 'middle'} className="fname">{n.name}</text>
                  <text x={av ? 54 : W / 2} y={39} textAnchor={av ? 'start' : 'middle'} className="fsub">{card ? card.type : '（無卡片）'}</text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      {c && mode !== 'hero' && (
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
  const keep = (x: { id?: string }) => !twelveOnly || (x.id && (TWELVE.includes(x.id) || ['titan-cronus', 'titan-rhea'].includes(x.id)));
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
  row(parents, -130, 'parent', 'p');
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
