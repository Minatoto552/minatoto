# Firebase・データ仕様

## Firestore

企業データは Firestore の `companies` コレクションに保存する。

## 企業データ構造

- id
- name
- industry
- jobType
- desireLevel
- difficultyLevel
- priority
- status
- myPageRegistered
- esStatus
- aptitudeTestStatus
- interviewSchedule
- internshipStatus
- applyDate
- esDeadline
- internshipDeadline
- nextDeadline
- nextAction
- companyMemo
- motivationMemo
- esMemo
- interviewMemo
- questionMemo
- myPageUrl
- recruitUrl
- tags
- createdAt
- updatedAt

## Firestore操作

- 企業データ取得
- 企業データ追加
- 企業データ更新
- 企業データ削除
- ローディング状態
- エラー状態
- createdAt保存
- updatedAt更新

## 環境変数

Firebase設定値は `.env` に分離し、`.env.example` にはキー名だけを記載する。
