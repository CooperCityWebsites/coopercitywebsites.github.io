const list = document.querySelector("#list");
const search = document.querySelector("#search");
const count = document.querySelector("#count");
const empty = document.querySelector("#empty");
const tabs = document.querySelector("#tabs");
const kicker = document.querySelector("#kicker");
const lede = document.querySelector("#lede");
const searchLabel = document.querySelector("#search-label");
const sorts = {
  sites: document.querySelector('.sorts[data-for="sites"]'),
  mods: document.querySelector('.sorts[data-for="mods"]')
};

const copy = {
  sites: {
    kicker: "rainbowroar14.github.io",
    lede: "Complexity comes from non-blank lines of source code in each repo. Simple is under 1,000. Moderate is under 4,000. Complex is under 10,000. Very complex is 10,000 or more.",
    search: "Search by name or title",
    label: "Search sites",
    empty: "No sites match that search.",
    noun: "unblocked sites"
  },
  mods: {
    kicker: "1.21.1 NeoForge",
    lede: "Your NeoForge 1.21.1 mods, ready to download.",
    search: "Search mods",
    label: "Search mods",
    empty: "No mods match that search.",
    noun: "mods"
  },
  old: {
    kicker: "Old",
    lede: "Moved off the main page. These only show up here.",
    search: "Search old sites",
    label: "Search old sites",
    empty: "No old sites match that search.",
    noun: "old sites"
  },
  trash: {
    kicker: "Trash",
    lede: "Moved off the main page. These only show up here.",
    search: "Search trash",
    label: "Search trash",
    empty: "Nothing in the trash matches that search.",
    noun: "in the trash"
  }
};

let sites = [];
let mods = [];
let tab = "sites";
let sort = { sites: "lines", old: "lines", mods: "name" };

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function formatDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatSize(bytes) {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function rate(lines) {
  if (lines >= 10000) return { id: "very", label: "Very complex" };
  if (lines >= 4000) return { id: "complex", label: "Complex" };
  if (lines >= 1000) return { id: "moderate", label: "Moderate" };
  return { id: "simple", label: "Simple" };
}

function siteMatches(site, query) {
  if (!query) return true;
  const complexity = rate(site.lines);
  return `${site.title} ${site.name} ${complexity.label}`.toLowerCase().includes(query);
}

function modMatches(mod, query) {
  if (!query) return true;
  return `${mod.name} ${mod.version}`.toLowerCase().includes(query);
}

function siteCard(site) {
  const label = site.trash ? "Trash" : site.old ? "Old" : site.group === "unblocked" ? "Unblocked" : "Project";
  const tagClass = site.trash ? "trash" : site.old ? "old" : site.group;
  const complexity = rate(site.lines);
  return `<li class="card">
    <a class="site" href="${escapeHtml(site.url)}" target="_blank" rel="noreferrer">
      <span class="tags">
        <span class="tag ${tagClass}">${label}</span>
        <span class="tag ${complexity.id}">${complexity.label}</span>
      </span>
      <h2 class="title">${escapeHtml(site.title)}</h2>
      <p class="path">${escapeHtml(site.name)}</p>
      <p class="meta">
        <span>${site.lines.toLocaleString("en-US")} lines</span>
        <span class="repo">Open</span>
      </p>
    </a>
  </li>`;
}

function modCard(mod) {
  const href = `downloads/${encodeURIComponent(mod.file)}`;
  return `<li class="card">
    <a class="site" href="${href}" download="${escapeHtml(mod.file)}">
      <span class="tags">
        <span class="tag ${mod.trash ? "trash" : "unblocked"}">${mod.trash ? "Trash" : "1.21.1 NeoForge"}</span>
      </span>
      <h2 class="title">${escapeHtml(mod.name)}</h2>
      <p class="path">${escapeHtml(mod.version)}</p>
      <p class="meta">
        <span>${formatSize(mod.bytes)}</span>
        <span class="repo">Download</span>
      </p>
    </a>
  </li>`;
}

function trashItems() {
  return [
    ...sites.filter((site) => site.trash).map((site) => ({ kind: "site", name: site.title, site })),
    ...mods.filter((mod) => mod.trash).map((mod) => ({ kind: "mod", name: mod.name, mod }))
  ];
}

function render() {
  const query = search.value.trim().toLowerCase();
  let shown;
  let total;
  if (tab === "sites" || tab === "old") {
    const source = sites.filter((site) => !site.trash && (tab === "old" ? site.old : !site.old));
    shown = source.filter((site) => siteMatches(site, query));
    shown.sort((a, b) => sort[tab] === "lines" ? b.lines - a.lines : b.updated.localeCompare(a.updated));
    total = source.length;
    list.innerHTML = shown.map(siteCard).join("");
  } else if (tab === "mods") {
    const source = mods.filter((mod) => !mod.trash);
    shown = source.filter((mod) => modMatches(mod, query));
    shown.sort((a, b) => sort.mods === "size" ? b.bytes - a.bytes : a.name.localeCompare(b.name, "en"));
    total = source.length;
    list.innerHTML = shown.map(modCard).join("");
  } else {
    const source = trashItems();
    shown = source.filter((item) => item.name.toLowerCase().includes(query));
    shown.sort((a, b) => a.name.localeCompare(b.name, "en"));
    total = source.length;
    list.innerHTML = shown.map((item) => item.kind === "site" ? siteCard(item.site) : modCard(item.mod)).join("");
  }
  const noun = copy[tab].noun;
  count.textContent = shown.length === total
    ? `${total} ${noun}`
    : `${shown.length} of ${total} ${noun}`;
  empty.hidden = shown.length !== 0;
  empty.textContent = copy[tab].empty;
}

function showTab(next) {
  tab = next;
  kicker.textContent = copy[tab].kicker;
  lede.textContent = copy[tab].lede;
  search.placeholder = copy[tab].search;
  searchLabel.textContent = copy[tab].label;
  for (const button of tabs.querySelectorAll("button")) {
    button.setAttribute("aria-selected", String(button.dataset.tab === tab));
  }
  sorts.sites.hidden = tab !== "sites" && tab !== "old";
  sorts.mods.hidden = tab !== "mods";
  render();
}

search.addEventListener("input", render);

tabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-tab]");
  if (!button || button.dataset.tab === tab) return;
  search.value = "";
  showTab(button.dataset.tab);
});

for (const [name, group] of Object.entries(sorts)) {
  group.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-sort]");
    if (!button) return;
    sort[name] = button.dataset.sort;
    if (name === "sites") sort.old = button.dataset.sort;
    for (const item of group.querySelectorAll("button")) {
      item.setAttribute("aria-pressed", String(item === button));
    }
    render();
  });
}

Promise.all([
  fetch("sites.json").then((response) => {
    if (!response.ok) throw new Error("Could not load sites");
    return response.json();
  }),
  fetch("mods.json").then((response) => {
    if (!response.ok) throw new Error("Could not load mods");
    return response.json();
  })
])
  .then(([siteData, modData]) => {
    sites = siteData;
    mods = modData;
    render();
  })
  .catch(() => {
    count.textContent = "Couldn’t load the list.";
  });
