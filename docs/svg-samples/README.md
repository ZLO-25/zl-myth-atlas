# SVG 插畫試作（2026-11-03）

Claude 用 SVG 向量圖依 `data/ai-art-prompts.yaml` 的場景與 `docs/art-style.md` 的畫風 C 試畫 3 張，給 ZL 看效果：

| 檔案 | 場景 |
|---|---|
| `img-ai-icarus-5.svg` | 伊卡洛斯越飛越高，太陽融化了蠟 |
| `img-ai-pandora-5.svg` | 潘朵拉掀開大罐子，災難飛散 |
| `img-ai-persephone-3.svg` | 狄蜜特持雙火炬，九天九夜尋找女兒 |

- 只用地中海五色＋深色線，4:3、1600×1200，畫面無文字。
- 還沒接進網站。若要採用：把 SVG 轉成 WebP（或讓 `imgSrc` 接受 `.svg`）放到 `public/images/ai/<卡片>/`，並在 YAML 把 `tool` 改成「Claude 手繪 SVG」。
- 風格是「簡筆圖像小說」，細節與質感不如生圖工具；適合先當佔位圖，或整站統一用這種樸拙風格。
