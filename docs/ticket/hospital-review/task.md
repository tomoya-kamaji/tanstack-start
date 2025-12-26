# 病院向けレビュー機能 - タスク一覧

> 最終更新: 2025-12-25

## 全体進捗

```
[████████████████████] 100% (M1〜M5完了)
```

## 凡例

- [ ] 未着手
- [x] 完了

---

## M1: 基盤構築（Firebase + DB） ✅

### T1-1: Firebase プロジェクト設定（30分） ✅

- [x] Firebase コンソールで匿名認証を有効化
- [x] 環境変数に Firebase 設定を追加（`.env`）
  - `FIREBASE_API_KEY`
  - `FIREBASE_AUTH_DOMAIN`
  - `FIREBASE_PROJECT_ID`
- [x] `nuxt.config.ts` に runtimeConfig 追加

**ローカル開発時の設定:**

方法1: 本番Firebaseを直接使用

```bash
# .env に追加
FIREBASE_API_KEY=xxxxx
FIREBASE_AUTH_DOMAIN=librechat-409605.firebaseapp.com
FIREBASE_PROJECT_ID=librechat-409605
```

方法2: Emulator使用（推奨）

```bash
# .env に追加
APP_ENV=local

# エミュレーター起動
docker compose up -d firebase-emulator

# Emulator UI: http://localhost:4000
```

**完了条件**: 環境変数が設定され、Nuxtから参照できる ✅

---

### T1-2: Nuxt に Firebase SDK 導入（1時間） ✅

- [x] `firebase` パッケージインストール
- [x] `plugins/firebase.client.ts` 作成
  - Firebase App 初期化
  - Auth インスタンス export
- [x] 匿名認証のcomposable作成（`composables/useFirebaseAuth.ts`）
  - `signInAnonymously()` ラッパー
  - 現在のユーザー取得
  - ログイン状態監視

**完了条件**: `signInAnonymously()` が動作し、UIDが取得できる ✅

---

### T1-3: Prisma スキーマ追加（1時間） ✅

- [x] `Hospital` モデル追加

  ```prisma
  model Hospital {
    id        String   @id @default(uuid()) @db.Uuid
    name      String
    memo      String?
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    members      HospitalMember[]
    productions  VideoProduction[]

    @@map("hospitals")
  }
  ```

- [x] `HospitalMember` モデル追加

  ```prisma
  model HospitalMember {
    id          String   @id @default(uuid()) @db.Uuid
    hospitalId  String   @db.Uuid
    firebaseUid String
    name        String
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt

    hospital  Hospital        @relation(fields: [hospitalId], references: [id], onDelete: Cascade)
    feedbacks StepFeedback[]

    @@unique([hospitalId, firebaseUid])
    @@map("hospital_members")
  }
  ```

- [x] `StepFeedback` モデル追加

  ```prisma
  model StepFeedback {
    id                String   @id @default(uuid()) @db.Uuid
    videoProductionId String   @db.Uuid
    stepIndex         Int
    hospitalMemberId  String   @db.Uuid
    content           String
    createdAt         DateTime @default(now())
    updatedAt         DateTime @updatedAt

    production HospitalMember @relation(fields: [hospitalMemberId], references: [id], onDelete: Cascade)

    @@unique([videoProductionId, stepIndex, hospitalMemberId])
    @@map("step_feedbacks")
  }
  ```

- [x] `VideoProduction` に `publishedHospitalId` 追加
  ```prisma
  publishedHospitalId String? @db.Uuid
  hospital            Hospital? @relation(fields: [publishedHospitalId], references: [id])
  ```

**完了条件**: `prisma generate` が成功する ✅

---

### T1-4: マイグレーション実行（30分） ✅

- [x] `prisma migrate dev --name add_hospital_review` 実行
- [x] ローカルDBで動作確認

**完了条件**: 新テーブルが作成され、CRUDが動作する ✅

---

### T1-5: 本番環境デプロイ準備

- [ ] Secret Manager に `FIREBASE_API_KEY` を作成
- [x] deploy.yml に設定追加
  - `FIREBASE_API_KEY` → Cloud Run secrets
  - `FIREBASE_AUTH_DOMAIN` → build-args
  - `FIREBASE_PROJECT_ID` → build-args
- [x] Dockerfile に build-args 追加
- [x] 本番DBへのマイグレーション実行

**完了条件**: 本番環境でFirebase認証とDBが動作する

---

## M2: 病院管理機能（Contrea側） ✅

### T2-1: 病院CRUD API 作成（1時間） ✅

- [x] `src/mastra/handler/hospitals-handler.ts` 作成
  - GET: 病院一覧取得
  - POST: 病院作成
  - GET: 病院詳細取得
  - PUT: 病院更新
  - DELETE: 病院削除
- [x] `src/mastra/repository/hospital/` 作成（reader/writer）
- [x] バリデーション（zodスキーマ: `src/shared/schemas/hospital/`）

**完了条件**: APIがPostman等で動作確認できる ✅

---

### T2-2: 病院一覧・登録画面（1.5時間） ✅

- [x] `pages/hospitals.vue` 作成
- [x] 病院一覧テーブル（Ant Design Table使用）
  - 病院名
  - メンバー一覧（タグ表示）
  - 招待URL（コピーボタン付き）
  - 作成日
  - 編集・削除ボタン
- [x] 病院登録モーダル
  - 病院名（必須）
  - メモ（任意）
- [x] 病院編集モーダル
- [x] 削除確認ダイアログ
- [x] サイドバーにナビゲーション追加

**完了条件**: 病院の一覧表示・登録・編集・削除ができる ✅

---

### T2-3: 招待URL表示・コピー機能（30分） ✅

- [x] 招待URL生成ロジック（`/public/review/[hospitalId]`）
- [x] コピーボタンコンポーネント（Ant Design Icons使用）
- [x] コピー成功時のトースト通知

**完了条件**: ワンクリックで招待URLがコピーできる ✅

---

## M3: 制作物公開機能 ✅

### T3-1: 公開設定API作成（30分） ✅

- [x] `src/mastra/handler/productions-handler.ts` に公開設定エンドポイント追加
  - `PATCH /api/productions/:id/publish` - 公開設定
  - Request: `{ hospitalId: string | null }`
  - Response: `{ success: boolean }`
- [x] Repository層に公開設定メソッド追加
  - `VideoProductionWriter.updatePublishedHospital(id, hospitalId)`
- [x] Zodスキーマ追加（`src/shared/schemas/video-production/api/publish.ts`）
- [x] CORS設定に`PATCH`メソッドを追加

**完了条件**: APIで制作物の公開先病院を設定・解除できる ✅

---

### T3-2: ProductionCardにメニューボタン追加（1時間） ✅

- [x] `ProductionCardContent.vue` に三点メニュー（⋯）追加
  - 「公開設定」オプション
  - （将来用: 削除など追加可能な構造に）
- [x] 公開状態の表示追加（カード内）
  - 公開中: `🏥 ○○病院に公開中`（青バッジ）
  - 未公開: 表示なし
- [x] メニュークリックで公開設定モーダルを開く
- [x] `onPublishClick` イベント追加

**UIイメージ:**

```
┌─────────────────────────────┐
│ [サムネイル]          [⋯]  │
│                             │
│ 入院案内動画               │
│ 2024/12/24                 │
│ 🏥 ○○病院に公開中         │
│                [再編集]    │
└─────────────────────────────┘
```

**完了条件**: カードに三点メニューと公開状態が表示される ✅

---

### T3-3: 公開設定モーダル作成（1時間） ✅

- [x] `PublishSettingModal.vue` 作成
  - 病院セレクトボックス（病院一覧から選択）
  - 「未公開」オプション
  - 保存ボタン
  - キャンセルボタン
- [x] 病院一覧APIを呼び出して選択肢を表示
- [x] 保存時に公開設定APIを呼び出し
- [x] 成功時にカード一覧を更新
- [x] 招待URL表示機能追加
  - 病院選択時に招待URLを表示
  - コピーボタン付き
- [x] 保存後の招待URL確認機能
  - 保存後もモーダルを開いたまま
  - 保存成功メッセージと招待URLを強調表示

**UIイメージ:**

```
┌─────────────────────────────────┐
│ 公開設定                     ✕ │
├─────────────────────────────────┤
│                                 │
│  公開先病院:                    │
│  ┌─────────────────────────┐   │
│  │ ○○総合病院           ▼ │   │
│  └─────────────────────────┘   │
│    ・未公開                     │
│    ・○○総合病院               │
│    ・△△クリニック             │
│                                 │
│  ────────────────────────────  │
│  招待URL:                       │
│  ┌─────────────────────────┐   │
│  │ http://...review/xxx   │   │
│  └─────────────────────────┘   │
│                                 │
│       [キャンセル] [保存]       │
└─────────────────────────────────┘
```

**完了条件**: モーダルから公開先病院を選択・保存できる ✅

---

### T3-4: 制作物一覧APIに公開情報追加（30分） ✅

- [x] `VideoProductionWithSteps` 型に `publishedHospital` 追加
  - `publishedHospitalId: string | null`
  - `publishedHospitalName: string | null`
- [x] 一覧取得時にHospitalをJOINして病院名を返す
  - `include: { hospital: true }` を追加
  - `convert()` 関数で `publishedHospitalName` を返す
- [x] フロントエンドの型定義更新

**完了条件**: 一覧取得時に公開先病院の情報が含まれる ✅

---

## M4: 病院担当者向けレビュー画面 ✅

### T4-1: レビュー用レイアウト作成（30分） ✅

- [x] `layouts/public-review.vue` 作成
  - シンプルなレイアウト（NuxtPageスロットのみ）
  - 管理画面とは別デザイン

**完了条件**: レビュー画面用のレイアウトが使える ✅

---

### T4-2: 名前入力画面（1時間） ✅

- [x] `pages/public/review/[hospitalId]/index.vue` 作成
- [x] 初回アクセス判定ロジック
  - Firebase UIDがHospitalMemberに存在するか確認
  - 登録済みの場合は自動で制作物一覧へ遷移
- [x] 名前入力フォーム
  - 病院名表示
  - 名前入力欄
  - 「開始する」ボタン
- [x] HospitalMember登録API呼び出し（`POST /api/public/review/:hospitalId/member`）
- [x] 登録後、制作物一覧へリダイレクト

**完了条件**: 初回アクセス時に名前入力後、一覧画面に遷移する ✅

---

### T4-3: 制作物一覧画面（1時間） ✅

- [x] `pages/public/review/[hospitalId]/productions.vue` 作成
- [x] 公開済み制作物一覧API作成
  - `GET /api/public/review/:hospitalId/productions`
  - `src/nuxt/api/public-review.ts`
- [x] 一覧表示
  - 制作物タイトル
  - 更新日時
  - フィードバック状況（対応が必要/対応済みで分類）
  - サムネイル画像
- [x] 制作物クリックでレビュー画面へ

**完了条件**: 公開された制作物の一覧が表示される ✅

---

### T4-4: レビュー画面（ステップ一覧表示）（1.5時間） ✅

- [x] `pages/public/review/[hospitalId]/productions/[productionId].vue` 作成
- [x] 制作物詳細API作成（ステップ情報含む）
  - `GET /api/public/review/:hospitalId/productions/:id`
- [x] ステップ一覧表示
  - ステップ番号
  - ボード画像（クリックでモーダル拡大表示）
  - テキスト（ナレーション/テロップ）
  - フィードバック入力欄
- [x] レスポンシブ対応（スマホ考慮）
- [x] 全体のOK/修正希望選択機能

**完了条件**: ステップ一覧が画像・テキスト付きで表示される ✅

---

### T4-5: フィードバック入力・保存機能（1時間） ✅

- [x] フィードバック保存API作成
  - `POST /api/public/review/:hospitalId/feedback`
  - upsert処理（既存があれば更新、なければ作成）
- [x] フィードバック入力UI
  - テキストエリア（各ステップ）
  - 自動保存機能（1.5秒後に保存）
  - 保存済み時刻表示
- [x] 保存成功時のフィードバック（保存済み時刻表示）
- [x] 既存フィードバックの読み込み・表示

**完了条件**: フィードバックを入力・保存でき、再アクセス時に表示される ✅

---

### T4-6: バックエンドAPI実装（追加） ✅

- [x] Firebase Admin SDK導入
  - `src/mastra/client/firebase-admin.ts`
  - エミュレーター対応（`demo-project`）
  - 本番環境対応（Secret Manager）
- [x] Middleware実装
  - `src/mastra/middleware/public-review.ts` - Firebase ID Token検証
  - `src/mastra/middleware/iap-auth.ts` - IAP認証（分離）
- [x] Repository実装
  - `src/mastra/repository/review/reader.ts` - データ取得
  - `src/mastra/repository/review/writer.ts` - データ書き込み
- [x] APIハンドラー実装
  - `src/mastra/handler/public-review-handler.ts` - 6つのエンドポイント
- [x] スキーマ定義
  - `src/shared/schemas/public-review/api/` - Zodスキーマ

**完了条件**: すべてのAPIが動作する ✅

---

## M5: フィードバック確認機能（Contrea側） ✅

### T5-1: フィードバック取得API（30分） ✅

- [x] `src/nuxt/api/feedback.ts` 作成
  - GET: 制作物に紐づくフィードバック一覧取得
- [x] `src/mastra/handler/feedback-handler.ts` 作成
  - `GET /api/productions/:id/feedback`
- [x] 担当者名、ステップ番号、内容、日時を返却
- [x] Zodスキーマ追加（`src/shared/schemas/feedback/api.ts`）

**完了条件**: 制作物IDでフィードバック一覧が取得できる ✅

---

### T5-2: フィードバック表示UI（1時間） ✅

- [x] 制作物詳細画面にフィードバックサイドパネル追加
  - `src/nuxt/features/video-workflow-v3/components/FeedbackSidePanel.vue`
- [x] ヘッダーにトグルボタン追加（デフォルト閉じ）
- [x] フィードバック一覧表示
  - 担当者名
  - ステップ番号
  - フィードバック内容
  - 送信日時
- [x] フィードバックがない場合のメッセージ
- [x] `useFeedback` composable作成

**完了条件**: 動画制作者がフィードバックを確認できる ✅

---

### T5-3: レビュー対応完了機能（追加） ✅

- [x] `VideoProduction` に `reviewCompleted` フラグ追加
- [x] フィードバック送信時に `reviewCompleted = false` に自動更新
- [x] 対応完了API作成（`PATCH /api/productions/:id/review-complete`）
- [x] フィードバックパネルに「対応完了」ボタン追加
- [x] 確認ダイアログ表示（病院側に反映される旨）

**完了条件**: Contreaが対応完了マークでき、病院側に反映される ✅

---

### T5-4: 病院一覧画面の状態表示改善（追加） ✅

- [x] 3状態表示に対応
  - 📌 確認待ち（フィードバック未入力）
  - ⏳ 対応中（フィードバック送信済み、Contrea対応待ち）
  - ✅ 対応完了（Contreaが完了マーク）
- [x] スキーマに `reviewCompleted` 追加
- [x] APIで `reviewCompleted` を返却
- [x] ProductionCardを3状態に対応

**完了条件**: 病院担当者がフィードバック対応状況を確認できる ✅

---

## 補足

### 並行作業可能なタスク

- T2-1 と T4-1 は並行可能（M1完了後）
- T3-2 と T4-2〜T4-4 は並行可能（M2完了後）

### 優先度

1. M1 → 他のすべての前提
2. M2 → 病院がないと始まらない
3. M4 → メイン機能、ユーザー価値が高い
4. M3 → M4と並行で進める
5. M5 → 最後でOK
