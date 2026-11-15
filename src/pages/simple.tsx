import { useEffect, useMemo, useState } from 'react';
import { QuizQuestion } from '../components/Quiz';
import { rng, shuffle, todayQuestion } from '../lib/quiz';
import { clearProgress, useReadSet } from '../lib/progress';
import { TODAY_CATEGORIES } from '../../scripts/lib/types';
import { eraById } from '../lib/data';
import { CardLink, MiniCard, ScrollTable } from '../components/bits';
import { cardNames, enOrig, fullName, origLang, origOf, romanNames } from '../lib/names';
import { avatarOf, cardById, imgSrc, site, todayById, TYPE_ORDER } from '../lib/data';

import { href } from '../lib/router';
import { CN_PATH, STARTER_PATH } from '../lib/paths';

export function Home() {
  const featured = ['god-zeus', 'god-athena', 'story-pandora', 'hero-odysseus', 'story-trojan-horse', 'monster-medusa'].map((id) => cardById.get(id)).filter(Boolean);
  return (
    <div className="page home">
      <section className="hero">
        <h1>眾神星圖</h1>
        <p className="lead">希臘羅馬神話與中華神話：認得眾神與英雄，能把故事講給別人聽，也看得懂今天電影、品牌、英文單字、太空任務裡的神話梗。每件事都附來源。</p>
        <a className="overview-cta" href={href('overview')}>
          <strong>第一次來？先看總覽</strong>
          <span>約 20 分鐘讀完：世界長什麼樣、誰是誰、故事從哪來、為什麼今天還要懂。趕時間？頁首有 1 分鐘極短版 →</span>
        </a>
        <div className="tiles">
          <a href={href('cards')}><strong>卡片</strong><span>{site.cards.length} 張神、英雄、故事</span></a>
          <a href={href('family')}><strong>族譜</strong><span>點一位神展開家族；中華神話看傳位與對戰</span></a>
          <a href={href('timeline')}><strong>神話年代</strong><span>從混沌到羅馬建國；從盤古到夏朝</span></a>
          <a href={href('map')}><strong>地圖</strong><span>真實地點與冥界</span></a>
          <a href={href('compare')}><strong>對照</strong><span>希臘 vs 羅馬、中西神話：不只是換名字</span></a>
          <a href={href('today')}><strong>今日影子</strong><span>{site.today.length} 個你看過的梗</span></a>
        </div>
      </section>
      <section className="howto">
        <h2>怎麼用這個網站</h2>
        <ol className="steps">
          <li><strong>認得他</strong><span>每張卡開頭「三句話」＋「一句話記住他」，30 秒知道他是誰。</span></li>
          <li><strong>聽故事</strong><span>分格故事 → 正文 → 名畫。句尾的小字 [s1] 可以點，直接跳到原典。</span></li>
          <li><strong>認出今天的影子</strong><span>卡片底部「這個梗你看過」：單字、品牌、電影，每條都寫明「和原典差在哪」。</span></li>
        </ol>
        <p className="muted small">本站的神話全部來自古代原典（荷馬、赫西俄德、奧維德、《山海經》、《淮南子》、《史記》……），句尾的小字來源可以直接點開原文或英譯本對照。</p>
      </section>
      <section>
        <h2>新手路線：照順序讀 8 張，就有整部神話的骨架</h2>
        <PathList items={STARTER_PATH} />
        <p className="muted small">讀完這 8 張，再用上面的「族譜」「年代」「地圖」把人物和地方串起來。</p>
      </section>
      <section>
        <h2>中華神話新手路線：從盤古讀到大禹</h2>
        <p className="muted">希臘神話是一棵家譜樹，主線是「兒子推翻父親」；中華神話比較像一條時間線，越往後神越像古代帝王，主線是「替人類解決問題」。</p>
        <PathList items={CN_PATH} />
      </section>
      <ProgressBox />
      {featured.length > 0 && (
        <section>
          <h2>最多人認識的 6 張</h2>
          <div className="card-grid">
            {featured.map((c) => (
              <CardTile key={c!.id} id={c!.id} />
            ))}
          </div>
        </section>
      )}
      <section className="notice">
        <h2>關於本站的圖</h2>
        <div className="legend">
          <div className="legend-work">
            <strong>真實作品</strong>
            <p>陶瓶、雕像、壁畫、名畫。每張都有作者、年代、館藏與授權，代表「古人或畫家怎麼想像」。</p>
          </div>
          <div className="legend-ai">
            <strong>AI 插畫</strong>
            <p>角落固定標「AI 插畫」，只用來讓分格故事連貫，是本站的示意，不是古代作品。</p>
          </div>
        </div>
        <p className="muted">古典雕像與名畫裡常有裸體，這是藝術史的常態，本站照常收錄。神話裡的暴力、性與殘酷懲罰照原典寫，不刻意隱晦也不渲染。</p>
      </section>
    </div>
  );
}

/** 新手路線：已讀幾張、繼續讀下一張，每一張前面有編號或勾勾 */
function PathList({ items }: { items: [string, string][] }) {
  const read = useReadSet();
  const done = items.filter(([id]) => read.has(id)).length;
  const nextId = items.find(([id]) => !read.has(id))?.[0];
  const nextCard = nextId ? cardById.get(nextId) : undefined;
  return (
    <>
      <p className="path-progress">
        <strong className="path-count">已讀 {done}/{items.length}</strong>
        {nextCard ? (
          <a className="path-continue" href={href('card', nextCard.id)}>
            {done > 0 ? '繼續讀下一張' : '從第一張開始'}：{nextCard.name_zh} →
          </a>
        ) : (
          <span className="path-done">這條路線全部讀完了</span>
        )}
      </p>
      <ol className="path">
        {items.map(([id, why], i) => {
          const c = cardById.get(id);
          if (!c) return null;
          const era = eraById.get(c.era);
          const isRead = read.has(id);
          return (
            <li key={id} className={isRead ? 'is-read' : ''}>
              <a href={href('card', id)}>
                <span className="path-no">{isRead ? <span aria-label="已讀">✓</span> : i + 1}</span>
                <span className="path-body">
                  <strong>{c.name_zh}</strong> <span className="muted">{enOrig(cardNames(c))}｜{era?.name}</span>
                  <span className="path-why">{why}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </>
  );
}

/** 全站已讀張數與清除進度 */
function ProgressBox() {
  const read = useReadSet();
  const [ask, setAsk] = useState(false);
  const n = site.cards.filter((c) => read.has(c.id)).length;
  if (n === 0) return null;
  return (
    <section className="progress-box">
      <p>
        你已經讀完 <strong>{n}</strong> / {site.cards.length} 張卡（在卡片頁讀到「來源」就會自動記下來，只存在這個瀏覽器裡）。
      </p>
      {ask ? (
        <p className="progress-ask">
          確定要清除嗎？<button type="button" className="danger" onClick={() => { clearProgress(); setAsk(false); }}>確定清除</button>
          <button type="button" onClick={() => setAsk(false)}>取消</button>
        </p>
      ) : (
        <button type="button" className="clear-progress" onClick={() => setAsk(true)}>清除讀書進度</button>
      )}
    </section>
  );
}

export function CardTile({ id }: { id: string }) {
  const c = cardById.get(id);
  const read = useReadSet();
  if (!c) return null;
  const av = avatarOf(c);
  const isRead = read.has(c.id);
  return (
    <a className={`tile${isRead ? ' is-read' : ''}`} href={href('card', c.id)}>
      <div className="tile-img">
        {av ? <img src={imgSrc(av)} alt="" loading="lazy" /> : <span className="tile-initial">{c.name_zh[0]}</span>}
        {isRead && <span className="read-badge">✓ 已讀</span>}
      </div>
      <div className="tile-body">
        <span className={`type-chip t-${c.type}`}>{c.type}</span>
        <strong>{c.name_zh}</strong>
        <span className="muted tile-names">{enOrig(cardNames(c))}</span>
        {c.roman && <span className="muted tile-names">羅馬：{fullName(romanNames(c)!)}</span>}
        <span className="tile-hook">{c.hook}</span>
      </div>
    </a>
  );
}

export function CardList() {
  const [type, setType] = useState<string>('全部');
  const [sys, setSys] = useState<string>('全部');
  const types = TYPE_ORDER.filter((t) => site.cards.some((c) => c.type === t));
  const list = site.cards.filter((c) => (type === '全部' || c.type === type) && (sys === '全部' || c.myth_system.includes(sys as 'greek')));
  const count = (t: string) => site.cards.filter((c) => t === '全部' || c.type === t).length;
  return (
    <div className="page">
      <h1>全部卡片</h1>
      <p className="lead">先按類型挑，點進去每張卡都先給你三句話。</p>
      <div className="filters" aria-label="依類型篩選">
        {['全部', ...types].map((t) => (
          <button key={t} className={t === type ? 'on' : ''} onClick={() => setType(t)}>
            {t} <span className="count">{count(t)}</span>
          </button>
        ))}
      </div>
      <div className="filters" aria-label="依神話系統篩選">
        {[['全部', '全部'], ['greek', '希臘'], ['roman', '羅馬'], ['chinese', '中華']].map(([k, label]) => (
          <button key={k} className={k === sys ? 'on' : ''} onClick={() => setSys(k)}>
            {label}
          </button>
        ))}
      </div>
      <p className="muted small">共 {list.length} 張</p>
      <div className="card-grid">
        {list.map((c) => (
          <CardTile key={c.id} id={c.id} />
        ))}
      </div>
    </div>
  );
}

export function TopicPage({ name }: { name: string }) {
  const t = site.topics.find((x) => x.name === name);
  const list = site.cards.filter((c) => c.topics.includes(name));
  return (
    <div className="page">
      <h1>#{name}</h1>
      {t && <p className="lead">{t.desc}</p>}
      <div className="card-grid">
        {list.map((c) => (
          <CardTile key={c.id} id={c.id} />
        ))}
      </div>
      <p className="topics">
        {site.topics.map((x) => (
          <a key={x.id} className="topic" href={href('topic', x.name)}>#{x.name}</a>
        ))}
      </p>
    </div>
  );
}

/** 對照表的希臘原文：只有希臘神才有（雅努斯是純羅馬的神） */
function greekOrig(id?: string) {
  const c = id ? cardById.get(id) : undefined;
  const o = origOf(c?.name_orig);
  return o && origLang(o) === '希臘文' ? o : '—';
}

function jumpTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Compare() {
  return (
    <div className="page">
      <h1>對照</h1>
      <p className="lead">這一頁放兩種對照：希臘神和羅馬神怎麼對應，以及中華神話和希臘羅馬神話怎麼回答同樣的問題。</p>
      <div className="jump-btns" aria-label="頁內跳轉">
        <button type="button" onClick={() => jumpTo('gr-rome')}>希臘 vs 羅馬</button>
        <button type="button" onClick={() => jumpTo('cn-west')}>中西神話對照</button>
      </div>
      <section id="gr-rome">
      <h2>希臘 vs 羅馬</h2>
      <p className="lead">羅馬人把很多希臘神「對應」到自己原有的神上，但個性、地位常常不一樣。下面是名字對照；點神名看每位神的真正差異。</p>
      <ScrollTable>
        <table className="compare">
          <thead>
            <tr>
              <th>希臘名</th>
              <th className="col-orig">希臘原文</th>
              <th>羅馬名</th>
              <th>拉丁文</th>
              <th>英文</th>
              <th>今天用在哪裡</th>
            </tr>
          </thead>
          <tbody>
            {site.greekRoman.map((r) => (
              <tr key={r.latin}>
                <td className="nw">{r.card ? <CardLink id={r.card}>{r.greek}</CardLink> : r.greek}</td>
                <td lang="grc" className="nw col-orig">{greekOrig(r.card)}</td>
                <td className="nw">{r.roman}</td>
                <td className="nw">{r.latin}</td>
                <td className="nw">{r.english}</td>
                <td className="wide">
                  {r.today}
                  {r.note && <span className="muted">｜{r.note}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollTable>
      </section>
      <BorrowStory />
      <ChineseWestern />
    </div>
  );
}

function CwCell({ side }: { side: { text: string; cards: string[] } }) {
  return (
    <td className="wide">
      {side.text}
      {side.cards.length > 0 && (
        <div className="small">
          {side.cards.map((id) => (
            <span key={id}>
              <CardLink id={id} />{' '}
            </span>
          ))}
        </div>
      )}
    </td>
  );
}

function ChineseWestern() {
  return (
    <section className="borrow" id="cn-west">
      <h2>中西神話對照</h2>
      <p className="muted">這張表只把「相似的問題」放在一起比，看兩邊各怎麼回答；不是說哪一邊影響了哪一邊。</p>
      <pre className="ascii">{`同一個問題 ──┬─► 中華神話怎麼回答
             └─► 希臘羅馬神話怎麼回答
                     │
                     ▼
              差在哪裡？（最右欄）`}</pre>
      <ScrollTable>
        <table className="compare">
          <thead>
            <tr>
              <th>問題</th>
              <th>中華神話</th>
              <th>希臘羅馬神話</th>
              <th>差在哪</th>
            </tr>
          </thead>
          <tbody>
            {site.chineseWestern.map((r) => (
              <tr key={r.theme}>
                <td className="nw">{r.theme}</td>
                <CwCell side={r.chinese} />
                <CwCell side={r.western} />
                <td className="wide">{r.diff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollTable>
    </section>
  );
}

const BORROW_SOURCES = [
  { cite: 'World History Encyclopedia「Magna Graecia」（希臘人在南義大利的殖民城市）', url: 'https://www.worldhistory.org/Magna_Graecia/' },
  { cite: 'World History Encyclopedia「Etruscan Civilization」（伊特拉斯坎人與希臘的交流）', url: 'https://www.worldhistory.org/Etruscan_Civilization/' },
  { cite: 'World History Encyclopedia「Roman Republic」（羅馬征服義大利與希臘）', url: 'https://www.worldhistory.org/Roman_Republic/' },
  { cite: 'World History Encyclopedia「Roman Religion」（羅馬神與希臘神的對應）', url: 'https://www.worldhistory.org/Roman_Religion/' },
  { cite: 'World History Encyclopedia「Aeneid」（維吉爾的史詩）', url: 'https://www.worldhistory.org/Aeneid/' },
];

function BorrowStory() {
  const c = cardById.get('hero-aeneas');
  return (
    <section className="borrow">
      <h2>羅馬怎麼借用希臘（真實歷史）</h2>
      <pre className="ascii">{`前 8–5 世紀  希臘人在南義大利、西西里建立殖民城市 ──┐
前 7–5 世紀  伊特拉斯坎人吸收希臘神像與故事 ─────────┼─► 羅馬人接觸希臘的神
前 3–2 世紀  羅馬征服南義大利、再征服希臘本土 ───────┘        │
                                                              ▼
            把自己原有的神「對應」到希臘神（Jupiter＝宙斯…）
                                                              │
前 1 世紀    維吉爾《埃涅阿斯紀》：羅馬人是特洛伊英雄的後代 ◄──┘`}</pre>
      <p className="muted">相關卡片{c ? <>：<CardLink id="hero-aeneas" /></> : null}。這張圖的來源：</p>
      <ol className="sources small">
        {BORROW_SOURCES.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noreferrer">{s.cite}</a>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** 第一句：收合時只露出這一句 */
function firstSentence(text: string): string {
  const i = text.search(/[。！？]/);
  return i < 0 ? text : text.slice(0, i + 1);
}

const matches = (t: (typeof site.today)[number], q: string) => {
  if (!q) return true;
  const hay = [t.title, t.what, t.category, ...(t.search_simp ?? []), ...t.cards.flatMap((id) => [cardById.get(id)?.name_zh ?? '', cardById.get(id)?.name_en ?? ''])].join(' ').toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
};

export function TodayPage({ id }: { id?: string }) {
  const [cat, setCat] = useState<string>('全部');
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<'list' | 'guess'>('list');
  const [open, setOpen] = useState<Set<string>>(new Set());
  const one = id ? todayById.get(id) : undefined;
  const list = site.today.filter((t) => (cat === '全部' || t.category === cat) && matches(t, q.trim()) && t.id !== one?.id);
  const toggle = (tid: string) => setOpen((s) => { const n = new Set(s); if (n.has(tid)) n.delete(tid); else n.add(tid); return n; });
  return (
    <div className="page">
      <h1>今日影子</h1>
      <p className="lead">神話留在今天的單字、品牌、電影與星空裡。每一條都寫了「和原典差在哪」。點一條展開說明，或切到「猜猜看」玩一玩。</p>
      {one && mode === 'list' && <TodayItemView id={one.id} highlight open onToggle={() => {}} />}
      <div className="today-tools">
        <div className="mode-switch" role="group" aria-label="瀏覽方式">
          <button type="button" aria-pressed={mode === 'list'} onClick={() => setMode('list')}>逐條看</button>
          <button type="button" aria-pressed={mode === 'guess'} onClick={() => setMode('guess')}>猜猜看</button>
        </div>
        <input type="search" className="today-filter" placeholder="篩選：輸入關鍵字，例如 月份、Nike、電影…" aria-label="篩選今日影子" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="filters">
        {['全部', ...TODAY_CATEGORIES.filter((c) => site.today.some((t) => t.category === c))].map((c) => (
          <button key={c} className={c === cat ? 'on' : ''} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>
      {mode === 'guess' ? (
        <TodayGuess list={site.today.filter((t) => (cat === '全部' || t.category === cat) && matches(t, q.trim()))} />
      ) : (
        <>
          <p className="muted small today-count">
            共 {list.length} 條
            {list.length > 1 && (
              <>
                {' '}｜<button type="button" className="linkish" onClick={() => setOpen(new Set(list.map((t) => t.id)))}>全部展開</button>
                {' '}<button type="button" className="linkish" onClick={() => setOpen(new Set())}>全部收合</button>
              </>
            )}
          </p>
          {list.length === 0 && <p className="muted">沒有符合的梗，換個關鍵字或分類試試看。</p>}
          <div className="today-list">
            {list.map((t) => (
              <TodayItemView key={t.id} id={t.id} open={open.has(t.id)} onToggle={() => toggle(t.id)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** 猜猜看：給今日影子的標題（名字遮掉），四選一猜來自哪張卡，答完顯示說明 */
function TodayGuess({ list }: { list: typeof site.today }) {
  const [round, setRound] = useState(0);
  const [n, setN] = useState(0);
  const [picked, setPicked] = useState<string | undefined>();
  const [right, setRight] = useState(0);
  const key = list.map((t) => t.id).join(',');
  const qs = useMemo(() => {
    const items = shuffle(list, rng(round * 7919 + 17)).flatMap((t) => {
      const c = cardById.get(t.cards[0]);
      const q = c && todayQuestion(t, c, 'guess');
      return q ? [{ t, q }] : [];
    });
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, round]);
  useEffect(() => {
    setN(0);
    setPicked(undefined);
    setRight(0);
  }, [key]);
  if (!qs.length) return <p className="muted">這個範圍沒有可以出題的梗，換個分類或清掉關鍵字試試看。</p>;
  if (n >= qs.length)
    return (
      <div className="guess-box">
        <p><strong>這一輪結束了！答對 {right} / {qs.length} 題。</strong></p>
        <button type="button" className="quiz-redo" onClick={() => { setRound((r) => r + 1); setN(0); setPicked(undefined); setRight(0); }}>再來一輪</button>
      </div>
    );
  const { t, q } = qs[n];
  return (
    <div className="guess-box">
      <p className="muted small">
        第 {n + 1} / {qs.length} 題｜答對 {right} 題｜分類：{t.category}
      </p>
      <QuizQuestion
        q={q}
        picked={picked}
        link={false}
        onPick={(id) => {
          setPicked(id);
          if (id === q.answer) setRight((r) => r + 1);
        }}
      />
      {picked !== undefined && (
        <div className="guess-explain">
          <h3>{t.title}</h3>
          <p>{t.what}</p>
          <p className="diff"><strong>和原典差在哪：</strong>{t.diff}</p>
          <p className="small">
            <a href={href('today', t.id)}>看這一條</a>
            {t.cards.map((c) => (
              <span key={c}>{'｜'}<CardLink id={c} /></span>
            ))}
          </p>
          <button type="button" className="quiz-redo" onClick={() => { setN(n + 1); setPicked(undefined); }}>
            {n + 1 >= qs.length ? '看結果' : '下一題'}
          </button>
        </div>
      )}
    </div>
  );
}

function TodayItemView({ id, highlight, open, onToggle }: { id: string; highlight?: boolean; open: boolean; onToggle: () => void }) {
  const t = todayById.get(id)!;
  const body = `today-body-${t.id}`;
  return (
    <article className={`today-item${highlight ? ' hl' : ''}${open ? ' open' : ''}`} id={highlight ? undefined : `today-${t.id}`}>
      <header>
        <span className="muted">
          {t.category}
          {t.status === '說法未證實' && <span className="unverified">說法未證實</span>}
        </span>
        <div className="today-head-row">
          <h3>
            <a href={href('today', t.id)}>{t.title}</a>
          </h3>
          {!highlight && (
            <button type="button" className="today-toggle" aria-expanded={open} aria-controls={open ? body : undefined} onClick={onToggle}>
              {open ? '收合' : '展開'}
            </button>
          )}
        </div>
      </header>
      {open ? (
        <div id={body}>
          <p>{t.what}</p>
          <p className="diff">
            <strong>和原典差在哪：</strong>
            {t.diff}
          </p>
          <p className="muted small">
            相關卡片：
            {t.cards.map((c, i) => (
              <span key={c}>
                {i > 0 && '、'}
                <CardLink id={c} />
              </span>
            ))}
            ｜來源：
            {t.sources.map((s, i) => (
              <span key={i}>
                {i > 0 && '；'}
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.cite}
                </a>
              </span>
            ))}
          </p>
        </div>
      ) : (
        <p className="today-first">{firstSentence(t.what)}</p>
      )}
    </article>
  );
}

export { MiniCard };
