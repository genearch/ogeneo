(() => {
  "use strict";

  const CONFIG = {
    locationEndpoint: "https://ogeneo-location-api.y5xvsnh5vq.workers.dev/api/location",
    momentsEndpoint: "data/posts.json",
    fallbackHero: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85",
    avatarUrl: "",
    ownerInitials: "GA"
  };

  const state = { moments: [], location: null };
  const $ = (selector) => document.querySelector(selector);

  const els = {
    greeting: $("#greeting"), today: $("#today-label"), heroImage: $("#hero-image"),
    heroTitle: $("#hero-title"), heroNote: $("#hero-note"), heroLocation: $("#hero-location"),
    heroCondition: $("#hero-condition"), heroTime: $("#hero-local-time"), sidePlace: $("#side-place"),
    sideWeather: $("#side-weather"), sideTime: $("#side-time"), timeline: $("#timeline"),
    toast: $("#toast"), searchDialog: $("#search-dialog"), searchInput: $("#search-input"),
    searchResults: $("#search-results"), sidebar: $(".sidebar")
  };

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 2400);
  }

  function setGreeting() {
    const now = new Date();
    const hour = now.getHours();
    const word = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
    els.greeting.textContent = `Good ${word}.`;
    els.today.textContent = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(now);
  }

  function pick(obj, keys, fallback = "") {
    for (const key of keys) {
      const value = key.split(".").reduce((acc, part) => acc?.[part], obj);
      if (value !== undefined && value !== null && value !== "") return value;
    }
    return fallback;
  }

  function formatTemperature(value) {
    if (value === "" || value === null || value === undefined) return "";
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    const looksCelsius = n < 55;
    const c = looksCelsius ? n : (n - 32) * 5 / 9;
    const f = looksCelsius ? n * 9 / 5 + 32 : n;
    return `${Math.round(f)}°F / ${Math.round(c)}°C`;
  }

  function weatherIcon(condition) {
    const c = String(condition || "").toLowerCase();
    if (/thunder|storm/.test(c)) return "⛈";
    if (/snow/.test(c)) return "❄️";
    if (/rain|drizzle|shower/.test(c)) return "🌧";
    if (/fog|mist|haze/.test(c)) return "🌫";
    if (/cloud|overcast/.test(c)) return "☁️";
    if (/clear|sun/.test(c)) return "☀️";
    return "🌤";
  }

  function formatLocalTime(timeZone) {
    try {
      return new Intl.DateTimeFormat(undefined, { timeZone, weekday: "short", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date());
    } catch {
      return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date());
    }
  }

  async function fetchJSON(url, timeout = 9000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  function normalizeLocation(payload) {
    const root = payload?.data || payload || {};
    const city = pick(root, ["city", "location.city", "place.city", "name"], "Somewhere interesting");
    const region = pick(root, ["region", "state", "location.region", "place.region"], "");
    const country = pick(root, ["country", "countryName", "location.country", "place.country"], "");
    const title = [city, country].filter(Boolean).join(", ");
    const temperature = pick(root, ["temperature", "temp", "weather.temperature", "weather.temp", "weather.current.temperature"], "");
    const condition = pick(root, ["condition", "summary", "weather.condition", "weather.summary", "weather.current.condition"], "Weather unavailable");
    const timezone = pick(root, ["timezone", "timeZone", "location.timezone", "place.timezone"], Intl.DateTimeFormat().resolvedOptions().timeZone);
    const image = pick(root, ["image", "imageUrl", "heroImage", "photo", "location.image"], CONFIG.fallbackHero);
    const note = pick(root, ["note", "caption", "status", "headline", "location.note"], "Collecting the small details that make a place memorable.");
    return { city, region, country, title, temperature, condition, timezone, image, note };
  }

  async function loadLocation() {
    try {
      const payload = await fetchJSON(CONFIG.locationEndpoint);
      state.location = normalizeLocation(payload);
    } catch (error) {
      console.warn("Location API unavailable:", error);
      state.location = {
        city: "Pépieux", country: "France", title: "Pépieux, France", temperature: "",
        condition: "A quiet corner of the Minervois", timezone: "Europe/Paris",
        image: CONFIG.fallbackHero, note: "A fresh page in the south of France."
      };
    }
    renderLocation();
  }

  function renderLocation() {
    const loc = state.location;
    const temp = formatTemperature(loc.temperature);
    const time = formatLocalTime(loc.timezone);
    const icon = weatherIcon(loc.condition);
    els.heroImage.style.backgroundImage = `url("${loc.image}")`;
    els.heroTitle.textContent = loc.city || loc.title;
    els.heroNote.textContent = loc.note;
    els.heroLocation.textContent = `📍 ${loc.title}`;
    els.heroCondition.textContent = [icon, [temp, loc.condition].filter(Boolean).join(" · ")].filter(Boolean).join(" ");
    els.heroTime.textContent = time;
    els.sidePlace.textContent = loc.title;
    els.sideWeather.textContent = [icon, [temp, loc.condition].filter(Boolean).join(" · ")].filter(Boolean).join(" ");
    els.sideTime.textContent = time;
  }

  function normalizeMoments(payload) {
    const source = Array.isArray(payload) ? payload : payload?.posts || payload?.moments || payload?.items || [];
    return source.map((item, index) => {
      const type = String(pick(item, ["type", "kind", "contentType"], "moment")).toLowerCase();
      return {
        id: pick(item, ["id", "slug", "uuid"], `moment-${index}`),
        type: type.includes("experience") ? "experience" : "moment",
        title: pick(item, ["title", "headline", "caption"], "Untitled moment"),
        text: pick(item, ["text", "description", "note", "body"], ""),
        image: pick(item, ["image", "imageUrl", "url", "media.url", "cloudinaryUrl", "photo"], CONFIG.fallbackHero),
        date: pick(item, ["date", "createdAt", "timestamp", "takenAt", "datetime"], new Date().toISOString()),
        location: pick(item, ["location", "place", "locationName", "city"], ""),
        source: pick(item, ["source", "camera", "device"], ""),
        count: pick(item, ["count", "momentCount", "moments.length"], "")
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async function loadMoments() {
    try {
      const payload = await fetchJSON(CONFIG.momentsEndpoint);
      state.moments = normalizeMoments(payload);
    } catch (error) {
      console.warn("Moments file unavailable:", error);
      state.moments = demoMoments();
      showToast("Using sample moments until data/posts.json is available");
    }
    renderTimeline(state.moments);
  }

  function demoMoments() {
    return [
      { id: "m1", type: "moment", title: "Bonjour isn’t optional.", text: "The smallest customs often say the most about a place.", image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85", date: new Date().toISOString(), location: "Pépieux, France", source: "Meta Ray-Ban" },
      { id: "m2", type: "moment", title: "Hot dogs... in a jar.", text: "The grocery aisle produced a cultural plot twist.", image: "https://images.unsplash.com/photo-1606850246029-dd00bd5eff97?auto=format&fit=crop&w=1200&q=85", date: new Date(Date.now() - 86400000).toISOString(), location: "Lézignan-Corbières, France", source: "iPhone" },
      { id: "e1", type: "experience", title: "A first week in the Minervois", text: "Markets, wrong turns and a growing list of things worth remembering.", image: "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?auto=format&fit=crop&w=1400&q=85", date: new Date(Date.now() - 172800000).toISOString(), location: "Occitanie, France", count: 14 }
    ];
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[c]));
  }

  function dateBits(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return { day: "", detail: "" };
    return {
      day: new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date),
      detail: new Intl.DateTimeFormat(undefined, { weekday: "long", hour: "numeric", minute: "2-digit" }).format(date)
    };
  }

  function renderTimeline(items) {
    if (!items.length) {
      els.timeline.innerHTML = `<div class="loading-card"><h3>No moments yet.</h3><p>Your next upload will begin the journal.</p></div>`;
      return;
    }
    els.timeline.innerHTML = items.map(item => {
      const d = dateBits(item.date);
      const media = `style="background-image:url('${esc(item.image)}')"`;
      if (item.type === "experience") {
        return `<article class="timeline-item" data-search="${esc([item.title,item.text,item.location].join(" ").toLowerCase())}">
          <div class="experience-card" ${media}>
            <div class="experience-copy"><span class="eyebrow-rule"></span><p class="eyebrow light">Experience</p><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p><p>${esc(item.count ? `${item.count} moments · ` : "")}${esc(item.location)}</p><span class="experience-link">Continue reading →</span></div>
          </div></article>`;
      }
      return `<article class="timeline-item" data-search="${esc([item.title,item.text,item.location,item.source].join(" ").toLowerCase())}">
        <div class="moment-row">
          <span class="moment-row-dot"></span>
          <div class="moment-row-thumb" ${media} role="img" aria-label="${esc(item.title)}"></div>
          <div class="moment-row-body">
            <p class="moment-row-title">${esc(item.title)}</p>
            <div class="moment-row-meta"><span>${esc(item.location)}</span><span>${esc(item.source)}</span></div>
          </div>
          <time class="moment-row-time">${esc(d.day)}</time>
        </div></article>`;
    }).join("");
  }

  function runSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) { els.searchResults.innerHTML = ""; return; }
    const found = state.moments.filter(item => [item.title,item.text,item.location,item.source].join(" ").toLowerCase().includes(q)).slice(0, 12);
    els.searchResults.innerHTML = found.length ? found.map(item => `<div class="search-result"><strong>${esc(item.title)}</strong><span>${esc(item.location || item.text)}</span></div>`).join("") : `<p>No matching moments found.</p>`;
  }

  function wireUI() {
    $("#menu-button").addEventListener("click", () => els.sidebar.classList.toggle("open"));
    document.addEventListener("click", event => {
      if (window.innerWidth <= 900 && els.sidebar.classList.contains("open") && !els.sidebar.contains(event.target) && !event.target.closest("#menu-button")) els.sidebar.classList.remove("open");
    });
    $("#search-button").addEventListener("click", () => { els.searchDialog.showModal(); setTimeout(() => els.searchInput.focus(), 60); });
    els.searchInput.addEventListener("input", event => runSearch(event.target.value));
    $("#profile-button").addEventListener("click", () => showToast("Profile tools are coming in a future build."));
    $("#refresh-button").addEventListener("click", async () => { showToast("Refreshing journal…"); await Promise.all([loadLocation(), loadMoments()]); showToast("Journal refreshed"); });
    document.querySelectorAll(".side-nav a, .mobile-nav a").forEach(link => link.addEventListener("click", () => els.sidebar.classList.remove("open")));
  }

  function setupAvatar() {
    $("#avatar-initials").textContent = CONFIG.ownerInitials;
    if (!CONFIG.avatarUrl) return;
    const img = $("#avatar-image");
    img.src = CONFIG.avatarUrl;
    img.hidden = false;
    img.addEventListener("error", () => { img.hidden = true; });
  }

  async function init() {
    setGreeting();
    setupAvatar();
    wireUI();
    $("#build-stamp").textContent = `Built ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date())}`;
    await Promise.all([loadLocation(), loadMoments()]);
    setInterval(() => state.location && renderLocation(), 60000);
  }

  init().catch(error => { console.error(error); showToast("OgeneO hit a small snag while loading."); });
})();
