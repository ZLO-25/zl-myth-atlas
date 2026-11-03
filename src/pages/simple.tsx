import { useState } from 'react';
import { TODAY_CATEGORIES } from '../../scripts/lib/types';
import { eraById } from '../lib/data';
import { CardLink, MiniCard } from '../components/bits';
import { avatarOf, cardById, imgSrc, site, todayById, TYPE_ORDER } from '../lib/data';

/** 新手路線：照故事順序讀這 8 張，就有整部神話的骨架 */
const STARTER_PATH: [string, string][] = [
  ['primordial-gaia', '一切從大地開始：她生出天空，也策畫了第一次政變'],
  ['titan-cronus', '兒子推翻父親，又怕被兒子推翻，於是吞掉孩子'],
  ['god-zeus', '被藏起來的么兒長大，打贏十年泰坦之戰，抽籤分天下'],
  ['titan-prometheus', '神與人的關係：偷火、潘朵拉，人類從此要受苦'],
  ['story-persephone', '女兒被冥王擄走，母親讓大地停止生長：四季的由來'],
  ['story-trojan-war', '一顆金蘋果引爆神話中最大的一場戰爭'],
  ['story-odyssey', '戰後十年返鄉路：獨眼巨人、海妖、冥界'],
  ['hero-aeneas', '特洛伊的敗將逃到義大利，變成羅馬人的祖先'],
];
import { href } from '../lib/router';

export function Home() {
  const featured = ['god-zeus', 'god-athena', 'story-pandora', 'hero-odysseus', 'story-trojan-horse', 'monster-medusa'].map((id) => cardById.get(id)).filter(Boolean);
  return (
    <div className="page home">
      <section className="hero">
        <h1>眾神星圖</h1>
        <p className="lead">希臘與羅馬神話：認得眾神與英雄，能把故事講給別人聽，也看得懂今天電影、品牌、英文單字裡的神話梗。每件事都附來源。</p>
        <div className="tiles">
          <a href={href('cards')}><strong>卡片</strong><span>{site.cards.length} 張神、英雄、故事</span></a>
          <a href={href('family')}><strong>族譜</strong><span>點一位神展開家族</span></a>
          <a href={href('timeline')}><strong>神話年代</strong><span>從混沌到羅馬建國</span></a>
          <a href={href('map')}><strong>地圖</strong><span>真實地點與冥界</span></a>
          <a href={href('compare')}><strong>希臘 vs 羅馬</strong><span>不只是換名字</span></a>
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
        <p className="muted small">本站的神話全部來自古代原典（荷馬、赫西俄德、奧維德……），句尾的小字來源可以直接點開英譯本對照。</p>
      </section>
      <section>
        <h2>新手路線：照順序讀 8 張，就有整部神話的骨架</h2>
        <ol className="path">
          {STARTER_PATH.map(([id, why], i) => {
            const c = cardById.get(id);
            if (!c) return null;
            const era = eraById.get(c.era);
            return (
              <li key={id}>
                <a href={href('card', id)}>
                  <span className="path-no">{i + 1}</span>
                  <span className="path-body">
                    <strong>{c.name_zh}</strong> <span className="muted">{era?.name}</span>
                    <span className="path-why">{why}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
        <p className="muted small">讀完這 8 張，再用上面的「族譜」「年代」「地圖」把人物和地方串起來。</p>
      </section>
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

export function CardTile({ id }: { id: string }) {
  const c = cardById.get(id);
  if (!c) return null;
  const av = avatarOf(c);
  return (
    <a className="tile" href={href('card', c.id)}>
      <div className="tile-img">{av ? <img src={imgSrc(av)} alt="" loading="lazy" /> : <span className="tile-initial">{c.name_zh[0]}</span>}</div>
      <div className="tile-body">
        <span className={`type-chip t-${c.type}`}>{c.type}</span>
        <strong>{c.name_zh}</strong>
        <span className="muted">{c.name_en}{c.roman ? `｜${c.roman.name_zh}` : ''}</span>
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
        {[['全部', '希臘＋羅馬'], ['greek', '有希臘版本'], ['roman', '有羅馬版本']].map(([k, label]) => (
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

export function Compare() {
  return (
    <div className="page">
      <h1>希臘 vs 羅馬</h1>
      <p className="lead">羅馬人把很多希臘神「對應」到自己原有的神上，但個性、地位常常不一樣。下面是名字對照；點神名看每位神的真正差異。</p>
      <div className="table-wrap">
        <table className="compare">
          <thead>
            <tr>
              <th>希臘名</th>
              <th>羅馬名</th>
              <th>拉丁文</th>
              <th>英文</th>
              <th>今天用在哪裡</th>
            </tr>
          </thead>
          <tbody>
            {site.greekRoman.map((r) => (
              <tr key={r.latin}>
                <td>{r.card ? <CardLink id={r.card}>{r.greek}</CardLink> : r.greek}</td>
                <td>{r.roman}</td>
                <td>{r.latin}</td>
                <td>{r.english}</td>
                <td>
                  {r.today}
                  {r.note && <span className="muted">｜{r.note}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BorrowStory />
    </div>
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

export function TodayPage({ id }: { id?: string }) {
  const [cat, setCat] = useState<string>('全部');
  const one = id ? todayById.get(id) : undefined;
  const list = site.today.filter((t) => cat === '全部' || t.category === cat);
  return (
    <div className="page">
      <h1>今日影子</h1>
      <p className="lead">神話留在今天的單字、品牌、電影與星空裡。每一條都寫了「和原典差在哪」。</p>
      {one && <TodayItemView id={one.id} highlight />}
      <div className="filters">
        {['全部', ...TODAY_CATEGORIES.filter((c) => site.today.some((t) => t.category === c))].map((c) => (
          <button key={c} className={c === cat ? 'on' : ''} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="today-list">
        {list.map((t) => (
          <TodayItemView key={t.id} id={t.id} />
        ))}
      </div>
    </div>
  );
}

function TodayItemView({ id, highlight }: { id: string; highlight?: boolean }) {
  const t = todayById.get(id)!;
  return (
    <article className={`today-item${highlight ? ' hl' : ''}`} id={`today-${t.id}`}>
      <header>
        <span className="muted">{t.category}</span>
        <h3>
          <a href={href('today', t.id)}>{t.title}</a>
        </h3>
        {t.status === '說法未證實' && <span className="unverified">說法未證實</span>}
      </header>
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
    </article>
  );
}

export { MiniCard };
