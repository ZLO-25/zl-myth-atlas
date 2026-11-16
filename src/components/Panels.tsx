import { useRef, useState } from 'react';
import type { Panel } from '../../scripts/lib/types';
import { Figure, Inline } from './bits';
import { QuickPlay } from './QuickPlay';

/** 分格故事：一格＝一張圖＋2–4 句，可按鈕、鍵盤左右鍵或手指滑動翻頁 */
export function Panels({ panels, cardId }: { panels: Panel[]; cardId: string }) {
  const [i, setI] = useState(0);
  const [cover, setCover] = useState(false); // 「講給別人聽」：只看圖，說明文字蓋住
  const [shown, setShown] = useState<Set<number>>(new Set());
  const [quick, setQuick] = useState(false); // 「30 秒看完」自動播放
  const canQuick = panels.every((x) => x.short && x.image);
  const startX = useRef<number | null>(null);
  const go = (d: number) => setI((x) => Math.min(panels.length - 1, Math.max(0, x + d)));
  const p = panels[i];
  const hidden = cover && !shown.has(i);
  const flip = (on: boolean) => setShown((x) => { const n = new Set(x); if (on) n.add(i); else n.delete(i); return n; });
  return (
    <section
      className="panels"
      aria-label="分格故事"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }}
      onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (startX.current === null) return;
        const dx = e.changedTouches[0].clientX - startX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        startX.current = null;
      }}
    >
      {quick && <QuickPlay panels={panels} onClose={(at) => { setI(at); setQuick(false); }} />}
      <div className="panel-tools" hidden={quick}>
        {canQuick && (
          <button type="button" className="quick-start" onClick={() => setQuick(true)}>
            ▶ 30 秒看完
          </button>
        )}
        <button
          type="button"
          className="cover-toggle"
          aria-pressed={cover}
          onClick={() => {
            setCover((v) => !v);
            setShown(new Set());
          }}
        >
          {cover ? '看說明文字（離開講給別人聽）' : '講給別人聽：只看圖、蓋住說明'}
        </button>
        {cover && <span className="muted small">看著圖，試著用自己的話把這一格講出來，再翻開對照。</span>}
      </div>
      <div className="panel-frame" hidden={quick}>
        {p.image ? <Figure id={p.image} compact /> : <div className="panel-noimg" />}
        {hidden ? (
          <div className="panel-cover">
            <p className="muted">這一格的說明文字蓋住了。</p>
            <button type="button" className="reveal" aria-expanded={false} onClick={() => flip(true)}>
              翻開看原文
            </button>
          </div>
        ) : (
          <div className="panel-reveal">
            <p className="panel-text">
              <Inline text={p.text} cardId={cardId} /> <Inline text={p.src.map((s) => `[${s}]`).join('')} cardId={cardId} />
            </p>
            {cover && (
              <button type="button" className="reveal" aria-expanded={true} onClick={() => flip(false)}>
                再蓋起來
              </button>
            )}
          </div>
        )}
      </div>
      <div className="panel-nav" hidden={quick}>
        <button onClick={() => go(-1)} disabled={i === 0} aria-label="上一格">
          ←
        </button>
        <span className="panel-dots">
          {panels.map((_, j) => (
            <button key={j} className={j === i ? 'on' : ''} onClick={() => setI(j)} aria-label={`第 ${j + 1} 格`} />
          ))}
        </span>
        <span className="muted">
          {i + 1} / {panels.length}
        </span>
        <button onClick={() => go(1)} disabled={i === panels.length - 1} aria-label="下一格">
          →
        </button>
      </div>
    </section>
  );
}
