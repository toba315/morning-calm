const state = {
  candidates: [],
  selectedIds: [],
  generatedAt: "",
};

const apiBase = `${window.location.protocol}//${window.location.hostname}:4174`;
const frontUrl = `${window.location.protocol}//${window.location.hostname}:4173/index.html`;

const el = {
  fetchNews: document.querySelector("#fetchNews"),
  publishNews: document.querySelector("#publishNews"),
  clearSelection: document.querySelector("#clearSelection"),
  generatedAt: document.querySelector("#generatedAt"),
  candidateCount: document.querySelector("#candidateCount"),
  selectedCount: document.querySelector("#selectedCount"),
  statusText: document.querySelector("#statusText"),
  candidateList: document.querySelector("#candidateList"),
  selectedList: document.querySelector("#selectedList"),
};

el.fetchNews.addEventListener("click", fetchLatestNews);
el.publishNews.addEventListener("click", publishSelected);
el.clearSelection.addEventListener("click", () => {
  state.selectedIds = [];
  render();
});

loadNews();

async function loadNews() {
  setStatus("候補を読み込み中");
  const data = await api("/api/news");
  state.candidates = data.candidates || [];
  state.generatedAt = data.generatedAt || "";
  state.selectedIds = (data.articles || []).slice(0, 5).map((article) => article.id);
  setStatus("読み込み完了");
  render();
}

async function fetchLatestNews() {
  setBusy(true, "ニュース取得中");
  try {
    const data = await api(`${apiBase}/api/fetch`, { method: "POST" });
    state.candidates = data.state.candidates || [];
    state.generatedAt = data.state.generatedAt || "";
    state.selectedIds = (data.state.articles || []).slice(0, 5).map((article) => article.id);
    setStatus("取得完了");
    render();
  } catch (error) {
    setStatus(`取得失敗: ${error.message}`);
  } finally {
    setBusy(false);
  }
}

async function publishSelected() {
  if (state.selectedIds.length !== 5) return;

  setBusy(true, "反映中");
  try {
    await api(`${apiBase}/api/publish`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: state.selectedIds }),
    });
    setStatus("フロントへ反映しました");
  } catch (error) {
    setStatus(`反映失敗: ${error.message}`);
  } finally {
    setBusy(false);
  }
}

function toggleSelection(id) {
  if (state.selectedIds.includes(id)) {
    state.selectedIds = state.selectedIds.filter((selectedId) => selectedId !== id);
  } else if (state.selectedIds.length < 5) {
    state.selectedIds = [...state.selectedIds, id];
  }
  render();
}

function render() {
  el.generatedAt.textContent = state.generatedAt ? formatDate(state.generatedAt) : "-";
  el.candidateCount.textContent = `${state.candidates.length}件`;
  el.selectedCount.textContent = `${state.selectedIds.length} / 5`;
  el.publishNews.disabled = state.selectedIds.length !== 5;

  el.candidateList.innerHTML = "";
  state.candidates.forEach((article) => {
    const card = document.createElement("article");
    const check = document.createElement("input");
    const thumb = document.createElement("img");
    const main = document.createElement("div");
    const title = document.createElement("h3");
    const body = document.createElement("p");
    const meta = document.createElement("div");

    const selected = state.selectedIds.includes(article.id);
    card.className = `candidate-card${selected ? " selected" : ""}`;
    check.type = "checkbox";
    check.checked = selected;
    check.disabled = !selected && state.selectedIds.length >= 5;
    check.addEventListener("change", () => toggleSelection(article.id));

    thumb.className = "thumb";
    thumb.alt = "";
    thumb.loading = "lazy";
    thumb.src = article.imageUrl || svgPlaceholder(article.category);

    main.className = "candidate-main";
    title.textContent = article.originalTitle || article.title;
    body.className = "body";
    body.textContent = article.body || "";
    meta.className = "meta";
    meta.append(
      textSpan(categoryLabel(article.category)),
      textSpan(article.source || "unknown source"),
      textSpan(formatDate(article.publishedAt)),
    );

    main.append(title, body, meta);
    card.append(check, thumb, main);
    el.candidateList.append(card);
  });

  el.selectedList.innerHTML = "";
  state.selectedIds
    .map((id) => state.candidates.find((article) => article.id === id))
    .filter(Boolean)
    .forEach((article) => {
      const item = document.createElement("li");
      item.textContent = article.originalTitle || article.title;
      el.selectedList.append(item);
    });
}

async function api(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok || data.ok === false) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

function setBusy(isBusy, message = "") {
  el.fetchNews.disabled = isBusy;
  el.publishNews.disabled = isBusy || state.selectedIds.length !== 5;
  if (message) setStatus(message);
}

function setStatus(message) {
  el.statusText.textContent = message;
}

function textSpan(value) {
  const span = document.createElement("span");
  span.textContent = value || "-";
  return span;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function categoryLabel(category) {
  const labels = {
    creatures: "生きもの",
    research: "研究",
    society: "社会",
    world: "世界",
  };
  return labels[category] || category || "ニュース";
}

function svgPlaceholder(category) {
  const label = encodeURIComponent(categoryLabel(category));
  return `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='224' height='156' viewBox='0 0 224 156'%3E%3Crect width='224' height='156' fill='%23e2ece9'/%3E%3Ctext x='112' y='82' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%232c3e50'%3E${label}%3C/text%3E%3C/svg%3E`;
}
