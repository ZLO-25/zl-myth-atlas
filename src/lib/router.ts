import { useEffect, useState } from 'react';

/** 用網址的 # 後面當路由（GitHub Pages 不需要另外設定）：#/card/god-zeus */
export function useRoute(): string[] {
  const read = () => decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('?')[0].split('/').filter(Boolean);
  const [r, setR] = useState(read);
  useEffect(() => {
    let prev = read()[0];
    const on = () => {
      const next = read();
      setR(next);
      // 族譜內切換模式、換中心人物，卡片列表、地圖內換篩選，只是同一頁的小變化，不要把頁面捲回頂端
      if (!(prev === next[0] && (prev === 'family' || prev === 'cards' || prev === 'map'))) window.scrollTo(0, 0);
      prev = next[0];
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
}

export const href = (...parts: string[]) => '#/' + parts.map(encodeURIComponent).join('/');

/** 讀網址 ? 後面的參數：#/family?mode=cn → get('mode') === 'cn' */
export const queryParam = (name: string) => new URLSearchParams(location.hash.split('?')[1] ?? '').get(name);
