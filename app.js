const fallbackArticles = [
  {
    category: "生きもの",
    title: "ペンギンの赤ちゃんが新しい一歩へ",
    source: "公式サイトの新着情報",
    sourceUrl: "",
    publishedAt: new Date().toISOString(),
    pipeline: "公式発表のメタ情報から、本文を流用せずに新規作成",
    visual: "water",
    body:
      "水族館で、ペンギンの赤ちゃんが次の成長段階へ進む準備をしています。小さな一歩を見守る知らせは、朝の気持ちを少しやわらかくしてくれます。",
    hint: "身近な成長の知らせに目を向けると、今日の見え方が少し変わるかもしれません。",
    facts: ["公式サイトの新着情報をもとにしたデモ記事です。"],
  },
  {
    category: "研究",
    title: "研究成果が社会に近づく",
    source: "研究機関の公式発表",
    sourceUrl: "",
    publishedAt: new Date().toISOString(),
    pipeline: "公式発表のメタ情報から、本文を流用せずに新規作成",
    visual: "market",
    body:
      "研究機関から、新しい成果が発表されました。静かな積み重ねが未来の選択肢を増やしていくことを、そっと感じられる知らせです。",
    hint: "誰かの積み重ねが、まだ見えない場所で日々を支えているのかもしれません。",
    facts: ["公式発表をもとにしたデモ記事です。"],
  },
  {
    category: "地域",
    title: "地域の新しい場所がひらく",
    source: "自治体・施設の公式発表",
    sourceUrl: "",
    publishedAt: new Date().toISOString(),
    pipeline: "公式発表のメタ情報から、本文を流用せずに新規作成",
    visual: "flowers",
    body:
      "地域に、新しい交流の場所が生まれました。少し立ち寄れる場所が増えることは、毎日の余白をつくる小さなニュースです。",
    hint: "通り道の変化をひとつ探してみるのも良いかもしれません。",
    facts: ["公式発表をもとにしたデモ記事です。"],
  },
  {
    category: "くらし",
    title: "水辺の展示に新しい季節",
    source: "公式サイトの新着情報",
    sourceUrl: "",
    publishedAt: new Date().toISOString(),
    pipeline: "公式発表のメタ情報から、本文を流用せずに新規作成",
    visual: "water",
    body:
      "水辺の施設で、季節に合わせた展示が始まります。見慣れた日常の近くにも、静かに新しい景色が用意されています。",
    hint: "今日は、いつもの場所にある小さな変化を探してみてもよさそうです。",
    facts: ["公式発表をもとにしたデモ記事です。"],
  },
  {
    category: "学び",
    title: "親子で学べる催しが開催へ",
    source: "公式サイトの新着情報",
    sourceUrl: "",
    publishedAt: new Date().toISOString(),
    pipeline: "公式発表のメタ情報から、本文を流用せずに新規作成",
    visual: "breakfast",
    body:
      "施設の公式発表で、親子向けの学びの催しが案内されています。新しいことを知る時間は、週末を少し明るくしてくれます。",
    hint: "気になる催しをひとつだけメモしておくと、楽しみが先に生まれます。",
    facts: ["公式発表をもとにしたデモ記事です。"],
  },
];

const generatedArticles = Array.isArray(window.MORNING_CALM_NEWS) ? window.MORNING_CALM_NEWS : [];
const articles = (generatedArticles.length >= 5 ? generatedArticles : fallbackArticles).slice(0, 5);

const todayKey = new Date().toISOString().slice(0, 10);
const usageKey = "morning-calm-usage";

const state = {
  plan: "free",
  index: 0,
  setCount: 1,
  streak: 12,
  mood: null,
  saved: new Set(),
  usage: loadUsage(),
};

const screens = {
  splash: document.querySelector("#splash"),
  reader: document.querySelector("#reader"),
  summary: document.querySelector("#summary"),
};

const el = {
  splashStreak: document.querySelector("#splashStreak"),
  readerPlan: document.querySelector("#readerPlan"),
  readerCopy: document.querySelector("#readerCopy"),
  summaryPlan: document.querySelector("#summaryPlan"),
  togglePlan: document.querySelector("#togglePlan"),
  progressBar: document.querySelector("#progressBar"),
  newsCard: document.querySelector("#newsCard"),
  newsCategory: document.querySelector("#newsCategory"),
  newsTitle: document.querySelector("#newsTitle"),
  newsBody: document.querySelector("#newsBody"),
  newsHint: document.querySelector("#newsHint"),
  cardCount: document.querySelector("#cardCount"),
  prevCard: document.querySelector("#prevCard"),
  nextCard: document.querySelector("#nextCard"),
  ambientAd: document.querySelector("#ambientAd"),
  titleList: document.querySelector("#titleList"),
  calendarPanel: document.querySelector("#calendarPanel"),
  calendarGrid: document.querySelector("#calendarGrid"),
  moreSet: document.querySelector("#moreSet"),
  fixedMessage: document.querySelector("#fixedMessage"),
  restart: document.querySelector("#restart"),
  modal: document.querySelector("#detailModal"),
  modalImage: document.querySelector("#modalImage"),
  modalCategory: document.querySelector("#modalCategory"),
  modalTitle: document.querySelector("#modalTitle"),
  modalMeta: document.querySelector("#modalMeta"),
  modalBody: document.querySelector("#modalBody"),
  modalHint: document.querySelector("#modalHint"),
  modalAd: document.querySelector("#modalAd"),
  closeModal: document.querySelector("#closeModal"),
};

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("screen-active"));
  screens[name].classList.add("screen-active");
}

function planLabel() {
  return state.plan === "paid" ? "有料版" : "無料版";
}

function renderReader() {
  const article = articles[state.index];
  const remaining = Math.max(articles.length - state.usage.readCount, 0);
  el.readerPlan.textContent = planLabel();
  el.togglePlan.textContent = state.plan === "paid" ? "無料版へ" : "有料版へ";
  el.readerCopy.textContent =
    state.plan === "paid"
      ? "広告なしで、追加のチューニングも読めます。"
      : `無料版は本日あと${remaining}本。`;
  el.progressBar.style.width = `${((state.index + 1) / articles.length) * 100}%`;
  el.newsCategory.textContent = categoryLabel(article.category);
  el.newsTitle.textContent = article.title;
  el.newsBody.textContent = article.body;
  el.newsHint.textContent = article.hint;
  el.cardCount.textContent = `${state.index + 1} / ${articles.length}`;
  el.prevCard.disabled = state.index === 0;
  el.ambientAd.hidden = state.plan === "paid";
  el.ambientAd.textContent = "朝の集中を妨げない、静かな広告枠";
}

function renderCalendar() {
  el.calendarGrid.innerHTML = "";
  const now = new Date();
  const currentDay = now.getDate();
  document.querySelector("#calendarMonth").textContent = `${now.getFullYear()}年${now.getMonth() + 1}月`;

  for (let day = 1; day <= 30; day += 1) {
    const item = document.createElement("span");
    item.className = "day";
    item.textContent = day;
    if ([3, 4, 5, 8, 9, 12, 16, 19, 22].includes(day)) item.classList.add("done");
    if (day === currentDay) item.classList.add("today");
    el.calendarGrid.append(item);
  }
}

function renderSummary() {
  el.summaryPlan.textContent = planLabel();
  el.calendarPanel.classList.toggle("visible", state.plan === "paid");
  el.moreSet.hidden = state.plan !== "paid";
  el.moreSet.disabled = state.setCount >= 4;
  el.moreSet.textContent =
    state.setCount >= 4 ? "本日の追加チューニングは終了しました" : "次の5本をチューニングする";
  el.restart.textContent =
    state.plan === "free" && state.usage.readCount >= articles.length ? "本日はここまで" : "最初へ";
  el.fixedMessage.textContent = `現在${state.streak}日連続で読了中。明日も朝の時間でお会いしましょう。`;

  el.titleList.innerHTML = "";
  articles.forEach((article, index) => {
    const row = document.createElement("li");
    const open = document.createElement("button");
    const category = document.createElement("span");
    const title = document.createElement("strong");
    const preview = document.createElement("span");

    open.type = "button";
    open.className = "summary-item";
    category.className = "summary-category";
    title.className = "summary-title";
    preview.className = "summary-preview";
    category.textContent = `${categoryLabel(article.category)} / ${article.source}`;
    title.textContent = article.title;
    preview.textContent = article.body;
    open.append(category, title, preview);
    open.addEventListener("click", () => openDetail(index));
    row.append(open);

    if (state.plan === "paid") {
      const save = document.createElement("button");
      save.type = "button";
      save.className = "bookmark";
      save.setAttribute("aria-label", "マイページに保存");
      save.textContent = state.saved.has(index) ? "★" : "☆";
      save.addEventListener("click", () => {
        state.saved.has(index) ? state.saved.delete(index) : state.saved.add(index);
        renderSummary();
      });
      row.append(save);
    }

    el.titleList.append(row);
  });
}

function openDetail(index) {
  const article = articles[index];
  const facts = Array.isArray(article.facts) ? article.facts.join(" / ") : "";
  el.modalImage.className = `modal-image image-${article.visual || "water"}`;
  el.modalImage.style.backgroundImage = article.imageUrl
    ? `linear-gradient(135deg, rgba(249, 249, 246, 0.18), rgba(44, 62, 80, 0.22)), url("${article.imageUrl}")`
    : "";
  el.modalImage.style.backgroundSize = article.imageUrl ? "cover" : "";
  el.modalImage.style.backgroundPosition = article.imageUrl ? "center" : "";
  el.modalCategory.textContent = categoryLabel(article.category);
  el.modalTitle.textContent = article.title;
  el.modalMeta.textContent = `${article.source} / ${formatDate(article.publishedAt)} / ${article.pipeline}`;
  el.modalBody.textContent = article.body;
  el.modalHint.textContent = `今日のヒント: ${article.hint}`;
  el.modalAd.hidden = state.plan === "paid";
  el.modalAd.textContent = facts
    ? `確認したファクト: ${facts}`
    : attributionText(article);

  document.querySelectorAll(".source-link").forEach((link) => link.remove());
  if (article.sourceUrl) {
    const sourceLink = document.createElement("a");
    sourceLink.className = "source-link";
    sourceLink.href = article.sourceUrl;
    sourceLink.target = "_blank";
    sourceLink.rel = "noopener noreferrer";
    sourceLink.textContent = "公式発表を開く";
    el.closeModal.before(sourceLink);
  }
  if (article.licenseUrl) {
    const licenseLink = document.createElement("a");
    licenseLink.className = "source-link";
    licenseLink.href = article.licenseUrl;
    licenseLink.target = "_blank";
    licenseLink.rel = "noopener noreferrer";
    licenseLink.textContent = `ライセンス: ${article.licenseName}`;
    el.closeModal.before(licenseLink);
  }

  el.modal.showModal();
}

function goNext() {
  if (state.index < articles.length - 1) {
    state.index += 1;
    renderReader();
    return;
  }
  markReadToday();
  renderSummary();
  showScreen("summary");
}

function goPrev() {
  if (state.index > 0) {
    state.index -= 1;
    renderReader();
  }
}

function startReader() {
  if (state.plan === "free" && state.usage.readCount >= articles.length) {
    renderSummary();
    showScreen("summary");
    return;
  }
  state.index = 0;
  renderReader();
  showScreen("reader");
}

el.togglePlan.addEventListener("click", () => {
  state.plan = state.plan === "paid" ? "free" : "paid";
  renderSummary();
  renderReader();
});

el.nextCard.addEventListener("click", goNext);
el.prevCard.addEventListener("click", goPrev);
el.restart.addEventListener("click", startReader);
el.closeModal.addEventListener("click", () => el.modal.close());

el.moreSet.addEventListener("click", () => {
  if (state.setCount >= 4) return;
  state.setCount += 1;
  startReader();
});

document.querySelectorAll("[data-mood]").forEach((button) => {
  button.addEventListener("click", () => {
    state.mood = button.dataset.mood;
    document.querySelectorAll("[data-mood]").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
  });
});

let touchStartX = 0;
el.newsCard.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].screenX;
});

el.newsCard.addEventListener("touchend", (event) => {
  const distance = event.changedTouches[0].screenX - touchStartX;
  if (distance < -48) goNext();
  if (distance > 48) goPrev();
});

el.splashStreak.textContent = state.streak;
renderCalendar();
setTimeout(startReader, 1200);

function loadUsage() {
  try {
    const stored = JSON.parse(localStorage.getItem(usageKey));
    if (stored?.date === todayKey) return stored;
  } catch {
    // Ignore invalid localStorage data and reset the daily prototype counter.
  }

  return { date: todayKey, readCount: 0 };
}

function markReadToday() {
  if (state.plan !== "free") return;

  state.usage = { date: todayKey, readCount: articles.length };
  localStorage.setItem(usageKey, JSON.stringify(state.usage));
}

function formatDate(value) {
  if (!value) return "日付未確認";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium" }).format(date);
}

function attributionText(article) {
  if (!article.licenseName && !article.attribution) return "出典ページで一次情報を確認できます。";
  return `出典/ライセンス: ${article.attribution || article.source} / ${article.licenseName || "公式発表"}`;
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
