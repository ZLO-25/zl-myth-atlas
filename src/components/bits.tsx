import { useState, type ReactNode } from 'react';
import type { Card, ImageItem, Source } from '../../scripts/lib/types';
import { avatarOf, cardById, imageById, imgSrc } from '../lib/data';
import { href } from '../lib/router';
import { cardNames, enOrig } from '../lib/names';

/** 卡片連結：滑過（或手機點一下旁邊的小圓點）浮出小卡。
 *  沒給 children 時顯示完整名稱「宙斯 Zeus（Ζεύς）」；正文裡的連結（有 children）維持原字，免得打斷閱讀。 */
export function CardLink({ id, children }: { id: string; children?: ReactNode }) {
  const c = cardById.get(id);
  const [open, setOpen] = useState(false);
  if (!c) return <span className="missing-link">{children ?? id}</span>;
  return (
    <span className="card-link-wrap" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <a className="card-link" href={href('card', id)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
        {children ?? c.name_zh}
      </a>
      {children == null && <NameTag text={enOrig(cardNames(c))} />}
      {open && <MiniCard c={c} />}
    </span>
  );
}

/** 名稱後面的小字「Zeus（Ζεύς）」 */
export function NameTag({ text }: { text: string }) {
  return text ? <span className="name-tag">{' '}{text}</span> : null;
}

export function MiniCard({ c }: { c: Card }) {
  const av = avatarOf(c);
  return (
    <span className="mini-card" role="tooltip">
      {av && <img src={imgSrc(av)} alt="" loading="lazy" />}
      <span className="mini-body">
        <strong>{c.name_zh}</strong> <span className="muted">{enOrig(cardNames(c))}</span>
        {c.three_lines.map((l, i) => (
          <span key={i} className="mini-line">
            {l}
          </span>
        ))}
      </span>
    </span>
  );
}

/** 把正文裡的 [s1] 變成上標連結、[[god-zeus|宙斯]] 變成卡片連結、**粗體** */
export function Inline({ text, cardId }: { text: string; cardId?: string }) {
  const parts: ReactNode[] = [];
  const re = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]|\[(s\d+)\]|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<CardLink key={k++} id={m[1]}>{m[2]}</CardLink>);
    else if (m[3])
      parts.push(
        <sup key={k++} className="cite">
          <a href={`#src-${cardId ?? ''}-${m[3]}`} onClick={(e) => jumpTo(e, `src-${cardId ?? ''}-${m![3]}`)}>
            {m[3]}
          </a>
        </sup>,
      );
    else if (m[4]) parts.push(<strong key={k++}>{m[4]}</strong>);
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function jumpTo(e: React.MouseEvent, id: string) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/** 極簡 Markdown：## 標題、### 小標、- 清單、> 引文、```ASCII 圖```、段落 */
export function Markdown({ text, cardId }: { text: string; cardId?: string }) {
  // 先把 ``` 圍起來的區塊切出來（裡面可能有空行，不能用空行切段）
  const chunks: { kind: 'code' | 'text'; body: string }[] = [];
  const fence = /```[^\n]*\n([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = fence.exec(text))) {
    if (m.index > last) chunks.push({ kind: 'text', body: text.slice(last, m.index) });
    chunks.push({ kind: 'code', body: m[1].replace(/\n$/, '') });
    last = fence.lastIndex;
  }
  if (last < text.length) chunks.push({ kind: 'text', body: text.slice(last) });
  let k = 0;
  return (
    <>
      {chunks.flatMap((ch) => {
        if (ch.kind === 'code') return [<pre key={k++} className="ascii" aria-label="示意圖">{ch.body}</pre>];
        return ch.body.split(/\n{2,}/).map((b) => {
          const t = b.trim();
          if (!t) return null;
          const i = k++;
          if (t.startsWith('### ')) return <h4 key={i}><Inline text={t.slice(4)} cardId={cardId} /></h4>;
          if (t.startsWith('## ')) return <h3 key={i}><Inline text={t.slice(3)} cardId={cardId} /></h3>;
          if (t.startsWith('> ')) return <blockquote key={i}><Inline text={t.replace(/^> ?/gm, '')} cardId={cardId} /></blockquote>;
          if (/^- /.test(t))
            return (
              <ul key={i}>
                {t.split(/\n(?=- )/).map((li, j) => (
                  <li key={j}><Inline text={li.replace(/^- /, '')} cardId={cardId} /></li>
                ))}
              </ul>
            );
          return <p key={i}><Inline text={t.replace(/\n/g, '')} cardId={cardId} /></p>;
        });
      })}
    </>
  );
}

/** 一張圖＋署名＋「看這張圖」。AI 插畫固定在角落標「AI 插畫」 */
export function Figure({ id, compact }: { id: string; compact?: boolean }) {
  const im = imageById.get(id);
  if (!im) return null;
  return (
    <figure className={`fig ${im.kind === 'ai' ? 'fig-ai' : 'fig-work'}`}>
      <div className="fig-img">
        <img src={imgSrc(im)} alt={im.title} loading="lazy" />
        {im.kind === 'ai' && <span className="ai-badge">AI 插畫</span>}
        {im.kind === 'work' && im.period && <span className="period-badge">{im.period === 'ancient' ? '古代作品' : '後世名作'}</span>}
      </div>
      <figcaption>
        <ImageCredit im={im} />
        {!compact && (
          <span className="look">
            <strong>看這張圖：</strong>
            {im.look}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

export function ImageCredit({ im }: { im: ImageItem }) {
  if (im.kind === 'ai')
    return (
      <span className="credit">
        {im.title}｜本站 AI 插畫（{im.tool}）{im.placeholder ? '｜尚未生圖，暫用佔位圖' : ''}
      </span>
    );
  return (
    <span className="credit">
      <em>{im.title}</em>｜{im.artist}｜{im.date}
      {im.museum ? `｜${im.museum}` : ''}｜
      <a href={im.source_url} target="_blank" rel="noreferrer">
        {im.credit}
      </a>
      ｜{im.license_url ? <a href={im.license_url} target="_blank" rel="noreferrer">{im.license}</a> : im.license}
    </span>
  );
}

export function SourceList({ sources, cardId }: { sources: Source[]; cardId: string }) {
  return (
    <ol className="sources">
      {sources.map((s) => (
        <li key={s.id} id={`src-${cardId}-${s.id}`}>
          <span className={`src-kind ${s.kind}`}>{s.kind === 'ancient' ? '原典' : '現代'}</span> <strong>{s.id}</strong>{' '}
          <a href={s.url} target="_blank" rel="noreferrer">
            {s.cite}
          </a>
          {s.accessed ? <span className="muted">（查閱 {s.accessed}）</span> : null}
          {s.note ? <span className="muted">｜{s.note}</span> : null}
        </li>
      ))}
    </ol>
  );
}

export function Cites({ ids, cardId }: { ids: string[]; cardId: string }) {
  return <Inline text={ids.map((i) => `[${i}]`).join('')} cardId={cardId} />;
}
