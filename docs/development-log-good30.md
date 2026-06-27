# GOOD-30 開発ログ

日付: 2026-06-27

## 対象

GOOD-30 は、自動ニュース取得プログラムを作る作業です。
出力はアプリでそのまま使えるニュースデータで、`title`、`body`、`imageUrl`、`sourceUrl`、`publishedAt`、`source`、`attribution` を含みます。

## 変更内容

- `scripts/fetch-news.mjs` を再構築した。
- `scripts/news-sources.json` を文字化けしにくい ASCII 安全なソース定義にした。
- 取得結果の構造化出力として `data/news-items.json` を追加した。
- ブラウザ用の `news-data.js` 生成を継続した。
- 詳細ページのメタ情報から `og:image` または `twitter:image` を拾って `imageUrl` に入れるようにした。
- 1件の取得が遅くても全体を止めないよう、ソースごとのタイムアウトを入れた。
- Windows のタスクスケジューラ登録用に `scripts/register-news-task.ps1` を追加した。
- `npm run news:schedule:windows` を追加した。
- アプリの詳細モーダルで `imageUrl` を表示するようにした。

## コマンド

ニュース取得:

```bash
npm run news:fetch
```

毎朝 6:00 の Windows タスク登録:

```bash
npm run news:schedule:windows
```

時間を変えて登録する場合:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/register-news-task.ps1 -DailyTime "07:30"
```

## 生成物

```text
data/news-items.json
news-data.js
```

`data/news-items.json` は取得結果の構造化データです。
`news-data.js` はブラウザでそのまま読むためのデータです。

## 検証

- `node --check scripts/fetch-news.mjs`: OK
- `node --check app.js`: OK
- `scripts/news-sources.json` の JSON 解析: OK
- `npm run news:fetch`: OK

最新の取得結果:

- Sumida Aquarium: 30 件
- Kyoto Aquarium: 30 件
- Sunshine Aquarium: 30 件
- Wikinews: 20 件
- RIKEN: 30 件
- 出力: アプリ向け 5 件

## 方針

- 保存する `body` は元ページ本文の流用ではなく、title / date / source などのメタ情報から生成する。
- ソース定義は `creatures`、`research`、`society`、`world` の固定カテゴリ ID を使う。
- `scripts/news-sources.json` のソース名は、ローカル環境の文字化けを避けるため ASCII 安全にした。
- アプリ側ではカテゴリ ID を表示時に日本語ラベルへ変換する。
- METI は一覧に残すが、以前タイムアウトしていたので今は無効化している。

## 今後の作業

- HTML 抽出が雑なサイト向けに、ソース専用パーサーを追加する。
- GOOD-31 / GOOD-15 と連携して AI のポジティブフィルタリングを入れる。
- デバッグ用に取得元の生データを別保存するか検討する。
- 日次の自動実行が必要な環境では、Windows のスケジュールタスクを登録する。

## 2026-06-27 管理画面

手動の管理画面を追加して、完全自動化の前にニュース取得結果を確認できるようにした。

### 変更内容

- `admin.html`、`admin.css`、`admin.js` を追加した。
- `scripts/admin-server.mjs` を追加した。
- `npm run admin` を追加した。
- `data/published-news.json` を追加した。
- `npm run news:candidates` を追加した。
- `scripts/fetch-news.mjs` に `--no-publish` を追加した。

### 手順

1. ローカルの管理サーバーを起動する。

```bash
npm run admin
```

2. 次を開く。

```text
http://localhost:4174/admin.html
```

3. `ニュース取得` を押す。
4. 候補からちょうど 5 件を選ぶ。
5. `反映` を押す。
6. 管理画面のリンクか `index.html` でフロント画面を開く。

### 動作

- `ニュース取得` は `data/news-items.json` の候補だけを更新する。
- フロント側の公開データは更新しない。
- `反映` は次の 2 つを書き出す。
  - `data/published-news.json`
  - `news-data.js`
- フロントは `news-data.js` を読むので、再読み込み後に選んだ 5 件が表示される。

### 検証

- `GET /api/news`: OK
- `POST /api/fetch`: OK
- `POST /api/publish`: OK
- `node --check scripts/admin-server.mjs`: OK
- `node --check admin.js`: OK

## 2026-06-27 管理画面の接続修正

管理画面とフロント画面は別の入口として動いていたが、ローカル環境では次の 2 点が問題になっていた。

1. `npm run admin` がまだ `4173` を使っていて、フロント用の表示サーバーと衝突していた。
2. `scripts/admin-server.mjs` が `favicon.ico` などの存在しない静的ファイルを致命的なエラーとして扱っており、通常のブラウザアクセスでも管理サーバーが落ちていた。

その結果、このセッションでは次の症状が出ていた。

- サイトを開こうとすると `ERR_CONNECTION_REFUSED` になる。
- ブラウザが正しいローカルサーバーではなく、落ちたポートや別の入口を見に行っていたため、「ニュース取得」や「反映」が失敗したように見える。
- `フロントを確認` がフロント画面への明確な遷移になっていなかった。

### 何を変えたか

- 管理サーバーの既定ポートを `4174` に変更した。
- 管理 API のレスポンスに CORS ヘッダと `OPTIONS` 対応を追加した。
- `admin.js` の取得・反映先を `http://localhost:4174` に明示した。
- 管理画面のフロント確認リンクを `http://localhost:4173/index.html` に直接向けた。
- `scripts/admin-server.mjs` の静的ファイル処理を修正し、存在しないファイルはクラッシュではなく `404` を返すようにした。

### できるようになったこと

- フロント画面は `http://localhost:4173/index.html` で表示できる。
- 管理画面は `http://localhost:4174/admin.html` で表示できる。
- 管理サーバーで `GET /api/news`、`POST /api/fetch`、`POST /api/publish` が正しく応答する。
- 管理画面経由で `npm run news:fetch` を実行すると、`data/news-items.json` が更新され、`news-data.js` も再生成される。

### 補足

- 取得パイプライン自体は動いており、壊れていたのはローカルのサーバー接続とエラーハンドリングだった。
- ブラウザ側では、開いているタブの状態に頼らず、フロント / 管理画面の入口を明示する形に整理した。
