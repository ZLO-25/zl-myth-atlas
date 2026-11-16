import { useEffect, useId, useState } from 'react';
import { CardLink, ScrollTable } from '../components/bits';
import { fullName, romanNames } from '../lib/names';
import { cardById, site } from '../lib/data';
import { href } from '../lib/router';
import { CN_PATH, NORSE_PATH, STARTER_PATH } from '../lib/paths';

/**
 * 總覽：本站三套神話（希臘羅馬、北歐、中華）各講成「一個連續的故事」。
 * 開頭先說三套神話各是怎麼留下來的、可信度差在哪；接著三部各自成篇，可以只讀一部；
 * 尾聲把三套放在一起看。觀念、表格、對照都嵌在故事該出現的地方，而不是另外列。
 * 這一頁只寫各卡片已經查證、寫了來源的內容。
 */

const TWELVE = ['god-zeus', 'god-hera', 'god-poseidon', 'god-demeter', 'god-athena', 'god-apollo', 'god-artemis', 'god-ares', 'god-aphrodite', 'god-hephaestus', 'god-hermes', 'god-dionysus'];

const PE = 'https://www.gutenberg.org/ebooks/73533';
const GYLF = 'https://germanicmythology.com/ProseEdda/BRODEURPrologeandGylfaginning.html';
const GYLF51 = 'https://www.voluspa.org/gylfaginning51-54.htm';

/** 本頁引用的來源：總覽不屬於任何一張卡，所以自己列。編號照出現順序 */
const SRC = {
  // ── 開頭：三套神話怎麼留下來 ──
  wheMyth: { k: 'modern', cite: 'World History Encyclopedia「Greek Mythology」（Mark Cartwright）', url: 'https://www.worldhistory.org/Greek_Mythology/' },
  wheHomer: { k: 'modern', cite: 'World History Encyclopedia「Homer」', url: 'https://www.worldhistory.org/homer/' },
  wheHesiod: { k: 'modern', cite: 'World History Encyclopedia「Hesiod」', url: 'https://www.worldhistory.org/hesiod/' },
  wheOvid: { k: 'modern', cite: 'World History Encyclopedia「Ovid」', url: 'https://www.worldhistory.org/Ovid/' },
  wheNorse: { k: 'modern', cite: 'World History Encyclopedia「Norse Mythology」（《詩體埃達》約 1270 年編成、斯諾里《散文埃達》約 1220 年、斯諾里站在基督教的立場寫作）', url: 'https://www.worldhistory.org/Norse_Mythology/' },
  poeticEdda: { k: 'ancient', cite: '《詩體埃達》（Bellows 英譯，全書）', url: PE },
  proseEdda: { k: 'ancient', cite: '斯諾里《散文埃達》〈欺騙古魯菲〉（Brodeur 英譯，全篇）', url: GYLF },
  britFeng: { k: 'modern', cite: '大英百科「Fenghuang」（《山海經》年代：前 3 世紀～西元 1 世紀）', url: 'https://www.britannica.com/topic/fenghuang' },
  britCn: { k: 'modern', cite: '大英百科「Chinese mythology」', url: 'https://www.britannica.com/topic/Chinese-mythology' },
  sanwu: { k: 'ancient', cite: '徐整《三五曆紀》（三國吳），見歐陽詢《藝文類聚》卷1〈天部上〉', url: 'https://zh.wikisource.org/wiki/%E8%97%9D%E6%96%87%E9%A1%9E%E8%81%9A/%E5%8D%B7001' },
  // ── 第一部：希臘羅馬 ──
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
  // ── 第二部：北歐 ──
  vsp3: { k: 'ancient', cite: '《詩體埃達》〈女先知的預言〉第 2–3 節與 Bellows 註解（最初的裂口、九個世界沒有列名字）', url: PE },
  g5: { k: 'ancient', cite: '斯諾里《散文埃達》〈欺騙古魯菲〉第 5–9 章（尤彌爾、母牛、包爾的兒子、身體變成世界、第一對人類）', url: GYLF },
  g15: { k: 'ancient', cite: '斯諾里《散文埃達》〈欺騙古魯菲〉第 15–16 章（世界樹的三條根、密米爾之泉、樹上的住客）', url: GYLF },
  vsp19: { k: 'ancient', cite: '《詩體埃達》〈女先知的預言〉第 19–20 節（常綠的白蠟樹、三位諾恩）', url: PE },
  g20: { k: 'ancient', cite: '斯諾里《散文埃達》〈欺騙古魯菲〉第 20–22 章（奧丁、索爾、巴德爾）', url: GYLF },
  vsp29: { k: 'ancient', cite: '《詩體埃達》〈女先知的預言〉第 27、29、47 節（押在泉裡的眼睛；密米爾的頭）', url: PE },
  hav139: { k: 'ancient', cite: '《詩體埃達》〈高人的箴言〉第 139–140 節（奧丁吊在樹上九夜）', url: PE },
  g34: { k: 'ancient', cite: '斯諾里《散文埃達》〈欺騙古魯菲〉第 25、33–34 章（提爾、洛基和他的三個孩子、綁住芬里爾）', url: GYLF },
  g48: { k: 'ancient', cite: '斯諾里《散文埃達》〈欺騙古魯菲〉第 48 章（索爾釣大蛇）', url: GYLF },
  etymDays: { k: 'modern', cite: 'Online Etymology Dictionary「Tuesday」「Wednesday」', url: 'https://www.etymonline.com/word/Wednesday' },
  lok9: { k: 'ancient', cite: '《詩體埃達》〈洛基的爭辯〉第 9 節與結尾的散文說明（血盟兄弟；洛基被綁）', url: PE },
  g42: { k: 'ancient', cite: '斯諾里《散文埃達》〈欺騙古魯菲〉第 42 章（巨人工匠與斯雷普尼爾）', url: GYLF },
  thrym: { k: 'ancient', cite: '《詩體埃達》〈索列姆之歌〉（索爾扮新娘）', url: PE },
  g49: { k: 'ancient', cite: '斯諾里《散文埃達》〈欺騙古魯菲〉第 49 章（巴德爾之死）', url: GYLF },
  vsp32: { k: 'ancient', cite: '《詩體埃達》〈女先知的預言〉第 32–33 節（槲寄生與霍德爾，只有幾行）', url: PE },
  wheThor: { k: 'modern', cite: 'World History Encyclopedia「Thor」（在埃達裡索爾不是洛基的兄弟）', url: 'https://www.worldhistory.org/Thor/' },
  vsp44: { k: 'ancient', cite: '《詩體埃達》〈女先知的預言〉第 44–56 節（諸神黃昏）', url: PE },
  g51: { k: 'ancient', cite: '斯諾里《散文埃達》〈欺騙古魯菲〉第 51 章（諸神黃昏的對戰）', url: GYLF51 },
  vsp59: { k: 'ancient', cite: '《詩體埃達》〈女先知的預言〉第 59、62 節（大地再升起、巴德爾回來）', url: PE },
  g53: { k: 'ancient', cite: '斯諾里《散文埃達》〈欺騙古魯菲〉第 53 章（活下來的神與人）', url: GYLF51 },
  wheRagnarok: { k: 'modern', cite: 'World History Encyclopedia「Ragnarök」（重生段落可能受基督教影響）', url: 'https://www.worldhistory.org/Ragnarok/' },
  // ── 第三部：中華 ──
  wuyun: { k: 'ancient', cite: '徐整《五運歷年紀》，見馬驌《繹史》卷1（盤古化身）', url: 'https://zh.wikisource.org/zh-hant/%E7%B9%B9%E5%8F%B2_(%E5%9B%9B%E5%BA%AB%E5%85%A8%E6%9B%B8%E6%9C%AC)/%E5%85%A8%E8%A6%BD1' },
  fengsu: { k: 'ancient', cite: '應劭《風俗通義》佚文，見《太平御覽》卷78〈皇王部三〉（女媧捏土造人）', url: 'https://zh.wikisource.org/zh/%E5%A4%AA%E5%B9%B3%E5%BE%A1%E8%A6%BD/0078' },
  lanming: { k: 'ancient', cite: '《淮南子·覽冥訓》（西漢，劉安主編；女媧補天、嫦娥奔月）', url: 'https://ctext.org/huainanzi/lan-ming-xun/zh' },
  tianwenxun: { k: 'ancient', cite: '《淮南子·天文訓》（共工撞不周山）', url: 'https://ctext.org/huainanzi/tian-wen-xun/zh' },
  liezi: { k: 'ancient', cite: '《列子·湯問》（先講補天，再講共工）', url: 'https://ctext.org/liezi/tang-wen/zh' },
  tianwen: { k: 'ancient', cite: '屈原《楚辭·天問》（「女媧有體，孰制匠之？」；替鯀抱不平）', url: 'https://ctext.org/chu-ci/tian-wen/zh' },
  xici: { k: 'ancient', cite: '《周易·繫辭下》（約戰國；伏羲畫八卦、神農作耒耜）', url: 'https://ctext.org/book-of-changes/xi-ci-xia/zh' },
  xiuwu: { k: 'ancient', cite: '《淮南子·修務訓》（神農嘗百草）', url: 'https://ctext.org/huainanzi/xiu-wu-xun/zh' },
  benjing: { k: 'ancient', cite: '《淮南子·本經訓》（倉頡作書、羿射十日）', url: 'https://ctext.org/huainanzi/ben-jing-xun/zh' },
  dahuangbei: { k: 'ancient', cite: '《山海經·大荒北經》（黃帝與蚩尤；天女魃；夸父「不量力」）', url: 'https://ctext.org/shan-hai-jing/da-huang-bei-jing/zh' },
  wudi: { k: 'ancient', cite: '司馬遷《史記·五帝本紀》（西漢；阪泉、涿鹿、堯舜禪讓）', url: 'https://ctext.org/shiji/wu-di-ben-ji/zh' },
  britHuangdi: { k: 'modern', cite: '大英百科「Huangdi」', url: 'https://www.britannica.com/topic/Huangdi' },
  haiwaixi: { k: 'ancient', cite: '《山海經·海外西經》（形天）', url: 'https://ctext.org/shan-hai-jing/hai-wai-xi-jing/zh' },
  dahuangnan: { k: 'ancient', cite: '《山海經·大荒南經》、〈海外東經〉（羲和生十日、扶桑）', url: 'https://ctext.org/shan-hai-jing/da-huang-nan-jing/zh' },
  britHouyi: { k: 'modern', cite: '大英百科「Hou Yi」（「射九留一」是後世說法）', url: 'https://www.britannica.com/topic/Hou-Yi' },
  britChange: { k: 'modern', cite: '大英百科「Chang’e」（月宮、玉兔是後來加的）', url: 'https://www.britannica.com/topic/Change-Chinese-deity' },
  xishan: { k: 'ancient', cite: '《山海經·西山經》（西王母「豹尾虎齒」）', url: 'https://ctext.org/shan-hai-jing/xi-shan-jing/zh' },
  haiwaibei: { k: 'ancient', cite: '《山海經·海外北經》（夸父逐日）', url: 'https://ctext.org/shan-hai-jing/hai-wai-bei-jing/zh' },
  beishan: { k: 'ancient', cite: '《山海經·北山經》（精衛）', url: 'https://ctext.org/shan-hai-jing/bei-shan-jing/zh' },
  haineijing: { k: 'ancient', cite: '《山海經·海內經》（鯀竊息壤、被祝融所殺）', url: 'https://ctext.org/shan-hai-jing/hai-nei-jing/zh' },
  xiabenji: { k: 'ancient', cite: '司馬遷《史記·夏本紀》（鯀治水九年、禹疏導洪水）', url: 'https://ctext.org/shiji/xia-ben-ji/zh' },
  mengzi: { k: 'ancient', cite: '《孟子·滕文公上》（禹三過家門不入）', url: 'https://ctext.org/mengzi/teng-wen-gong-i/zh' },
  britXia: { k: 'modern', cite: '大英百科「Xia dynasty」', url: 'https://www.britannica.com/topic/Xia-dynasty' },
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

type Part = 'greek' | 'norse' | 'chinese';
const PARTS: [Part, string, string][] = [
  ['greek', '第一部', '希臘羅馬'],
  ['norse', '第二部', '北歐'],
  ['chinese', '第三部', '中華'],
];
/** [錨點, 幕次, 標題, 屬於哪一部, 目錄用的短標題（4 字內，手機一格放得下）] */
const ACTS: [string, string, string, Part, string][] = [
  ['act1', '一', '開天闢地：一把鐮刀', 'greek', '鐮刀開天'],
  ['act2', '二', '吞子與石頭：宙斯登基', 'greek', '宙斯登基'],
  ['act3', '三', '奧林帕斯這一家', 'greek', '奧林帕斯'],
  ['act4', '四', '神與人：火、罐子、石榴籽', 'greek', '火與罐子'],
  ['act5', '五', '凡人的傲慢，神的嫉妒', 'greek', '凡人傲慢'],
  ['act6', '六', '英雄時代', 'greek', '英雄時代'],
  ['act7', '七', '特洛伊戰爭', 'greek', '特洛伊'],
  ['act8', '八', '返鄉，以及羅馬', 'greek', '返鄉羅馬'],
  ['n1', '一', '霜與火之間：巨人的身體', 'norse', '巨人身體'],
  ['n2', '二', '眾神付出的代價', 'norse', '眾神代價'],
  ['n3', '三', '洛基與巴德爾之死', 'norse', '巴德爾死'],
  ['n4', '四', '諸神黃昏，以及之後', 'norse', '諸神黃昏'],
  ['c1', '一', '開天與補天', 'chinese', '開天補天'],
  ['c2', '二', '發明東西的人', 'chinese', '發明家'],
  ['c3', '三', '涿鹿之戰：神變成帝王', 'chinese', '涿鹿之戰'],
  ['c4', '四', '十個太陽與一顆月亮', 'chinese', '射日奔月'],
  ['c5', '五', '洪水與夏朝', 'chinese', '大禹治水'],
];

/** 每幕結尾：先問一個問題，按「看答案」才展開「讀到這裡你已經知道」 */
function Recap({ q, items }: { q: string; items: string[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <aside className="recap">
      <p className="recap-q">
        <strong>先想一想</strong>
        {q}
      </p>
      <button type="button" className="recap-btn" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
        {open ? '收起答案' : '看答案'}
      </button>
      {open && (
        <div id={id} className="recap-body">
          <strong>讀到這裡你已經知道</strong>
          <ul>
            {items.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

/** 每一部的開頭橫幅 */
function PartHead({ part, minutes, children }: { part: Part; minutes: number; children: React.ReactNode }) {
  const [, no, name] = PARTS.find(([p]) => p === part)!;
  const n = ACTS.filter((a) => a[3] === part).length;
  return (
    <header className={`part-head part-${part}`} id={`ov-part-${part}`}>
      <p className="part-no">{no}・約 {minutes} 分鐘</p>
      <h2 className="part-title">{name}神話：{'〇一二三四五六七八九'[n]}幕</h2>
      <p>{children}</p>
    </header>
  );
}

const QUICK: [Part, string, [string, string][]][] = [
  ['greek', '希臘羅馬', STARTER_PATH],
  ['norse', '北歐', NORSE_PATH],
  ['chinese', '中華', CN_PATH],
];

export function Overview() {
  const twelve = TWELVE.map((id) => cardById.get(id)).filter(Boolean);
  const [cur, setCur] = useState('');
  const [quick, setQuick] = useState<Part>('greek');
  // 讀到哪一幕：讓頂端的目錄亮起來。
  // 用「哪一段的開頭已經捲過目錄底下那條線」來判斷，捲動當下就更新（不等標題捲到畫面中間）
  useEffect(() => {
    const ids = [...PARTS.map(([p]) => `part-${p}`), ...ACTS.map(([a]) => a)];
    const els = ids.map((a) => document.getElementById(`ov-${a}`)).filter(Boolean) as HTMLElement[];
    els.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    let raf = 0;
    const update = () => {
      raf = 0;
      const nav = document.querySelector('nav.acts');
      const line = (nav?.getBoundingClientRect().bottom ?? 0) + 96;
      let found = '';
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) found = el.id.replace('ov-', '');
        else break;
      }
      setCur(found);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  // 點目錄：立刻亮起、立刻跳過去（不用慢慢滑）
  const go = (target: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setCur(target);
    document.getElementById(`ov-${target}`)?.scrollIntoView({ behavior: 'auto', block: 'start' });
  };
  // 目前讀到哪一部：決定下排列出哪幾幕
  const curPart: Part = (cur.startsWith('part-') ? (cur.slice(5) as Part) : ACTS.find(([a]) => a === cur)?.[3]) ?? 'greek';

  return (
    <article className="page overview">
      <h1>總覽：三套神話，從開天闢地講到世界末日</h1>
      <p className="lead">
        本站收了三套神話：<strong>希臘羅馬</strong>、<strong>北歐</strong>、<strong>中華</strong>。它們是三個不同地方的人，各自回答同樣幾個大問題：世界怎麼來的？誰在管事？人和神是什麼關係？最後會怎樣？下面分三部，每一部都當成一個連續的故事講完，可以只讀一部（全部讀完約 40 分鐘）。讀完這一頁，{site.cards.length} 張卡裡的每一張你都知道放在哪裡。
      </p>
      <aside className="quick" aria-label="極短版">
        <strong>只有 1～2 分鐘？先讀極短版</strong>
        <div className="quick-tabs" role="group" aria-label="選一套神話">
          {QUICK.map(([part, label]) => (
            <button key={part} type="button" className={`part-${part}${quick === part ? ' on' : ''}`} aria-pressed={quick === part} onClick={() => setQuick(part)}>
              {label}
            </button>
          ))}
        </div>
        <ol>
          {QUICK.find(([p]) => p === quick)![2].map(([id, why]) => (
            <li key={id}>
              <a href={href('card', id)}>{cardById.get(id)?.name_zh}</a>
              <span>{why}</span>
            </li>
          ))}
        </ol>
        <span className="muted small">想要完整故事，就往下讀：希臘羅馬八幕、北歐四幕、中華五幕。</span>
      </aside>
      {/* 目錄兩排：上排選神話（三顆永遠看得到），下排只列這套神話的幕；不必橫向捲動 */}
      <nav className={`acts part-${curPart}`} aria-label="目錄">
        <div className="part-tabs">
          {PARTS.map(([part, , name]) => (
            <a
              key={part}
              href={`#part-${part}`}
              className={`part-tab part-${part}${part === curPart && cur ? ' on' : ''}`}
              aria-current={part === curPart && cur ? 'true' : undefined}
              onClick={go(`part-${part}`)}
            >
              {name}
              <span className="part-count">{ACTS.filter((x) => x[3] === part).length} 幕</span>
            </a>
          ))}
        </div>
        <div className="act-chips">
          {ACTS.filter((x) => x[3] === curPart).map(([a, no, title, , label]) => (
            <a key={a} href={`#${a}`} className={cur === a ? 'on' : ''} title={title} aria-label={`第${no}幕：${title}`} aria-current={cur === a ? 'true' : undefined} onClick={go(a)}>
              <span className="act-no">{no}</span>
              <span className="act-title">{label}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* ───────── 開頭：三套神話怎麼留下來 ───────── */}
      <section className="prologue" id="ov-sources-guide">
        <h2>開始之前：這三套神話，各是怎麼留到今天的</h2>
        <p>
          先說一件很重要、但常被忽略的事：<strong>我們今天讀到的神話，全都是「某個人、在某個年代、寫下來的版本」</strong>。沒有一套神話有「正確版本」。<Ref k="wheMyth" /> 三套神話被寫下來的時間差了將近兩千年，寫的人和他們的立場也很不一樣，所以讀的時候要問的問題也不一樣。
        </p>
        <pre className="ascii">{`真實年代：這些故事「什麼時候被寫成文字」（不是故事發生的時間）

前 8～7 世紀 ─● 希臘：荷馬《伊里亞德》《奧德賽》、赫西俄德《神譜》
前 5 世紀    ─● 希臘：雅典悲劇
前 3 世紀    ─┐
 ～西元 1 世紀 ─● 中華：《山海經》；西漢的《淮南子》、司馬遷《史記》
西元前後     ─● 羅馬：維吉爾、奧維德重講希臘故事
3 世紀       ─● 中華：三國吳人徐整，第一次寫下盤古
約 1220 年   ─● 北歐：冰島人斯諾里寫《散文埃達》
約 1270 年   ─● 北歐：古詩被編成《詩體埃達》`}</pre>
        <p className="muted small">
          年代出處：荷馬、赫西俄德<Ref k={['wheHomer', 'wheHesiod']} />；奧維德<Ref k="wheOvid" />；兩部埃達<Ref k="wheNorse" />；《山海經》<Ref k="britFeng" />；盤古<Ref k={['sanwu', 'britCn']} />。
        </p>
        <ScrollTable>
          <table className="compare src-table">
            <thead>
              <tr>
                <th></th>
                <th>希臘羅馬</th>
                <th>北歐</th>
                <th>中華</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="nw">主要的書</td>
                <td>荷馬、赫西俄德的史詩；雅典悲劇；羅馬詩人奧維德、維吉爾</td>
                <td>兩本書：古詩集《詩體埃達》，和斯諾里整理的《散文埃達》</td>
                <td>沒有一本專講神話的書。本站 {site.cards.filter((c) => c.myth_system.includes('chinese')).length} 張中華卡的原典，散在《山海經》《淮南子》《史記》《楚辭》《周易》等許多種古書裡，每本只記幾段</td>
              </tr>
              <tr>
                <td className="nw">誰寫的</td>
                <td>許多不同時代的詩人與劇作家，各寫各的</td>
                <td>斯諾里是 13 世紀的冰島人，站在基督教的立場寫作；古詩的作者不知道是誰<Ref k="wheNorse" /></td>
                <td>許多不同朝代、不同身分的作者，各記一小段；司馬遷《史記》把其中一部分寫成了歷史</td>
              </tr>
              <tr>
                <td className="nw">最大的問題</td>
                <td>版本太多，同一件事常有兩三種說法；今天流行的版本常是羅馬人奧維德的<Ref k="wheOvid" /></td>
                <td>寫下來的時間很晚；很多完整的情節，只有斯諾里一個人說過<Ref k={['wheNorse', 'proseEdda']} /></td>
                <td>故事零碎，有些原書已經失傳，只靠後世的書引用才留下來（例如盤古<Ref k="sanwu" />）；而且很多神後來被寫成「古代的帝王」，神話被改寫成歷史<Ref k="britCn" /></td>
              </tr>
              <tr>
                <td className="nw">讀的時候問自己</td>
                <td>這是哪位詩人的版本？</td>
                <td>這句是古詩說的，還是斯諾里說的？</td>
                <td>這是哪本書、哪個朝代的說法？後人加了什麼？</td>
              </tr>
            </tbody>
          </table>
        </ScrollTable>
        <h3>「可信度」在這裡是什麼意思？</h3>
        <p>
          這裡說的可信度，不是問「神話裡的事有沒有真的發生」，而是問：<strong>我們讀到的版本，離最早相信這些故事的人有多近？</strong>每多經過一手、多隔幾百年，就可能多改掉一點。
        </p>
        <pre className="ascii">{`最早的口傳 ──(幾十到幾百年)──► 寫成文字 ──► 抄本、引文留下來 ──► 今天的翻譯 ──► 電影、遊戲、小說
                                   │
           每一步都可能刪掉、改寫、補上一點；越往右，離原來的說法越遠`}</pre>
        <ul className="notes">
          <li><strong>希臘：</strong>最早的作品在前 8～7 世紀，比北歐的兩本書早了將近兩千年，而且可以互相對照的作者最多。<Ref k={['wheHomer', 'wheHesiod']} /></li>
          <li><strong>北歐：</strong>古詩可能在 10 世紀以前、基督教傳入之前就有了，但兩本書都是 13 世紀才寫成；研究者提醒，斯諾里的書要帶著批判的眼光讀。<Ref k="wheNorse" /> 所以本站的北歐卡片，每一段都標明是「古詩說的」還是「斯諾里說的」。</li>
          <li><strong>中華：</strong>最特別的是「書寫的時間」和「故事的時間」剛好倒過來：排在最前面的盤古，反而最晚出現在書裡。<Ref k={['sanwu', 'britCn']} /> 很多今天熟悉的情節（嫦娥的玉兔、后羿「射九留一」）原典都沒有，是後人加的。<Ref k={['britChange', 'britHouyi']} /></li>
        </ul>
        <p>所以本站每一句話句尾都有小字來源，點了就能看到是誰說的；古書彼此矛盾時，兩種說法都寫出來，不替古人選一個。</p>
      </section>

      {/* ═════════ 第一部：希臘羅馬 ═════════ */}
      <PartHead part="greek" minutes={20}>
        世界怎麼來、神怎麼換了三代、神和人怎麼鬧翻、英雄怎麼出現、一場戰爭怎麼結束了英雄時代，最後怎麼傳到羅馬。主線是<strong>兒子推翻父親</strong>。
      </PartHead>
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
        <Recap q="世界一開始是怎麼來的？第一代統治者後來被誰推翻？" items={['世界不是被「創造」的，是一件件自己冒出來的：空隙 → 大地 → 天空', '第一代統治者烏拉諾斯被兒子克羅諾斯用鐮刀推翻', '愛神阿芙蘿黛蒂是從這一刀的泡沫裡生出來的（荷馬另有一說：她是宙斯的女兒）']} />
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
        <Recap q="克羅諾斯為什麼要吞掉自己的孩子？宙斯又是怎麼活下來的？" items={['兒子推翻父親第二次上演：克羅諾斯吞子，宙斯靠一塊石頭活下來', '泰坦之戰打了十年，雷電與百臂巨人決定勝負；輸的被關進塔爾塔羅斯', '世界分三層：天空（宙斯）、海（波賽頓）、冥界（黑帝斯），大地共有']} />
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
        <ScrollTable>
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
                  <td><CardLink id={c!.id} /></td>
                  <td>{c!.domains?.roles.slice(0, 3).join('、')}</td>
                  <td>{c!.domains?.symbols.slice(0, 3).join('、')}</td>
                  <td>{c!.roman ? fullName(romanNames(c!)!) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollTable>
        <Recap q="十二主神其實是誰的一家人？宙斯為什麼要把墨提斯吞下肚？" items={['宙斯吞下墨提斯，擋掉第三次政變；雅典娜從他頭裡出生', '十二主神就是宙斯這一家：兄弟姊妹（希拉、波賽頓、狄蜜特、赫斯提亞）＋子女', '神像人，只是更大：外遇、嫉妒、報復，全是家務事']} />
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
        <Recap q="普羅米修斯騙了宙斯幾次？潘朵拉打開的到底是什麼？四季又是怎麼來的？" items={['普羅米修斯兩次騙宙斯：分肉、盜火；代價是被鷹啄肝', '潘朵拉打開的是罐子；人類從此受苦，只剩希望', '波瑟芬妮每年回冥界一段時間：季節的由來，也是死後希望的寄託']} />
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
        <Recap q="阿拉克涅、尼俄柏、伊卡洛斯的下場有什麼共通點？有沒有人根本沒犯錯也遭殃？" items={['hubris：阿拉克涅、尼俄柏、伊卡洛斯都是「太過頭」的下場', '有時根本沒犯錯也會遭殃（阿克泰翁、納西瑟斯）：神的世界不講公平', '四條規則：神像人、傲慢必罰、待客神聖、命運難違']} />
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
        <Recap q="英雄是什麼樣的人？說出一位你記得的英雄和他的代表事蹟。" items={['英雄＝神與人的孩子：能殺怪，逃不過命運', '柏修斯（梅杜莎）、海克力斯（十二任務）、忒修斯（迷宮）、伊阿宋（金羊毛）、奧菲斯（回頭）', '伊底帕斯：越逃越近，命運故事的極致']} />
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
        <Recap q="特洛伊戰爭是怎麼開始的？《伊里亞德》有寫到木馬屠城嗎？" items={['一顆金蘋果 → 一場選美 → 一個誓言 → 十年戰爭', '《伊里亞德》只寫阿基里斯的憤怒，不寫木馬也不寫阿基里斯之死', '木馬計結束戰爭，也結束了英雄時代']} />
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
        <Recap q="奧德修斯靠什麼回到家？羅馬人把自己的祖先接到誰身上？" items={['奧德賽：十年返鄉，靠的是腦袋；潘妮洛普的聰明不輸丈夫', '羅馬人把起源接到特洛伊（埃涅阿斯），再接到母狼養大的雙胞胎', '羅馬神≠希臘神換名字：地位、個性常不一樣']} />
      </section>

      {/* ═════════ 第二部：北歐 ═════════ */}
      <PartHead part="norse" minutes={10}>
        冰與火之間冒出一個巨人，眾神殺了他、用他的身體造出世界；眾神為了智慧和秩序一再付出代價，卻早就知道自己最後會死。主線是<strong>一個早就寫好的結局</strong>。
      </PartHead>

      <section className="prologue">
        <h2>北歐的序：先分清楚「古詩」和「斯諾里」</h2>
        <p>
          北歐神話主要靠兩本書留下來。<Ref k={['poeticEdda', 'proseEdda']} /> 《詩體埃達》是一部古詩集，詩寫得很短、很跳，常常只用幾行帶過一件大事；《散文埃達》是冰島人斯諾里在 13 世紀寫的整理本，把故事從頭到尾講清楚。<Ref k="wheNorse" /> 今天大家熟悉的北歐故事，很多完整情節只見於斯諾里。下面每一幕都會告訴你哪一段是誰說的。
        </p>
        <pre className="ascii">{`《詩體埃達》：古詩，作者不明，約 1270 年編成
     └─► 像「重點筆記」：事件有，細節少

《散文埃達》：斯諾里寫，約 1220 年
     └─► 像「整理好的課本」：故事完整，但經過他的手`}</pre>
      </section>

      {/* ───────── 北歐第一幕 ───────── */}
      <section id="ov-n1">
        <h2><span className="act-no">一</span>霜與火之間：巨人的身體變成世界</h2>
        <p>
          一開始，沒有海、沒有沙、也沒有浪，只有一道張開的裂口，叫金倫加鴻溝。<Ref k="vsp3" /> 斯諾里接著說：裂口的一邊是尼福爾海姆的霜，另一邊是穆斯貝爾海姆的熱；霜被熱融化，滴成了人形，這就是霜巨人<C id="primordial-ymir">尤彌爾</C>。一頭母牛用乳汁餵他；母牛舔著鹹鹹的冰塊，三天舔出一個人，叫布利。布利的兒子包爾娶了巨人的女兒，生下三個兒子：<C id="god-odin">奧丁</C>、維利和維。<Ref k="g5" />
        </p>
        <p>
          然後，這三兄弟殺了尤彌爾。他的血多到淹死了幾乎所有霜巨人，只有一家人逃走。三兄弟用尤彌爾的身體造出世界：肉變成大地，血變成海，骨頭變成岩石，頭蓋骨變成天空，眉毛圍成人類住的米德加爾德，腦變成雲。最後，眾神用兩棵樹，造出第一對人類。<Ref k="g5" />
        </p>
        <pre className="ascii">{`尤彌爾的身體          世界
   肉        ───►   大地
   血        ───►   海
   骨頭      ───►   岩石
   頭蓋骨    ───►   天空（四個角各有一個矮人撐著）
   眉毛      ───►   圍住人間米德加爾德的牆
   腦        ───►   雲`}</pre>
        <p>
          世界的中心是一棵常綠的白蠟樹：<C id="place-yggdrasil">世界樹</C>。<Ref k="vsp19" /> 斯諾里說它有三條根，一條通往眾神開會的泉、一條通往霜巨人那邊的密米爾之泉、一條在尼福爾海姆上方、被毒龍尼德霍格啃著。<Ref k="g15" /> 你可能聽過「北歐九界」，但要小心：古詩只說有「九個世界」，沒有列出名字，今天常見的九界名單是後人整理的。<Ref k="vsp3" />
        </p>
        <p>
          注意這裡和希臘的不同：希臘是一代代「生」出世界，北歐是「殺」了一個巨人、拆開他的身體做成世界。而且眾神的母親本身就是巨人的女兒，<strong>神和巨人從一開始就是親戚，也是仇人</strong>。<Ref k="g5" />
        </p>
        <Recap q="北歐的世界是用什麼做成的？為什麼說神和巨人是親戚？" items={['世界是用被殺的霜巨人尤彌爾的身體做成的：肉是地、血是海、頭蓋骨是天', '奧丁三兄弟的母親是巨人的女兒，神和巨人本來就有血緣', '世界樹是常綠的白蠟樹；古詩只說「九個世界」，九界的名單是後人整理的']} />
      </section>

      {/* ───────── 北歐第二幕 ───────── */}
      <section id="ov-n2">
        <h2><span className="act-no">二</span>眾神付出的代價</h2>
        <p>
          <C id="god-odin">奧丁</C>是阿薩神族裡最高、最年長的神，被稱為「眾神之父」，妻子是<C id="god-frigg">芙麗嘉</C>。<Ref k="g20" /> 他最有名的故事，都和<strong>知道更多</strong>有關，而且他願意為此付出身體：他為了喝一口密米爾之泉的水，把一隻眼睛押在泉裡；<Ref k="vsp29" /> 他也在風吹的樹上吊了九夜，被矛刺傷，「自己獻給自己」，然後尖叫著拾起了盧恩文字。<Ref k="hav139" /> （古詩另一處又說奧丁向「密米爾的頭」問計，兩種說法對不起來。<Ref k="vsp29" />）
        </p>
        <p>
          洛基和女巨人生了三個可怕的孩子：狼<C id="monster-fenrir">芬里爾</C>、大蛇<C id="monster-jormungandr">耶夢加得</C>，和海爾。奧丁把大蛇丟進深海，牠越長越大，環繞了整個大地。狼被眾神養在身邊，只有<C id="god-tyr">提爾</C>敢餵牠。牠掙斷了兩條鐵鍊，眾神再拿來一條矮人用「貓的腳步聲、女人的鬍子、山的根」等六樣東西做成、滑得像絲帶的繩子。狼起了疑心，要有人把手放進牠嘴裡當保證。提爾放進了右手。繩子綁住了狼，眾神不肯鬆綁，狼就咬斷了提爾的手。斯諾里寫：「除了提爾，大家都笑了。」<Ref k="g34" />
        </p>
        <p>
          最強的神是奧丁的兒子<C id="god-thor">索爾</C>：拿著錘子妙爾尼爾、繫著讓力量加一半的腰帶，專打巨人。<Ref k="g20" /> 他曾經用牛頭當餌，把米德加爾德大蛇從海裡釣上來；巨人嚇得割斷了釣線。有人說索爾當場打掉了蛇頭，但斯諾里說，大蛇還活著。<Ref k="g48" /> 這筆帳，要留到世界末日才算。
        </p>
        <pre className="ascii">{`眾神為了「知道」和「秩序」付出的代價

  奧丁 ──► 押掉一隻眼睛、吊在樹上九夜 ──► 換到智慧、盧恩文字
  提爾 ──► 把右手放進狼嘴             ──► 換到把芬里爾綁起來
                                              │
                         但預言早就說了：這匹狼最後會殺死奧丁`}</pre>
        <p>
          為什麼不乾脆殺了狼？斯諾里說，眾神不願讓血玷汙聖地，雖然預言說這匹狼會殺死奧丁。<Ref k="g34" /> 這就是北歐神話最特別的地方：<strong>眾神知道結局，卻照樣做該做的事</strong>。今天的星期二（Tuesday）和星期三（Wednesday），原本就是提爾和奧丁的日子。<Ref k="etymDays" />
        </p>
        <Recap q="奧丁和提爾各付出了什麼？眾神為什麼沒有殺死芬里爾？" items={['奧丁押掉一隻眼睛、吊在樹上九夜，換來智慧與盧恩文字', '提爾用右手換到把狼綁起來；眾神不願玷汙聖地，所以沒殺牠', '預言早就說狼會殺死奧丁：北歐的神知道自己的結局']} />
      </section>

      {/* ───────── 北歐第三幕 ───────── */}
      <section id="ov-n3">
        <h2><span className="act-no">三</span>洛基與巴德爾之死</h2>
        <p>
          <C id="god-loki">洛基</C>是巨人的兒子，卻住在眾神之間。斯諾里形容他「外表俊美，心地邪惡，性情多變」。<Ref k="g34" /> 古詩裡洛基提醒奧丁：「我們曾經混過血」，他們是結拜的血盟兄弟。<Ref k="lok9" /> 洛基常常闖禍，又常常替眾神收拾：一個巨人工匠和眾神打賭，是洛基出主意接受賭約，後來又是他去引開工匠的馬，後來還「生下」一匹八隻腳的小馬，成了奧丁的坐騎。<Ref k="g42" /> 索爾的錘子被巨人偷走時，也是他陪索爾披上新娘頭紗、自己扮成侍女，一起去把錘子騙回來：這就是<C id="story-thor-bride">索爾扮新娘</C>。<Ref k="thrym" />
        </p>
        <p>
          但他也做了北歐神話裡最不可原諒的事。奧丁的次子<C id="god-baldr">巴德爾</C>最俊美，身上會發光。<Ref k="g20" /> 他夢見自己有性命危險，母親芙麗嘉就讓火、水、鐵、石、樹、疾病、鳥獸、毒蛇全都發誓不傷他。眾神覺得好玩，拿東西丟他取樂。洛基扮成女人去問芙麗嘉，套出一個祕密：槲寄生太年幼，沒有發誓。他拔來槲寄生，交給盲眼的霍德爾，還幫他瞄準，巴德爾倒地而死。<Ref k="g49" />
        </p>
        <pre className="ascii">{`巴德爾做惡夢 ─► 萬物發誓不傷他 ─► 眾神丟東西取樂
                                       │
              洛基套出：只有槲寄生沒發誓
                                       ▼
          盲眼的霍德爾拿槲寄生一射 ─► 巴德爾死
                                       │
          冥界的海爾說：萬物都為他哭，就放他回來
                                       ▼
          只有一個女巨人不肯哭（人們認為那就是洛基）─► 巴德爾回不來`}</pre>
        <p>
          眾神派人騎著八腳馬，騎了九夜到冥界求情。海爾開出條件：只要世上萬物都為巴德爾哭，就放他回來。萬物都哭了，只有一個女巨人不肯，斯諾里說人們認為她就是洛基變的。<Ref k="g49" /> 洛基最後被抓住，眾神用他兒子的腸子把他綁起來，頭上掛著滴毒液的蛇；他一掙扎，大地就震動。<Ref k="lok9" />
        </p>
        <p>
          要提醒的是：這個故事最完整的版本來自斯諾里，古詩〈女先知的預言〉只用幾行帶過槲寄生和霍德爾。<Ref k="vsp32" /> 也別把洛基當成索爾的兄弟：在埃達裡，他們不是兄弟。<Ref k="wheThor" />
        </p>
        <Recap q="洛基是眾神的朋友還是敵人？巴德爾為什麼回不來？" items={['洛基是巨人之子、奧丁的血盟兄弟：常闖禍，也常幫忙（八腳馬、扮侍女拿回錘子）', '萬物都發誓不傷巴德爾，只漏了槲寄生；洛基讓盲眼的霍德爾射死了他', '海爾要萬物都哭；只有一個女巨人（被認為是洛基）不哭，巴德爾就回不來']} />
      </section>

      {/* ───────── 北歐第四幕 ───────── */}
      <section id="ov-n4">
        <h2><span className="act-no">四</span>諸神黃昏，以及之後</h2>
        <p>
          巴德爾死後，故事就走向結局。古詩說：兄弟會互相殘殺，鎖鏈斷裂，狼芬里爾掙脫出來；<C id="god-heimdall">海姆達爾</C>吹響號角，世界樹搖動；洛基掌舵駛來敵船，火巨人蘇爾特從南方來。<Ref k="vsp44" /> 斯諾里還補上：先會來一個連續的大寒冬，狼會吞下太陽。<Ref k="g51" /> 這就是<C id="story-ragnarok">諸神黃昏</C>。
        </p>
        <pre className="ascii">{`最後一戰：一組一組的對手
  奧丁       ✖ 狼芬里爾      奧丁被吞；兒子維達殺狼替他報仇
  索爾       ✖ 大蛇耶夢加得  索爾殺死大蛇，走了九步，中毒倒下
  弗雷       ✖ 火巨人蘇爾特  弗雷戰死
  提爾       ✖ 惡犬加姆      同歸於盡  ┐ 這兩組只有斯諾里寫，
  海姆達爾   ✖ 洛基          同歸於盡  ┘ 古詩沒有
                    │
                    ▼
          蘇爾特的火燒毀世界`}</pre>
        <p className="muted small">對戰出處：古詩<Ref k="vsp44" />、斯諾里<Ref k="g51" />。</p>
        <p>
          世界燒光了，但故事沒有結束。古詩說，大地從海中再度升起，一片翠綠；巴德爾和霍德爾從冥界回來。<Ref k="vsp59" /> 斯諾里說，有幾位神活了下來，索爾的兒子帶著那把錘子前來；一對人類躲在樹林裡、靠晨露活過大火，重新繁衍人類。<Ref k="g53" /> 不過研究者指出，這段「重生」可能受到基督教的影響。<Ref k="wheRagnarok" />
        </p>
        <p>
          回頭看第二幕就懂了：奧丁押眼睛、問預言，都是為了知道結局；知道了，還是改不了。<strong>北歐的神不是不死的，他們的勇氣在於明知會輸，還是上戰場。</strong>
        </p>
        <Recap q="諸神黃昏時，奧丁和索爾各怎麼死？世界燒光之後呢？" items={['奧丁被狼芬里爾吞下；索爾殺了大蛇，走九步後中毒倒下', '火巨人蘇爾特的火燒毀世界；大地又從海裡升起，巴德爾回來', '重生的段落可能受基督教影響；有兩組對戰只見於斯諾里']} />
      </section>

      {/* ═════════ 第三部：中華 ═════════ */}
      <PartHead part="chinese" minutes={10}>
        巨人撐開天地、女神補好破掉的天，接著一位位發明家、帝王出場，最後大禹治好洪水，他的兒子開啟夏朝。主線是<strong>有人出來把世界修好</strong>，而且越往後，神越像古代的帝王。
      </PartHead>

      <section className="prologue">
        <h2>中華的序：為什麼沒有一本「中華神話」</h2>
        <p>
          希臘有荷馬、北歐有斯諾里，中華神話卻沒有一位把故事從頭講到尾的作者。故事散在《山海經》、漢代的《淮南子》、屈原的詩、司馬遷的《史記》等古書裡，每本只記一兩段，有時只有一句話：本站 {site.cards.filter((c) => c.myth_system.includes('chinese')).length} 張中華卡的原典，來自許多種不同的古書。 下面這五幕的順序，是照「故事裡的時間」排的，但要記得它們被寫下來的時間常常是倒過來的：
        </p>
        <pre className="ascii">{`書寫的時間：  女媧、黃帝（戰國～漢） ──────→ 盤古（三國）
故事的時間：  盤古（最早） ──────→ 女媧 ──────→ 黃帝 ──────→ 堯、舜、禹 ──→ 夏朝`}</pre>
        <p>
          還有一個中華神話獨有的現象：很多神後來被寫成了真實的古代君主，學者稱為神話的「歷史化」。<Ref k="britCn" /> 第三幕會親眼看到它怎麼發生。
        </p>
      </section>

      {/* ───────── 中華第一幕 ───────── */}
      <section id="ov-c1">
        <h2><span className="act-no">一</span>開天與補天</h2>
        <p>
          很久很久以前，天和地混在一起，像一顆雞蛋，<C id="primordial-pangu">盤古</C>就在裡面出生。一萬八千年後天地分開：輕而清的往上成了天，重而濁的往下成了地。天每天高一丈，地每天厚一丈，盤古也每天長高一丈，就這樣把天地撐開。<Ref k="sanwu" /> 他死的時候，身體化成了世界：氣變成風雲，聲音變成雷，左眼變成太陽，右眼變成月亮，血液變成江河。<Ref k="wuyun" />
        </p>
        <p>
          世上還沒有人。<C id="primordial-nuwa">女媧</C>拿黃土一個一個捏人，忙不過來，就用繩子沾泥漿一甩，濺出的泥點也變成人。<Ref k="fengsu" /> 後來撐天的四根柱子壞了，天蓋不住地，大火燒不停，洪水氾濫，猛獸吃人。女媧熔煉五色石補好天空，砍下大海龜的四隻腳撐住四方，又用蘆葦燒成的灰擋住洪水：<C id="story-nuwa-mends-sky">女媧補天</C>。<Ref k="lanming" />
        </p>
        <p>
          今天常聽到「<C id="god-gonggong">共工</C>撞斷不周山，天破了，女媧才去補天」。但在《淮南子》裡，補天和<C id="story-buzhou">共工撞不周山</C>分在兩篇，彼此沒有因果關係；<Ref k={['lanming', 'tianwenxun']} /> 是後來《列子》才把兩件事放在一起講。<Ref k="liezi" /> 兩千多年前的屈原還問過一個好問題：「女媧有體，孰制匠之？」人是女媧造的，那女媧又是誰造的？<Ref k="tianwen" />
        </p>
        <pre className="ascii">{`盤古（巨人）：撐開天地，死後化成世界     ← 和北歐的尤彌爾很像，但盤古是自己撐、自己化
        ↓
女媧（女神）：捏土造人；天破了就去補     ← 希臘要兩個角色（普羅米修斯造人、阿特拉斯扛天）`}</pre>
        <Recap q="盤古和北歐的尤彌爾有什麼一樣、什麼不一樣？共工撞山和女媧補天在原典裡是同一個故事嗎？" items={['盤古撐開天地，死後身體化成世界；尤彌爾則是被殺後被拆成世界', '女媧捏土造人、煉五色石補天：一位女神做了希臘兩個角色的事', '《淮南子》裡補天和共工撞山分在兩篇，是《列子》才把它們放在一起']} />
      </section>

      {/* ───────── 中華第二幕 ───────── */}
      <section id="ov-c2">
        <h2><span className="act-no">二</span>發明東西的人：伏羲、神農、倉頡</h2>
        <p>
          接下來出場的，不是打仗的神，而是<strong>教人過日子</strong>的人。《周易》說，<C id="primordial-fuxi">伏羲</C>抬頭看天象、低頭看地形，畫出了八卦，又結繩做網，教人打獵捕魚；他之後的<C id="god-shennong">神農</C>削木頭做成犁，教天下人耕田，又開了市集讓人交換東西。<Ref k="xici" /> 《淮南子》說神農親口嘗遍百草，讓人知道什麼能吃、什麼要避開，「一日而遇七十毒」。<Ref k="xiuwu" />
        </p>
        <p>
          <C id="hero-cangjie">倉頡</C>造出文字的那天，「天雨粟，鬼夜哭」：天上下起穀子，鬼在夜裡哭泣。<Ref k="benjing" /> 原文沒有說為什麼，後人的解釋各不相同。
        </p>
        <pre className="ascii">{`伏羲 ──► 八卦、漁網      （認識世界、取得食物）
神農 ──► 犁、市集、草藥  （種田、交易、治病）
倉頡 ──► 文字            （記錄）
          │
          └─► 這種「靠發明被記住」的角色，學者叫「文化英雄」`}</pre>
        <p>
          學者把他們叫作「文化英雄」。<Ref k="britCn" /> 比一比希臘：希臘也有盜火給人類的普羅米修斯，但他是騙了宙斯、受了懲罰；中華的文化英雄做這些事，不需要和誰作對。
        </p>
        <Recap q="伏羲、神農、倉頡各發明了什麼？他們和希臘的普羅米修斯有什麼不同？" items={['伏羲畫八卦、結網；神農教耕田、開市集、嘗百草；倉頡造字', '他們是「文化英雄」：靠發明、而不是靠打仗被記住', '普羅米修斯送火要騙神、受罰；中華的文化英雄不需要和誰作對']} />
      </section>

      {/* ───────── 中華第三幕 ───────── */}
      <section id="ov-c3">
        <h2><span className="act-no">三</span>涿鹿之戰：神變成帝王</h2>
        <p>
          這一幕最能看出中華神話的特色，因為同一場仗有兩個版本。《山海經》說：戰神<C id="god-chiyou">蚩尤</C>造了兵器攻打<C id="god-huangdi">黃帝</C>；黃帝派會蓄水的應龍迎戰，蚩尤請來風伯雨師颳起狂風暴雨；黃帝再請天女魃下凡，她走到哪裡哪裡就乾旱，雨一停，蚩尤就被殺了。<Ref k="dahuangbei" />
        </p>
        <p>
          司馬遷的《史記》卻寫成一場人間戰爭：黃帝先和炎帝在阪泉打了三仗，再召集諸侯在涿鹿擒殺作亂的蚩尤，於是諸侯尊他為天子。司馬遷還替他排了家譜：父親、妻子、繼位的孫子都有名有姓。<Ref k="wudi" /> 黃帝從此成了「中國歷史的第一頁」，也成了「炎黃子孫」說法的來源。<Ref k="britHuangdi" />
        </p>
        <pre className="ascii">{`《山海經》：  黃帝（天帝）派應龍、天女魃 ✖ 蚩尤召風伯雨師   ← 神打神
                  │
                  ▼ 寫進史書
《史記》：    黃帝（君主）率領諸侯 ✖ 蚩尤作亂            ← 人打人

這就是「神話的歷史化」：神被寫成古代帝王，神話被寫成歷史`}</pre>
        <p>
          輸的一方也有故事：<C id="hero-xingtian">形天</C>和天帝爭神位，被砍了頭，就用乳頭當眼睛、肚臍當嘴巴，揮著盾和斧繼續打。<Ref k="haiwaixi" /> 而黃帝之後的堯、舜，在《史記》裡把王位讓給賢能的人，而不是傳給兒子：<C id="story-yao-shun">堯舜禪讓</C>。<Ref k="wudi" /> 這些「聖王」在儒家經典裡常被當成真實的君主，但沒有考古證據，所以本站把他們放在神話這一邊。
        </p>
        <Recap q="涿鹿之戰在《山海經》和《史記》裡差在哪裡？什麼叫「神話的歷史化」？" items={['《山海經》是神仙大戰（應龍、風伯雨師、天女魃）；《史記》是黃帝率諸侯平亂', '神被寫成古代帝王、神話被寫成歷史，這叫「歷史化」，是中華神話最大的特色之一', '堯舜禪讓：王位讓給賢人；這些聖王沒有考古證據']} />
      </section>

      {/* ───────── 中華第四幕 ───────── */}
      <section id="ov-c4">
        <h2><span className="act-no">四</span>十個太陽與一顆月亮</h2>
        <p>
          太陽有十個，都是女神<C id="god-xihe">羲和</C>的孩子，住在東方的大樹<C id="place-fusang">扶桑</C>上，本來應該輪流上天。<Ref k="dahuangnan" /> 到了堯的時代，十個太陽一起出來，莊稼燒焦，怪獸也出來害人。堯派<C id="hero-houyi">后羿</C>出征，羿向上射太陽，向下除掉六種怪獸：<C id="story-houyi-suns">后羿射日</C>。<Ref k="benjing" /> 注意，《淮南子》只說羿「上射十日」，大家熟悉的「射九留一」是後世的說法。<Ref k="britHouyi" />
        </p>
        <p>
          羿向西方的<C id="god-xiwangmu">西王母</C>求來不死藥。（最早的《山海經》裡，西王母一點也不慈祥：「豹尾虎齒而善嘯」。<Ref k="xishan" />）接下來的事，《淮南子》只寫了一句：「羿請不死之藥於西王母，姮娥竊以奔月，悵然有喪，無以續之。」<Ref k="lanming" /> 這就是<C id="story-change-moon">嫦娥奔月</C>的全部原文。嫦娥為什麼偷藥、月宮、玉兔、桂樹，原文都沒有，是後來一代代加上去的。<Ref k="britChange" />
        </p>
        <pre className="ascii">{`《淮南子》原文（一句話）          後人加上去的
  羿向西王母求不死藥        ──►   嫦娥為什麼偷藥？各種說法
  姮娥偷了藥飛奔月亮        ──►   月宮、玉兔、桂樹
  羿悵然若失                ──►   中秋賞月`}</pre>
        <p>
          和太陽有關的還有兩個「不服輸」的人：<C id="hero-kuafu">夸父</C>追著太陽跑，喝乾黃河、渭水還不夠，渴死在路上，手杖化成一片桃林；<Ref k="haiwaibei" /> 《山海經》另一處卻說他「不量力」。<Ref k="dahuangbei" /> 淹死在東海的女孩化成小鳥<C id="hero-jingwei">精衛</C>，每天銜著樹枝石頭，要把東海填平。<Ref k="beishan" />
        </p>
        <Recap q="《淮南子》裡后羿射下了幾個太陽？嫦娥奔月的原文有寫到玉兔嗎？" items={['《淮南子》只說「上射十日」，「射九留一」是後世的說法', '嫦娥奔月的原文只有一句；月宮、玉兔、中秋都是後來加的', '夸父逐日、精衛填海：不服輸的人，但古書對夸父也有「不量力」的評語']} />
      </section>

      {/* ───────── 中華第五幕 ───────── */}
      <section id="ov-c5">
        <h2><span className="act-no">五</span>洪水與夏朝：神話接上歷史</h2>
        <p>
          洪水滔天。<C id="hero-gun">鯀</C>偷了天帝會自己長大的神土「息壤」去堵洪水，沒等天帝同意，天帝就命<C id="god-zhurong">祝融</C>在羽山殺了他；傳說他死後，肚子裡生出了禹。<Ref k="haineijing" /> 《史記》的版本則像真實政事：鯀治了九年沒成功，被舜處死。<Ref k="xiabenji" /> 屈原在〈天問〉裡還替鯀抱不平：為什麼不讓他試完？<Ref k="tianwen" />
        </p>
        <p>
          兒子<C id="hero-yu">大禹</C>接手。他不再只是圍堵，而是疏通河道、把水引進大海；<Ref k="xiabenji" /> 在外奔波多年，經過家門都沒進去。<Ref k="mengzi" /> 洪水退了，舜把王位讓給他；但禹死後，諸侯都去朝見禹的兒子啟，王位從此改成父傳子，這就是夏朝。<Ref k="wudi" /> 神話在這裡接上了歷史的第一個朝代。
        </p>
        <pre className="ascii">{`  鯀：堵（偷息壤築堤）──► 失敗，被處死
                              │
  禹：導（疏通河道入海）──► 成功，受禪當王
                              │
  啟：禹的兒子繼位      ──► 從「讓賢」變「傳子」：夏朝開始，神話接上歷史`}</pre>
        <p>
          和希臘的洪水比一比：希臘是宙斯降洪水懲罰人類，人類坐船「躲」過去；中華的洪水是靠人「治」好的。<Ref k="britXia" /> 詳見<C id="story-yu-flood">大禹治水</C>。
        </p>
        <Recap q="鯀和禹治水的方法差在哪裡？禹之後王位怎麼傳？" items={['鯀用息壤「堵」，失敗被殺；禹「導」水入海，三過家門不入', '禹死後王位傳給兒子啟，從讓賢變成傳子：夏朝開始', '希臘的洪水是躲過去的，中華的洪水是治好的']} />
      </section>

      {/* ───────── 尾聲 ───────── */}
      <section className="epilogue">
        <h2>尾聲：三套神話放在一起看</h2>
        <p>三條主線你現在都有了：</p>
        <pre className="ascii">{`希臘羅馬  空隙 → 大地與天空 → 泰坦 → 奧林帕斯 → 人類受苦 → 英雄 → 特洛伊 → 返鄉 → 羅馬
          主線：兒子推翻父親；神像人，只是更大

北歐      裂口 → 霜巨人被殺、身體變成世界 → 眾神付出代價 → 巴德爾之死 → 諸神黃昏 → 重生
          主線：結局早就寫好，眾神明知會輸還是上戰場

中華      盤古開天 → 女媧造人補天 → 發明家 → 黃帝 → 射日奔月 → 大禹治水 → 夏朝
          主線：有人出來把世界修好；越往後，神越像古代的帝王`}</pre>
        <p>放在一起，就能看出幾個有意思的差別（這裡只比想法，不是說哪一邊影響了哪一邊）：</p>
        <ScrollTable>
          <table className="compare">
            <thead>
              <tr>
                <th>問題</th>
                <th>希臘羅馬</th>
                <th>北歐</th>
                <th>中華</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="nw">世界怎麼來</td>
                <td>一代代「生」出來：空隙、大地、天空</td>
                <td>殺了一個巨人，用他的身體「做」出來</td>
                <td>巨人盤古「撐」開天地，死後自己化成世界</td>
              </tr>
              <tr>
                <td className="nw">誰當家</td>
                <td>宙斯，靠推翻父親坐上王位</td>
                <td>奧丁，「眾神之父」，知道自己會被狼殺死</td>
                <td>黃帝，打贏涿鹿之戰，後來被寫成人間第一位君主</td>
              </tr>
              <tr>
                <td className="nw">世界會結束嗎</td>
                <td>本站的卡片裡沒有末日故事</td>
                <td>會：諸神黃昏，燒毀後再重生</td>
                <td>本站的卡片裡沒有末日故事</td>
              </tr>
              <tr>
                <td className="nw">大洪水</td>
                <td>神降下懲罰，人坐船躲過</td>
                <td>（尤彌爾的血淹死霜巨人，但那是創世，不是懲罰）</td>
                <td>鯀堵失敗，禹導成功：人把洪水治好</td>
              </tr>
              <tr>
                <td className="nw">最後接到哪裡</td>
                <td>羅馬建國</td>
                <td>世界重生</td>
                <td>夏朝：神話接上歷史</td>
              </tr>
            </tbody>
          </table>
        </ScrollTable>
        <p>
          更細的三方對照（包括愛搗蛋的角色），見「<a href={href('compare')}>對照</a>」頁。這些故事今天也還在你身邊：八大行星除了地球全用希臘羅馬神的羅馬名；星期二、三、五的英文名來自北歐的神；嫦娥、夸父、羲和成了中國太空任務的名字；chaos、panic、echo 這些英文單字，《戰神》《雷神索爾》這些作品。本站的「<a href={href('today')}>今日影子</a>」收了 {site.today.length} 條，每條都寫明「和原典差在哪」，因為今天的用法常常已經走樣。
        </p>
        <pre className="ascii">{`讀完總覽之後，怎麼往下走？

  想照順序深入 ──► 首頁三條「新手路線」：希臘羅馬 8 張、北歐 7 張、中華 7 張
  想認識某位神 ──► 「卡片」：可依希臘、羅馬、北歐、中華篩選；每張開頭三句話，30 秒知道他是誰
  想看人物關係 ──► 「族譜」：希臘看血緣，北歐以奧丁為中心，中華看傳位與對戰
  想看時間順序 ──► 「年代」：希臘八個時代就是本頁的八幕；北歐從創世到諸神黃昏；中華從盤古、夏朝一路到後世神仙與小說
  想找今天的梗 ──► 「今日影子」：單字、品牌、電影、行星、星期、太空任務`}</pre>
        <p>
          <a className="overview-cta" href="#/"><strong>回首頁，挑一條新手路線開始 →</strong><span>蓋亞、尤彌爾、盤古：三個世界的起點</span></a>
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
