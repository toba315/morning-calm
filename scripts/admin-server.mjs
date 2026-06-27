import { spawn } from "node:child_process";
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const port = Number.parseInt(process.env.PORT || process.argv.find((arg) => arg.startsWith("--port="))?.split("=")[1] || "4174", 10);
const newsJsonPath = path.join(rootDir, "data", "news-items.json");
const newsJsPath = path.join(rootDir, "news-data.js");
const publishedJsonPath = path.join(rootDir, "data", "published-news.json");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") {
      return sendCorsPreflight(response);
    }

    if (request.method === "GET" && request.url === "/api/news") {
      return sendJson(response, await readNewsState());
    }

    if (request.method === "POST" && request.url === "/api/fetch") {
      const before = await readNewsState();
      const beforeSignature = articlesSignature(before.articles);
      const result = await runFetch();
      const state = await readNewsState();
      const afterSignature = articlesSignature(state.articles);
      const changed = beforeSignature !== afterSignature;
      const message = changed
        ? `取得完了。${state.articles.length}件の内容が更新されました。`
        : `取得完了。新しいニュースはありませんでした。前回と同じ内容です。`;
      return sendJson(response, { ok: true, result, state, changed, message });
    }

    if (request.method === "POST" && request.url === "/api/publish") {
      const payload = await readJsonBody(request);
      const state = await readNewsState();
      const selected = selectArticles(state.candidates, payload.ids);
      await publishArticles(selected);
      return sendJson(response, {
        ok: true,
        publishedAt: new Date().toISOString(),
        count: selected.length,
        articles: selected,
        message: `${selected.length}件を反映しました。`,
      });
    }

    return serveStatic(request, response);
  } catch (error) {
    sendJson(response, { ok: false, error: error.message }, 500);
  }
});

server.listen(port, () => {
  console.log(`Morning Calm admin: http://localhost:${port}/admin.html`);
});

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://localhost:${port}`);
  const pathname = decodeURIComponent(url.pathname === "/" ? "/admin.html" : url.pathname);
  const filePath = path.normalize(path.join(rootDir, pathname));

  if (!filePath.startsWith(rootDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    response.writeHead(200, { "content-type": contentTypes[path.extname(filePath)] || "application/octet-stream" });
    response.end(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    throw error;
  }
}

async function readNewsState() {
  const data = JSON.parse(await fs.readFile(newsJsonPath, "utf8"));
  const candidates = Array.isArray(data.candidates) ? data.candidates : data.articles || [];
  const articles = Array.isArray(data.articles) ? data.articles : candidates.slice(0, 5);
  return { ...data, candidates, articles };
}

async function runFetch() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["scripts/fetch-news.mjs", "--detail-limit=30", "--no-publish"], {
      cwd: rootDir,
      shell: false,
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(stderr || `fetch exited with code ${code}`));
    });
  });
}

function selectArticles(candidates, ids) {
  if (!Array.isArray(ids)) throw new Error("ids must be an array");
  if (ids.length < 1) throw new Error("Select at least 1 news item");
  if (ids.length > 5) throw new Error("Select no more than 5 news items");

  const byId = new Map(candidates.map((article) => [article.id, article]));
  const selected = ids.map((id) => byId.get(id));
  if (selected.some((article) => !article)) throw new Error("Selected item was not found in candidates");
  return selected;
}

async function publishArticles(articles) {
  const publishedAt = new Date().toISOString();
  await fs.writeFile(
    publishedJsonPath,
    `${JSON.stringify({ publishedAt, count: articles.length, articles }, null, 2)}\n`,
    "utf8",
  );
  await fs.writeFile(
    newsJsPath,
    `// Published from admin at ${publishedAt}\nwindow.MORNING_CALM_NEWS = ${JSON.stringify(articles, null, 2)};\n`,
    "utf8",
  );
}

async function readJsonBody(request) {
  let body = "";
  for await (const chunk of request) body += chunk;
  return body ? JSON.parse(body) : {};
}

function sendJson(response, data, status = 200) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    ...corsHeaders(),
  });
  response.end(JSON.stringify(data, null, 2));
}

function sendCorsPreflight(response) {
  response.writeHead(204, corsHeaders());
  response.end();
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
  };
}

function articlesSignature(articles) {
  return JSON.stringify(
    (Array.isArray(articles) ? articles : []).map((article) => ({
      id: article.id || "",
      title: article.title || "",
      source: article.source || "",
      sourceUrl: article.sourceUrl || "",
      publishedAt: article.publishedAt || "",
    })),
  );
}
