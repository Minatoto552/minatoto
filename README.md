# NAKIYA_BAR VRC Operations App

VRCバー運営向けのスマホ優先Webアプリです。配置、注文登録、注文管理、緊急ヘルプ、レシピ、会員ポイント、抽選、Diceゲーム、シフト提出、データメンテナンスをロール別に扱います。

## 公開URL

GitHub Pages:

```text
https://minatoto552.github.io/minatoto/
```

従業員アプリ:

```text
https://minatoto552.github.io/minatoto/app
```

## 技術構成

- React 19 / TypeScript / Vite
- Firebase Authentication / Firestore
- React Router
- Tailwind CSS
- lucide-react / motion / Three.js

## ロール

| Role | 主な画面 |
| --- | --- |
| `admin` | 全体配置、注文登録/管理、メニュー、レシピ、会員、ポイント、抽選、Dice、シフト、権限、データメンテナンス |
| `staff` | スタッフホーム、配置一覧、注文登録/管理、レシピ、緊急ヘルプ、シフト確認 |
| `cast` | キャストホーム、自分の配置、配置一覧、注文登録、レシピ、Dice対戦、緊急ヘルプ、シフト提出 |
| `customer` | お客様ホーム、メニュー閲覧、ポイント、抽選、Diceゲーム、本日のキャスト、お知らせ、マイページ |

お客様は注文作成できません。注文登録は管理者、スタッフ、キャストが行います。

## 開発

```bash
npm install
npm run dev
```

ローカルURL:

```text
http://127.0.0.1:5173/app
```

## 品質確認

```bash
npm run lint
npm run build
```

GitHub Pages相当のビルド:

```bash
npm run build:pages
```

## GitHub Pages

`main` ブランチへpushすると `.github/workflows/deploy-pages.yml` が `dist` をビルドしてGitHub Pagesへ公開します。

ViteはGitHub Pages用ビルド時に `/minatoto/` をbase pathとして使います。React Routerの直リンク対策として、`dist/index.html` から `dist/404.html` も生成します。

## Firebase設定

公開Webアプリで使うFirebase設定は `src/lib/firebase.ts` に公開フォールバックを持っています。別プロジェクトへ切り替える場合は、以下の環境変数を設定してください。

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_DATABASE_ID
```

FirebaseのWeb API Keyは公開クライアント設定であり、DB保護はFirebase AuthenticationとFirestore Rulesで行います。パスワードや機密情報はリポジトリに置かないでください。

Firestore Rulesを反映する場合:

```bash
firebase deploy --only firestore:rules
```
