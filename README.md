# 英語禁止配信 カウンター

「英語（カタカナ語）を使ってはいけない配信」で使う、配信用のライブカウントツール。

- **配信者8人ごとに英語を使った回数をカウント**（＋1 / −1 / リセット）
- **没収額の自動計算**（1ワード = 1万ギル。1ワードあたりのギルは変更可）
- **リスナーの予想を管理** … 各リスナーが「全配信者の合計英語回数」を予想。
  - 終了時の合計に **最も近い予想を自動ハイライト（最有力）**
  - 予想は **ソート可能**（実績に近い順 / 予想 少→多 / 予想 多→少 / 名前順）
- **データは Neon Postgres に自動保存・複数端末で共有**（オフライン時は localStorage に一時保存）+ **JSONでエクスポート / インポート**

参加配信者: 木天蓼のこな / いっちゃん / すなはまくじら / ちゅん / ときちょ / 七白リオン / 一片カナメ / 夜真月しるし

## 開発

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # 単体テスト（lib のロジック）
npm run lint     # ESLint
npm run build    # 本番ビルド（型チェック込み）
```

## 技術構成

- Next.js 16 (App Router) / React 19 / TypeScript / Tailwind CSS v4
- データ永続化は **Neon Postgres**（`@neondatabase/serverless`）。状態を1行のJSONBで保存
- 状態管理は `hooks/useAppState.ts`、純粋なロジックは `lib/`（`state.ts` / `gil.ts` / `storage.ts` / `schema.ts`）に分離
- 入力・取り込みJSON・API入力の検証に zod、ロジックの単体テストに vitest

```
app/
  api/state/    GET/PUT … DB の読み書き（Route Handler）
  layout / page 画面
components/      UI コンポーネント（カード・予想リスト・ツールバー・同期状態）
hooks/          useAppState（状態 + DB同期 + localStorageキャッシュ + 操作）
lib/            db.ts(Neon) / remote.ts(fetch) / state.ts / gil.ts / storage.ts / schema.ts
```

## データの保存・共有

- 入力内容は **データベース（Neon Postgres）に自動保存**され、URLを開いた**全端末で共有**されます。
  - 変更はデバウンス（約0.6秒）して保存。ヘッダーに同期状態（DB同期済み / 保存中 / オフライン）を表示。
  - 他の端末での変更を取り込むには「**DBから再読込**」ボタン。
  - DBに接続できないときは **localStorage に一時保存**して動作を継続（復帰後に保存）。
- **エクスポート / インポート**: 状態をJSONファイルで保存・復元（バックアップ用）。

## データベース設定

接続文字列を環境変数 `DATABASE_URL` に設定します（ローカルは `.env.local`、git管理外）。

```bash
# .env.local
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
```

テーブル（`board_state`）はアプリが初回アクセス時に自動作成します（`CREATE TABLE IF NOT EXISTS`）。

## 書き込み保護（任意・推奨）

このアプリは単一の共有ボードを持ち、`GET /api/state`（閲覧）は公開です（内容は配信用の回数・予想のみ）。
**書き込み（`PUT`）を保護したい場合**は、環境変数 `BOARD_WRITE_TOKEN` を設定します。

```bash
# .env.local（および Vercel の環境変数）
BOARD_WRITE_TOKEN=<任意の十分長いランダム文字列>
```

- 設定すると、`PUT` は `x-board-token` ヘッダーが一致する場合のみ許可されます（定数時間比較）。
- 操作者は画面右の「**編集トークン**」欄に同じ値を入力します（端末の localStorage に保存。DB やバンドルには含まれません）。
- 未設定の場合は誰でも書き込み可能（後方互換）。URL を知る第三者の改ざんを防ぐには設定を推奨します。
- リクエストボディは 1MB 上限、状態は件数・桁数に上限を設けています（巨大ペイロード対策）。

## Vercel へのデプロイ

### 方法A: Vercel CLI（このディレクトリから直接）

```bash
npm i -g vercel        # 未インストールの場合
vercel login
vercel                 # プレビュー環境へデプロイ
vercel --prod          # 本番環境へデプロイ

# 環境変数 DATABASE_URL を Vercel に登録（各環境で必要）
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development
```

フレームワークは自動で Next.js として検出されます。**`DATABASE_URL` の登録だけ必須**で、`BOARD_WRITE_TOKEN`（書き込み保護）は任意です。

### 方法B: GitHub 連携

1. このディレクトリを git リポジトリ化して GitHub へ push（`.env.local` はコミットされません）
2. [vercel.com/new](https://vercel.com/new) からリポジトリをインポート
3. Project Settings → Environment Variables に `DATABASE_URL` を追加
4. デフォルト設定のままデプロイ（ビルドコマンド `next build`）
