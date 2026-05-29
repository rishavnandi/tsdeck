const API_BASE = window.API_BASE || (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:8787" : "");

let apps = [];
let selectedApps = new Set();

const els = {
  loading: document.getElementById("loading"),
  catalog: document.getElementById("catalog"),
  categories: document.getElementById("categories"),
  generateBtn: document.getElementById("generate-btn"),
  selectedCount: document.getElementById("selected-count"),
  result: document.getElementById("result"),
  warnings: document.getElementById("warnings"),
  curlCommand: document.getElementById("curl-command"),
  copyBtn: document.getElementById("copy-btn"),
  backBtn: document.getElementById("back-btn"),
  error: document.getElementById("error"),
  searchInput: document.getElementById("search-input"),
};

// Curated category display order — grouped by user intent
const CATEGORY_ORDER = [
  "media",
  "media-management",
  "downloads",
  "documents",
  "bookmarks",
  "productivity",
  "home",
  "automation",
  "files",
  "ai",
  "communication",
  "development",
  "dashboards",
  "infrastructure",
  "monitoring",
  "networking",
  "security",
  "backup",
  "gaming",
  "remote-access",
  "utilities",
];

// Human-friendly display names for category slugs
const CATEGORY_LABELS = {
  "media": "Media & Streaming",
  "media-management": "Media Management",
  "downloads": "Downloads",
  "documents": "Documents & Knowledge",
  "bookmarks": "Bookmarks & Read Later",
  "productivity": "Productivity & Tasks",
  "home": "Home & Lifestyle",
  "automation": "Home Automation",
  "files": "File Sharing & Sync",
  "ai": "AI & Search",
  "communication": "Communication",
  "development": "Development",
  "dashboards": "Dashboards",
  "infrastructure": "Infrastructure",
  "monitoring": "Monitoring",
  "networking": "Networking & DNS",
  "security": "Security & Auth",
  "backup": "Backup & Recovery",
  "gaming": "Gaming",
  "remote-access": "Remote Access",
  "utilities": "Utilities & Tools",
};

// Category icons (emoji) for visual distinction
const CATEGORY_ICONS = {
  "media": "🎬",
  "media-management": "📡",
  "downloads": "⬇️",
  "documents": "📝",
  "bookmarks": "🔖",
  "productivity": "✅",
  "home": "🏠",
  "automation": "🤖",
  "files": "📁",
  "ai": "🧠",
  "communication": "💬",
  "development": "💻",
  "dashboards": "📊",
  "infrastructure": "🔧",
  "monitoring": "📈",
  "networking": "🌐",
  "security": "🔒",
  "backup": "💾",
  "gaming": "🎮",
  "remote-access": "🖥️",
  "utilities": "🛠️",
};

async function init() {
  try {
    const res = await fetch(`${API_BASE}/apps`);
    if (!res.ok) throw new Error("Failed to load apps");
    apps = await res.json();
    renderCatalog();
    els.loading.classList.add("hidden");
    els.catalog.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    els.loading.classList.add("hidden");
    els.error.classList.remove("hidden");
  }
}

function renderCatalog(filter = "") {
  const filteredApps = filter
    ? apps.filter((app) =>
        app.name.toLowerCase().includes(filter) ||
        app.description.toLowerCase().includes(filter) ||
        app.category.toLowerCase().includes(filter)
      )
    : apps;

  const byCategory = filteredApps.reduce((acc, app) => {
    const cat = app.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(app);
    return acc;
  }, {});

  // Sort apps alphabetically within each category
  for (const cat of Object.keys(byCategory)) {
    byCategory[cat].sort((a, b) => a.name.localeCompare(b.name));
  }

  // Use curated order; any unknown categories go at the end alphabetically
  const knownCategories = CATEGORY_ORDER.filter((c) => byCategory[c]);
  const unknownCategories = Object.keys(byCategory)
    .filter((c) => !CATEGORY_ORDER.includes(c))
    .sort();
  const sortedCategories = [...knownCategories, ...unknownCategories];

  els.categories.innerHTML = "";

  for (const cat of sortedCategories) {
    const icon = CATEGORY_ICONS[cat] || "📦";
    const displayName = CATEGORY_LABELS[cat] || cat.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    const catDiv = document.createElement("div");
    catDiv.className = "category";
    catDiv.id = `cat-${cat}`;

    const heading = document.createElement("h3");
    heading.innerHTML = `<span class="cat-icon">${icon}</span> ${displayName} <span class="cat-count">${byCategory[cat].length}</span>`;
    catDiv.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "apps-grid";

    for (const app of byCategory[cat]) {
      const label = document.createElement("label");
      label.className = "app-card";
      label.dataset.id = app.id;
      if (selectedApps.has(app.id)) label.classList.add("selected");

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = app.id;
      cb.checked = selectedApps.has(app.id);
      label.appendChild(cb);

      const img = document.createElement("img");
      img.src = app.icon;
      img.alt = app.name;
      img.loading = "lazy";
      label.appendChild(img);

      const info = document.createElement("div");
      info.className = "app-info";

      const strong = document.createElement("strong");
      strong.textContent = app.name;
      info.appendChild(strong);

      const small = document.createElement("small");
      small.textContent = app.description;
      info.appendChild(small);

      label.appendChild(info);
      grid.appendChild(label);

      cb.addEventListener("change", () => {
        toggleApp(app.id, cb.checked);
      });
    }

    catDiv.appendChild(grid);
    els.categories.appendChild(catDiv);
  }

  // Show "no results" for empty search
  if (sortedCategories.length === 0 && filter) {
    const noResults = document.createElement("div");
    noResults.className = "no-results";
    noResults.textContent = `No apps match "${filter}"`;
    els.categories.appendChild(noResults);
  }
}

function toggleApp(id, checked) {
  const card = document.querySelector(`.app-card[data-id="${id}"]`);
  if (checked) {
    selectedApps.add(id);
    if (card) card.classList.add("selected");
  } else {
    selectedApps.delete(id);
    if (card) card.classList.remove("selected");
  }
  updateActions();
}

function updateActions() {
  const count = selectedApps.size;
  els.selectedCount.textContent = `${count} app${count !== 1 ? "s" : ""} selected`;
  els.generateBtn.disabled = count === 0;
}

// Search handler with debounce
let searchTimeout;
if (els.searchInput) {
  els.searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      renderCatalog(e.target.value.toLowerCase().trim());
    }, 200);
  });
}

els.generateBtn.addEventListener("click", async () => {
  if (selectedApps.size === 0) return;

  els.generateBtn.disabled = true;
  els.generateBtn.textContent = "Generating...";

  try {
    const res = await fetch(`${API_BASE}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apps: Array.from(selectedApps) }),
    });

    if (res.status === 429) {
      alert("Rate limit exceeded. Please wait a minute and try again.");
    } else if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to generate command. Please try again.");
    } else {
      const { url, warnings } = await res.json();
      els.curlCommand.textContent = `curl -fsSL ${url} | bash`;

      if (warnings && warnings.length > 0) {
        els.warnings.innerHTML = "";
        const ul = document.createElement("ul");
        for (const w of warnings) {
          const li = document.createElement("li");
          li.textContent = w;
          ul.appendChild(li);
        }
        els.warnings.appendChild(ul);
        els.warnings.classList.remove("hidden");
      } else {
        els.warnings.classList.add("hidden");
      }

      els.catalog.classList.add("hidden");
      els.result.classList.remove("hidden");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to generate command. Please try again.");
  } finally {
    els.generateBtn.disabled = false;
    els.generateBtn.textContent = "Generate Install Command";
  }
});

els.copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(els.curlCommand.textContent);
    els.copyBtn.textContent = "Copied!";
    setTimeout(() => (els.copyBtn.textContent = "Copy"), 1500);
  } catch {
    const range = document.createRange();
    range.selectNode(els.curlCommand);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    els.copyBtn.textContent = "Copied!";
    setTimeout(() => (els.copyBtn.textContent = "Copy"), 1500);
  }
});

els.backBtn.addEventListener("click", () => {
  els.result.classList.add("hidden");
  els.warnings.classList.add("hidden");
  els.catalog.classList.remove("hidden");
});

init();
