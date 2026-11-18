import { useEffect, useRef, useState } from 'react';
import type { Panel } from '../../scripts/lib/types';
import { imageById, imgSrc } from '../lib/data';

const videoSrc = (v: string) => import.meta.env.BASE_URL + v.replace(/^\//, '');
const reduceMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** 整段固定 30 秒：每格平均分配（6 格＝每格 5 秒） */
export const QUICK_TOTAL_MS = 30_000;
const TICK = 100;

/** 「30 秒看完」：既有插畫一格一格自動播，圖慢慢推近或平移，下方一句字幕。
 *  不是影片檔，所以畫風就是原圖、不佔流量；之後某一格有動態影片時再換進來。 */
export function QuickPlay({ panels, film, onClose }: { panels: Panel[]; film?: string; onClose: (at: number) => void }) {
  const per = QUICK_TOTAL_MS / panels.length;
  const [ms, setMs] = useState(0);
  const [paused, setPaused] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const still = useRef(reduceMotion()).current; // 「減少動態效果」時只放靜態圖
  // 有整支短片：畫面由一支連續影片帶著走，字幕依影片時間換；ms 只是把影片進度換算成同一把尺
  const filmOn = !!film && !still;
  const [dur, setDur] = useState(0); // 短片實際秒數
  const done = ms >= QUICK_TOTAL_MS;
  const i = Math.min(panels.length - 1, Math.floor(ms / per));

  useEffect(() => {
    if (filmOn || paused || done) return;
    const t = window.setInterval(() => setMs((x) => Math.min(QUICK_TOTAL_MS, x + TICK)), TICK);
    return () => window.clearInterval(t);
  }, [filmOn, paused, done]);

  // 下一格的圖先載好，換格時才不會閃白
  useEffect(() => {
    const next = panels[i + 1]?.image;
    const im = next && imageById.get(next);
    if (im) new Image().src = imgSrc(im);
    const nv = panels[i + 1]?.video;
    if (nv && !still) fetch(videoSrc(nv)).catch(() => {}); // 下一格的影片先抓進快取
  }, [i, panels]);

  useEffect(() => box.current?.focus(), []);

  // 這一格有動態影片：跟著暫停／繼續；影片比這一格的秒數長就自然被下一格接走
  const curVideo = filmOn ? film : !still && !done ? panels[i].video : undefined;
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused, curVideo, i]);

  const jump = (j: number) => {
    const to = Math.min(panels.length - 1, Math.max(0, j)) * per;
    const v = vid.current;
    if (filmOn && v && v.duration) v.currentTime = (to / QUICK_TOTAL_MS) * v.duration;
    setMs(to);
  };
  const seek = (ratio: number) => {
    const v = vid.current;
    if (v && v.duration) v.currentTime = Math.min(0.999, Math.max(0, ratio)) * v.duration;
  };
  const replay = () => {
    const v = vid.current;
    if (filmOn && v) { v.currentTime = 0; v.play().catch(() => {}); }
    setMs(0);
    setPaused(false);
  };
  const left = filmOn && dur ? Math.ceil(dur * (1 - ms / QUICK_TOTAL_MS)) : Math.ceil((QUICK_TOTAL_MS - ms) / 1000);

  return (
    <div
      className="qp"
      ref={box}
      tabIndex={0}
      role="group"
      aria-label={filmOn ? '故事短片' : '30 秒看完這個故事'}
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
              className={`qp-img ${p.video && !still ? 'qp-still' : `qp-move-${j % 4}`} ${j === i ? 'on' : ''} ${paused || done ? 'hold' : ''}`}
              style={{ animationDuration: `${per + 600}ms` }}
              src={imgSrc(im)}
              alt={j === i ? im.title : ''}
            />
          );
        })}
        {curVideo && (
          <video
            key={curVideo}
            ref={vid}
            className="qp-video"
            src={videoSrc(curVideo)}
            muted
            playsInline
            autoPlay
            preload="auto"
            aria-hidden="true"
            onLoadedMetadata={filmOn ? (e) => setDur(e.currentTarget.duration) : undefined}
            onTimeUpdate={filmOn ? (e) => { const v = e.currentTarget; if (v.duration && !v.ended) setMs((v.currentTime / v.duration) * QUICK_TOTAL_MS); } : undefined}
            onEnded={filmOn ? () => setMs(QUICK_TOTAL_MS) : undefined}
          />
        )}
        <span className="ai-badge">{curVideo ? 'AI 動畫' : 'AI 插畫'}</span>
        {paused && !done && <span className="qp-paused">已暫停，點畫面繼續</span>}
        {done ? (
          <div className="qp-end">
            <p>看完了。記得嗎：{panels[panels.length - 1].short}</p>
            <div className="qp-end-btns">
              <button type="button" onClick={replay}>再看一次</button>
              <button type="button" onClick={() => onClose(0)}>逐格細讀</button>
            </div>
          </div>
        ) : (
          <p className="qp-cap" key={i} aria-live="polite">{panels[i].short}</p>
        )}
      </div>
      <div className={`qp-bar ${filmOn ? 'qp-bar-film' : ''}`} aria-hidden="true">
        {filmOn ? (
          <button type="button" tabIndex={-1} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seek((e.clientX - r.left) / r.width); }}>
            <span style={{ width: `${(ms / QUICK_TOTAL_MS) * 100}%` }} />
          </button>
        ) : (
          panels.map((_, j) => (
            <button key={j} type="button" tabIndex={-1} onClick={() => jump(j)}>
              <span style={{ width: `${Math.min(100, Math.max(0, ((ms - j * per) / per) * 100))}%` }} />
            </button>
          ))
        )}
      </div>
      <div className="qp-ctl">
        <button type="button" onClick={() => setPaused((v) => !v)} disabled={done}>
          {paused ? '▶ 繼續' : '❚❚ 暫停'}
        </button>
        <span className="muted small">
          {filmOn ? `剩 ${left} 秒` : `第 ${i + 1} / ${panels.length} 格｜${left} 秒`}
        </span>
        <button type="button" onClick={() => onClose(i)}>✕ 離開</button>
      </div>
    </div>
  );
}
