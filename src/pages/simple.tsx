import { useEffect, useMemo, useState } from 'react';
import { QuizQuestion } from '../components/Quiz';
import { rng, shuffle, todayQuestion } from '../lib/quiz';
import { clearProgress, useReadSet } from '../lib/progress';
import { TODAY_CATEGORIES } from '../../scripts/lib/types';
import { eraById } from '../lib/data';
import { CardLink, MiniCard, ScrollTable, SysTabs } from '../components/bits';
import { cardNames, enOrig, fullName, origLang, origOf, romanNames } from '../lib/names';
import { avatarOf, cardById, imgSrc, site, todayById, TYPE_ORDER } from '../lib/data';

import { href, queryParam } from '../lib/router';
import { CN_PATH, NORSE_PATH, STARTER_PATH } from '../lib/paths';
import { SYSTEMS, parseSys, sysLabel, sysOf, sysOfToday, type Sys } from '../lib/systems';

/** 首頁三張入口卡：特色一句話改寫自總覽頁；原典出自總覽「主要的書」那一列 */
const DOORS: Record<Sys, { feature: string; books: string; links: [string, string][] }> = {
  west: {
    feature: '神換了三代，英雄一個個出現，最後傳到羅馬。主線是「兒子推翻父親」。',
    books: '荷馬、赫西俄德、奧維德、維吉爾',
    links: [['族譜', href('family')], ['年代', href('timeline')]],
  },
  norse: {
    feature: '眾神殺了巨人，用他的身體造出世界，卻早就知道自己最後會死。主線是「一個早就寫好的結局」。',
    books: '《詩體埃達》與斯諾里的《散文埃達》',
    links: [['族譜', `${href('family')}?mode=norse`], ['年代', `${href('timeline')}?era=no-creation`]],
  },
  chinese: {
    feature: '巨人撐開天地，女神補好破掉的天，最後大禹治好洪水。主線是「有人出來把世界修好」。',
    books: '《山海經》《淮南子》《史記》',
    links: [['族譜', `${href('family')}?mode=cn`], ['年代', `${href('timeline')}?era=cn-creation`]],
  },
};

const FEATURED = ['god-zeus', 'story-trojan-horse', 'story-baldr-death', 'story-ragnarok', 'primordial-nuwa', 'primordial-pangu'];

export function Home() {
  const count = (k: Sys) => site.cards.filter((c) => sysOf(c) === k).length;
  return (
    <div className="page home">
      <section className="hero">
        <h1>眾神星圖</h1>
        <p className="lead">希臘羅馬、北歐與中華神話：認得眾神與英雄，能把故事講給別人聽，也看得懂今天電影、品牌、英文單字、太空任務裡的神話梗。每件事都附來源。</p>
        <a className="overview-cta" href={href('overview')}>
          <strong>第一次來？先看總覽</strong>
          <span>希臘羅馬、北歐、中華三套神話各講成一個故事：每套約 10～20 分鐘，可以只讀一套。先講清楚每套神話是誰寫下來的、哪些說法可靠。趕時間？頁首有 1 分鐘極短版 →</span>
        </a>
        <h2 className="doors-title">三套神話，從哪一套開始都可以</h2>
        <div className="sys-doors" aria-label="三套神話入口">
          {SYSTEMS.map((s) => (
            <article key={s.key} className={`sys-door ${s.cls}`} data-sys={s.key}>
              <h3>{s.label}</h3>
              <p className="muted small">{count(s.key)} 張卡</p>
              <p>{DOORS[s.key].feature}</p>
              <p className="muted small">主要原典：{DOORS[s.key].books}</p>
              <div className="sys-door-links">
                <a href={`${href('cards')}?sys=${s.key}`}>卡片</a>
                {DOORS[s.key].links.map(([label, to]) => (
                  <a key={label} href={to}>{label}</a>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="tiles">
          <a href={href('cards')}><strong>卡片</strong><span>{site.cards.length} 張神、英雄、故事，三套神話都有</span></a>
          <a href={href('family')}><strong>族譜</strong><span>希臘羅馬看家譜；北歐以奧丁為中心；中華神話看傳位與對戰</span></a>
          <a href={href('timeline')}><strong>神話年代</strong><span>從混沌到羅馬建國；從創世到諸神黃昏；從盤古到夏朝</span></a>
          <a href={href('map')}><strong>地圖</strong><span>地中海、北歐、中國的真實地點，與各自的神話世界</span></a>
          <a href={href('compare')}><strong>對照</strong><span>三套神話對照、中華與希臘羅馬、希臘 vs 羅馬：不只是換名字</span></a>
          <a href={href('today')}><strong>今日影子</strong><span>{site.today.length} 個你看過的梗，可以挑一套神話來看</span></a>
        </div>
      </section>
      <section className="howto">
        <h2>怎麼用這個網站</h2>
        <ol className="steps">
          <li><strong>認得他</strong><span>每張卡開頭「三句話」＋「一句話記住他」，30 秒知道他是誰。</span></li>
          <li><strong>聽故事</strong><span>分格故事 → 正文 → 名畫。句尾的小字 [s1] 可以點，直接跳到原典。</span></li>
          <li><strong>認出今天的影子</strong><span>卡片底部「這個梗你看過」：單字、品牌、電影，每條都寫明「和原典差在哪」。</span></li>
        </ol>
        <p className="muted small">本站的神話全部來自古代原典（荷馬、赫西俄德、奧維德、《詩體埃達》、斯諾里《散文埃達》、《山海經》、《淮南子》、《史記》……），句尾的小字來源可以直接點開原文或英譯本對照。</p>
      </section>
      <section>
        <h2>希臘羅馬新手路線：從蓋亞讀到埃涅阿斯</h2>
        <p className="muted path-intro">希臘羅馬神話像一棵家譜樹，主線是「兒子推翻父親」；這條路線照故事順序讀 8 張，從大地蓋亞讀到逃出特洛伊的埃涅阿斯，他後來成了羅馬人的祖先。</p>
        <PathList items={STARTER_PATH} />
      </section>
      <section>
        <h2>北歐新手路線：從尤彌爾讀到諸神黃昏</h2>
        <p className="muted path-intro">北歐神話的主線是「一個早就寫好的結局」；很多故事只見於 13 世紀冰島作者斯諾里的《散文埃達》，每張卡都會標明哪些是古詩說的、哪些是斯諾里說的。</p>
        <PathList items={NORSE_PATH} />
      </section>
      <section>
        <h2>中華新手路線：從盤古讀到大禹</h2>
        <p className="muted path-intro">中華神話像一條時間線，越往後，神越像古代帝王，主線是「有人出來把世界修好」；這條路線從盤古讀到大禹，他的兒子開啟夏朝。</p>
        <PathList items={CN_PATH} />
      </section>
      <ProgressBox />
      <section>
        <h2>三套神話各挑兩張：從這裡開始也可以</h2>
        <div className="card-grid featured-grid">
          {FEATURED.map((id) => (
            <CardTile key={id} id={id} />
          ))}
        </div>
      </section>
      <section className="notice">
        <h2>關於本站的圖</h2>
        <div className="legend">
          <div className="legend-work">
            <strong>真實作品</strong>
            <p>陶瓶、雕像、壁畫、名畫，以及漢代的畫像石拓本與帛畫。每張都有作者、年代、館藏與授權，代表「古人或畫家怎麼想像」。</p>
          </div>
          <div className="legend-ai">
            <strong>AI 插畫</strong>
            <p>角落固定標「AI 插畫」，只用來讓分格故事連貫，是本站的示意，不是古代作品。目前北歐的圖都是這一類。</p>
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
  // 篩選狀態放在網址：#/cards?sys=norse&type=神
  const sys = parseSys(queryParam('sys')) ?? 'all';
  const inSys = (c: (typeof site.cards)[number]) => sys === 'all' || sysOf(c) === sys;
  const sysCards = site.cards.filter(inSys);
  const types = TYPE_ORDER.filter((t) => sysCards.some((c) => c.type === t));
  const askedType = queryParam('type');
  // 切換神話後，原本選的類型如果沒有卡，就回到「全部」
  const type = askedType && types.includes(askedType) ? askedType : '全部';
  const go = (nextSys: Sys | 'all', nextType: string) => {
    const q = new URLSearchParams();
    if (nextSys !== 'all') q.set('sys', nextSys);
    if (nextType !== '全部') q.set('type', nextType);
    const qs = q.toString();
    location.hash = href('cards') + (qs ? `?${qs}` : '');
  };
  const typeOk = (c: (typeof site.cards)[number]) => type === '全部' || c.type === type;
  const list = sysCards.filter(typeOk);
  const sysCount = (k: Sys | 'all') => site.cards.filter((c) => k === 'all' || sysOf(c) === k).length;
  const typeCount = (t: string) => sysCards.filter((c) => t === '全部' || c.type === t).length;
  return (
    <div className="page">
      <h1>全部卡片</h1>
      <p className="lead">先選一套神話，再按類型挑，點進去每張卡都先給你三句話。</p>
      <SysTabs all value={sys} label="依神話篩選" counts={{ all: sysCount('all'), west: sysCount('west'), norse: sysCount('norse'), chinese: sysCount('chinese') }} onChange={(k) => go(k, type)} />
      <div className="filters" aria-label="依類型篩選">
        {['全部', ...types].map((t) => (
          <button key={t} className={t === type ? 'on' : ''} aria-pressed={t === type} onClick={() => go(sys, t)}>
            {t} <span className="count">{typeCount(t)}</span>
          </button>
        ))}
      </div>
      <p className="muted small">共 {list.length} 張</p>
      {sys === 'all' ? (
        SYSTEMS.map((s) => {
          const part = list.filter((c) => sysOf(c) === s.key);
          if (!part.length) return null;
          return (
            <section key={s.key} className={`sys-section ${s.cls}`} data-sys={s.key}>
              <h2 className="sys-section-title">{s.label}（{part.length} 張）</h2>
              <div className="card-grid">
                {part.map((c) => (
                  <CardTile key={c.id} id={c.id} />
                ))}
              </div>
            </section>
          );
        })
      ) : (
        <div className="card-grid">
          {list.map((c) => (
            <CardTile key={c.id} id={c.id} />
          ))}
        </div>
      )}
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
      <p className="lead">這一頁放三種對照：三套神話怎麼回答同樣的問題、中華神話和希臘羅馬神話怎麼對應，以及希臘神和羅馬神怎麼對應。</p>
      <div className="jump-btns" aria-label="頁內跳轉">
        <button type="button" onClick={() => jumpTo('norse-compare')}>三套神話對照</button>
        <button type="button" onClick={() => jumpTo('cn-west')}>中華與希臘羅馬</button>
        <button type="button" onClick={() => jumpTo('gr-rome')}>希臘 vs 羅馬</button>
      </div>
      <ThreeWayCompare />
      <ChineseWestern />
      <section id="gr-rome">
      <h2>希臘 vs 羅馬</h2>
      <p className="muted">這一段只談希臘羅馬內部。</p>
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
      <h2>中華與希臘羅馬</h2>
      <p className="muted">這張表只把「相似的問題」放在一起比，看兩邊各怎麼回答；不是說哪一邊影響了哪一邊。這幾題本站的北歐卡片沒有對應內容，所以只比兩邊；北歐卡片有寫的題目（世界怎麼開始、大洪水、龍），放在上面的三套神話對照。</p>
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

function ThreeWayCompare() {
  return (
    <section className="borrow" id="norse-compare">
      <h2>三套神話對照</h2>
      <p className="muted">這張表把相似的問題放在一起，看希臘羅馬、北歐、中華各怎麼回答；只比想法，不是說哪一邊影響了哪一邊。本站卡片沒寫的地方，會直接說沒寫。</p>
      <pre className="ascii">{`同一個問題 ──┬─► 希臘羅馬神話怎麼回答
             ├─► 北歐神話怎麼回答
             └─► 中華神話怎麼回答
                     │
                     ▼
              差在哪裡？（最右欄）`}</pre>
      <ScrollTable>
        <table className="compare">
          <thead>
            <tr>
              <th>問題</th>
              <th>希臘羅馬神話</th>
              <th>北歐神話</th>
              <th>中華神話</th>
              <th>差在哪</th>
            </tr>
          </thead>
          <tbody>
            {site.threeWay.map((r) => (
              <tr key={r.theme}>
                <td className="nw">{r.theme}</td>
                <CwCell side={r.greek} />
                <CwCell side={r.norse} />
                <CwCell side={r.chinese} />
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
  const [sys, setSys] = useState<Sys | 'all'>('all');
  const [cat, setCat] = useState<string>('全部');
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<'list' | 'guess'>('list');
  const [open, setOpen] = useState<Set<string>>(new Set());
  const one = id ? todayById.get(id) : undefined;
  const inSys = site.today.filter((t) => sys === 'all' || sysOfToday(t) === sys);
  const cats = TODAY_CATEGORIES.filter((c) => inSys.some((t) => t.category === c));
  // 換了神話之後，原本選的分類如果沒有條目，就當作「全部」
  const curCat = cat !== '全部' && !cats.includes(cat as (typeof cats)[number]) ? '全部' : cat;
  const pool = inSys.filter((t) => (curCat === '全部' || t.category === curCat) && matches(t, q.trim()));
  const list = pool.filter((t) => t.id !== one?.id);
  const sysCount = (k: Sys | 'all') => site.today.filter((t) => k === 'all' || sysOfToday(t) === k).length;
  const toggle = (tid: string) => setOpen((s) => { const n = new Set(s); if (n.has(tid)) n.delete(tid); else n.add(tid); return n; });
  return (
    <div className="page">
      <h1>今日影子</h1>
      <p className="lead">希臘羅馬、北歐、中華神話留在今天的單字、品牌、電影與星空裡。每一條都寫了「和原典差在哪」。可以先挑一套神話，點一條展開說明，或切到「猜猜看」玩一玩。</p>
      {one && mode === 'list' && <TodayItemView id={one.id} highlight open onToggle={() => {}} />}
      <div className="today-tools">
        <div className="mode-switch" role="group" aria-label="瀏覽方式">
          <button type="button" aria-pressed={mode === 'list'} onClick={() => setMode('list')}>逐條看</button>
          <button type="button" aria-pressed={mode === 'guess'} onClick={() => setMode('guess')}>猜猜看</button>
        </div>
        <input type="search" className="today-filter" placeholder="篩選：輸入關鍵字，例如 一月、Thursday、嫦娥…" aria-label="篩選今日影子" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <SysTabs all value={sys} label="依神話挑選" counts={{ all: sysCount('all'), west: sysCount('west'), norse: sysCount('norse'), chinese: sysCount('chinese') }} onChange={setSys} />
      <div className="filters" aria-label="依類別篩選">
        {['全部', ...cats].map((c) => (
          <button key={c} className={c === curCat ? 'on' : ''} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>
      {mode === 'guess' ? (
        <TodayGuess list={pool} />
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
          <span className={`sys-hit ${SYSTEMS.find((x) => x.key === sysOfToday(t))!.cls}`}>{sysLabel(sysOfToday(t))}</span>｜{t.category}
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
