import { useEffect, useRef, useState } from 'react';
import { CardPage } from './pages/CardPage';
import { Family } from './pages/Family';
import { MapPage } from './pages/MapPage';
import { CardList, Compare, Home, TodayPage, TopicPage } from './pages/simple';
import { Timeline } from './pages/Timeline';
import { href, useRoute } from './lib/router';
import { search, type Hit } from './lib/search';

const NAV: [string, string][] = [
  ['cards', '卡片'],
  ['family', '族譜'],
  ['timeline', '年代'],
  ['map', '地圖'],
  ['compare', '希臘 vs 羅馬'],
  ['today', '今日影子'],
];

export default function App() {
  const r = useRoute();
  let page;
  switch (r[0]) {
    case 'card':
      page = <CardPage id={r[1]} />;
      break;
    case 'cards':
      page = <CardList />;
      break;
    case 'family':
      page = <Family focus={r[1]} />;
      break;
    case 'timeline':
      page = <Timeline />;
      break;
    case 'map':
      page = <MapPage />;
      break;
    case 'compare':
      page = <Compare />;
      break;
    case 'today':
      page = <TodayPage id={r[1]} />;
      break;
    case 'topic':
      page = <TopicPage name={r[1]} />;
      break;
    default:
      page = <Home />;
  }
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#/">
          <span className="brand-star">✦</span> 眾神星圖
        </a>
        <nav>
          {NAV.map(([k, v]) => (
            <a key={k} href={href(k)} className={r[0] === k ? 'on' : ''}>
              {v}
            </a>
          ))}
        </nav>
        <SearchBox />
      </header>
      <main>{page}</main>
      <footer className="site-footer">
        <p>
          程式碼 MIT；本站文字與資料 <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hant">CC BY-SA 4.0</a>；每張圖片的授權標在圖片旁。地圖 © OpenStreetMap contributors。
        </p>
        <p>
          標「AI 插畫」的圖是本站示意，不是古代作品。真實歷史請到{' '}
          <a href="https://zlo-25.github.io/Long-History/" target="_blank" rel="noreferrer">
            歷史長河
          </a>
          。
        </p>
      </footer>
    </>
  );
}

function SearchBox() {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => setHits(search(q)), [q]);
  useEffect(() => {
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);
  const go = (h: Hit) => {
    location.hash = h.kind === 'card' ? href('card', h.id) : href('today', h.id);
    setOpen(false);
    setQ('');
  };
  return (
    <div className="search" ref={box}>
      <input
        type="search"
        placeholder="搜尋：宙斯、Jupiter、雅典娜…"
        value={q}
        aria-label="搜尋卡片"
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && hits[0]) go(hits[0]);
          if (e.key === 'Escape') setOpen(false);
        }}
      />
      {open && q && (
        <ul className="search-results" role="listbox">
          {hits.length === 0 && <li className="muted">找不到「{q}」</li>}
          {hits.map((h) => (
            <li key={h.kind + h.id} role="option" aria-selected="false">
              <button onClick={() => go(h)}>
                <strong>{h.title}</strong>
                <span className="muted">{h.sub}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
