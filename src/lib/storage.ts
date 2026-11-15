// localStorage 的安全包裝：讀不到（無痕、被封鎖）時不丟錯，改存在記憶體裡，網站照常運作。
const mem = new Map<string, string>();

export function storeGet(key: string): string | null {
  try {
    const v = localStorage.getItem(key);
    if (v !== null) return v;
  } catch {
    /* 讀不到就用記憶體 */
  }
  return mem.get(key) ?? null;
}

export function storeSet(key: string, value: string): void {
  mem.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    /* 寫不進去就只留在這次瀏覽 */
  }
}

export function storeRemove(key: string): void {
  mem.delete(key);
  try {
    localStorage.removeItem(key);
  } catch {
    /* 同上 */
  }
}
