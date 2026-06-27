# GOOD-30 Development Log

Date: 2026-06-27

## Scope

GOOD-30 builds the automatic news fetch program.
The output is app-ready news data: title, body, image URL, source URL, date, source, and attribution.

## What Changed

- Rebuilt `scripts/fetch-news.mjs`.
- Rebuilt `scripts/news-sources.json` with ASCII-safe source metadata.
- Added `data/news-items.json` as structured output for the fetch program.
- Continued generating `news-data.js` for the browser prototype.
- Added detail-page enrichment to collect `og:image` or `twitter:image` as `imageUrl`.
- Added per-source timeout handling so one slow source does not block the whole job.
- Added `scripts/register-news-task.ps1` for Windows Task Scheduler registration.
- Added `npm run news:schedule:windows`.
- Updated the app detail modal to render `imageUrl` when available.

## Commands

Fetch news now:

```bash
npm run news:fetch
```

Register a Windows daily task at 06:00:

```bash
npm run news:schedule:windows
```

Register with a custom time:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/register-news-task.ps1 -DailyTime "07:30"
```

## Generated Files

```text
data/news-items.json
news-data.js
```

`data/news-items.json` is the structured fetch output.
`news-data.js` is the browser-readable prototype data.

## Verification

- `node --check scripts/fetch-news.mjs`: OK
- `node --check app.js`: OK
- `scripts/news-sources.json` parses as JSON: OK
- `npm run news:fetch`: OK

Latest fetch result:

- Sumida Aquarium: 30 candidates
- Kyoto Aquarium: 30 candidates
- Sunshine Aquarium: 30 candidates
- Wikinews: 20 candidates
- RIKEN: 30 candidates
- Output: 5 app-ready articles

## Decisions

- The saved `body` is not copied from source pages. It is generated from metadata such as title, date, and source.
- Source definitions use stable category IDs: `creatures`, `research`, `society`, `world`.
- Source names in `scripts/news-sources.json` are ASCII-safe to avoid local encoding breakage.
- The app maps category IDs to Japanese labels at render time.
- METI remains in the source list but disabled for now because it previously timed out.

## Remaining Work

- Add source-specific parsers for sites where generic HTML extraction is too noisy.
- Add AI positive filtering in GOOD-31 / GOOD-15 integration.
- Decide whether to store fetched raw candidates separately for debugging.
- Register the Windows scheduled task when daily automatic execution is needed on the target machine.
