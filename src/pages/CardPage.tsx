import type { Card } from '../../scripts/lib/types';
import { CardLink, Cites, Figure, Markdown, SourceList } from '../components/bits';
import { Panels } from '../components/Panels';
import { cardById, eraById, familyOf, site, todayById } from '../lib/data';
import { href } from '../lib/router';

const SYS: Record<string, string> = { greek: '希臘', roman: '羅馬', norse: '北歐' };

export function CardPage({ id }: { id: string }) {
  const c = cardById.get(id);
  if (!c) return <div className="page"><p>找不到這張卡：{id}</p></div>;
  const fam = familyOf(c.id);
  const era = eraById.get(c.era);
  const works = (c.images ?? []).filter(Boolean);
  const backlinks = site.cards.filter((o) => o.id !== c.id && [...(o.causes ?? []), ...(o.effects ?? [])].some((l) => l.id === c.id));
  return (
    <article className="page card-page">
      <header className="card-head">
        <div className="card-kicker">
          <span className={`type-chip t-${c.type}`}>{c.type}</span>
          {c.myth_system.map((s) => (
            <span key={s} className="sys-chip">{SYS[s]}</span>
          ))}
          {era && <a className="era-chip" href={href('timeline')}>{era.name}</a>}
          <span className={`reality r-${c.reality.level}`}>{c.reality.level}</span>
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
          <span>一句話記住{c.type === '故事' ? '這個故事' : '他'}</span>
          {c.hook}
        </p>
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
              <h3>名畫雕像裡怎麼認出{c.type === '地點' ? '這裡' : '他'}</h3>
              <p>{c.how_to_recognize}</p>
            </div>
          )}
        </section>
      )}

      {works.length > 0 && (
        <section className="gallery">
          <h2>古人與畫家怎麼想像</h2>
          <div className="gallery-grid">
            {works.map((im) => (
              <Figure key={im} id={im} />
            ))}
          </div>
        </section>
      )}

      {c.panels && c.panels.length > 0 && (
        <section>
          <h2>分格故事</h2>
          <Panels panels={c.panels} cardId={c.id} />
        </section>
      )}

      <section className="body">
        <Markdown text={c.body ?? ''} cardId={c.id} />
      </section>

      {c.greek_vs_roman && (
        <section className="gvr">
          <h2>希臘 vs 羅馬</h2>
          <p>
            {c.greek_vs_roman.text} <Cites ids={c.greek_vs_roman.src} cardId={c.id} />
          </p>
          <a href={href('compare')}>看完整對照表 →</a>
        </section>
      )}

      {(fam.parents.length || fam.consorts.length || fam.children.length) > 0 && (
        <section className="family-box">
          <h2>家族</h2>
          <FamRow label="父母" list={fam.parents} cardId={c.id} />
          <FamRow label="配偶／情人" list={fam.consorts} cardId={c.id} />
          <FamRow label="子女" list={fam.children} cardId={c.id} />
          <a href={href('family', c.id)}>在族譜裡展開 →</a>
        </section>
      )}

      {(c.causes?.length || c.effects?.length || backlinks.length) ? (
        <section className="causes">
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
        </section>
      ) : null}

      {c.disputed && c.disputed.length > 0 && (
        <section className="disputed">
          <h2>說法不一的地方</h2>
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
        <section className="today-box">
          <h2>這個梗你看過</h2>
          <ul>
            {c.today.map((t) => {
              const it = todayById.get(t);
              return it ? (
                <li key={t}>
                  <a href={href('today', it.id)}>{it.title}</a> <span className="muted">｜{it.category}</span>
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

      <section>
        <h2>來源</h2>
        <SourceList sources={c.sources} cardId={c.id} />
      </section>
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
