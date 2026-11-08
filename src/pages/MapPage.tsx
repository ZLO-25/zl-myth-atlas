import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { CardLink } from '../components/bits';
import { cardNames, enOrig, fullName } from '../lib/names';
import { cardById, site } from '../lib/data';
import { href } from '../lib/router';

export function MapPage() {
  const [tab, setTab] = useState<'real' | 'underworld'>('real');
  return (
    <div className="page map-page">
      <h1>地圖</h1>
      <div className="filters">
        <button className={tab === 'real' ? 'on' : ''} onClick={() => setTab('real')}>真實地圖</button>
        <button className={tab === 'underworld' ? 'on' : ''} onClick={() => setTab('underworld')}>神話世界：冥界</button>
      </div>
      {tab === 'real' ? <RealMap /> : <Underworld />}
    </div>
  );
}

function RealMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [showRoute, setShowRoute] = useState(true);
  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false });
    const pts: [number, number][] = [
      ...site.places.filter((x) => x.kind === 'real' && x.lat != null).map((x) => [x.lat!, x.lng!] as [number, number]),
      ...(showRoute ? site.odysseyRoute.map((x) => [x.lat, x.lng] as [number, number]) : []),
    ];
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [24, 24] });
    else map.setView([38.5, 22], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 12,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    for (const p of site.places.filter((x) => x.kind === 'real' && x.lat != null)) {
      const cards = p.cards.map((id) => { const c = cardById.get(id); return `<a href="${href('card', id)}">${c ? fullName(cardNames(c)) : id}</a>`; }).join('、');
      const src = p.src.map((s) => `<a href="${s.url}" target="_blank" rel="noreferrer">${s.cite}</a>`).join('；');
      L.circleMarker([p.lat!, p.lng!], { radius: 8, color: '#1F5F8B', fillColor: '#C4622D', fillOpacity: 0.9, weight: 2 })
        .addTo(map)
        .bindPopup(`<strong>${p.name_zh}</strong> <span>${enOrig({ zh: p.name_zh, en: p.name_en, orig: p.name_orig })}</span><p>${p.archaeology ?? ''}</p><p>相關卡片：${cards}</p><p class="small">來源：${src}</p>`);
    }
    let route: L.LayerGroup | undefined;
    if (showRoute && site.odysseyRoute.length) {
      route = L.layerGroup().addTo(map);
      L.polyline(
        site.odysseyRoute.map((s) => [s.lat, s.lng] as [number, number]),
        { color: '#6B7F3A', dashArray: '6 8', weight: 3 },
      ).addTo(route);
      site.odysseyRoute.forEach((s, i) =>
        L.marker([s.lat, s.lng], {
          icon: L.divIcon({ className: 'route-pin', html: `<span>${i + 1}</span>`, iconSize: [22, 22] }),
        })
          .addTo(route!)
          .bindPopup(`<strong>${i + 1}. ${s.name}</strong>（${s.book}）<p>學者推測：${s.guess}</p><p>${s.note}</p><p class="small">${s.src.map((x) => `<a href="${x.url}" target="_blank" rel="noreferrer">${x.cite}</a>`).join('；')}</p>`),
      );
    }
    return () => {
      map.remove();
    };
  }, [showRoute]);
  return (
    <>
      <p className="lead">橘點＝神話裡出現、今天找得到的真實地點，點一下看考古狀況。</p>
      {site.odysseyRoute.length > 0 && (
        <label className="check">
          <input type="checkbox" checked={showRoute} onChange={(e) => setShowRoute(e.target.checked)} /> 顯示奧德修斯可能的航線（<strong>學者推測，眾說紛紜</strong>：古代地理學家埃拉托斯特尼就說過，等你找到替風神縫風袋的鞋匠，才找得到奧德修斯漂流的地方；見<a href="https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Strabo/1B*.html" target="_blank" rel="noreferrer">史特拉波《地理學》1.2.15</a>）
        </label>
      )}
      <div ref={ref} className="leaflet-box" role="region" aria-label="真實地點地圖" />
      <ul className="place-list">
        {site.places
          .filter((p) => p.kind === 'real')
          .map((p) => (
            <li key={p.id}>
              <strong>{p.name_zh}</strong> <span className="muted">{enOrig({ zh: p.name_zh, en: p.name_en, orig: p.name_orig })}</span>：{p.archaeology}{' '}
              {p.cards.map((c) => (
                <CardLink key={c} id={c} />
              ))}
            </li>
          ))}
      </ul>
    </>
  );
}

/** 冥界結構示意圖（依荷馬、赫西俄德、維吉爾整理；各家說法不同，見冥界卡片） */
function Underworld() {
  const c = cardById.get('place-underworld');
  return (
    <>
      <p className="lead">這不是真實地圖，而是把古代作家描寫的冥界畫成一張示意圖。不同作家的冥界並不一致，細節與來源請看{c ? <CardLink id="place-underworld">冥界卡片</CardLink> : '冥界卡片'}。</p>
      <svg className="underworld" viewBox="0 0 640 520" role="img" aria-label="冥界結構示意圖">
        <rect x="0" y="0" width="640" height="70" className="uw-earth" />
        <text x="320" y="30" className="uw-title">人間（地表）</text>
        <text x="320" y="54" className="uw-sub">入口：洞穴或湖，例如維吉爾寫的阿韋爾努斯湖</text>
        <path d="M320 70 L320 110" className="uw-path" />
        <rect x="60" y="110" width="520" height="56" rx="10" className="uw-river" />
        <text x="320" y="134" className="uw-title">冥河（阿刻戎河／斯堤克斯河）</text>
        <text x="320" y="154" className="uw-sub">擺渡人卡戎載亡魂過河；沒下葬的亡魂不准上船</text>
        <path d="M320 166 L320 198" className="uw-path" />
        <rect x="200" y="198" width="240" height="50" rx="10" className="uw-gate" />
        <text x="320" y="220" className="uw-title">冥府大門</text>
        <text x="320" y="238" className="uw-sub">三頭犬看守：只准進、不准出</text>
        <path d="M320 248 L320 280" className="uw-path" />
        <rect x="180" y="280" width="280" height="50" rx="10" className="uw-judge" />
        <text x="320" y="302" className="uw-title">審判</text>
        <text x="320" y="320" className="uw-sub">米諾斯在冥界替亡魂判案（荷馬、維吉爾）</text>
        <path d="M320 330 L120 380 M320 330 L320 380 M320 330 L520 380" className="uw-path" />
        <rect x="20" y="380" width="200" height="80" rx="10" className="uw-elysium" />
        <text x="120" y="408" className="uw-title">極樂淨土（Elysium）</text>
        <text x="120" y="428" className="uw-sub">英雄與受神眷顧者</text>
        <rect x="230" y="380" width="180" height="80" rx="10" className="uw-asphodel" />
        <text x="320" y="408" className="uw-title">長春花原野</text>
        <text x="320" y="428" className="uw-sub">荷馬：亡魂聚集之地</text>
        <rect x="420" y="380" width="200" height="120" rx="10" className="uw-tartarus" />
        <text x="520" y="408" className="uw-title">塔爾塔羅斯</text>
        <text x="520" y="428" className="uw-sub">最深的深淵：關著泰坦</text>
        <text x="520" y="446" className="uw-sub">（荷馬另寫坦塔洛斯、</text>
        <text x="520" y="464" className="uw-sub">薛西弗斯在冥界別處受罰）</text>
      </svg>
      <p className="muted small">示意圖為本站繪製，依各家古代作品整理；不同作者的冥界細節不同，請以卡片內文與來源為準。</p>
    </>
  );
}
