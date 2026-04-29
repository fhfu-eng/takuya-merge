# Fruit Merge

『スイカゲーム』にインスパイアされた個人制作のクローンゲームです。同じフルーツをぶつけて進化させ、ハイスコアを目指しましょう！

## 遊び方

- マウスを動かしてフルーツの落下位置を指定
- クリック / Space / ↓キー でフルーツを落とす
- 同じフルーツ同士がぶつかると次のレベルに進化
- フルーツが上端ラインを2秒以上超えるとゲームオーバー
- スマホはタッチ操作対応

## 技術スタック

- Vite + React + TypeScript
- Matter.js（物理演算）
- HTML5 Canvas（独自レンダラ）
- Tailwind CSS

## ローカル開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## デプロイ（Vercel）

```bash
# 1. GitHubリポジトリを作成してpush
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main

# 2. https://vercel.com/new からリポジトリを選択してデプロイ
#    フレームワークは "Vite" を自動検出します
```

## フルーツ画像の差し替え

`public/fruits/` に以下のファイルを配置すると自動的に使用されます（現在はSVGプレースホルダー）:

- `01_cherry.png` 〜 `11_watermelon.png`（300×300px 推奨、透過PNG）

## ライセンス

本アプリはAladdin X社の『スイカゲーム』を学習目的で模倣した個人制作クローンです。
