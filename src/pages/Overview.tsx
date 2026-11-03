import { CardLink } from '../components/bits';
import { cardById, site } from '../lib/data';
import { href } from '../lib/router';

/** 總覽：給完全沒概念的讀者，先把背景、世界觀、人物世代與核心觀念講一遍，再進卡片 */

const TWELVE = ['god-zeus', 'god-hera', 'god-poseidon', 'god-demeter', 'god-athena', 'god-apollo', 'god-artemis', 'god-ares', 'god-aphrodite', 'god-hephaestus', 'god-hermes', 'god-dionysus'];

/** 本頁引用的來源（總覽不屬於任何一張卡，所以自己列） */
const SRC = {
  theogony: { cite: '赫西俄德《神譜》', url: 'https://www.theoi.com/Text/HesiodTheogony.html' },
  iliad15: { cite: '荷馬《伊里亞德》15.187–193（三兄弟抽籤分天下）', url: 'https://www.theoi.com/Text/HomerIliad15.html' },
  iliad16: { cite: '荷馬《伊里亞德》16.431–461（宙斯救不了兒子薩爾珀冬）', url: 'https://www.theoi.com/Text/HomerIliad16.html' },
  odyssey9: { cite: '荷馬《奧德賽》9.266–271（宙斯是乞援者與陌生人的守護者）', url: 'https://www.theoi.com/Text/HomerOdyssey9.html' },
  odyssey11: { cite: '荷馬《奧德賽》卷 11（奧德修斯召喚亡魂）', url: 'https://www.theoi.com/Text/HomerOdyssey11.html' },
  worksdays: { cite: '赫西俄德《工作與時日》106–201（人類的五個時代）', url: 'https://www.theoi.com/Text/HesiodWorksDays.html' },
  apollodorus: { cite: '阿波羅多洛斯《書庫》（Theoi 英譯）', url: 'https://www.theoi.com/Text/Apollodorus1.html' },
  ovid: { cite: '奧維德《變形記》（Theoi 英譯）', url: 'https://www.theoi.com/Text/OvidMetamorphoses1.html' },
  wheMyth: { cite: 'World History Encyclopedia「Greek Mythology」（Mark Cartwright）', url: 'https://www.worldhistory.org/Greek_Mythology/' },
  wheHomer: { cite: 'World History Encyclopedia「Homer」', url: 'https://www.worldhistory.org/homer/' },
  wheHesiod: { cite: 'World History Encyclopedia「Hesiod」', url: 'https://www.worldhistory.org/hesiod/' },
  wheTragedy: { cite: 'World History Encyclopedia「Greek Tragedy」', url: 'https://www.worldhistory.org/Greek_Tragedy/' },
  wheOvid: { cite: 'World History Encyclopedia「Ovid」', url: 'https://www.worldhistory.org/Ovid/' },
  wheReligion: { cite: 'World History Encyclopedia「Roman Religion」', url: 'https://www.worldhistory.org/Roman_Religion/' },
  wheOlympians: { cite: 'World History Encyclopedia「The Olympian Gods」', url: 'https://www.worldhistory.org/collection/23/the-olympian-gods/' },
  theoiOlympians: { cite: 'Theoi.com「Twelve Olympians」', url: 'https://www.theoi.com/greek-mythology/olympian-gods.html' },
};
type K = keyof typeof SRC;
const keys = Object.keys(SRC) as K[];
const Ref = ({ k }: { k: K | K[] }) => (
  <sup className="cite">
    {(Array.isArray(k) ? k : [k]).map((x) => (
      <a key={x} href={`#ov-${x}`} onClick={(e) => { e.preventDefault(); document.getElementById(`ov-${x}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>
        {keys.indexOf(x) + 1}
      </a>
    ))}
  </sup>
);

export function Overview() {
  const twelve = TWELVE.map((id) => cardById.get(id)).filter(Boolean);
  const counts = {
    gods: site.cards.filter((c) => ['神', '原始神', '泰坦'].includes(c.type)).length,
    heroes: site.cards.filter((c) => c.type === '英雄').length,
    stories: site.cards.filter((c) => c.type === '故事').length,
  };
  return (
    <article className="page overview">
      <h1>總覽：五分鐘進入希臘羅馬神話</h1>
      <p className="lead">
        第一次接觸的人常卡在三件事：名字太多、故事版本不一、不知道從哪開始。這一頁先把「世界長什麼樣、誰是誰、故事從哪來、為什麼今天還要懂」講一遍，之後再進卡片就不會迷路。
      </p>
      <nav className="toc" aria-label="本頁內容">
        <span className="muted">本頁內容</span>
        {[
          ['what', '神話是什麼'],
          ['world', '世界長什麼樣'],
          ['gen', '神的四代'],
          ['twelve', '十二主神速覽'],
          ['ideas', '四個核心觀念'],
          ['rome', '希臘 vs 羅馬'],
          ['today', '為什麼今天還要懂'],
          ['start', '怎麼開始'],
        ].map(([a, t]) => (
          <a key={a} href={`#${a}`} onClick={(e) => { e.preventDefault(); document.getElementById(`ov-sec-${a}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{t}</a>
        ))}
      </nav>

      <section id="ov-sec-what">
        <h2>一、神話是什麼：不是一本書，是幾百年的眾聲喧嘩</h2>
        <p>
          希臘神話沒有「聖經」。它是古希臘人從青銅時代口耳相傳的故事，被不同時代的詩人、劇作家各自寫下來；同一件事常有兩三種說法，誰也不是「標準答案」。<Ref k="wheMyth" /> 這就是為什麼本站每張卡都有「說法不一的地方」，而不是硬選一種。
        </p>
        <pre className="ascii">{`誰寫下了這些故事？（真實年代，由早到晚）

前 8 世紀   荷馬《伊里亞德》《奧德賽》      特洛伊戰爭與返鄉；眾神像一個大家族
前 700 年   赫西俄德《神譜》《工作與時日》   世界怎麼來、神的族譜、潘朵拉、人類為何受苦
前 5 世紀   雅典悲劇（埃斯庫羅斯、索福克勒斯、歐里庇得斯）  伊底帕斯、米蒂亞、酒神的女信徒
西元 1 世紀  阿波羅多洛斯《書庫》            把所有故事整理成一本「百科」
西元 8 年   奧維德《變形記》（羅馬人）       今天最多人讀的版本：阿拉克涅、納西瑟斯、伊卡洛斯
前 19 年    維吉爾《埃涅阿斯紀》（羅馬人）   把羅馬的起源接到特洛伊`}</pre>
        <p>
          兩個重點：第一，荷馬與赫西俄德相隔不遠，但兩人講的神常常不一樣（例如阿芙蘿黛蒂的出身）。<Ref k={['wheHomer', 'wheHesiod']} /> 第二，今天我們「以為」的希臘神話，很多其實是羅馬詩人奧維德的版本，他比荷馬晚了七百多年。<Ref k="wheOvid" /> 所以本站每句話句尾都有小字來源，你可以點開看是誰說的。
        </p>
      </section>

      <section id="ov-sec-world">
        <h2>二、世界長什麼樣：三層，三兄弟分家</h2>
        <p>
          荷馬讓海神親口說出這個世界的結構：泰坦之戰後，三兄弟抽籤分天下，宙斯抽到天空、波賽頓抽到大海、黑帝斯抽到冥界，大地與奧林帕斯山則是共有的。<Ref k="iliad15" />
        </p>
        <pre className="ascii">{`        ☁  奧林帕斯山頂：眾神的家，宙斯坐鎮          ← 宙斯 掌天空
   ───────────────────────────────────────────────
        ⛰  大地：人類、英雄、城邦                    ← 共有
        〰  大海：島嶼之間的航路，奧德修斯漂流的地方    ← 波賽頓
   ───────────────────────────────────────────────
        ⬇  冥界：所有死者都去（不分好壞）             ← 黑帝斯
        ⬇  塔爾塔羅斯：最深的深淵，關著被推翻的泰坦`}</pre>
        <p>
          注意：冥界不是「地獄」。希臘人相信每個人死後都去那裡，只有極少數罪人受罰、極少數英雄得到福報。<Ref k="odyssey11" /> 詳見 <CardLink id="place-underworld" /> 與 <a href={href('map')}>地圖頁的冥界示意圖</a>。
        </p>
      </section>

      <section id="ov-sec-gen">
        <h2>三、神的四代：兒子推翻父親，一再重演</h2>
        <p>
          赫西俄德的《神譜》把整個神界寫成一部家族史，主軸只有一句話：<strong>兒子推翻父親</strong>。它發生了兩次，第三次差點發生。<Ref k="theogony" />
        </p>
        <pre className="ascii">{`第 0 代  卡厄斯（最初的空隙）
            │
第 1 代  蓋亞（大地）＋ 烏拉諾斯（天空）
            │   烏拉諾斯把孩子塞回大地 ──► 克羅諾斯用鐮刀推翻父親   ◄ 第一次政變
第 2 代  泰坦：克羅諾斯 ＋ 瑞亞（還有阿特拉斯、普羅米修斯那一輩）
            │   克羅諾斯吞掉孩子 ──► 瑞亞用石頭調包，宙斯長大後開戰  ◄ 第二次政變
第 3 代  奧林帕斯眾神：宙斯、希拉、波賽頓、黑帝斯、狄蜜特、赫斯提亞
            │   宙斯吞掉懷孕的墨提斯，預言中的兒子沒有出生           ◄ 第三次沒發生
第 4 代  宙斯的子女：雅典娜、阿波羅、阿提米絲、荷米斯、阿瑞斯、戴奧尼索斯…
            │
英雄時代  神與凡人所生的英雄：海克力斯、柏修斯、忒修斯、伊阿宋
            │
特洛伊戰爭 → 返鄉（奧德賽） → 埃涅阿斯到義大利 → 羅馬建國`}</pre>
        <p>
          本站的「<a href={href('timeline')}>神話年代</a>」就是照這個順序排的 8 個時代。記住這條線，45 張卡裡的每一張你都知道該放在哪裡。相關卡片：<CardLink id="primordial-chaos" />、<CardLink id="primordial-gaia" />、<CardLink id="titan-cronus" />、<CardLink id="god-zeus" />、<CardLink id="event-titanomachy" />。
        </p>
      </section>

      <section id="ov-sec-twelve">
        <h2>四、奧林帕斯十二主神速覽</h2>
        <p>
          「十二主神」的名單古代就有兩種版本：差別在算不算黑帝斯（他住冥界，通常不算）、算不算赫斯提亞或戴奧尼索斯。<Ref k={['theoiOlympians', 'wheOlympians']} /> 下表列 12 位，再加黑帝斯。每一格都點得進去。
        </p>
        <div className="table-wrap">
          <table className="compare twelve-table">
            <thead>
              <tr>
                <th>神</th>
                <th>掌管</th>
                <th>名畫裡怎麼認</th>
                <th>羅馬名</th>
              </tr>
            </thead>
            <tbody>
              {[...twelve, cardById.get('god-hades')].filter(Boolean).map((c) => (
                <tr key={c!.id}>
                  <td><CardLink id={c!.id} /><br /><span className="muted small">{c!.name_en}</span></td>
                  <td>{c!.domains?.roles.slice(0, 3).join('、')}</td>
                  <td>{c!.domains?.symbols.slice(0, 3).join('、')}</td>
                  <td>{c!.roman ? `${c!.roman.name_zh} ${c!.roman.name_en ?? c!.roman.name_la}` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small">本站共收 {counts.gods} 位神祇與泰坦、{counts.heroes} 位英雄、{counts.stories} 則故事；全部清單在「<a href={href('cards')}>卡片</a>」。</p>
      </section>

      <section id="ov-sec-ideas">
        <h2>五、讀懂神話的四個核心觀念</h2>
        <ol className="steps ideas">
          <li>
            <strong>神像人，只是更大</strong>
            <span>希臘的神會嫉妒、外遇、說謊、哭著找爸爸。他們不是道德榜樣，而是把人性放大。荷馬筆下連宙斯都被妻子騙過。<Ref k="wheMyth" /></span>
          </li>
          <li>
            <strong>命運連宙斯都改不了</strong>
            <span>《伊里亞德》裡宙斯想救自己的兒子，希拉提醒他：命中注定的事，連你也不能改。他只能流下血淚。<Ref k="iliad16" /> 伊底帕斯越逃越近，就是這個觀念。</span>
          </li>
          <li>
            <strong>傲慢（hubris）必受懲罰</strong>
            <span>凡人自以為比神厲害，一定出事：阿拉克涅、尼俄柏、伊卡洛斯都是。這是希臘悲劇最常見的主題。<Ref k="wheTragedy" /> 見主題「<a href={href('topic', '傲慢與懲罰')}>傲慢與懲罰</a>」。</span>
          </li>
          <li>
            <strong>待客之道（xenia）是神聖的</strong>
            <span>陌生人上門要好好招待，因為宙斯是乞援者與陌生人的守護神；獨眼巨人吃掉客人、帕里斯拐走主人的妻子，都是觸犯這條。<Ref k="odyssey9" /></span>
          </li>
        </ol>
        <p>
          還有一個常被忽略的背景：赫西俄德說人類一代不如一代，從黃金時代一路退到他自己所處的「黑鐵時代」。<Ref k="worksdays" /> 所以希臘神話裡的「英雄時代」是過去式，神不再常常走進人間，這就是為什麼故事會停在特洛伊戰爭與返鄉。
        </p>
      </section>

      <section id="ov-sec-rome">
        <h2>六、希臘 vs 羅馬：不只是換名字</h2>
        <pre className="ascii">{`希臘人（前 8 世紀起）        羅馬人（前 3 世紀起大量吸收）
  宙斯   ──對應──►  朱比特   國家守護神，凱旋遊行的終點
  阿瑞斯 ──對應──►  馬爾斯   希臘人討厭的戰神，羅馬人的祖先
  赫斯提亞 ─對應──►  維斯塔   希臘沒故事的灶神，羅馬的國家聖火
  （無）           雅努斯    純羅馬的門神，一月 January`}</pre>
        <p>
          羅馬人本來有自己的神，接觸希臘文化後把兩邊「對應」起來，但地位與個性常常不同；有些神羅馬直接照搬（阿波羅），有些希臘根本沒有（雅努斯）。<Ref k="wheReligion" /> 完整名單與借用的真實歷史，看「<a href={href('compare')}>希臘 vs 羅馬</a>」。
        </p>
      </section>

      <section id="ov-sec-today">
        <h2>七、為什麼今天還要懂</h2>
        <p>
          因為它還在你身邊：八大行星除了地球全用這些神的羅馬名；一月到六月、星期六的名字；chaos、panic、echo、mentor、odyssey 這些單字；Nike、Hermès、Amazon、Versace 這些品牌；《戰神》《波西傑克森》《Hadestown》這些作品。本站的「<a href={href('today')}>今日影子</a>」收了 {site.today.length} 條，每條都寫明「和原典差在哪」，因為今天的用法常常已經走樣。
        </p>
      </section>

      <section id="ov-sec-start">
        <h2>八、怎麼開始</h2>
        <ol className="steps">
          <li><strong>照首頁的新手路線讀 8 張</strong><span>從蓋亞到埃涅阿斯，照故事順序，讀完就有骨架。<a href="#/">回首頁 →</a></span></li>
          <li><strong>卡片先看「三句話」</strong><span>每張卡開頭三句：他是誰、最有名的故事、為什麼今天會遇到他。沒時間就只看這裡。</span></li>
          <li><strong>遇到名字就點</strong><span>正文裡的人名都點得進去；滑過會浮出小卡，不用離開頁面。</span></li>
        </ol>
      </section>

      <section>
        <h2>這一頁的來源</h2>
        <ol className="sources">
          {keys.map((k) => (
            <li key={k} id={`ov-${k}`}>
              <span className={`src-kind ${k.startsWith('whe') || k.startsWith('theoi') ? 'modern' : 'ancient'}`}>{k.startsWith('whe') || k.startsWith('theoi') ? '現代' : '原典'}</span>{' '}
              <a href={SRC[k].url} target="_blank" rel="noreferrer">{SRC[k].cite}</a>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
