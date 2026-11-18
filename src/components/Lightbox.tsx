import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { imageById, imgSrc } from '../lib/data';
import { ImageCredit } from './bits';

/** 燈箱：點卡片上的圖，全螢幕放大看。
 *  任何地方呼叫 openLightbox(這一組圖的 id, 從第幾張開始)，App 最外層的 <Lightbox /> 就會打開。
 *  一組有好幾張時可以左右切換（按鈕、鍵盤左右鍵、手指滑動）。 */
type State = { ids: string[]; at: number } | null;
let state: State = null;
const subs = new Set<() => void>();
const set = (s: State) => {
  state = s;
  subs.forEach((f) => f());
};
export const openLightbox = (ids: string[], at = 0) => {
  const list = ids.filter((id) => imageById.has(id));
  if (list.length) set({ ids: list, at: Math.max(0, list.indexOf(ids[at])) });
};
const close = () => set(null);
const useLightbox = () =>
  useSyncExternalStore(
    (f) => (subs.add(f), () => void subs.delete(f)),
    () => state,
  );

export function Lightbox() {
  const s = useLightbox();
  const [zoom, setZoom] = useState(false); // 點圖切換：塞滿螢幕 ↔ 原尺寸（可捲動）
  const closeBtn = useRef<HTMLButtonElement>(null);
  const back = useRef<Element | null>(null); // 關掉後把焦點還給原本那張圖
  const startX = useRef<number | null>(null);
  const n = s?.ids.length ?? 0;
  const go = (d: number) => {
    if (!s || n < 2) return;
    setZoom(false);
    set({ ...s, at: (s.at + d + n) % n });
  };

  useEffect(() => {
    if (!s) return;
    back.current = document.activeElement;
    closeBtn.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('hashchange', close); // 換頁就關掉
    return () => {
      window.removeEventListener('hashchange', close);
      document.body.style.overflow = prev;
      (back.current as HTMLElement | null)?.focus?.({ preventScroll: true });
    };
  }, [!!s]);

  // 先把左右兩張載好，切換時才不會閃白
  useEffect(() => {
    if (!s || n < 2) return;
    for (const d of [1, -1]) {
      const im = imageById.get(s.ids[(s.at + d + n) % n]);
      if (im) new Image().src = imgSrc(im);
    }
  }, [s?.at, s?.ids]);

  if (!s) return null;
  const im = imageById.get(s.ids[s.at]);
  if (!im) return null;

  return (
    <div
      className="lb"
      role="dialog"
      aria-modal="true"
      aria-label={`放大看：${im.title}`}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowRight') go(1);
        else if (e.key === 'ArrowLeft') go(-1);
        else if (e.key === 'Tab') {
          // 焦點只在燈箱裡面轉
          const f = [...e.currentTarget.querySelectorAll<HTMLElement>('button, a[href]')];
          const i = f.indexOf(document.activeElement as HTMLElement);
          const j = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : i === f.length - 1 ? 0 : i + 1;
          e.preventDefault();
          f[j]?.focus();
        }
      }}
    >
      <div className="lb-top">
        <span className="lb-count">{n > 1 ? `${s.at + 1} / ${n}` : ''}</span>
        <button type="button" className="lb-zoom" onClick={() => setZoom((z) => !z)} aria-pressed={zoom}>
          {zoom ? '縮回整張' : '看原尺寸'}
        </button>
        <button type="button" className="lb-close" ref={closeBtn} onClick={close} aria-label="關閉（Esc）">
          ✕
        </button>
      </div>
      <div
        className={`lb-stage ${zoom ? 'zoomed' : ''}`}
        onClick={(e) => e.target === e.currentTarget && close()}
        onTouchStart={(e) => (startX.current = e.touches.length === 1 ? e.touches[0].clientX : null)}
        onTouchEnd={(e) => {
          if (startX.current === null || zoom) return;
          const dx = e.changedTouches[0].clientX - startX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          startX.current = null;
        }}
      >
        <img key={im.id} src={imgSrc(im)} alt={im.title} onClick={() => setZoom((z) => !z)} />
      </div>
      {n > 1 && (
        <>
          <button type="button" className="lb-nav lb-prev" onClick={() => go(-1)} aria-label="上一張">
            ‹
          </button>
          <button type="button" className="lb-nav lb-next" onClick={() => go(1)} aria-label="下一張">
            ›
          </button>
        </>
      )}
      <div className="lb-cap">
        {im.kind === 'ai' && <span className="lb-badge">AI 插畫</span>}
        <ImageCredit im={im} />
      </div>
    </div>
  );
}
