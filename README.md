# 就活企業管理

スマホ・PCの両方で使える就活専用Webアプリです。応募企業、インターン、選考状況、締切、次にやること、メモ、志望度、難易度、URLを一元管理できます。

ログイン画面はありません。起動するとダッシュボードと企業一覧が表示されます。サンプル企業データは入れていないため、企業は手動で登録してください。

## 使用技術

- React
- TypeScript
- Vite
- Firebase Firestore
- Tailwind CSS
- lucide-react

## 主な機能

- 企業の追加・編集・削除
- 企業検索、タグ検索
- 業界、選考状況、志望度、難易度フィルター
- 本命、インターン、選考中、ES提出前、SPI、面接予定、締切間近などのカテゴリタブ
- 締切が近い順、志望度順、難易度順、優先度順、最近更新順の並び替え
- カード表示、コンパクト表示、一覧表表示、カンバン表示
- 今日やること、明日まで、3日以内の締切、次に対応すべき企業の表示
- 締切3日以内の至急表示、7日以内の注意表示、期限切れ表示
- 次アクション未設定、放置中の自動判定
- 志望度、締切、選考状況、次アクションから優先度を自動計算
- マイページURL、採用ページURLの管理
- 長文メモ、志望理由メモ、ESメモ、面接メモ、逆質問メモ
- 編集中の下書き保存
- 保存完了表示、削除確認ダイアログ

## セットアップ

```bash
npm install
cp .env.example .env
cp .firebaserc.example .firebaserc
npm run dev
```

表示されたURLをブラウザで開いてください。

## Firebase設定

1. Firebase Consoleでプロジェクトを作成します。
2. Webアプリを追加し、Firebase設定値を取得します。
3. Firestore Databaseを作成します。
4. `.env` に以下の値を設定します。
5. Firebase CLIを使う場合は `.firebaserc` の `your-firebase-project-id` を自分のプロジェクトIDに変更します。

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

`.env` は `.gitignore` で除外しています。APIキーやFirebase設定値はGitHubへアップロードしないでください。

Firestoreルールをデプロイする場合:

```bash
npm run firebase:login
npm run firebase:use
npm run firebase:deploy:rules
```

このアプリはログインなしで使う仕様のため、`companies` コレクションの読み書きを認証なしで許可するルールになっています。公開運用する場合は、認証やユーザー別ワークスペースを追加してください。

## Firestoreコレクション構造

コレクション名:

```txt
companies
```

ドキュメント構造:

```ts
{
  id: string;
  name: string;
  industry: string;
  jobType: string;
  desireLevel: "本命" | "高" | "中" | "低" | "未設定";
  difficultyLevel: "高" | "中" | "低" | "未設定";
  priority: "高" | "中" | "低";
  status: string;
  myPageRegistered: boolean;
  esStatus: string;
  aptitudeTestStatus: string;
  interviewSchedule: string;
  internshipStatus: string;
  applyDate: string;
  esDeadline: string;
  internshipDeadline: string;
  nextDeadline: string;
  nextAction: string;
  companyMemo: string;
  motivationMemo: string;
  esMemo: string;
  interviewMemo: string;
  questionMemo: string;
  myPageUrl: string;
  recruitUrl: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

## ビルド

```bash
npm run build
```

## Firebase Hostingへデプロイ

```bash
npm run firebase:deploy
```

Hostingのみ更新する場合:

```bash
npm run firebase:deploy:hosting
```

## 今後追加できる機能案

- Googleログインとユーザー別データ分離
- カレンダー連携
- 通知・リマインダー
- ES設問テンプレート管理
- 面接質問ログ
- 企業ごとの添付ファイル管理
- スマホ向けPWA対応
