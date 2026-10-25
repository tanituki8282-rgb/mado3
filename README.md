# 窓3（mado3）

STS系カードローグライクの **ブラウザ文字プロト**。  
核: **見える窓は手札3＋次1。AP（今）とMP（蓄え）を割く。**

Improvement loop rounds 1–45 on `main` (R41–45: Review5 Top3 — 精鋭毎ターン気滞、膜裂き贈与、通常戦フェア＋詰み脱出、docs). **Not Done** — awaits Review6. Play: https://tanituki8282-rgb.github.io/mado3/ — smoke: `node scripts/smoke.mjs`.

## Play

1. GitHub Pages を開く（下記 URL）
2. 「冒険を始める」
3. マップでノードを選び、戦闘では手札をクリックして使用 → 「ターン終了」
4. 店で購入／削除、エリートを越え、ボスを倒す

### 操作の要点

| 要素 | ルール |
|------|--------|
| 手札 | 常に最大3。使うと次が入り、また3枚に戻る |
| 次 | 常に1枚見える。使ったあと山からランダムに更新 |
| 捨て札 | **なし**。使用カードは山へ戻る |
| AP | 毎ターン 3 にリセット |
| MP | ターンでは回復しない。カード等でのみ増減 |
| ブロック | 敵行動のあと清算 |

## Pages

- **URL**: https://tanituki8282-rgb.github.io/mado3/
- 配信元: `main` ブランチの **リポジトリルート**（`/`）
- `index.html` がルートにある構成。Pages 設定: Settings → Pages → Deploy from branch → `main` / `/ (root)`

Pages の初回反映には数分かかることがあります。404 のときは上記設定を確認してください。

## Local

```bash
cd mado3
python3 -m http.server 8080
# open http://localhost:8080
```

Smoke（手札/次/山ルール）:

```bash
node scripts/smoke.mjs
```

## Repo layout

```
index.html
css/style.css
js/cards.js
js/game.js
docs/CORE.md
README.md
scripts/smoke.mjs
```

## Out of scope (v1)

アート、遺物、Exhaust/捨て札、ポーション、多アクト、Godot。
