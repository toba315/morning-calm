# News ingestion

Morning Calm は、他社ニュース本文のスクレイピングや要約配信を避ける。
取得するのは、公式発表やCCライセンス記事のメタ情報と、確認可能なファクトに限定する。

## 方針

- 公式RSSまたは公式新着ページから、タイトル、日付、URL、発表元を取得する。
- 一般ニュースサイトの記事本文は保存しない。
- RSSの description は本文生成に使わない。
- アプリ内の文章は、取得したファクトから新規に書き起こす。
- 詳細画面には出典リンクを出す。
- CCライセンスのソースは、ライセンス名、ライセンスURL、帰属表記を保持する。

## 実行

```bash
npm run news:fetch
```

生成先:

```text
news-data.js
```

画面は `window.MORNING_CALM_NEWS` を読み込む。

## ソース追加

`scripts/news-sources.json` に追加する。

```json
{
  "id": "example-aquarium",
  "name": "Example水族館",
  "type": "html",
  "url": "https://example.com/news/",
  "category": "生きもの",
  "visual": "water",
  "licenseName": "公式発表",
  "attribution": "Example水族館"
}
```

RSSの場合:

```json
{
  "id": "example-rss",
  "name": "Example News",
  "type": "rss",
  "url": "https://example.com/feed.xml",
  "category": "世界",
  "visual": "market",
  "licenseName": "CC BY 4.0",
  "licenseUrl": "https://example.com/license",
  "attribution": "Example News"
}
```

MediaWiki APIの場合:

```json
{
  "id": "en-wikinews",
  "name": "Wikinews",
  "type": "mediawiki",
  "url": "https://en.wikinews.org/w/api.php?action=query&generator=categorymembers&gcmtitle=Category:Published&gcmlimit=20&gcmnamespace=0&gcmdir=desc&prop=info&inprop=url&format=json",
  "category": "世界",
  "visual": "market",
  "licenseName": "CC BY 4.0 / CC BY 2.5",
  "licenseUrl": "https://en.wikinews.org/wiki/Wikinews:Copyright",
  "attribution": "Wikinews"
}
```

## Wikinews

Wikinews は本文を利用できるCCライセンスの候補として扱える。
ただし、現在の実装では本文を流用せず、RSSのタイトル、URL、日付をもとにMorning Calm用の短文を新規生成する。
ライセンスと帰属は詳細画面に表示する。
