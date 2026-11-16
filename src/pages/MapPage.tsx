import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { CardLink, SysTabs } from '../components/bits';
import { cardNames, enOrig, fullName } from '../lib/names';
import { useOrigHidden } from '../lib/prefs';
import { cardById, site, stripLinks } from '../lib/data';
import { href, queryParam } from '../lib/router';
import { parseSys, type Sys } from '../lib/systems';

type View = 'real' | 'myth';

/** 地圖的狀態放在網址：#/map?sys=norse&view=myth。沒參數＝希臘羅馬的真實地圖 */
const mapHref = (sys: Sys, view: View) => `${href('map')}?sys=${sys}&view=${view}`;
/** 這一套神話在地圖上有沒有真實地點可畫 */
const realPlacesOf = (sys: Sys) => site.places.filter((x) => (x.system ?? 'west') === sys);
const REAL_LABEL: Record<Sys, string> = { west: '真實地圖：地中海', norse: '真實地圖：冰島與瑞典', chinese: '真實地圖：中國' };
const MYTH_LABEL: Record<Sys, string> = { west: '神話世界：冥界', norse: '神話世界：世界樹', chinese: '神話世界：古書裡的仙境' };

export function MapPage() {
  const sys = parseSys(queryParam('sys')) ?? 'west';
  const hasReal = realPlacesOf(sys).length > 0;
  const asked = queryParam('view');
  const view: View = asked === 'myth' || !hasReal ? 'myth' : 'real';
  return (
    <div className="page map-page">
      <h1>地圖</h1>
      <SysTabs value={sys} onChange={(v) => { if (v !== 'all') location.hash = mapHref(v, 'real'); }} label="選一套神話的地圖" />
      <div className="filters map-sub" role="group" aria-label="真實地圖或神話世界">
        {hasReal && (
          <button className={view === 'real' ? 'on' : ''} aria-pressed={view === 'real'} onClick={() => (location.hash = mapHref(sys, 'real'))}>{REAL_LABEL[sys]}</button>
        )}
        <button className={view === 'myth' ? 'on' : ''} aria-pressed={view === 'myth'} onClick={() => (location.hash = mapHref(sys, 'myth'))}>{MYTH_LABEL[sys]}</button>
      </div>
      {view === 'real' ? <RealMap key={sys} sys={sys} /> : sys === 'west' ? <Underworld /> : sys === 'norse' ? <NorseWorld /> : <ChineseWorld />}
    </div>
  );
}

function RealMap({ sys }: { sys: Sys }) {
  const china = sys === 'chinese';
  const west = sys === 'west';
  const places = realPlacesOf(sys);
  const ref = useRef<HTMLDivElement>(null);
  const [showRoute, setShowRoute] = useState(west);
  const hideOrig = useOrigHidden(); // 彈出視窗的名字是文字串，開關變了要重畫地圖
  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false });
    const pts: [number, number][] = [
      ...places.filter((x) => x.kind === 'real' && x.lat != null).map((x) => [x.lat!, x.lng!] as [number, number]),
      ...(showRoute && west ? site.odysseyRoute.map((x) => [x.lat, x.lng] as [number, number]) : []),
    ];
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [24, 24] });
    else map.setView([38.5, 22], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 12,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    for (const p of places.filter((x) => x.kind === 'real' && x.lat != null)) {
      const cards = p.cards.map((id) => { const c = cardById.get(id); return `<a href="${href('card', id)}">${c ? fullName(cardNames(c)) : id}</a>`; }).join('、');
      const src = p.src.map((s) => `<a href="${s.url}" target="_blank" rel="noreferrer">${s.cite}</a>`).join('；');
      L.circleMarker([p.lat!, p.lng!], { radius: 8, color: '#1F5F8B', fillColor: '#C4622D', fillOpacity: 0.9, weight: 2 })
        .addTo(map)
        .bindPopup(`<strong>${p.name_zh}</strong> <span>${enOrig({ zh: p.name_zh, en: p.name_en, orig: p.name_orig })}</span><p>${p.archaeology ?? ''}</p><p>相關卡片：${cards}</p><p class="small">來源：${src}</p>`);
    }
    let route: L.LayerGroup | undefined;
    if (showRoute && west && site.odysseyRoute.length) {
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
  }, [showRoute, sys, hideOrig]);
  return (
    <>
      <p className="lead">{china ? '橘點＝中華神話與古書裡出現、今天找得到的地點。傳說地點是不是故事真正發生的地方，學界多半沒有定論；扶桑、不周山這類神話地點沒有真實位置，所以不上地圖。' : sys === 'norse' ? '橘點＝和北歐神話的文獻或考古有關、今天找得到的地點，點一下看說明與來源。世界樹這類神話裡的地方沒有真實位置，不上地圖，請看「神話世界」。' : '橘點＝神話裡出現、今天找得到的真實地點，點一下看考古狀況。'}</p>
      {west && site.odysseyRoute.length > 0 && (
        <label className="check">
          <input type="checkbox" checked={showRoute} onChange={(e) => setShowRoute(e.target.checked)} /> 顯示奧德修斯可能的航線（<strong>學者推測，眾說紛紜</strong>：古代地理學家埃拉托斯特尼就說過，等你找到替風神縫風袋的鞋匠，才找得到奧德修斯漂流的地方；見<a href="https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Strabo/1B*.html" target="_blank" rel="noreferrer">史特拉波《地理學》1.2.15</a>）
        </label>
      )}
      <div ref={ref} className="leaflet-box" role="region" aria-label="真實地點地圖" />
      <ul className="place-list">
        {places
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

/** 中華的神話世界：只列清單，不畫示意圖（古書對這些地方的相對位置說法不一，畫了就是杜撰） */
function ChineseWorld() {
  const ids = [...site.cards.filter((c) => c.myth_system.includes('chinese') && c.type === '地點' && c.era === 'cn-world').map((c) => c.id), 'story-buzhou'];
  return (
    <>
      <p className="lead">這些地方沒有真實位置，所以不畫在地圖上，也不畫示意圖：古書對它們的相對位置說法不一，硬畫就是杜撰。下面每一項取自卡片的第一句，點進去看完整的故事與來源。</p>
      <ul className="myth-world-list sys-chinese">
        {ids.map((id) => {
          const c = cardById.get(id);
          if (!c) return null;
          return (
            <li key={id}>
              <CardLink id={id} />
              <p>{stripLinks(c.three_lines[0])}</p>
            </li>
          );
        })}
      </ul>
      <p className="muted small">崑崙在今天的中國西部有一條同名的山脈，那是漢代才把神話的名字用在它身上；見「真實地圖：中國」的崑崙山脈。</p>
    </>
  );
}

/** 北歐的世界樹示意圖：只畫世界樹卡片寫到的東西，不畫九個世界的位置 */
function NorseWorld() {
  const c = cardById.get('place-yggdrasil');
  return (
    <>
      <p className="lead">這不是真實地圖，而是把世界樹卡片寫到的東西畫成一張示意圖。古詩只說有「九個世界」，沒有一致的名單，所以這張圖不畫九個世界在哪裡。細節與來源請看{c ? <CardLink id="place-yggdrasil">世界樹卡片</CardLink> : '世界樹卡片'}。</p>
      <svg className="yggdrasil" viewBox="0 0 440 452" role="img" aria-label="世界樹示意圖">
        <rect x="100" y="8" width="240" height="56" rx="10" className="yg-box" />
        <text x="220" y="30" className="yg-title">樹頂：一隻鷹</text>
        <text x="220" y="50" className="yg-sub">兩眼之間停著一隻隼</text>
        <path d="M220 64 L220 100" className="yg-path" />
        <rect x="150" y="100" width="140" height="70" rx="10" className="yg-tree" />
        <text x="220" y="128" className="yg-title">世界樹</text>
        <text x="220" y="148" className="yg-sub">常綠的白蠟樹</text>
        <rect x="8" y="104" width="120" height="62" rx="10" className="yg-box" />
        <text x="68" y="130" className="yg-title">四頭鹿</text>
        <text x="68" y="150" className="yg-sub">吃樹葉</text>
        <path d="M128 135 L150 135" className="yg-path dash" />
        <rect x="312" y="96" width="120" height="78" rx="10" className="yg-box" />
        <text x="372" y="118" className="yg-title">松鼠</text>
        <text x="372" y="136" className="yg-sub">拉塔托斯克</text>
        <text x="372" y="154" className="yg-sub">傳鷹與龍的壞話</text>
        <path d="M312 135 L290 135" className="yg-path dash" />
        <path d="M220 170 L74 226 M220 170 L220 226 M220 170 L366 226" className="yg-path" />
        <rect x="8" y="226" width="132" height="104" rx="10" className="yg-root" />
        <text x="74" y="250" className="yg-title">第一條根</text>
        <text x="74" y="270" className="yg-sub">在阿薩神族那裡</text>
        <text x="74" y="288" className="yg-sub">下面有烏爾德之泉</text>
        <text x="74" y="306" className="yg-sub">眾神在這裡開會</text>
        <rect x="154" y="226" width="132" height="104" rx="10" className="yg-root" />
        <text x="220" y="250" className="yg-title">第二條根</text>
        <text x="220" y="270" className="yg-sub">在霜巨人那裡</text>
        <text x="220" y="288" className="yg-sub">下面有密米爾之泉</text>
        <text x="220" y="306" className="yg-sub">奧丁把眼睛押在泉裡</text>
        <rect x="300" y="226" width="132" height="104" rx="10" className="yg-root" />
        <text x="366" y="250" className="yg-title">第三條根</text>
        <text x="366" y="270" className="yg-sub">在尼福爾海姆上方</text>
        <text x="366" y="288" className="yg-sub">下面是赫瓦格密爾泉</text>
        <text x="366" y="306" className="yg-sub">毒龍尼德霍格啃它</text>
        <rect x="8" y="364" width="424" height="76" rx="10" className="yg-norn" />
        <text x="220" y="390" className="yg-title">三位諾恩女神：烏爾德、薇兒丹蒂、詩寇蒂</text>
        <text x="220" y="412" className="yg-sub">每天用泉水和泥澆這棵樹</text>
        <text x="220" y="430" className="yg-sub">（卡片沒有寫她們用哪一口泉）</text>
      </svg>
      <p className="muted small">示意圖為本站繪製，依斯諾里《散文埃達》〈欺騙古魯菲〉第 15–16 章；三位諾恩女神的名字見《詩體埃達》〈女先知的預言〉第 19–20 節。只畫卡片寫到的東西，各部分的相對大小與位置不代表任何說法。</p>
      <h2>九個世界：沒有一致的名單</h2>
      <p>〈女先知的預言〉第 2 節只說有「九個世界」，沒有列出名字；斯諾里說海爾掌管九個世界，也沒有列出完整名單。常見的九界名單是後人整理的，第九個是哪一個並不確定。卡片提到常見名單裡有這八個名字（出自 <a href="https://www.worldhistory.org/article/1305/nine-realms-of-norse-cosmology/" target="_blank" rel="noreferrer">World History Encyclopedia「Nine Realms of Norse Cosmology」</a>）：</p>
      <ul className="realm-names">
        {['阿斯嘉特', '華納海姆', '亞爾夫海姆', '米德加爾德', '約頓海姆', '穆斯貝爾海姆', '斯瓦塔爾夫海姆', '尼福爾海姆'].map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <p className="muted small">所以本站不畫這些世界的位置圖：古書沒有給過一致的位置。</p>
    </>
  );
}
