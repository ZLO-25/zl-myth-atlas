// 三套神話的共用設定：順序永遠是 希臘羅馬 → 北歐 → 中華。顏色沿用總覽頁的三個色（terra／aegean／olive）。
// 用法：
//   SYSTEMS.map((s) => s.label)        // 依固定順序列出三套
//   sysOf(card)                        // 一張卡屬於哪一套（含 chinese → 中華；含 norse → 北歐；其餘 → 希臘羅馬）
//   sysOfToday(item)                   // 今日影子：看它第一張相關卡片屬於哪一套
//   parseSys(queryParam('sys'))        // 網址參數轉成 Sys；不認得的值回傳 undefined（舊值 greek、roman 視為 west）
//   <SysTabs> 在 components/bits.tsx；cls（sys-west／sys-norse／sys-chinese）在 styles.css 設定 --sys 色票
import type { TodayItem } from '../../scripts/lib/types';
import { cardById } from './data';

export type Sys = 'west' | 'norse' | 'chinese';

export const SYSTEMS: { key: Sys; label: string; cls: string }[] = [
  { key: 'west', label: '希臘羅馬', cls: 'sys-west' },
  { key: 'norse', label: '北歐', cls: 'sys-norse' },
  { key: 'chinese', label: '中華', cls: 'sys-chinese' },
];

export const sysLabel = (k: Sys) => SYSTEMS.find((s) => s.key === k)!.label;

export function sysOf(card?: { myth_system: string[] }): Sys {
  if (card?.myth_system.includes('chinese')) return 'chinese';
  if (card?.myth_system.includes('norse')) return 'norse';
  return 'west';
}

/** 今日影子屬於哪一套：看它第一張相關卡片 */
export function sysOfToday(item: Pick<TodayItem, 'cards'>): Sys {
  return sysOf(cardById.get(item.cards[0]));
}

/** 網址參數 → Sys（greek、roman 是舊的分法，都算希臘羅馬） */
export function parseSys(v: string | null | undefined): Sys | undefined {
  if (v === 'west' || v === 'greek' || v === 'roman') return 'west';
  if (v === 'norse' || v === 'chinese') return v;
  return undefined;
}
