const LOCATION_API = "https://ogeneo-location-api.y5xvsnh5vq.workers.dev/api/location";

const FALLBACK_LOCATION = {
  city: "Camarillo",
  region: "California",
  country: "United States",
  timezone: "America/Los_Angeles",
  note: "The next entry is waiting.",
  updatedAt: null,
  weather: null,
  photoUrl: null
};

const fallbackFeed = [
  {
    type: "moment",
    title: "Hot dogs... in a jar.",
    caption: "Sometimes the little things make me smile.",
    place: "Pépieux, France",
    date: "Today",
    time: "8:47 AM",
    source: "meta",
    image: "https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?auto=format&fit=crop&w=800&q=85"
  },
  {
    type: "moment",
    title: "Bonjour isn't optional.",
    caption: "A friendly reminder in case you forget.",
    place: "Pépieux, France",
    date: "Today",
    time: "8:16 AM",
    source: "meta",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=85"
  },
  {
    type: "moment",
    title: "Can't park there.",
    caption: "I mean... technically they never said I couldn't.",
    place: "Minerve, France",
    date: "Today",
    time: "7:52 AM",
    source: "camera",
    image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=85"
  },
  {
    type: "experience",
    title: "Carcassonne Festival 2025",
    caption: "A week of music, medieval streets, and unforgettable nights.",
    date: "Jul 7 – Jul 13, 2025",
    count: 24,
    image: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?auto=format&fit=crop&w=1600&q=88"
  },
  {
    type: "moment",
    title: "Now this was worth the detour.",
    caption: "Golden hour in Minerve.",
    place: "Minerve, France",
    date: "Yesterday",
    time: "8:21 PM",
    source: "meta",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=85"
  },
  {
    type: "moment",
    title: "Morning market before the crowds.",
    caption: "Fresh figs, local cheese, and great people.",
    place: "Pépieux, France",
    date: "Yesterday",
    time: "11:03 AM",
    source: "meta",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=85"
  },
  {
    type: "experience",
    title: "Road Trip Through Provence",
    caption: "Sunflowers, hill towns, lavender fields, and a car full of good ideas.",
    date: "Jul 5 – Jul 12, 2025",
    count: 42,
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=88"
  }
];

const dialog = document.querySelector("#story-dialog");
let currentLocation = { ...FALLBACK_LOCATION };

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setAll(selector, value) {
  document.querySelectorAll(selector).forEach(el => {
    el.textContent = value;
  });
}

function formatLocation(location) {
  return [location.city, location.region].filter(Boolean).join(", ") || location.country || "Somewhere worth finding";
}

function formatTime(timeZone) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date());
  } catch {
    return "--:--";
  }
}

function shortZone(timeZone) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short"
    }).formatToParts(new Date());
    return parts.find(part => part.type === "timeZoneName")?.value || "";
  } catch {
    return "";
  }
}

function updateGreeting() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning." : hour < 18 ? "Good afternoon." : "Good evening.";
  setAll("[data-greeting]", greeting);
}

function renderLocation() {
  const weather = currentLocation.weather || {};
  const location = formatLocation(currentLocation);
  const time = formatTime(currentLocation.timezone || "UTC");
  const zone = shortZone(currentLocation.timezone || "UTC");
  const hasTemps = Number.isFinite(weather.temperatureF) && Number.isFinite(weather.temperatureC);
  const temp = hasTemps
    ? `${Math.round(weather.temperatureF)}°F / ${Math.round(weather.temperatureC)}°C`
    : "Weather unavailable";

  setAll("[data-wander-location]", location);
  setAll("[data-wander-note]", currentLocation.note || "Somewhere between here and there.");
  setAll("[data-wander-time]", time);
  setAll("[data-wander-zone]", zone);
  setAll("[data-weather-icon]", weather.icon || "☀︎");
  setAll("[data-weather-temp]", temp);
  setAll("[data-weather-condition]", weather.condition || "");

  document.querySelectorAll("[data-wander-photo]").forEach(img => {
    img.src = currentLocation.photoUrl || "assets/locations/travel-fallback.jpg";
  });
}

async function loadLocation() {
  try {
    const response = await fetch(LOCATION_API, { cache: "no-store" });
    if (!response.ok) throw new Error(`Location API returned ${response.status}`);
    currentLocation = { ...currentLocation, ...(await response.json()) };
  } catch (error) {
    console.warn("Using fallback location:", error);
  }
  renderLocation();
}

function normalizePost(post) {
  if (post.type === "experience") return post;
  return {
    type: post.type === "quote" ? "moment" : "moment",
    title: post.title || post.quote || "Untitled moment",
    caption: post.caption || "",
    place: post.place || post.location || post.kicker || "",
    date: post.date || "Recently",
    time: post.time || "",
    source: post.source || "camera",
    image: post.image || "assets/locations/travel-fallback.jpg"
  };
}

async function loadFeed() {
  let feed = fallbackFeed;
  try {
    const response = await fetch("data/posts.json", { cache: "no-store" });
    if (response.ok) {
      const posts = await response.json();
      if (Array.isArray(posts) && posts.length) {
        feed = posts.map(normalizePost);
      }
    }
  } catch {
    // The fallback feed keeps the page complete until the live data source is present.
  }
  renderFeed(feed);
}

function iconForSource(source) {
  return source === "meta" ? '<span class="meta-glyph" title="Captured with Meta glasses">⌁</span>' : '<span class="camera-glyph" title="Camera">▣</span>';
}

function renderFeed(items) {
  const feed = document.querySelector("#journal-feed");
  feed.innerHTML = items.map((item, index) => {
    if (item.type === "experience") {
      return `
        <article class="stream-item experience-row" id="${index === 3 ? "experiences" : ""}">
          <div class="timeline-date"><strong>${escapeHtml(item.date || "")}</strong></div>
          <button class="experience-card" type="button" data-index="${index}">
            <img src="${escapeHtml(item.image)}" alt="" loading="lazy">
            <span class="experience-shade"></span>
            <span class="experience-copy">
              <small>Experience</small>
              <strong>${escapeHtml(item.title)}</strong>
              <em>${escapeHtml(item.caption || "")}</em>
              <span>${Number(item.count) || 0} moments <b>Open experience →</b></span>
            </span>
          </button>
        </article>`;
    }

    return `
      <article class="stream-item moment-row">
        <div class="timeline-date"><strong>${escapeHtml(item.date || "")}</strong><span>${escapeHtml(item.time || "")}</span></div>
        <button class="moment-card" type="button" data-index="${index}">
          <img src="${escapeHtml(item.image)}" alt="" loading="lazy">
          <span class="moment-copy">
            <strong>${iconForSource(item.source)} ${escapeHtml(item.title)}</strong>
            <em>${escapeHtml(item.caption || "")}</em>
            <small>⌖ ${escapeHtml(item.place || "")}</small>
          </span>
          <span class="more">•••</span>
        </button>
      </article>`;
  }).join("");

  feed.querySelectorAll("[data-index]").forEach(button => {
    button.addEventListener("click", () => openStory(items[Number(button.dataset.index)]));
  });
}

function openStory(item) {
  if (!dialog) return;
  dialog.querySelector(".dialog-media").innerHTML = `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}">`;
  dialog.querySelector(".dialog-meta").textContent = item.type === "experience" ? `${item.count || 0} moments · ${item.date || ""}` : `${item.place || ""} · ${item.date || ""}`;
  dialog.querySelector(".dialog-title").textContent = item.title || "";
  dialog.querySelector(".dialog-caption").textContent = item.caption || "";
  dialog.showModal();
}

function bindNavigation() {
  const menu = document.querySelector(".mobile-menu");
  const sidebar = document.querySelector(".sidebar");
  menu?.addEventListener("click", () => {
    const open = sidebar.classList.toggle("open");
    menu.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll(".side-nav a, .mobile-tabbar a").forEach(link => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".side-nav a, .mobile-tabbar a").forEach(item => item.classList.remove("active"));
      link.classList.add("active");
      sidebar.classList.remove("open");
      menu?.setAttribute("aria-expanded", "false");
    });
  });

  dialog?.querySelector(".dialog-close")?.addEventListener("click", () => dialog.close());
  dialog?.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
}

updateGreeting();
renderLocation();
loadLocation();
loadFeed();
bindNavigation();
setInterval(renderLocation, 30000);
