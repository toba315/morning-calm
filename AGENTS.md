# AGENTS.md

## Backlog仕様の参照

このリポジトリでは、Backlogの課題とWikiを `docs/backlog/` にMarkdownとして同期する。

- 作業前に `docs/backlog/current-task.md` を最優先で読む。
- 関連する課題一覧は `docs/backlog/issues.md` を読む。
- 関連するWikiは `docs/backlog/wikis.md` から辿る。
- Backlog APIキーや `.env` の値は絶対に出力、コミット、ログ貼り付けしない。
- 生成されたMarkdownにもAPIキーを含めない。
- 個人情報を含みうる情報は、必要最小限だけ参照する。

## 同期コマンド

```bash
npm run backlog:sync
npm run backlog:task -- PROJECT-123
```

`backlog:task` は指定した課題を `docs/backlog/current-task.md` に出力する。
