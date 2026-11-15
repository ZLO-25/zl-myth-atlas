// 兩條新手路線：卡片頁（上一張／下一張）、首頁（進度）、總覽（極短版）共用。

export interface ReadingPath {
  key: string;
  name: string;
  items: [string, string][]; // [卡片 id, 一句話理由]
}

/** 新手路線：照故事順序讀這 8 張，就有整部神話的骨架 */
export const STARTER_PATH: [string, string][] = [
  ['primordial-gaia', '一切從大地開始：她生出天空，也策畫了第一次政變'],
  ['titan-cronus', '兒子推翻父親，又怕被兒子推翻，於是吞掉孩子'],
  ['god-zeus', '被藏起來的么兒長大，打贏十年泰坦之戰，抽籤分天下'],
  ['titan-prometheus', '神與人的關係：偷火、潘朵拉，人類從此要受苦'],
  ['story-persephone', '女兒被冥王擄走，母親讓大地停止生長：四季的由來'],
  ['story-trojan-war', '一顆金蘋果引爆神話中最大的一場戰爭'],
  ['story-odyssey', '戰後十年返鄉路：獨眼巨人、海妖、冥界'],
  ['hero-aeneas', '特洛伊的敗將逃到義大利，變成羅馬人的祖先'],
];

/** 中華神話新手路線：從開天闢地讀到夏朝，看神怎麼一步步「變成」古代帝王 */
export const CN_PATH: [string, string][] = [
  ['primordial-pangu', '天地像一顆蛋，巨人盤古把它撐開，死後化成山川日月'],
  ['primordial-nuwa', '女媧捏土造人；天塌了，她煉五色石把天補好'],
  ['primordial-fuxi', '伏羲畫八卦、教人結網捕魚：不打仗的「文化英雄」'],
  ['god-huangdi', '黃帝在涿鹿打敗蚩尤，後來被《史記》寫成第一位君主'],
  ['hero-houyi', '十個太陽一起出來，后羿把它們射下來'],
  ['hero-change', '嫦娥吃了不死藥飛上月亮，中秋的故事從這裡開始'],
  ['hero-yu', '大禹疏導洪水，他的兒子開啟夏朝：神話接上歷史'],
];

/** 北歐神話新手路線：從創世讀到諸神黃昏（B 批會補成 7 張） */
export const NORSE_PATH: [string, string][] = [
  ['primordial-ymir', '霜融成的巨人尤彌爾被殺，身體變成了世界'],
  ['god-odin', '眾神之父：押上一隻眼睛、吊在樹上九夜，最後被狼殺死'],
  ['god-thor', '最強的神：用錘子打巨人、釣大蛇，也扮過新娘'],
  ['god-loki', '巨人的兒子、奧丁的血盟兄弟：性情多變，引導霍德爾射死巴德爾'],
  ['story-ragnarok', '最後一戰：世界被火燒毀，又從海裡重新升起'],
];

export const PATHS: ReadingPath[] = [
  { key: 'starter', name: '新手路線', items: STARTER_PATH },
  { key: 'cn', name: '中華神話新手路線', items: CN_PATH },
  { key: 'norse', name: '北歐神話新手路線', items: NORSE_PATH },
];

/** 這張卡在哪些路線裡、排第幾（從 0 起算） */
export function pathsOf(cardId: string): { path: ReadingPath; index: number }[] {
  return PATHS.flatMap((path) => {
    const index = path.items.findIndex(([id]) => id === cardId);
    return index >= 0 ? [{ path, index }] : [];
  });
}
