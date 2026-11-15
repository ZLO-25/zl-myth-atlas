// 全站共用的資料型別。欄位說明見 docs/card-fields.md（兩者不一致時以文件為準並修正這裡）。

export const CARD_TYPES = ['原始神', '泰坦', '神', '英雄', '凡人', '怪物', '故事', '地點', '物品'] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const MYTH_SYSTEMS = ['greek', 'roman', 'norse', 'chinese'] as const;
export type MythSystem = (typeof MYTH_SYSTEMS)[number];

export const REALITY_LEVELS = ['純神話', '神話裡有歷史影子', '真實歷史'] as const;
export const CAUSE_RELS = ['直接引發', '促成', '背景', '回應'] as const;

export interface Source {
  id: string; // s1, s2…
  kind: 'ancient' | 'modern';
  cite: string; // 赫西俄德《神譜》453–506 ／ Theoi.com「Zeus」
  url: string;
  accessed?: string;
  note?: string;
}

export interface FamilyLink {
  id?: string; // 有卡片就寫卡片 id
  name?: string; // 沒有卡片的人物寫中文名
  src: string[];
  variant?: string; // 有值＝「另有一說」，畫虛線，寫明是哪一說
}

export interface CauseLink {
  id: string;
  rel: (typeof CAUSE_RELS)[number];
  why: string; // ≤80 字
  src: string[];
}

export interface Panel {
  image?: string; // data/images.yaml 的 id
  text: string;
  src: string[];
}

export interface Card {
  id: string;
  type: CardType;
  myth_system: MythSystem[];
  name_zh: string;
  aliases: string[];
  name_en: string;
  name_orig: string;
  roman?: { name_zh: string; name_la: string; name_en?: string; card?: string; note?: string };
  reality: { level: (typeof REALITY_LEVELS)[number]; evidence?: string; src?: string[] };
  three_lines: [string, string, string];
  hook: string; // 一句話記住他
  domains?: { roles: string[]; symbols: string[] };
  how_to_recognize?: string;
  how_to_recognize_src?: string[];
  /** 古代與後世作品真的很少時，說明原因（有寫就不要求 2 張作品圖） */
  few_images?: string;
  family?: {
    parents?: FamilyLink[];
    consorts?: FamilyLink[];
    children?: FamilyLink[];
    siblings?: FamilyLink[];
    /** 傳位：王位從誰手上接來（中華神話的堯→舜→禹） */
    predecessors?: FamilyLink[];
    /** 傳位：王位傳給誰 */
    successors?: FamilyLink[];
    /** 對戰：和誰打過（黃帝對蚩尤） */
    foes?: FamilyLink[];
  };
  panels?: Panel[];
  images?: string[];
  sources: Source[];
  causes?: CauseLink[];
  effects?: CauseLink[];
  greek_vs_roman?: { text: string; src: string[] };
  today?: string[];
  places?: string[];
  era: string;
  topics: string[];
  disputed?: { claim: string; views: { view: string; src: string[] }[] }[];
  history_river?: { url: string; label: string };
  // 由 build-index 填入
  body?: string;
  file?: string;
  search_simp?: string[];
}

export interface ImageItem {
  id: string;
  kind: 'work' | 'ai';
  title: string;
  look: string; // 「看這張圖：」解說
  // 真實作品
  artist?: string;
  date?: string;
  period?: 'ancient' | 'modern'; // 古代 vs 文藝復興以後
  museum?: string;
  license?: string;
  license_url?: string;
  source_url?: string; // Commons／博物館的作品頁
  file_url?: string; // 實際顯示的圖（Commons 縮圖網址或本機路徑）
  credit?: string;
  commons?: string; // Commons 檔名（File:…），授權資料由 scripts/commons.ts 自動取得
  pending?: boolean; // 還沒從 Commons 抓回來
  // AI 插畫
  ai?: boolean;
  tool?: string;
  prompt?: string;
  file?: string; // public/ 底下的路徑
  placeholder?: boolean; // 還沒生圖，用佔位圖
}

export const TODAY_CATEGORIES = ['英文單字與成語', '品牌與企業', '天文與太空', '時間', '科學與醫學', '電影、影集、遊戲', '名畫與雕塑', '文學', '台灣生活'] as const;

export interface TodayItem {
  id: string;
  category: (typeof TODAY_CATEGORIES)[number];
  title: string;
  cards: string[];
  what: string; // 它是什麼、和神話的關係
  diff: string; // 和原典差在哪
  status: '已查證' | '說法未證實';
  sources: { cite: string; url: string; accessed?: string }[];
  search_simp?: string[];
}

export interface Era {
  id: string;
  /** 屬於哪個神話體系的年代；沒寫＝希臘羅馬 */
  system?: 'chinese';
  name: string;
  order: number;
  summary: string;
}

export interface HistoryRef {
  label: string;
  start: number; // 西元前用負數
  end: number;
  note: string;
  src: { cite: string; url: string }[];
}

export interface Place {
  id: string;
  name_zh: string;
  name_en: string;
  name_orig?: string; // 古代原文，例如 Δελφοί
  kind: 'real' | 'mythic';
  lat?: number;
  lng?: number;
  archaeology?: string;
  cards: string[];
  src: { cite: string; url: string }[];
}

export interface Topic {
  id: string;
  name: string;
  desc: string;
}

/** data/names.yaml：沒有卡片的人物的英文與原文（key 是卡片裡寫的中文名，原樣照抄） */
export type NameTable = Record<string, { en: string; orig: string }>;

export interface SiteData {
  cards: Card[];
  names: NameTable;
  images: ImageItem[];
  today: TodayItem[];
  eras: Era[];
  history: HistoryRef[];
  places: Place[];
  topics: Topic[];
  greekRoman: GreekRomanRow[];
  odysseyRoute: RouteStop[];
  builtAt: string;
}

export interface GreekRomanRow {
  greek: string;
  card?: string;
  roman: string;
  latin: string;
  english: string;
  today: string; // 行星、月份、星期、單字
  note?: string;
}

/** 奧德修斯可能航線的一站（學者推測，眾說紛紜） */
export interface RouteStop {
  name: string; // 史詩裡的地名
  guess: string; // 推測的今日地點
  lat: number;
  lng: number;
  book: string; // 《奧德賽》卷數
  note: string;
  src: { cite: string; url: string }[];
}
