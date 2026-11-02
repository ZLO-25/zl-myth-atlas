import { CardLink } from '../components/bits';
import { site } from '../lib/data';

const fmt = (y: number) => (y < 0 ? `前 ${-y}` : `西元 ${y}`);

/** 上半：神話年代（故事順序）。下半：真實歷史參照軸（這些故事何時被寫下來） */
export function Timeline() {
  const eras = [...site.eras].sort((a, b) => a.order - b.order);
  const hist = [...site.history].sort((a, b) => a.start - b.start);
  const min = Math.min(-1700, ...hist.map((h) => h.start));
  const max = Math.max(50, ...hist.map((h) => h.end));
  const pct = (y: number) => ((y - min) / (max - min)) * 100;
  const ticks: number[] = [];
  for (let y = Math.ceil(min / 200) * 200; y <= max; y += 200) ticks.push(y);
  return (
    <div className="page timeline-page">
      <h1>神話年代</h1>
      <p className="lead">
        <strong>注意：</strong>神話年代是「故事發生的先後順序」，不是真實年份。宙斯什麼時候打敗泰坦，沒有年份可言。下面另有一條真實歷史軸，告訴你這些故事是什麼時候被寫下來的。
      </p>
      <ol className="eras">
        {eras.map((e) => (
          <li key={e.id} className="era">
            <div className="era-name">
              <span className="era-no">{e.order}</span>
              {e.name}
            </div>
            <p className="era-sum">{e.summary}</p>
            <div className="era-cards">
              {site.cards
                .filter((c) => c.era === e.id)
                .map((c) => (
                  <CardLink key={c.id} id={c.id} />
                ))}
            </div>
          </li>
        ))}
      </ol>

      <h2>真實歷史參照：故事何時被寫下來</h2>
      <div className="hist-axis" role="list">
        <div className="hist-ticks" aria-hidden>
          {ticks.map((t) => (
            <span key={t} style={{ left: `${pct(t)}%` }}>{t === 0 ? '0' : fmt(t)}</span>
          ))}
        </div>
        {hist.map((h) => (
          <div key={h.label} className="hist-row" role="listitem">
            <div className="hist-bar" style={{ left: `${pct(h.start)}%`, width: `${Math.max(1.2, pct(h.end) - pct(h.start))}%` }} />
            <div className="hist-text">
              <strong>{h.label}</strong>
              <span className="muted">
                {h.start === h.end ? `約${fmt(h.start)}年` : `約${fmt(h.start)}–${fmt(h.end).replace('西元 ', '')}年`}
              </span>
              <span>{h.note}</span>
              <span className="small">
                {h.src.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noreferrer">
                    {s.cite}
                  </a>
                ))}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
