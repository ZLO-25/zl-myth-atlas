import { useEffect, useState } from 'react';
import { CardLink } from '../components/bits';
import { cardById, site } from '../lib/data';
import { href } from '../lib/router';

/**
 * 總覽：把希臘羅馬神話當成「一個連續的故事」講一遍，八幕，約 15 分鐘。
 * 觀念、表格、希羅對照都嵌在故事該出現的地方，而不是另外列。
 */

const TWELVE = ['god-zeus', 'god-hera', 'god-poseidon', 'god-demeter', 'god-athena', 'god-apollo', 'god-artemis', 'god-ares', 'god-aphrodite', 'god-hephaestus', 'god-hermes', 'god-dionysus'];

/** 本頁引用的來源：總覽不屬於任何一張卡，所以自己列。編號照出現順序 */
const SRC = {
  wheMyth: { k: 'modern', cite: 'World History Encyclopedia「Greek Mythology」（Mark Cartwright）', url: 'https://www.worldhistory.org/Greek_Mythology/' },
  wheHomer: { k: 'modern', cite: 'World History Encyclopedia「Homer」', url: 'https://www.worldhistory.org/homer/' },
  wheHesiod: { k: 'modern', cite: 'World History Encyclopedia「Hesiod」', url: 'https://www.worldhistory.org/hesiod/' },
  wheOvid: { k: 'modern', cite: 'World History Encyclopedia「Ovid」', url: 'https://www.worldhistory.org/Ovid/' },
  theog116: { k: 'ancient', cite: '赫西俄德《神譜》116–210（卡厄斯、蓋亞、烏拉諾斯被閹割、阿芙蘿黛蒂誕生）', url: 'https://www.theoi.com/Text/HesiodTheogony.html' },
  theog453: { k: 'ancient', cite: '赫西俄德《神譜》453–506（克羅諾斯吞子、瑞亞調包）', url: 'https://www.theoi.com/Text/HesiodTheogony.html' },
  theog617: { k: 'ancient', cite: '赫西俄德《神譜》617–735（泰坦之戰、塔爾塔羅斯）', url: 'https://www.theoi.com/Text/HesiodTheogony.html' },
  iliad15: { k: 'ancient', cite: '荷馬《伊里亞德》15.187–193（三兄弟抽籤分天下）', url: 'https://www.theoi.com/Text/HomerIliad15.html' },
  theog886: { k: 'ancient', cite: '赫西俄德《神譜》886–944（宙斯的配偶與子女、雅典娜從頭誕生）', url: 'https://www.theoi.com/Text/HesiodTheogony.html' },
  hymnHermes: { k: 'ancient', cite: '《荷馬詩體頌歌》第 4 首〈致荷米斯〉', url: 'https://www.theoi.com/Text/HomericHymns2.html' },
  odyssey8: { k: 'ancient', cite: '荷馬《奧德賽》8.266–366（阿瑞斯與阿芙蘿黛蒂被網住）', url: 'https://www.theoi.com/Text/HomerOdyssey8.html' },
  theoiOlympians: { k: 'modern', cite: 'Theoi.com「Twelve Olympians」', url: 'https://www.theoi.com/greek-mythology/olympian-gods.html' },
  theog507: { k: 'ancient', cite: '赫西俄德《神譜》507–616（普羅米修斯分肉、盜火、第一個女人）', url: 'https://www.theoi.com/Text/HesiodTheogony.html' },
  works42: { k: 'ancient', cite: '赫西俄德《工作與時日》42–105（潘朵拉的罐子）、106–201（人類五個時代）', url: 'https://www.theoi.com/Text/HesiodWorksDays.html' },
  hymnDemeter: { k: 'ancient', cite: '《荷馬詩體頌歌》第 2 首〈致狄蜜特〉', url: 'https://www.theoi.com/Text/HomericHymns1.html' },
  ovid6: { k: 'ancient', cite: '奧維德《變形記》6.1–145（阿拉克涅）、6.146–312（尼俄柏）', url: 'https://www.theoi.com/Text/OvidMetamorphoses6.html' },
  ovid3: { k: 'ancient', cite: '奧維德《變形記》3.138–255（阿克泰翁）、3.339–510（納西瑟斯）', url: 'https://www.theoi.com/Text/OvidMetamorphoses3.html' },
  ovid8: { k: 'ancient', cite: '奧維德《變形記》8.183–235（伊卡洛斯）', url: 'https://www.theoi.com/Text/OvidMetamorphoses8.html' },
  odyssey9: { k: 'ancient', cite: '荷馬《奧德賽》9.266–271（宙斯是乞援者與陌生人的守護者）、9.105–566（獨眼巨人）', url: 'https://www.theoi.com/Text/HomerOdyssey9.html' },
  wheTragedy: { k: 'modern', cite: 'World History Encyclopedia「Greek Tragedy」', url: 'https://www.worldhistory.org/Greek_Tragedy/' },
  apollod2: { k: 'ancient', cite: '阿波羅多洛斯《書庫》卷 2（柏修斯、海克力斯十二項任務）', url: 'https://www.theoi.com/Text/Apollodorus2.html' },
  plutTheseus: { k: 'ancient', cite: '普魯塔克《忒修斯傳》', url: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Theseus*.html' },
  apollod1: { k: 'ancient', cite: '阿波羅多洛斯《書庫》1.9.16–28（伊阿宋與米蒂亞）', url: 'https://www.theoi.com/Text/Apollodorus1.html' },
  ovid10: { k: 'ancient', cite: '奧維德《變形記》10.1–85（奧菲斯下冥界）', url: 'https://www.theoi.com/Text/OvidMetamorphoses10.html' },
  sophocles: { k: 'ancient', cite: '索福克勒斯《伊底帕斯王》', url: 'http://classics.mit.edu/Sophocles/oedipus.html' },
  iliad16: { k: 'ancient', cite: '荷馬《伊里亞德》16.431–461（宙斯救不了兒子薩爾珀冬）', url: 'https://www.theoi.com/Text/HomerIliad16.html' },
  apollodE: { k: 'ancient', cite: '阿波羅多洛斯《書庫》摘要 3–5（金蘋果到木馬屠城）', url: 'https://www.theoi.com/Text/ApollodorusE.html' },
  iliad1: { k: 'ancient', cite: '荷馬《伊里亞德》卷 1（阿基里斯之怒）、卷 22（殺死赫克托耳）、卷 24（普里阿摩斯贖屍）', url: 'https://www.theoi.com/Text/HomerIliad1.html' },
  aeneid2: { k: 'ancient', cite: '維吉爾《埃涅阿斯紀》卷 2（木馬、拉奧孔、城破）、卷 4（狄多）', url: 'http://classics.mit.edu/Virgil/aeneid.2.ii.html' },
  odyssey12: { k: 'ancient', cite: '荷馬《奧德賽》卷 12（海妖、太陽神的牛）、卷 23（床的祕密）', url: 'https://www.theoi.com/Text/HomerOdyssey12.html' },
  livy1: { k: 'ancient', cite: '李維《羅馬史》1.3–1.7（羅慕路斯與雷穆斯）', url: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0151:book=1:chapter=4' },
  wheReligion: { k: 'modern', cite: 'World History Encyclopedia「Roman Religion」', url: 'https://www.worldhistory.org/Roman_Religion/' },
};
type K = keyof typeof SRC;
const keys = Object.keys(SRC) as K[];
const jump = (id: string, block: ScrollLogicalPosition = 'center') => (e: React.MouseEvent) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block });
};
const Ref = ({ k }: { k: K | K[] }) => (
  <sup className="cite">
    {(Array.isArray(k) ? k : [k]).map((x) => (
      <a key={x} href={`#ov-${x}`} onClick={jump(`ov-${x}`)} title={SRC[x].cite}>
        {keys.indexOf(x) + 1}
      </a>
    ))}
  </sup>
);
const C = ({ id, children }: { id: string; children?: string }) => <CardLink id={id}>{children}</CardLink>;

const ACTS: [string, string, string][] = [
  ['act1', '一', '開天闢地：一把鐮刀'],
  ['act2', '二', '吞子與石頭：宙斯登基'],
  ['act3', '三', '奧林帕斯這一家'],
  ['act4', '四', '神與人：火、罐子、石榴籽'],
  ['act5', '五', '凡人的傲慢，神的嫉妒'],
  ['act6', '六', '英雄時代'],
  ['act7', '七', '特洛伊戰爭'],
  ['act8', '八', '返鄉，以及羅馬'],
];

/** 讀到這裡你已經知道：每一幕結尾的小結 */
function Recap({ items }: { items: string[] }) {
  return (
    <aside className="recap">
      <strong>讀到這裡你已經知道</strong>
      <ul>
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </aside>
  );
}

export function Overview() {
  const twelve = TWELVE.map((id) => cardById.get(id)).filter(Boolean);
  const [cur, setCur] = useState('');
  // 讀到哪一幕：讓頂端的進度列亮起來
  useEffect(() => {
    const els = ACTS.map(([a]) => document.getElementById(`ov-${a}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setCur(e.target.id.replace('ov-', ''));
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <article className="page overview">
      <h1>總覽：十五分鐘，一口氣講完希臘神話</h1>
      <p className="lead">
        希臘神話不是一堆零散的人名，而是一個連續的故事：世界怎麼來、神怎麼換了三代、神和人怎麼鬧翻、英雄怎麼出現、一場戰爭怎麼結束了英雄時代，最後怎麼傳到羅馬。下面分八幕講完。讀完這一頁，45 張卡裡的每一張你都知道放在哪裡。
      </p>
      <nav className="acts" aria-label="八幕">
        {ACTS.map(([a, no, title]) => (
          <a key={a} href={`#${a}`} className={cur === a ? 'on' : ''} onClick={jump(`ov-${a}`, 'start')}>
            <span className="act-no">{no}</span>
            <span>{title}</span>
          </a>
        ))}
      </nav>

      <section className="prologue">
        <h2>序幕：為什麼沒有一本「希臘神話」</h2>
        <p>
          先說一件會讓你安心的事：希臘神話沒有「正確版本」。它是從青銅時代口耳相傳的故事，被不同時代的詩人各自寫下來，同一件事常有兩三種說法。<Ref k="wheMyth" /> 最早也最重要的兩位，是講特洛伊戰爭與返鄉的<strong>荷馬</strong>，和寫下眾神族譜的<strong>赫西俄德</strong>，都在西元前 8 到 7 世紀。<Ref k={['wheHomer', 'wheHesiod']} /> 七百年後，羅馬詩人<strong>奧維德</strong>把這些故事重講一遍，寫得更美、更戲劇化；今天大家「以為」的希臘神話，很多其實是奧維德的版本。<Ref k="wheOvid" />
        </p>
        <pre className="ascii">{`誰講的？（真實年代）                 本頁的故事主要跟誰走
前 8 世紀   荷馬《伊里亞德》《奧德賽》     第七、八幕
前 700 年   赫西俄德《神譜》《工作與時日》  第一到四幕
前 5 世紀   雅典悲劇                      第五、六幕（伊底帕斯）
西元 8 年   奧維德《變形記》（羅馬）       第五幕（變形故事）
前 19 年    維吉爾《埃涅阿斯紀》（羅馬）   第八幕`}</pre>
        <p>所以本站每一句話句尾都有小字來源，點了就能看到是誰說的。好，故事開始。</p>
      </section>

      {/* ───────── 第一幕 ───────── */}
      <section id="ov-act1">
        <h2><span className="act-no">一</span>開天闢地：一把鐮刀</h2>
        <p>
          一開始，什麼都沒有，只有一道張開的空隙，希臘人叫它<C id="primordial-chaos">卡厄斯</C>。接著大地<C id="primordial-gaia">蓋亞</C>出現了，她不靠任何人，自己生出了和她一樣大、能把她整個蓋住的星空<C id="primordial-uranus">烏拉諾斯</C>。天與地結合，生下十二位泰坦、三位獨眼巨人、三位各有一百隻手的百臂巨人。<Ref k="theog116" />
        </p>
        <p>
          但烏拉諾斯恨這些孩子。孩子一出生，他就把他們塞回大地體內，不讓他們見光。被撐得痛苦的蓋亞打造了一把巨大的鐮刀，問孩子們誰敢替她報仇。只有最小的<C id="titan-cronus">克羅諾斯</C>站出來。那天夜裡，天空降下來擁抱大地，埋伏的克羅諾斯一刀割下父親的生殖器，往身後一拋。落在地上的血生出復仇女神與巨人族；落進海裡的部分在浪裡漂流，周圍湧起白色泡沫，泡沫中走出一位少女：<C id="god-aphrodite">阿芙蘿黛蒂</C>。<Ref k="theog116" />
        </p>
        <p>這是希臘神話的第一個主題，之後會一再重演：<strong>兒子推翻父親</strong>。</p>
        <Recap items={['世界不是被「創造」的，是一件件自己冒出來的：空隙 → 大地 → 天空', '第一代統治者烏拉諾斯被兒子克羅諾斯用鐮刀推翻', '愛神阿芙蘿黛蒂是從這一刀的泡沫裡生出來的（荷馬另有一說：她是宙斯的女兒）']} />
      </section>

      {/* ───────── 第二幕 ───────── */}
      <section id="ov-act2">
        <h2><span className="act-no">二</span>吞子與石頭：宙斯登基</h2>
        <p>
          克羅諾斯當上王，娶了姊姊<C id="titan-rhea">瑞亞</C>。可是父母告訴他一個預言：你也會被自己的兒子推翻。於是孩子一出生，他就一口吞進肚裡：<C id="god-hestia">赫斯提亞</C>、<C id="god-demeter">狄蜜特</C>、<C id="god-hera">希拉</C>、<C id="god-hades">黑帝斯</C>、<C id="god-poseidon">波賽頓</C>，一個接一個。生到第六個時，瑞亞受不了了。她在父母指點下，把剛出生的<C id="god-zeus">宙斯</C>送到克里特島的山洞藏起來，拿一塊石頭包在襁褓裡交給丈夫。克羅諾斯看也不看就吞了。<Ref k="theog453" />
        </p>
        <p>
          宙斯長大後，設計讓父親把吞下的孩子全部吐出來，最先吐出來的就是那塊石頭。被吐出來的哥哥姊姊成了他的班底，新舊兩代神族在奧林帕斯山與俄特里斯山對峙，打了整整十年：<C id="event-titanomachy">泰坦之戰</C>。僵局怎麼打破？宙斯放出了被祖父關在地底的獨眼巨人（他們送他雷電）和百臂巨人（他們一次丟出三百塊巨石）。泰坦戰敗，被鎖進地底最深的塔爾塔羅斯。<Ref k="theog617" /> 站錯邊的<C id="titan-atlas">阿特拉斯</C>，從此在世界的西方盡頭扛著天空。
        </p>
        <p>天下打下來了，怎麼分？荷馬讓波賽頓親口說：三兄弟抽籤。<Ref k="iliad15" /></p>
        <pre className="ascii">{`        ☁  奧林帕斯山頂：眾神的家            宙斯 ── 天空、雷電、王權
   ───────────────────────────────────────
        ⛰  大地：人類、英雄、城邦            三兄弟共有
        〰  大海：島嶼之間的航路              波賽頓 ── 海、地震、馬
   ───────────────────────────────────────
        ⬇  冥界：所有死者都去，不分好壞       黑帝斯 ── 亡者、地底的財富
        ⬇  塔爾塔羅斯：最深的深淵，關著泰坦`}</pre>
        <p>
          記住這張圖，往後所有故事都在這三層之間發生。也請記住：冥界不是「地獄」，每個人死後都去那裡，只有極少數罪人受罰、極少數英雄享福。<Ref k="theog617" /> 詳見<C id="place-underworld">冥界</C>。
        </p>
        <Recap items={['兒子推翻父親第二次上演：克羅諾斯吞子，宙斯靠一塊石頭活下來', '泰坦之戰打了十年，雷電與百臂巨人決定勝負；輸的被關進塔爾塔羅斯', '世界分三層：天空（宙斯）、海（波賽頓）、冥界（黑帝斯），大地共有']} />
      </section>

      {/* ───────── 第三幕 ───────── */}
      <section id="ov-act3">
        <h2><span className="act-no">三</span>奧林帕斯這一家</h2>
        <p>
          宙斯當了王，第一件事是結婚，而且結很多次。第一任妻子是智慧女神墨提斯，預言說她會生下一個推翻他的兒子，宙斯乾脆把懷孕的她整個吞下去。後來他頭痛欲裂，<C id="god-athena">雅典娜</C>全副武裝從他的頭裡跳了出來。那個預言中的兒子永遠沒有出生：「兒子推翻父親」的第三回合，被宙斯用吞的擋掉了。<Ref k="theog886" />
        </p>
        <p>
          接著他和勒托生下雙胞胎<C id="god-apollo">阿波羅</C>與<C id="god-artemis">阿提米絲</C>，最後娶姊姊<C id="god-hera">希拉</C>為正宮，生下戰神<C id="god-ares">阿瑞斯</C>；希拉和他吵架，一氣之下自己生了跛腳的工匠神<C id="god-hephaestus">赫菲斯托斯</C>。婚後宙斯照樣到處留情：和邁亞生下<C id="god-hermes">荷米斯</C>，這孩子出生第一天就發明了七弦琴、偷走哥哥阿波羅的牛；<Ref k="hymnHermes" /> 和凡人塞墨勒生下<C id="god-dionysus">戴奧尼索斯</C>，母親被宙斯的真身燒死，胎兒縫進父親大腿裡再出生一次。<Ref k="theog886" />
        </p>
        <p>
          這個家一點也不和睦：希拉一輩子追殺丈夫的情人與私生子；阿芙蘿黛蒂嫁給赫菲斯托斯卻和阿瑞斯偷情，被丈夫用一張看不見的網當場網住，叫眾神來看笑話。<Ref k="odyssey8" /> 這就是希臘神話的第二個主題：<strong>神像人，只是更大</strong>。他們會嫉妒、外遇、哭著找爸爸，不是道德榜樣，而是把人性放大給你看。
        </p>
        <p>所謂「奧林帕斯十二主神」，就是這一家人。名單古代就有兩種版本，差別在算不算住在冥界的黑帝斯。<Ref k="theoiOlympians" /> 每一格都點得進去：</p>
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
        <Recap items={['宙斯吞下墨提斯，擋掉第三次政變；雅典娜從他頭裡出生', '十二主神就是宙斯這一家：兄弟姊妹（希拉、波賽頓、狄蜜特、赫斯提亞）＋子女', '神像人，只是更大：外遇、嫉妒、報復，全是家務事']} />
      </section>

      {/* ───────── 第四幕 ───────── */}
      <section id="ov-act4">
        <h2><span className="act-no">四</span>神與人：火、罐子、石榴籽</h2>
        <p>
          人類在哪裡？赫西俄德說，神與人原本一起吃飯，直到有一天要決定祭祀時怎麼分牛肉。泰坦<C id="titan-prometheus">普羅米修斯</C>（名字的意思是「先想到的人」）把好肉藏在難看的牛胃裡，把白骨裹上誘人的油脂，請宙斯先選。宙斯選了油脂那堆，看到白骨，怒火中燒，把火從人類手中收走。普羅米修斯又把火種藏在空心的茴香莖裡偷回人間。<Ref k="theog507" />
        </p>
        <p>
          宙斯的報復分兩頭。對普羅米修斯：鎖在懸崖上，每天一隻鷹來啄食肝臟，夜裡長回來，第二天再吃。對人類：命赫菲斯托斯用土和水捏出第一個女人<C id="story-pandora">潘朵拉</C>，眾神各送一樣禮物，送到普羅米修斯那個「後想到的」弟弟家。潘朵拉掀開一只大陶罐（對，是罐子，不是盒子），疾病與勞苦飛散人間，只有「希望」留在罐裡。<Ref k={['theog507', 'works42']} /> 從此人類不再過沒有煩惱的日子，而且一代不如一代：從黃金時代一路退到赫西俄德自己所處的黑鐵時代。<Ref k="works42" />
        </p>
        <p>
          神與人之間還有一條更溫柔、也更重要的線。穀物女神<C id="god-demeter">狄蜜特</C>的女兒<C id="story-persephone">波瑟芬妮</C>在草地上摘花，大地裂開，冥王黑帝斯駕著金色馬車把她擄走，宙斯早已私下同意。狄蜜特舉著火炬找了九天九夜，知道真相後離開奧林帕斯，讓大地不長一粒穀物，人類快餓死，神也收不到祭品。宙斯只好讓步；但黑帝斯臨走前讓少女吃下石榴籽，吃過冥界食物就不能完全離開。協議是：她每年一部分時間住冥界，其餘回到母親身邊。<Ref k="hymnDemeter" />
        </p>
        <pre className="ascii">{`波瑟芬妮在人間 ─► 母親歡喜 ─► 大地生長（春、夏）
波瑟芬妮在冥界 ─► 母親哀傷 ─► 大地休眠（荒蕪的季節）`}</pre>
        <p>這個故事解釋了季節，也成了古希臘最重要的秘密宗教「厄琉息斯秘儀」的核心：參加者相信死後會有更好的命運。<Ref k="hymnDemeter" /></p>
        <Recap items={['普羅米修斯兩次騙宙斯：分肉、盜火；代價是被鷹啄肝', '潘朵拉打開的是罐子；人類從此受苦，只剩希望', '波瑟芬妮每年回冥界一段時間：季節的由來，也是死後希望的寄託']} />
      </section>

      {/* ───────── 第五幕 ───────── */}
      <section id="ov-act5">
        <h2><span className="act-no">五</span>凡人的傲慢，神的嫉妒</h2>
        <p>
          神與人的距離拉開之後，故事的主題變成一條鐵律：<strong>凡人不可以自以為比神厲害</strong>，希臘人叫它 hubris（傲慢）。織女<C id="story-arachne">阿拉克涅</C>說自己織得比雅典娜好，比賽時織出眾神欺騙凡人女子的醜事，作品完美無瑕，卻被女神變成蜘蛛。王后尼俄柏誇口自己有十四個孩子，比只生兩個的勒托了不起，阿波羅與阿提米絲一人一邊，把她的孩子全部射死。<Ref k="ovid6" /> 獵人阿克泰翁只是不小心撞見阿提米絲洗澡，就被變成鹿，被自己的獵犬咬死。<Ref k="ovid3" />
        </p>
        <p>
          有些懲罰連「錯」都談不上。美少年<C id="story-narcissus">納西瑟斯</C>拒絕了所有追求者，報應女神讓他愛上水中自己的倒影，憔悴而死，原地開出一朵水仙；愛他的仙女厄科則憔悴到只剩回聲。<Ref k="ovid3" /> 少年<C id="story-icarus">伊卡洛斯</C>戴著父親用羽毛和蠟做的翅膀飛出克里特島，父親叮嚀不要飛太高，他越飛越開心，太陽融化了蠟，墜海而死。<Ref k="ovid8" />
        </p>
        <p>
          讀這些故事時，請把四個觀念放在心上，它們是整部神話的「遊戲規則」：
        </p>
        <ol className="steps ideas">
          <li><strong>神像人，只是更大</strong><span>神會嫉妒、會犯錯、會偏心。不要用「善惡」看他們，要用「權力」看。</span></li>
          <li><strong>傲慢（hubris）必受懲罰</strong><span>凡人挑戰神，一定出事；這也是雅典悲劇最愛的主題。<Ref k="wheTragedy" /></span></li>
          <li><strong>待客之道（xenia）是神聖的</strong><span>陌生人上門要好好招待，因為宙斯是乞援者與陌生人的守護神；吃掉客人的獨眼巨人、拐走主人妻子的帕里斯，都觸犯了這條。<Ref k="odyssey9" /></span></li>
          <li><strong>命運連宙斯都改不了</strong><span>《伊里亞德》裡宙斯想救親生兒子，希拉提醒他：注定的事連你也不能改。他只能流下血淚。<Ref k="iliad16" /> 下一幕的伊底帕斯就是這條規則的極致。</span></li>
        </ol>
        <Recap items={['hubris：阿拉克涅、尼俄柏、伊卡洛斯都是「太過頭」的下場', '有時根本沒犯錯也會遭殃（阿克泰翁、納西瑟斯）：神的世界不講公平', '四條規則：神像人、傲慢必罰、待客神聖、命運難違']} />
      </section>

      {/* ───────── 第六幕 ───────── */}
      <section id="ov-act6">
        <h2><span className="act-no">六</span>英雄時代</h2>
        <p>
          宙斯和凡人女子生下的孩子，成了英雄：半神半人，能殺怪物，卻逃不過人的命運。<C id="hero-perseus">柏修斯</C>的母親被外公關在銅屋裡，宙斯化成金雨進去；他長大後借來飛鞋、隱形帽和一面當鏡子的盾，不直視就砍下了蛇髮女妖<C id="monster-medusa">梅杜莎</C>的頭，回程順手救了被綁在海邊的公主。多年後他擲鐵餅誤殺外公，預言還是應驗了。<Ref k="apollod2" />
        </p>
        <p>
          最強的英雄是<C id="hero-heracles">海克力斯</C>，也是希拉恨得最深的私生子。她在他嬰兒時放蛇進搖籃，長大後讓他發瘋殺死自己的孩子。為了贖罪，他完成十二項不可能的任務：勒死刀槍不入的獅子、斬九頭蛇、一天清完牛棚、替阿特拉斯扛天去摘金蘋果，最後下冥界把看門的三頭犬活捉上來。<Ref k="apollod2" /> 他死於妻子的醋意（一件浸了毒血的袍子），死後成神。
        </p>
        <p>
          雅典的英雄<C id="hero-theseus">忒修斯</C>自願當貢品去克里特，靠公主阿里阿德涅的一團線走出迷宮、殺死牛頭人<C id="monster-minotaur">米諾陶洛斯</C>；回程卻拋下公主，又忘了把黑帆換成白帆，父親以為他死了，跳崖自盡。<Ref k="plutTheseus" /> <C id="hero-jason">伊阿宋</C>率阿爾戈號遠航取金羊毛，真正的功臣是女巫公主米蒂亞；他後來拋棄她，她殺了新娘，也殺了自己和他的孩子。<Ref k="apollod1" /> 歌手<C id="hero-orpheus">奧菲斯</C>唱動了冥界，被允許帶妻子回人間，條件是出去前不准回頭。他在最後一步回頭了。<Ref k="ovid10" />
        </p>
        <p>
          而最有名的「命運」故事，主角甚至不是英雄。底比斯王子<C id="story-oedipus">伊底帕斯</C>聽到「殺父娶母」的預言，為了逃避而離家，卻在路口殺了不認識的親生父親，解開人面獅身的謎題當上國王，娶了守寡的王后。多年後他像偵探一樣追查前王的兇手，每個證人都把他推向同一個答案：就是他自己。他刺瞎了雙眼。<Ref k="sophocles" />
        </p>
        <pre className="ascii">{`父親怕預言 → 丟棄嬰兒 → 嬰兒不認得父母
                              ↓
   聽到預言 → 為了保護「父母」離家 → 正好走向真正的父親
                              ↓
          每一步「逃避命運」的選擇，都是走向命運的一步`}</pre>
        <Recap items={['英雄＝神與人的孩子：能殺怪，逃不過命運', '柏修斯（梅杜莎）、海克力斯（十二任務）、忒修斯（迷宮）、伊阿宋（金羊毛）、奧菲斯（回頭）', '伊底帕斯：越逃越近，命運故事的極致']} />
      </section>

      {/* ───────── 第七幕 ───────── */}
      <section id="ov-act7">
        <h2><span className="act-no">七</span>特洛伊戰爭</h2>
        <p>
          英雄時代的最後一場大戲，起因荒謬得像一場婚禮鬧劇。爭吵女神沒被邀請，丟下一顆寫著「給最美的」金蘋果；希拉、雅典娜、阿芙蘿黛蒂都要，宙斯把裁判工作丟給特洛伊王子帕里斯。希拉許他權力，雅典娜許他戰無不勝，阿芙蘿黛蒂許他世上最美的女人。帕里斯選了阿芙蘿黛蒂，然後到斯巴達作客，帶走了主人的妻子海倫。<Ref k="apollodE" />
        </p>
        <p>
          為什麼全希臘都要為一個王后出兵？因為海倫出嫁前，所有求婚的王子都發過誓：不管誰娶到她，大家都要保護這段婚姻。誓言把每個人拖下水。船隊在港口無風，統帥阿伽門農得把親生女兒獻祭給阿提米絲才能出航。<Ref k="apollodE" /> 這就是<C id="story-trojan-war">特洛伊戰爭</C>。
        </p>
        <p>
          荷馬的《伊里亞德》不是從頭講，它只寫第十年的幾十天，主角是<C id="hero-achilles">阿基里斯</C>的憤怒：統帥搶走他的女俘，他罷戰，希臘軍節節敗退；摯友穿上他的盔甲代他出戰而死，他暴怒復出，殺死特洛伊王子赫克托耳，把屍體綁在戰車後拖行。最後一夜，赫克托耳年邁的父親潛入敵營，跪下親吻殺子仇人的手求屍，兩個敵人相對痛哭。史詩就停在這裡。<Ref k="iliad1" />
        </p>
        <p>
          結局是後人補的：阿基里斯被射中腳踝而死；久攻不下的希臘人聽<C id="hero-odysseus">奧德修斯</C>的計，造了一匹藏著戰士的<C id="story-trojan-horse">木馬</C>假裝撤退。祭司拉奧孔大喊「我怕希臘人，就算他們帶著禮物」，隨即被海蛇纏死；特洛伊人把木馬拖進城，當夜城破。<Ref k={['apollodE', 'aeneid2']} />
        </p>
        <pre className="ascii">{`金蘋果 ─► 帕里斯的評判 ─► 帶走海倫 ─► 求婚者誓約 ─► 聯軍出征 ─► 圍城十年
                                                                   ↓
                                                  阿基里斯之怒（《伊里亞德》）
                                                                   ↓
                                                     木馬計 ─► 特洛伊陷落
                                                   ↙                      ↘
                                  希臘英雄返鄉（《奧德賽》）        埃涅阿斯出逃（羅馬起源）`}</pre>
        <Recap items={['一顆金蘋果 → 一場選美 → 一個誓言 → 十年戰爭', '《伊里亞德》只寫阿基里斯的憤怒，不寫木馬也不寫阿基里斯之死', '木馬計結束戰爭，也結束了英雄時代']} />
      </section>

      {/* ───────── 第八幕 ───────── */}
      <section id="ov-act8">
        <h2><span className="act-no">八</span>返鄉，以及羅馬</h2>
        <p>
          戰爭結束，英雄各自回家，<C id="story-odyssey">奧德修斯</C>走了十年。他被獨眼巨人關進山洞，自稱「沒有人」，灌醉巨人後刺瞎他的眼，逃上船卻忍不住報上真名炫耀，巨人的父親海神波賽頓從此讓他有家歸不得。<Ref k="odyssey9" /> 他讓水手塞住耳朵、把自己綁在桅桿上聽海妖唱歌；同伴吃了太陽神的牛，宙斯一道雷把船擊沉，只剩他一人。在家鄉，妻子潘妮洛普白天織壽衣、晚上拆掉，拖住一百多個求婚者。奧德修斯扮成乞丐回家，拉開只有他拉得開的弓，殺光求婚者；潘妮洛普還不敢相信，直到他說出只有兩人知道的祕密：那張床是用活橄欖樹做的，搬不動。<Ref k="odyssey12" />
        </p>
        <p>
          另一邊，特洛伊這方也有人活下來。<C id="hero-aeneas">埃涅阿斯</C>背著老父、牽著幼子逃出火海，漂流到北非，迦太基女王狄多愛上他；神提醒他使命在義大利，他悄悄離開，狄多自殺前詛咒兩國世代為敵。他最後在義大利打贏戰爭，後代建立了阿爾巴隆加王國。<Ref k="aeneid2" /> 幾百年後，一位女祭司和戰神馬爾斯生下雙胞胎<C id="story-romulus-remus">羅慕路斯與雷穆斯</C>，被丟進台伯河，被一頭母狼救起餵奶；兩兄弟長大後建城，為了誰當王起衝突，羅慕路斯殺了弟弟，城市以他命名：羅馬。<Ref k="livy1" />
        </p>
        <p>
          為什麼羅馬人要把自己的祖先接到特洛伊？因為羅馬人從西元前 3 世紀起大量吸收希臘文化，把自己原有的神「對應」到希臘神上：宙斯變成朱比特，阿瑞斯變成馬爾斯。但<strong>不只是換名字</strong>：希臘人討厭的暴躁戰神，在羅馬是國家的祖先；希臘幾乎沒故事的灶神，在羅馬是國家聖火；而門神<C id="god-janus">雅努斯</C>是希臘根本沒有的。<Ref k="wheReligion" /> 完整對照見「<a href={href('compare')}>希臘 vs 羅馬</a>」。
        </p>
        <Recap items={['奧德賽：十年返鄉，靠的是腦袋；潘妮洛普的聰明不輸丈夫', '羅馬人把起源接到特洛伊（埃涅阿斯），再接到母狼養大的雙胞胎', '羅馬神≠希臘神換名字：地位、個性常不一樣']} />
      </section>

      {/* ───────── 尾聲 ───────── */}
      <section className="epilogue">
        <h2>尾聲：這些故事今天在哪裡</h2>
        <p>
          這條線你現在已經有了：<strong>空隙 → 大地與天空 → 泰坦 → 奧林帕斯 → 人類受苦 → 英雄 → 特洛伊 → 返鄉 → 羅馬</strong>。它還在你身邊：八大行星除了地球全用這些神的羅馬名；一月（雅努斯）、三月（馬爾斯）、星期六（薩圖恩）；chaos、panic、echo、mentor、odyssey、narcissism 這些單字；Nike、Hermès、Versace、Amazon 這些品牌；《戰神》《波西傑克森》《Hadestown》這些作品。本站的「<a href={href('today')}>今日影子</a>」收了 {site.today.length} 條，每條都寫明「和原典差在哪」，因為今天的用法常常已經走樣。
        </p>
        <pre className="ascii">{`讀完總覽之後，怎麼往下走？

  想照順序深入 ──► 首頁「新手路線」8 張（蓋亞 → 克羅諾斯 → 宙斯 → 普羅米修斯 → 波瑟芬妮 → 特洛伊 → 奧德賽 → 埃涅阿斯）
  想認識某位神 ──► 「卡片」：每張開頭三句話，30 秒知道他是誰；名畫區教你在博物館認出他
  想看人物關係 ──► 「族譜」：點一位神展開家族；「年代」：八個時代就是本頁的八幕
  想找今天的梗 ──► 「今日影子」：單字、品牌、電影、行星`}</pre>
        <p>
          <a className="overview-cta" href="#/"><strong>回首頁，從新手路線第 1 張開始 →</strong><span>蓋亞：一切從大地開始</span></a>
        </p>
      </section>

      <section>
        <h2>這一頁的來源</h2>
        <ol className="sources">
          {keys.map((k) => (
            <li key={k} id={`ov-${k}`}>
              <span className={`src-kind ${SRC[k].k}`}>{SRC[k].k === 'ancient' ? '原典' : '現代'}</span>{' '}
              <a href={SRC[k].url} target="_blank" rel="noreferrer">{SRC[k].cite}</a>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
