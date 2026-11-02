# 卡片欄位規則

> `scripts/validate.ts` 依這份文件檢查；兩者不一致時，以這份文件為準並修正程式。

## 一張卡長什麼樣

```
cards/god/god-zeus.md
┌──────────────────────────────────────────────┐
│ ---                                          │
│ id: god-zeus           ← YAML：機器讀得懂的資料 │
│ name_zh: 宙斯             給搜尋、族譜、年代軸用   │
│ sources:                                     │
│   - {id: s1, kind: ancient, cite: …, url: …} │
│ ---                                          │
│ ## 故事                 ← 正文：給人讀的故事     │
│ 克羅諾斯怕被兒子推翻……[s1]  ← 句尾標來源代號    │
└──────────────────────────────────────────────┘
```

- 正文裡寫 `[s1]` 會變成可點的上標，跳到卡片底部的來源。
- 正文裡寫 `[[god-hera|希拉]]` 會變成卡片連結，滑過會浮出小卡。
- 查不到可靠來源時寫「查無可靠來源」，不可以編造。

## 欄位

| 欄位 | 必填 | 說明 |
|---|---|---|
| `id` | ✔ | 英文小寫連字號，和檔名相同，例 `god-zeus`、`story-trojan-war`。前綴：`primordial-` `titan-` `god-` `hero-` `story-` `event-` `monster-` `place-` |
| `type` | ✔ | 原始神／泰坦／神／英雄／凡人／怪物／故事／地點／物品 |
| `myth_system` | ✔ | `[greek]`、`[roman]` 或 `[greek, roman]` |
| `name_zh` | ✔ | 台灣最通行譯名 |
| `aliases` | ✔ | 其他中文譯名（含中國大陸譯名）、稱號、英文別名；全部可搜尋。簡體寫法由建置程式自動產生 |
| `name_en`、`name_orig` | ✔ | 英文；原文（希臘文附拉丁轉寫，如 `Ζεύς / Zeus`） |
| `roman` | | `{name_zh, name_la, name_en?, card?, note?}` 對應的羅馬名 |
| `reality` | ✔ | `{level: 純神話｜神話裡有歷史影子｜真實歷史, evidence?, src?}`；後兩者必須寫 evidence 與 src |
| `three_lines` | ✔ | 剛好三句：他是誰、最有名的故事、為什麼今天你會遇到他 |
| `hook` | ✔ | 一句話記住他 |
| `domains` | 神祇必填 | `{roles: [...], symbols: [...]}` |
| `how_to_recognize` | 神祇必填 | 名畫雕像裡怎麼認出他 |
| `family` | | `parents`／`consorts`／`children`／`siblings`，每筆 `{id 或 name, src, variant?}`。`variant` 有值＝「另有一說」，族譜畫虛線 |
| `panels` | 重要故事必填 | 4–8 格，每格 `{image?, text, src}` |
| `images` | 神祇至少 2 張真實作品 | `data/images.yaml` 的 id |
| `sources` | ✔ | 至少 1 個 `kind: ancient` 古代原典＋1 個 `kind: modern` 現代可靠來源（維基百科不算） |
| `causes`／`effects` | | `{id, rel: 直接引發｜促成｜背景｜回應, why ≤80 字, src}` |
| `greek_vs_roman` | 奧林帕斯神必填 | `{text, src}`，寫真正的差異，不只是換名字 |
| `today` | | 今日影子 id 清單 |
| `places` | | `data/places.yaml` 的 id 或地點卡 id |
| `era` | ✔ | `data/eras.yaml` 的 id |
| `topics` | ✔ | `data/topics.yaml` 的名稱 |
| `disputed` | | `[{claim, views: [{view, src}]}]` |
| `history_river` | | `{url, label}`，連到歷史長河的真實歷史卡 |

## 來源格式

- **古代原典**：作者＋作品＋卷行數，例「赫西俄德《神譜》453–506」「奧維德《變形記》1.452–567」。連結到可讀的線上版（Perseus、Theoi 英譯、維基文庫中譯）。
- **現代來源**：Theoi.com、大英百科、Perseus、牛津古典辭典、博物館館藏說明、大學課程資料、正式出版的學術書。維基百科只能當線索。

## 圖片（`data/images.yaml`）

| 欄位 | 真實作品 | AI 插畫 |
|---|---|---|
| `kind` | `work` | `ai` |
| `title`、`look` | ✔ | ✔ |
| `artist`、`date`、`license`、`source_url`、`file_url`、`credit` | ✔（從 Commons API 或博物館頁面抄，不要猜） | |
| `museum`、`license_url`、`period` | 建議 | |
| `ai: true`、`tool`、`prompt` | | ✔ |
| `file` | | ✔（`public/` 底下的路徑）；還沒生圖時寫 `placeholder: true` |

驗證腳本會擋：缺授權、缺來源連結、AI 圖沒標示、同一張圖署名不一致。

## 今日影子（`data/today/*.yaml`）

每筆 `{id, category, title, cards, what, diff, status: 已查證｜說法未證實, sources}`。`diff` 是「和原典差在哪」，一定要寫。
