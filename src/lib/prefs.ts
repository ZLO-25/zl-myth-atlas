// 顯示偏好：「隱藏原文」開關。預設顯示原文（和之前一樣）。
import { useSyncExternalStore } from 'react';
import { storeGet, storeSet } from './storage';

const KEY = 'myth-atlas:hide-orig:v1';
const listeners = new Set<() => void>();
let hidden = storeGet(KEY) === '1';

function apply() {
  // 讓純 CSS 就能藏起族譜、對照表裡的原文
  if (typeof document !== 'undefined') document.documentElement.classList.toggle('hide-orig', hidden);
}
apply();

export const isOrigHidden = () => hidden;

export function setOrigHidden(v: boolean): void {
  hidden = v;
  storeSet(KEY, v ? '1' : '0');
  apply();
  listeners.forEach((l) => l());
}

export function useOrigHidden(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => hidden,
  );
}
