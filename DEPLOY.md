# デプロイ手順

## 1. GitHubにプッシュ

```bash
cd /Users/masuo/totonoereform-analyzer
git init
git add .
git commit -m "初回コミット"
# GitHubでリポジトリを作成してからpush
git remote add origin https://github.com/あなたのユーザー名/totonoereform-analyzer.git
git push -u origin main
```

---

## 2. Railway（バックエンド + DB）

1. https://railway.app にアクセスしてログイン
2. 「New Project」→「Deploy from GitHub repo」
3. `totonoereform-analyzer` リポジトリを選択
4. 「Add Service」→「Database」→「PostgreSQL」を追加
5. バックエンドサービスの「Settings」→「Root Directory」を `backend` に設定
6. 「Variables」タブで以下の環境変数を設定：

| 変数名 | 値 |
|---|---|
| `DATABASE_URL` | （PostgreSQLサービスの接続URLをコピー）|
| `INSTAGRAM_USERNAME` | `masuolife` |
| `INSTAGRAM_PASSWORD` | （@masuolifeのパスワード）|
| `X_USERNAME` | `totonoerehome` |
| `X_PASSWORD` | （@totonoerehomeのパスワード）|
| `X_EMAIL` | （Xアカウントのメールアドレス）|

7. デプロイが完了したら、バックエンドのURLをメモ（例: `https://xxx.railway.app`）

---

## 3. Vercel（フロントエンド）

1. https://vercel.com にアクセスしてログイン
2. 「New Project」→ GitHubリポジトリを選択
3. 「Root Directory」を `frontend` に設定
4. 「Environment Variables」で設定：

| 変数名 | 値 |
|---|---|
| `NEXT_PUBLIC_API_URL` | （Railwayのバックエンド URL）|

5. 「Deploy」をクリック
6. 完了するとURLが発行される（例: `https://totonoereform-analyzer.vercel.app`）

---

## 4. スマホにインストール（PWA）

- iPhoneの場合: Safariでアプリのページを開き、「共有」→「ホーム画面に追加」
- Androidの場合: Chromeで開き、「ホーム画面に追加」
