# AGENT.md

このファイルはAIエージェント（Cursor, GitHub Copilot等）向けのプロジェクト情報です。

---

## プロジェクト概要

TanStack Start を使用したフルスタックReactアプリケーション。

---

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | TanStack Start (React 19) |
| ルーティング | TanStack Router |
| 状態管理 | TanStack Query |
| テーブル | TanStack Table |
| スタイリング | Tailwind CSS v4 |
| ビルドツール | Vite 8 |
| パッケージマネージャ | Bun |
| Linter/Formatter | Biome |
| Git Hooks | Lefthook |
| 言語 | TypeScript |

---

## ディレクトリ構成

```
src/
├── lib/                    # ライブラリ・ユーティリティ
│   └── esports/            # Eスポーツ機能
│       ├── constants.ts    # 定数定義
│       ├── types.ts        # 型定義
│       ├── storage.ts      # localStorage操作
│       ├── queryClient.ts  # TanStack Query設定
│       └── hooks/          # カスタムフック
│           ├── useTournament.ts
│           ├── usePlayers.ts
│           └── useRanks.ts
├── routes/                 # ページコンポーネント（ファイルベースルーティング）
│   ├── __root.tsx          # ルートレイアウト
│   ├── index.tsx           # /
│   ├── about/
│   │   └── index.tsx       # /about
│   ├── esports/
│   │   ├── index.tsx       # /esports（ダッシュボード）
│   │   ├── players.tsx     # /esports/players（参加者管理）
│   │   ├── score.tsx       # /esports/score（スコア入力）
│   │   └── result.tsx      # /esports/result（結果発表）
│   └── user/
│       ├── index.tsx       # /user
│       └── $id.tsx         # /user/:id（動的ルート）
├── router.tsx              # ルーター設定
├── routeTree.gen.ts        # 自動生成（編集禁止）
└── styles.css              # グローバルスタイル

docs/
└── ticket/                 # 機能チケット
    ├── esports/            # Eスポーツ機能の仕様
    └── hospital-review/    # 病院レビュー機能の仕様
```

---

## 開発コマンド

### 基本

```bash
# 開発サーバー起動（http://localhost:3000）
bun run dev

# プロダクションビルド
bun run build

# ビルド結果をプレビュー
bun run start
```

### Lint / Format（Biome）

```bash
# チェック（lint + format）
bun run check

# チェック + 自動修正
bun run fix

# Lintのみ
bun run lint
bun run lint:fix

# Formatのみ
bun run fmt
bun run fmt:fix
```

### パッケージ管理

```bash
# パッケージインストール
bun install

# パッケージ追加
bun add <package>

# 開発依存追加
bun add -d <package>
```

---

## 主要機能

### 1. Eスポーツ大会スコアボード (`/esports`)

社内Eスポーツ大会用のスコア管理アプリ。

## 実装時のガイドライン

### コード品質

- **コード改修時には lint と format を実行してください。**
  ```bash
  bun run fix  # lint + format + 自動修正
  ```

### ファイル編集時の注意

- `routeTree.gen.ts` は自動生成ファイルのため**編集禁止**
- `.vscode/settings.json` で `*.md` ファイルは読み取り専用に設定されている
- Biomeによるフォーマットが保存時に自動実行される（`editor.formatOnSave: true`）

### TanStack Query の使い方

- 状態管理は `TanStack Query` を使用
- `localStorage` への保存は `queryClient` の `subscribe` で自動化
- カスタムフックは `src/lib/esports/hooks/` に配置
  - `useTournament()` - トーナメントデータ取得
  - `usePlayers()` - プレイヤー追加/更新/削除
  - `useRanks()` - 順位更新

### ルーティング

- ファイルベースルーティング（`src/routes/`）
- 動的ルートは `$` プレフィックス（例: `$id.tsx`）
- ルート定義は `createFileRoute()` を使用

### スタイリング

- Tailwind CSS v4 を使用
- カラーパレット: ネオン/サイバーテーマ（マゼンタ、シアン、イエロー）
- ダークベース（`bg-[#0a0a0f]`）にネオンアクセント

---

## 関連ドキュメント

- `docs/ticket/esports/spec.md` - Eスポーツ機能の要件定義
- `docs/ticket/esports/plan.md` - 実装計画
- `docs/ticket/esports/ux-design.md` - UXデザイン
