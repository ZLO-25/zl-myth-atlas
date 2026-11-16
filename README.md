# 眾神星圖（zl-myth-atlas）

圖多、好讀、每件事都有來源的神話互動網站，收三套神話：**希臘羅馬**、**北歐**、**中華**。給台灣成人讀者：認得眾神與英雄、能把故事講給別人聽、看懂今天電影、品牌、英文單字、太空任務裡的神話梗。

| 神話 | 卡片的 `myth_system` | 主要原典 | 讀的時候要注意 |
| --- | --- | --- | --- |
| 希臘羅馬 | `greek`、`roman` | 荷馬、赫西俄德、雅典悲劇、奧維德、維吉爾 | 版本很多，同一件事常有兩三種說法 |
| 北歐 | `norse` | 《詩體埃達》（古詩）、斯諾里《散文埃達》（約 1220 年） | 很多完整情節只見於斯諾里；卡片要標明是古詩還是斯諾里說的 |
| 中華 | `chinese` | 《山海經》《淮南子》《史記》《楚辭》等十多種古書 | 故事零碎；很多神被寫成古代帝王（歷史化）；後世加的情節要標明 |

三套神話怎麼來、各自的可信度與差異，網站的「總覽」頁開頭有完整說明。

網站：https://zlo-25.github.io/zl-myth-atlas/
姊妹站（真實歷史）：[歷史長河](https://zlo-25.github.io/Long-History/)

```
cards/*.md ─┐
data/*.yaml ┼─► npm run validate（擋缺來源、缺授權、id 不存在…）
            └─► npm run build:index ─► src/generated/site-data.json ─► Vite＋React 網站 ─► GitHub Pages
```

## 本機執行

需要 Node.js 20.11 以上。

```bash
npm install
npm run dev        # 開發模式，打開 http://localhost:5173
npm run validate   # 檢查資料
npm run build      # 驗證＋建置到 dist/
npm test           # Playwright 測試（桌機 1280、手機 390）
```

推到 `main` 會自動驗證、建置並發布到 GitHub Pages（`.github/workflows/pages.yml`）。

## 新增一張卡

1. 在 `cards/<類別>/` 新增 `<id>.md`，檔名和 `id` 相同。
2. 照 [`docs/card-fields.md`](docs/card-fields.md) 填欄位；至少 1 個古代原典＋1 個現代可靠來源。
3. 正文寫 `## 故事`，句尾標 `[s1]`；提到別張卡寫 `[[god-hera|希拉]]`。
4. `npm run validate` 沒有錯誤就完成。

三套神話各有要注意的欄位（以 `scripts/validate.ts` 的實際規則為準）：

- `myth_system`：希臘羅馬用 `greek`、`roman`（可以並列）；北歐只寫 `[norse]`、中華只寫 `[chinese]`，這兩套不能和其他體系混。
- `name_orig`：中華一定要寫成「漢字 / 拼音」，例如 `女媧 / Nǚwā`，格式不對會擋；希臘羅馬與北歐沒有格式檢查，慣例是希臘文或古諾斯語加英文拼法，例如 `Ζεύς / Zeus`、`Óðinn / Odin`。
- `era`：要用自己那一套的年代。希臘羅馬用 `data/eras.yaml` 裡沒寫 `system` 的，北歐用 `system: norse`（`no-` 開頭），中華用 `system: chinese`（`cn-` 開頭），用錯會擋。

## 新增一張圖

真實作品（只收公有領域或開放授權）：在 `data/images.yaml` 加一筆：

```yaml
- id: img-zeus-artemision
  kind: work
  title: 阿特米西翁青銅像
  artist: 不詳（古希臘）
  date: 約前 460 年
  period: ancient
  museum: 雅典國家考古博物館
  license: CC BY-SA 4.0          # 從 Commons 頁面抄，不要猜
  license_url: https://creativecommons.org/licenses/by-sa/4.0/
  source_url: https://commons.wikimedia.org/wiki/File:…
  file_url: https://upload.wikimedia.org/…/1200px-….jpg
  credit: 攝影者名, via Wikimedia Commons
  look: 他正要擲出（已遺失的）雷電……
```

AI 插畫：`kind: ai`、`ai: true`、`tool`、`prompt`，圖檔放 `public/images/ai/<卡片 id>/`，`file` 寫 `images/ai/<卡片 id>/<檔名>.webp`。還沒生圖時寫 `placeholder: true`。提示詞清單在 `data/ai-art-prompts.yaml`，畫風與角色設定見 [`docs/art-style.md`](docs/art-style.md)。

然後在卡片的 `images:` 或 `panels:` 裡寫這個 id。三套神話的圖都一樣處理；目前漢代畫像石拓本等真實作品在中華卡片，北歐卡片的圖都是 AI 插畫，新增時照實標示 `kind`，不要把 AI 插畫標成古代作品。

## 新增一條今日影子

在 `data/today/` 對應類別的檔案加一筆：

```yaml
- id: today-panic
  category: 英文單字與成語
  title: panic（恐慌）
  cards: [god-hermes]
  what: 來自潘（Pan）……
  diff: ……（和原典差在哪，一定要寫）
  status: 已查證          # 或「說法未證實」
  sources:
    - {cite: Etymonline「panic」, url: https://www.etymonline.com/word/panic}
```

網站用 `cards` 的**第一張卡**決定這一條屬於哪一套神話（今日影子頁的篩選與搜尋結果都用它），所以北歐或中華的梗（例如 `thursday-thor` 連到索爾），第一張要放該套的卡。

## 授權

程式碼 MIT（`LICENSE`）；本站文字與資料 CC BY-SA 4.0；圖片各自授權。詳見 [`LICENSE-CONTENT.md`](LICENSE-CONTENT.md)。
