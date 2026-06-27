# Morning Calm Prototype

## Development log

Backlog課題ごとの開発記録は `docs/development-log.md` に追記します。
GOOD-29のニュース取得元選定・収集システム導入の記録もここに残しています。
GOOD-30の自動収集プログラムの記録は `docs/development-log-good30.md` に残しています。

静的HTML/CSS/JavaScriptで作成したプロトタイプです。

## 画面確認

`index.html` をブラウザで開いて確認します。

## Backlog仕様同期

Backlogの課題とWikiをCodexが読みやすいMarkdownとして `docs/backlog/` に保存できます。

### 初期設定

```bash
npm install
Copy-Item .env.example .env
```

`.env` にBacklogの接続情報を設定します。

```env
BACKLOG_SPACE_ID=your-space-id
BACKLOG_API_KEY=your-api-key
BACKLOG_PROJECT_KEY=PROJECT
BACKLOG_DOMAIN=backlog.com
BACKLOG_MAX_ISSUES=100
BACKLOG_REDACT_PERSONAL_INFO=true
```

`.env` は `.gitignore` に含めています。APIキーはGit管理しないでください。

### コマンド

指定プロジェクトの課題一覧とWikiを同期します。

```bash
npm run backlog:sync
```

作業対象の課題を `docs/backlog/current-task.md` に出力します。

```bash
npm run backlog:task -- PROJECT-123
```

### 出力

- `docs/backlog/issues.md`: 課題一覧
- `docs/backlog/issues/*.md`: 課題ごとの詳細
- `docs/backlog/wikis.md`: Wiki一覧
- `docs/backlog/wiki/*.md`: Wikiページ
- `docs/backlog/current-task.md`: 最新の作業対象課題

課題Markdownには、課題キー、タイトル、状態、優先度、担当者、説明、コメント、完了条件を整理して出力します。完了条件は説明内の「完了条件」「受け入れ条件」「Acceptance Criteria」「Definition of Done」などの見出しから抽出します。

個人情報を避けるため、デフォルトでは担当者名、コメント投稿者名、メールアドレス、メンション、電話番号を伏せます。担当者名などを出力したい場合は `.env` で `BACKLOG_REDACT_PERSONAL_INFO=false` を設定してください。

## ファイル

- `index.html`: 画面構造
- `styles.css`: ビジュアル
- `app.js`: 画面遷移と状態管理
- `scripts/backlog-sync.mjs`: Backlog同期スクリプト
