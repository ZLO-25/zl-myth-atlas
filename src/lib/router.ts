import { useEffect, useState } from 'react';

/** 用網址的 # 後面當路由（GitHub Pages 不需要另外設定）：#/card/god-zeus */
export function useRoute(): string[] {
  const read = () => decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('?')[0].split('/').filter(Boolean);
  const [r, setR] = useState(read);
  useEffect(() => {
    const on = () => {
      setR(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
}

export const href = (...parts: string[]) => '#/' + parts.map(encodeURIComponent).join('/');
