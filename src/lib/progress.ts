// 已讀進度：哪些卡片「讀到底」了。唯一碰 localStorage 的地方（透過 storage.ts）。
import { useSyncExternalStore } from 'react';
import { storeGet, storeRemove, storeSet } from './storage';

const KEY = 'myth-atlas:read:v1';
const listeners = new Set<() => void>();

function load(): ReadonlySet<string> {
  try {
    const a = JSON.parse(storeGet(KEY) ?? '[]');
    return new Set(Array.isArray(a) ? a.filter((x) => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

let current: ReadonlySet<string> = load();
const emit = () => listeners.forEach((l) => l());

export function markRead(id: string): void {
  if (current.has(id)) return;
  current = new Set([...current, id]);
  storeSet(KEY, JSON.stringify([...current]));
  emit();
}

export function clearProgress(): void {
  current = new Set();
  storeRemove(KEY);
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      current = load();
      l();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener('storage', onStorage);
  };
}

/** 目前已讀的卡片 id；有變動時用到的元件會自己更新 */
export function useReadSet(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, () => current);
}
