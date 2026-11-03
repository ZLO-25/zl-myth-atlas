import type { Card } from '../../scripts/lib/types';
import { CardLink, Cites, Figure, Markdown, SourceList } from '../components/bits';
import { Panels } from '../components/Panels';
import { cardById, eraById, familyOf, site, todayById } from '../lib/data';
import { href } from '../lib/router';
import { CardTile } from './simple';

const SYS: Record<string, string> = { greek: '希臘', roman: '羅馬', norse: '北歐' };

/** 「一句話記住○」的○要看卡片類型 */
function pronoun(type: string) {
  if (type === '故事') return '這個故事';
  if (type === '地點') return '這個地方';
  if (type === '怪物') return '牠';
  if (type === '物品') return '它';
  return '他';
}

/** 讀完這張卡，接著讀什麼：前因後果裡的卡優先，再補同一個年代的卡 */
function nextCards(c: Card, backlinks: Card[]): Card[] {
  const picked: Card[] = [];
  const add = (id?: string) => {
    const o = id ? cardById.get(id) : undefined;
    if (o && o.id !== c.id && !picked.some((p) => p.id === o.id)) picked.push(o);
  };
  for (const l of c.effects ?? []) add(l.id);
  for (const l of c.causes ?? []) add(l.id);
  for (const o of backlinks) add(o.id);
  for (const o of site.cards) if (picked.length < 3 && o.era === c.era) add(o.id);
  return picked.slice(0, 3);
}

export function CardPage({ id }: { id: string }) {
  const c = cardById.get(id);
  if (!c) return <div className="page"><p>找不到這張卡：{id}</p></div>;
  const fam = familyOf(c.id);
  const era = eraById.get(c.era);
  const works = (c.images ?? []).filter(Boolean);
  const backlinks = site.cards.filter((o) => o.id !== c.id && [...(o.causes ?? []), ...(o.effects ?? [])].some((l) => l.id === c.id));
  const hasFamily = (fam.parents.length || fam.consorts.length || fam.children.length) > 0;
  const hasCauses = !!(c.causes?.length || c.effects?.length || backlinks.length);
  const next = nextCards(c, backlinks);

  // 本頁內容：只列出這張卡真的有的段落
  const toc: [string, string][] = [];
  if (c.panels?.length) toc.push(['panels', '分格故事']);
  toc.push(['story', '故事']);
  if (works.length) toc.push(['gallery', '古人與畫家怎麼想像']);
  if (c.greek_vs_roman) toc.push(['gvr', '希臘 vs 羅馬']);
  if (hasFamily) toc.push(['family', '家族']);
  if (hasCauses) toc.push(['causes', '前因後果']);
  if (c.disputed?.length) toc.push(['disputed', '說法不一']);
  if (c.today?.length) toc.push(['today', '這個梗你看過']);
  toc.push(['sources', '來源']);

  const jump = (e: React.MouseEvent, anchor: string) => {
    e.preventDefault();
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <article className="page card-page">
      <header className="card-head">
        <div className="card-kicker">
          <span className={`type-chip t-${c.type}`}>{c.type}</span>
          {c.myth_system.map((s) => (
            <span key={s} className="sys-chip">{SYS[s]}</span>
          ))}
          {era && (
            <a className="era-chip" href={`${href('timeline')}?era=${era.id}`} title="在神話年代裡看這個時代">
              {era.order}. {era.name}
            </a>
          )}
          <span className={`reality r-${c.reality.level}`} title={c.reality.evidence ?? ''}>{c.reality.level}</span>
        </div>
        <h1>
          {c.name_zh} <span className="name-en">{c.name_en}</span>
        </h1>
        <p className="name-orig">
          {c.name_orig}
          {c.roman && (
            <>
              {' '}｜羅馬：{c.roman.card ? <CardLink id={c.roman.card}>{c.roman.name_zh}</CardLink> : c.roman.name_zh} {c.roman.name_la}
              {c.roman.name_en && c.roman.name_en !== c.roman.name_la ? `（英文 ${c.roman.name_en}）` : ''}
            </>
          )}
        </p>
        {c.aliases?.length > 0 && <p className="aliases">也叫：{c.aliases.join('、')}</p>}
        <ol className="three-lines">
          {c.three_lines.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ol>
        <p className="hook">
          <span>一句話記住{pronoun(c.type)}</span>
          {c.hook}
        </p>
        {c.reality.level !== '純神話' && c.reality.evidence && (
          <p className="reality-note">
            <strong>{c.reality.level}：</strong>
            {c.reality.evidence} {c.reality.src && <Cites ids={c.reality.src} cardId={c.id} />}
          </p>
        )}
        <nav className="toc" aria-label="本頁內容">
          <span className="muted">本頁內容</span>
          {toc.map(([a, label]) => (
            <a key={a} href={`#${a}`} onClick={(e) => jump(e, `sec-${a}`)}>
              {label}
            </a>
          ))}
        </nav>
      </header>

      {(c.domains || c.how_to_recognize) && (
        <section className="facts">
          {c.domains && (
            <div>
              <h3>掌管與象徵</h3>
              <p>掌管：{c.domains.roles.join('、')}</p>
              <p>象徵物：{c.domains.symbols.join('、')}</p>
            </div>
          )}
          {c.how_to_recognize && (
            <div>
              <h3>名畫雕像裡怎麼認出{c.name_zh}</h3>
              <p>
                {c.how_to_recognize}{' '}
                {c.how_to_recognize_src && <Cites ids={c.how_to_recognize_src} cardId={c.id} />}
              </p>
            </div>
          )}
        </section>
      )}

      {c.panels && c.panels.length > 0 && (
        <section id="sec-panels">
          <h2>分格故事</h2>
          <p className="muted small">先用 {c.panels.length} 格看完整個故事，再往下讀細節。</p>
          <Panels panels={c.panels} cardId={c.id} />
        </section>
      )}

      <section className="body" id="sec-story">
        <Markdown text={c.body ?? ''} cardId={c.id} />
      </section>

      {works.length > 0 && (
        <section className="gallery" id="sec-gallery">
          <h2>古人與畫家怎麼想像</h2>
          <p className="muted small">讀完故事再看圖：每張圖下面的「看這張圖」會告訴你畫家抓的是哪一刻。</p>
          <div className="gallery-grid">
            {works.map((im) => (
              <Figure key={im} id={im} />
            ))}
          </div>
          {c.few_images && <p className="note">{c.few_images}</p>}
        </section>
      )}

      {c.greek_vs_roman && (
        <section className="gvr" id="sec-gvr">
          <h2>希臘 vs 羅馬</h2>
          <p>
            {c.greek_vs_roman.text} <Cites ids={c.greek_vs_roman.src} cardId={c.id} />
          </p>
          <a href={href('compare')}>看完整對照表 →</a>
        </section>
      )}

      {hasFamily && (
        <section className="family-box" id="sec-family">
          <h2>家族</h2>
          <FamRow label="父母" list={fam.parents} cardId={c.id} />
          <FamRow label="配偶／情人" list={fam.consorts} cardId={c.id} />
          <FamRow label="子女" list={fam.children} cardId={c.id} />
          <a href={href('family', c.id)}>在族譜裡展開 →</a>
        </section>
      )}

      {hasCauses && (
        <section className="causes" id="sec-causes">
          <h2>前因後果</h2>
          {c.causes?.map((l) => (
            <p key={'c' + l.id}>
              <span className="rel">前因｜{l.rel}</span> <CardLink id={l.id} />：{l.why} <Cites ids={l.src} cardId={c.id} />
            </p>
          ))}
          {c.effects?.map((l) => (
            <p key={'e' + l.id}>
              <span className="rel">後果｜{l.rel}</span> <CardLink id={l.id} />：{l.why} <Cites ids={l.src} cardId={c.id} />
            </p>
          ))}
          {backlinks
            .filter((o) => !c.causes?.some((l) => l.id === o.id) && !c.effects?.some((l) => l.id === o.id))
            .map((o) => {
              const asCause = o.causes?.find((l) => l.id === c.id);
              const asEffect = o.effects?.find((l) => l.id === c.id);
              return (
                <p key={'b' + o.id}>
                  <span className="rel">{asCause ? '後果' : '前因'}｜{(asCause ?? asEffect)!.rel}</span> <CardLink id={o.id} />：{(asCause ?? asEffect)!.why}{' '}
                  <span className="muted small">（寫在{o.name_zh}的卡片）</span>
                </p>
              );
            })}
        </section>
      )}

      {c.disputed && c.disputed.length > 0 && (
        <section className="disputed" id="sec-disputed">
          <h2>說法不一的地方</h2>
          <p className="muted small">神話沒有「標準版本」：不同時代的作者常常講得不一樣，這裡並列給你看。</p>
          {c.disputed.map((d, i) => (
            <div key={i}>
              <h4>{d.claim}</h4>
              <ul>
                {d.views.map((v, j) => (
                  <li key={j}>
                    {v.view} <Cites ids={v.src} cardId={c.id} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {c.history_river && (
        <p className="river-link">
          <a href={c.history_river.url} target="_blank" rel="noreferrer">
            到歷史長河看真實歷史：{c.history_river.label} ↗
          </a>
        </p>
      )}

      {c.today && c.today.length > 0 && (
        <section className="today-box" id="sec-today">
          <h2>這個梗你看過</h2>
          <ul>
            {c.today.map((t) => {
              const it = todayById.get(t);
              return it ? (
                <li key={t}>
                  <a href={href('today', it.id)}>{it.title}</a> <span className="muted">｜{it.category}</span>
                  {it.status === '說法未證實' && <span className="unverified">說法未證實</span>}
                </li>
              ) : null;
            })}
          </ul>
        </section>
      )}

      {c.topics.length > 0 && (
        <p className="topics">
          {c.topics.map((t) => (
            <a key={t} className="topic" href={href('topic', t)}>#{t}</a>
          ))}
        </p>
      )}

      <section id="sec-sources">
        <h2>來源</h2>
        <SourceList sources={c.sources} cardId={c.id} />
      </section>

      {next.length > 0 && (
        <section className="next-cards">
          <h2>接著讀</h2>
          <div className="card-grid">
            {next.map((o) => (
              <CardTile key={o.id} id={o.id} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function FamRow({ label, list, cardId }: { label: string; list: { id?: string; name?: string; variant?: string; src: string[]; from: string }[]; cardId: string }) {
  if (!list.length) return null;
  return (
    <p>
      <span className="rel">{label}</span>{' '}
      {list.map((f, i) => (
        <span key={i} className={f.variant ? 'variant' : ''}>
          {i > 0 && '、'}
          {f.id ? <CardLink id={f.id} /> : f.name}
          {f.variant && <span className="variant-tag">另有一說：{f.variant}</span>}
          {f.from === cardId && <Cites ids={f.src} cardId={cardId} />}
        </span>
      ))}
    </p>
  );
}

export function cardsOfType(type: string): Card[] {
  return site.cards.filter((c) => c.type === type);
}
