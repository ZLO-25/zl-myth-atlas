import { useEffect, useState } from 'react';
import { CardLink } from '../components/bits';
import { site } from '../lib/data';

const fmt = (y: number) => (y < 0 ? `前 ${-y}` : `西元 ${y}`);

/** 上半：神話年代（故事順序）。下半：真實歷史參照軸（這些故事何時被寫下來） */
export function Timeline() {
  const want = new URLSearchParams(location.hash.split('?')[1] ?? '').get('era');
  const [sys, setSys] = useState<'west' | 'chinese'>(site.eras.find((e) => e.id === want)?.system === 'chinese' ? 'chinese' : 'west');
  const eras = [...site.eras].filter((e) => (e.system === 'chinese') === (sys === 'chinese')).sort((a, b) => a.order - b.order);
  const hist = [...site.history].sort((a, b) => a.start - b.start);
  const min = Math.min(-1700, ...hist.map((h) => h.start));
  const max = Math.max(50, ...hist.map((h) => h.end));
  const pct = (y: number) => ((y - min) / (max - min)) * 100;
  const ticks: number[] = [];
  for (let y = Math.ceil(min / 200) * 200; y <= max; y += 200) ticks.push(y);
  // 從卡片的年代標籤跳過來（#/timeline?era=heroes）時，捲到那個年代並短暫強調
  useEffect(() => {
    const era = new URLSearchParams(location.hash.split('?')[1] ?? '').get('era');
    const el = era && document.getElementById(`era-${era}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('era-hl');
    const t = setTimeout(() => el.classList.remove('era-hl'), 2500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="page timeline-page">
      <h1>神話年代</h1>
      <p className="lead">
        <strong>注意：</strong>神話年代是「故事發生的先後順序」，不是真實年份。
        {sys === 'chinese' ? '中華神話的特別之處是：越後面的年代，神越像古代帝王，最後接上歷史上的夏朝。但「最早」的盤古，其實是最晚（三國時代）才被寫進書裡的。' : '宙斯什麼時候打敗泰坦，沒有年份可言。下面另有一條真實歷史軸，告訴你這些故事是什麼時候被寫下來的。'}
      </p>
      <div className="filters" aria-label="選擇神話體系">
        <button className={sys === 'west' ? 'on' : ''} onClick={() => setSys('west')}>希臘羅馬：從混沌到羅馬建國</button>
        <button className={sys === 'chinese' ? 'on' : ''} onClick={() => setSys('chinese')}>中華：從盤古到夏朝</button>
      </div>
      {sys === 'chinese' && (
        <pre className="ascii">{`開天闢地 → 補天造人 → 三皇教化 → 炎黃之戰 → 堯舜時代 → 洪水與治水 → 夏朝開始
←──────── 神的成分多 ─────────────────────── 人的成分多 ────────→`}</pre>
      )}
      <ol className="eras">
        {eras.map((e) => (
          <li key={e.id} className="era" id={`era-${e.id}`}>
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

      {sys === 'west' && (<>
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
      </>)}
    </div>
  );
}
