import { useEffect, useState } from 'react';
import { CardLink, SysTabs } from '../components/bits';
import { site } from '../lib/data';
import { parseSys, SYSTEMS, type Sys } from '../lib/systems';

const fmt = (y: number) => (y < 0 ? `前 ${-y}` : `西元 ${y}`);

/** 上半：神話年代（故事順序）。下半：真實歷史參照軸（這些故事何時被寫下來） */
export function Timeline() {
  const q = new URLSearchParams(location.hash.split('?')[1] ?? '');
  const want = q.get('era');
  const [sys, setSys] = useState<Sys>(() => (site.eras.find((e) => e.id === want)?.system ?? parseSys(q.get('sys')) ?? 'west') as Sys);
  // 同一頁內換網址（例如從別處按「年代」連結）時，也要跟著切到對應的體系
  useEffect(() => {
    const on = () => {
      const p = new URLSearchParams(location.hash.split('?')[1] ?? '');
      const era = site.eras.find((e) => e.id === p.get('era'));
      const k = era ? era.system ?? 'west' : parseSys(p.get('sys'));
      if (k) setSys(k as Sys);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const eras = [...site.eras].filter((e) => (e.system ?? 'west') === sys).sort((a, b) => a.order - b.order);
  // 真實歷史軸：只畫目前這套神話的資料；起訖年依這一套的資料算，往外各留一點邊
  const hist = site.history.filter((h) => (h.system ?? 'west') === sys).sort((a, b) => a.start - b.start);
  const step = 200;
  const min = Math.floor((Math.min(...hist.map((h) => h.start)) - step / 4) / step) * step;
  const max = Math.ceil((Math.max(...hist.map((h) => h.end)) + step / 4) / step) * step;
  const pct = (y: number) => ((y - min) / (max - min)) * 100;
  const ticks: number[] = [];
  for (let y = min; y <= max; y += step) ticks.push(y);
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
        {sys === 'chinese'
          ? '中華神話的特別之處是：越後面的年代，神越像古代帝王，最後接上歷史上的夏朝。但「最早」的盤古，其實是最晚（三國時代）才被寫進書裡的。下面另有一條真實歷史軸，告訴你這些故事是什麼時候被寫進書裡的。'
          : sys === 'norse'
            ? '北歐神話的故事從一道裂口開始，用巨人的身體造出世界，最後在諸神黃昏被火燒毀，又重新升起。很多完整的情節只見於 13 世紀冰島作者斯諾里的《散文埃達》，不是更老的古詩。下面另有一條真實歷史軸，告訴你這些書是什麼時候被寫下來的。'
            : '希臘羅馬神話從混沌開始，經過諸神的世代、英雄的時代，最後接上羅馬建國；宙斯什麼時候打敗泰坦，沒有年份可言。下面另有一條真實歷史軸，告訴你這些故事是什麼時候被寫下來的。'}
      </p>
      <SysTabs value={sys} onChange={(v) => setSys(v as Sys)} label="選一套神話" />
      <p className="muted small era-range">{{ west: '希臘羅馬：從混沌到羅馬建國', norse: '北歐：從創世到諸神黃昏', chinese: '中華：從盤古到夏朝' }[sys]}</p>
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

      <>
      <h2>真實歷史參照：故事何時被寫下來（{SYSTEMS.find((x) => x.key === sys)!.label}）</h2>
      <div className="hist-axis" role="list">
        <div className="hist-ticks" aria-hidden>
          {ticks.map((t) => (
            <span key={t} style={{ left: `${pct(t)}%` }}>{t === 0 ? '0' : fmt(t)}</span>
          ))}
        </div>
        {hist.map((h) => (
          <div key={h.label} className="hist-row" role="listitem">
            <div className={`hist-bar sys-${sys}`} style={{ left: `${pct(h.start)}%`, width: `${Math.max(1.2, pct(h.end) - pct(h.start))}%` }} />
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
      </>
    </div>
  );
}
