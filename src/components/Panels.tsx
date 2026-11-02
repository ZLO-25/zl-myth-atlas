import { useRef, useState } from 'react';
import type { Panel } from '../../scripts/lib/types';
import { Figure, Inline } from './bits';

/** 分格故事：一格＝一張圖＋2–4 句，可按鈕、鍵盤左右鍵或手指滑動翻頁 */
export function Panels({ panels, cardId }: { panels: Panel[]; cardId: string }) {
  const [i, setI] = useState(0);
  const startX = useRef<number | null>(null);
  const go = (d: number) => setI((x) => Math.min(panels.length - 1, Math.max(0, x + d)));
  const p = panels[i];
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
      <div className="panel-frame">
        {p.image ? <Figure id={p.image} compact /> : <div className="panel-noimg" />}
        <p className="panel-text">
          <Inline text={p.text} cardId={cardId} /> <Inline text={p.src.map((s) => `[${s}]`).join('')} cardId={cardId} />
        </p>
      </div>
      <div className="panel-nav">
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
