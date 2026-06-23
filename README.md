# NAKIYA_BAR VRC Operations App

VRCバーの営業をスマートフォン中心で管理するReactアプリです。注文登録、配置、ローテーション、シフト、メニュー、レシピ、ポイント、抽選、Diceゲーム、緊急ヘルプを役割別の画面で提供します。

## 技術構成

- React 19 / TypeScript / Vite
- Firebase Authentication / Firestore
- React Router
- Tailwind CSS
- lucide-react / motion / Three.js

## 権限

| Role | 主な機能 |
| --- | --- |
| `admin` | 全体配置、注文、メニュー、レシピ、会員、ポイント、抽選、シフト、権限、データメンテナンス |
| `staff` | スタッフ・キャスト配置確認、注文登録と進行管理、レシピ、緊急ヘルプ、シフト |
| `cast` | 自分の配置、配置一覧、注文登録、レシピ、Dice対戦、緊急ヘルプ、シフト |
| `customer` | メニュー閲覧、ポイント、抽選、Diceゲーム、本日のキャスト、お知らせ、プロフィール |

お客様は注文を作成できません。注文登録は管理者・スタッフ・キャスト向け画面から行います。権限制御はルートガード、サービス処理、Firestore Rulesの三層で行います。

## ディレクトリ

```text
src/
  components/       共通UI、レイアウト、ルートガード、3D表現
  hooks/            配置・ナビゲーションなどの共通ロジック
  lib/              Firebase、アプリContext、注文ユーティリティ
  pages/
    admin/          管理者機能
    announcements/ お知らせ
    auth/           認証・プロフィール
    customer/       お客様専用画面
    home/           役割別ホーム
    orders/         注文登録
    placements/     配置一覧
    recipes/        レシピ閲覧
    staff/          スタッフ業務・シフト
```

## セットアップ

1. `.env.example` を参考に `.env.local` を作成します。
2. Firebase Web AppとFirestoreの値を設定します。
3. 依存関係をインストールして開発サーバーを起動します。

```bash
npm install
npm run dev
```

既定URLは `http://127.0.0.1:5173` です。

## 品質確認

```bash
npm run lint
npm run build
```

## Firebase Rules

Firebase CLIを利用できる環境では、対象プロジェクトを確認してからRulesをデプロイします。

```bash
firebase use
firebase deploy --only firestore:rules
```

パスワードや秘密鍵はリポジトリへコミットしないでください。Firebase Web App設定は環境変数から読み込みます。
