# Nakiya_Bar Order System 設計ドキュメント

## 1. アプリ全体の設計
- **スタック**: React (Vite) + TypeScript + Tailwind CSS + Supabase (想定)
- **目的**: VRChat内ホスト系BARイベント向けの一元管理システム。
- **アーキテクチャ**: フロントエンドはSPAとして構成し、Supabaseを用いて認証・DB・リアルタイム同期・ストレージ機能を統合。
- **特徴**: モバイルファーストで直感的な操作性、高級感のあるUI。注文管理、スタッフの権限制御、ローテーション管理など業務に必要な機能を一通り網羅。

## 2. 画面構成
- **ログイン/新規登録画面**: アプリへのアクセスゲートウェイ。「Enter Nakiya_Bar」の演出。
- **お客様向け注文画面 (Order Lounge)**: 商品メニューの閲覧用。スタッフのみが注文確定可能。
- **スタッフ向け注文確認画面 (Staff Board)**: 注文ごとの進捗状況（未対応、対応中、完了、お届け）を管理。
- **キャスト向けダッシュボード**: 自分の担当卓の注文状況やヘルプ状況を確認。
- **運営向け全体管理画面 (Owner Dashboard)**: ユーザー権限承認、卓管理、ローテーション作成、売上・履歴の確認。
- **共有表示UI**: 画面上部のアナウンスバー、緊急ヘルプボタン（モーダル含む）。

## 3. ユーザー権限ごとの機能一覧
- **未ログイン/お客様**: アナウンス閲覧、メニュー閲覧（注文確定は不可）、ログイン/登録画面へのアクセス。
- **承認待ち**: ログインはできるが「承認待ち画面」が表示され操作不可。
- **キャスト (approved, can_create_order: false)**: アナウンス閲覧、自分の担当卓の注文ステータス閲覧、緊急ヘルプ送信、プロフィール編集。
- **スタッフ (approved, can_create_order: true)**: アナウンス閲覧、メニューからの注文確定、すべての注文の閲覧・ステータス更新、お届け完了処理、緊急ヘルプ送信と対応、プロフィール編集。
- **運営 (admin)**: スタッフ全機能＋ユーザー承認・権限変更（can_create_orderの個別設定）、商品登録、卓管理、全体アナウンスの発信。

## 4. Supabaseのデータベース設計

### `user_profiles` テーブル
| カラム名 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PRIMARY, REFERENCES auth.users | AuthユーザーID |
| display_name | text | NOT NULL | サービス内表示名 |
| vrc_name | text | | VRChat表示名 |
| icon_url | text | | アバター/アイコン画像URL |
| role | enum | DEFAULT 'pending' | 現在の権限 (pending, staff, cast, admin) |
| requested_role | enum | | 登録時の希望権限 |
| can_create_order | boolean | DEFAULT false | 注文作成権限の有無 |
| approval_status | enum | DEFAULT 'pending' | 運営からの承認状態 (pending, approved, rejected) |
| assigned_table_id | uuid | REFERENCES tables | 現在の担当卓ID |
| created_at | timestampz | DEFAULT now() | |
| updated_at | timestampz | DEFAULT now() | |

*(その他のテーブル: `products`, `orders`, `order_items`, `tables`, `announcements`, `emergency_calls` などは初期要求の通り設計します)*

### 7. RLSポリシー方針
- **未認証**: 閲覧不可 (メニューなど公開するテーブルのみ `SELECT` 許可)。
- **user_profiles**:
  - `SELECT`: 全認証ユーザーが閲覧可能 (スタッフ一覧などのため)。
  - `UPDATE`: 自身のプロフィールのみ (ただし role, can_create_order などの権限フィールドは更新不可)。
  - `UPDATE (Admin)`: role = 'admin' のユーザーのみ、他者の権限フィールドを更新可能。
- **orders**:
  - `INSERT`: `can_create_order = true` のユーザーのみ。
  - `UPDATE`: `role IN ('staff', 'admin')` のユーザーのみ。
- **products**: `INSERT / UPDATE / DELETE` は `role = 'admin'` のみ許可。

## 5. 主要な状態管理の設計
- グローバルな状態管理は React Context (今回は `MockAppContext`) を用いて提供。
- `currentUser`: 現在の認証ユーザー情報と権限。
- `orders`: 現在アクティブな注文リスト。
- `products`: メニュー情報。
- 將来的には Supabase への直接の Fetch / Mutation と、SWR/React Query を利用したキャッシュ管理に移行。

## 6. リアルタイム同期の設計
- Supabase の Realtime (Postgres Changes) を利用。
- `orders` テーブルに対する `INSERT`, `UPDATE` イベントを購読し、UI上のリストを差分更新（リロードなしで注文の出現、ステータス変更を反映）。
- 同様に `emergency_calls` や `announcements` の変更も Push 受信。

## 7. UIデザイン方針
- **テーマ**: 黒ベース (#050505), ゴールドアクセント (#d4af37), ワインレッド (#7b1113)。
- 高級感、グラスの透過・光の演出を `backdrop-blur` や `box-shadow`, `linear-gradient` で表現。
- ログイン画面等では、日常からVIP空間へ入るような演出を心がけ、安っぽくならないようにマージンを広めにとる。

## 8. MVPとして最初に作るべき機能
- ログイン・新規登録・ロール選択機能
- カタログ閲覧と注文カート
- 注文状況 (カンバン風orリスト) とステータス更新機能
- シンプルなユーザー管理機能

## 今後追加できる機能
- Discord Webhook 連携 (注文時、ヘルプ時のDiscord通知機能)
- キャストごとのオリジナルカクテル売上ランキング分析
- QRコードを用いた卓への簡易アクセス（お客様用スマートオーダー化）
