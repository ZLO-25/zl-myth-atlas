import { useEffect, useRef, useState } from 'react';
import type { Panel } from '../../scripts/lib/types';
import { imageById, imgSrc } from '../lib/data';

/** 整段固定 30 秒：每格平均分配（6 格＝每格 5 秒） */
export const QUICK_TOTAL_MS = 30_000;
const TICK = 100;

/** 「30 秒看完」：既有插畫一格一格自動播，圖慢慢推近或平移，下方一句字幕。
 *  不是影片檔，所以畫風就是原圖、不佔流量；之後某一格有動態影片時再換進來。 */
export function QuickPlay({ panels, onClose }: { panels: Panel[]; onClose: (at: number) => void }) {
  const per = QUICK_TOTAL_MS / panels.length;
  const [ms, setMs] = useState(0);
  const [paused, setPaused] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const done = ms >= QUICK_TOTAL_MS;
  const i = Math.min(panels.length - 1, Math.floor(ms / per));

  useEffect(() => {
    if (paused || done) return;
    const t = window.setInterval(() => setMs((x) => Math.min(QUICK_TOTAL_MS, x + TICK)), TICK);
    return () => window.clearInterval(t);
  }, [paused, done]);

  // 下一格的圖先載好，換格時才不會閃白
  useEffect(() => {
    const next = panels[i + 1]?.image;
    const im = next && imageById.get(next);
    if (im) new Image().src = imgSrc(im);
  }, [i, panels]);

  useEffect(() => box.current?.focus(), []);

  const jump = (j: number) => setMs(Math.min(panels.length - 1, Math.max(0, j)) * per);

  return (
    <div
      className="qp"
      ref={box}
      tabIndex={0}
      role="group"
      aria-label="30 秒看完這個故事"
      onKeyDown={(e) => {
        if (e.key === ' ') { e.preventDefault(); setPaused((v) => !v); }
        if (e.key === 'ArrowRight') { e.stopPropagation(); jump(i + 1); }
        if (e.key === 'ArrowLeft') { e.stopPropagation(); jump(i - 1); }
        if (e.key === 'Escape') onClose(i);
      }}
    >
      <div className="qp-stage" onClick={() => !done && setPaused((v) => !v)}>
        {panels.map((p, j) => {
          const im = p.image ? imageById.get(p.image) : undefined;
          if (!im || Math.abs(j - i) > 1) return null;
          return (
            <img
              key={j}
              className={`qp-img qp-move-${j % 4} ${j === i ? 'on' : ''} ${paused || done ? 'hold' : ''}`}
              style={{ animationDuration: `${per + 600}ms` }}
              src={imgSrc(im)}
              alt={j === i ? im.title : ''}
            />
          );
        })}
        <span className="ai-badge">AI 插畫</span>
        {paused && !done && <span className="qp-paused">已暫停，點畫面繼續</span>}
        {done ? (
          <div className="qp-end">
            <p>看完了。記得嗎：{panels[panels.length - 1].short}</p>
            <div className="qp-end-btns">
              <button type="button" onClick={() => { setMs(0); setPaused(false); }}>再看一次</button>
              <button type="button" onClick={() => onClose(0)}>逐格細讀</button>
            </div>
          </div>
        ) : (
          <p className="qp-cap" key={i} aria-live="polite">{panels[i].short}</p>
        )}
      </div>
      <div className="qp-bar" aria-hidden="true">
        {panels.map((_, j) => (
          <button key={j} type="button" tabIndex={-1} onClick={() => jump(j)}>
            <span style={{ width: `${Math.min(100, Math.max(0, ((ms - j * per) / per) * 100))}%` }} />
          </button>
        ))}
      </div>
      <div className="qp-ctl">
        <button type="button" onClick={() => setPaused((v) => !v)} disabled={done}>
          {paused ? '▶ 繼續' : '❚❚ 暫停'}
        </button>
        <span className="muted small">
          第 {i + 1} / {panels.length} 格｜{Math.ceil((QUICK_TOTAL_MS - ms) / 1000)} 秒
        </span>
        <button type="button" onClick={() => onClose(i)}>✕ 離開</button>
      </div>
    </div>
  );
}
