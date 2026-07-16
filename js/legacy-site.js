const mosaic = document.querySelector("#mosaic");
const dialog = document.querySelector("#story-dialog");
const wanderDialog = document.querySelector("#wander-dialog");
const wanderTrigger = document.querySelector("#wander-trigger");
const wanderInlineCard = document.querySelector("#wander-inline-card");

const LOCATION_API =
  "https://ogeneo-location-api.y5xvsnh5vq.workers.dev/api/location";

let currentWanderLocation = {
  city: "Camarillo",
  region: "California",
  country: "United States",
  timezone: "America/Los_Angeles",
  note: "The next entry is waiting.",
  updatedAt: null,
  weather: null,
  journey: null,
  recentStops: [],
  photoUrl: null
};

const countryFlags = {
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  "England": "🏴",
  "France": "🇫🇷",
  "Croatia": "🇭🇷",
  "Italy": "🇮🇹",
  "Spain": "🇪🇸",
  "Germany": "🇩🇪",
  "Canada": "🇨🇦",
  "Mexico": "🇲🇽"
};

const locationImages = {
  "camarillo|california|united states": "assets/locations/camarillo-vineyard-sunset.jpg",
  "ventura|california|united states": "assets/locations/ventura-pier.jpg"
};

function locationImageFor(location) {
  if (location.photoUrl) return location.photoUrl;

  const key = [location.city, location.region, location.country]
    .map(value => String(value || "").trim().toLowerCase())
    .join("|");

  return locationImages[key] || "assets/locations/travel-fallback.jpg";
}

function formatLocation(location) {
  return [location.city, location.region].filter(Boolean).join(", ");
}

function formatUpdatedAt(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  const days = Math.floor(seconds / 86400);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatClock(timeZone) {
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

function formatPhotoDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "Today";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function renderWorldTimes() {
  const ribbon = document.querySelector("[data-world-times]");
  if (!ribbon) return;

  const zones = [
    {
      label: currentWanderLocation.city || "Here",
      zone: currentWanderLocation.timezone || "UTC",
      icon: "📍",
      current: true
    },
    { label: "Los Angeles", zone: "America/Los_Angeles", icon: "🌴" },
    { label: "New York", zone: "America/New_York", icon: "🗽" },
    { label: "London", zone: "Europe/London", icon: "🇬🇧" }
  ];

  ribbon.innerHTML = zones.map(item => `
    <div class="world-time-item${item.current ? " current" : ""}">
      <span>${item.icon} ${escapeHtml(item.label)}</span>
      <strong>${formatClock(item.zone)}</strong>
    </div>
  `).join("");
}

function renderRecentStops() {
  const ribbon = document.querySelector("[data-recent-stops]");
  if (!ribbon) return;

  const stops = Array.isArray(currentWanderLocation.recentStops)
    ? currentWanderLocation.recentStops
    : [];

  if (!stops.length) {
    ribbon.innerHTML =
      '<span class="empty-stop">Your recent stops will appear after the next city change.</span>';
    return;
  }

  ribbon.innerHTML = stops.slice(0, 5).map(stop => `
    <div class="recent-stop">
      <strong>${countryFlags[stop.country] || "📍"} ${escapeHtml(stop.city || "Unknown")}</strong>
      <span>${formatUpdatedAt(stop.updatedAt)}</span>
    </div>
  `).join("");
}
function updateWanderDetails() {
  const location = currentWanderLocation;
  const weather = location.weather || {};
  const journey = location.journey || {};

  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  };

  setText("[data-wander-flag]", countryFlags[location.country] || "🌍");
  setText("[data-wander-country]", location.country || "");
  setText("[data-wander-location]", formatLocation(location));
  setText("[data-wander-note]",
    location.note || "Somewhere between here and there.");
  setText("[data-wander-time]", formatClock(location.timezone || "UTC"));
  setText("[data-wander-updated]", formatUpdatedAt(location.updatedAt));

  setText("[data-weather-icon]", weather.icon || "🌤️");
  setText(
    "[data-weather-temp]",
    Number.isFinite(weather.temperatureF) && Number.isFinite(weather.temperatureC)
      ? `${Math.round(weather.temperatureF)}°F / ${Math.round(weather.temperatureC)}°C`
      : "Weather unavailable"
  );
  setText("[data-weather-condition]", weather.condition || "");

  setText("[data-journey-title]",
    journey.status === "away" ? (journey.title || "On the road") : "Home");
  setText("[data-journey-day]",
    journey.status === "away"
      ? `Day ${journey.day || 1}`
      : "Between adventures");

  setText("[data-photo-place]", formatLocation(location));
  setText("[data-photo-date]", formatPhotoDate(location.updatedAt));

  const photo = document.querySelector("[data-wander-photo]");
  if (photo) {
    photo.src = locationImageFor(location);
  }


  setText("[data-inline-wander-location]", formatLocation(location));
  setText("[data-inline-wander-note]",
    location.note || "Somewhere between here and there.");
  setText("[data-inline-weather-icon]", weather.icon || "🌤️");
  setText(
    "[data-inline-weather-temp]",
    Number.isFinite(weather.temperatureF) && Number.isFinite(weather.temperatureC)
      ? `${Math.round(weather.temperatureF)}°F / ${Math.round(weather.temperatureC)}°C`
      : "Weather unavailable"
  );

  const inlinePhoto = document.querySelector("[data-inline-wander-photo]");
  if (inlinePhoto) {
    inlinePhoto.src = locationImageFor(location);
  }

  setText("[data-api-status]", "API healthy ●");
  renderWorldTimes();
  renderRecentStops();
}

async function loadWanderLocation() {
  try {
    const response = await fetch(LOCATION_API, { cache: "no-store" });
    if (!response.ok) throw new Error(`Location API returned ${response.status}`);
    currentWanderLocation = {
      ...currentWanderLocation,
      ...(await response.json())
    };
  } catch (error) {
    console.error("Could not load current location:", error);
    currentWanderLocation.note =
      "The compass is temporarily taking a coffee break.";
    const status = document.querySelector("[data-api-status]");
    if (status) status.textContent = "API unavailable";
  }
  updateWanderDetails();
}

async function openWanderDialog() {
  await loadWanderLocation();
  if (typeof wanderDialog.showModal === "function") {
    wanderDialog.showModal();
  } else {
    wanderDialog.setAttribute("open", "");
  }
}

if (wanderDialog) {
  wanderTrigger?.addEventListener("click", openWanderDialog);
  wanderInlineCard?.addEventListener("click", openWanderDialog);

  wanderDialog.querySelector(".dialog-close")?.addEventListener("click", () => {
    if (typeof wanderDialog.close === "function") wanderDialog.close();
    else wanderDialog.removeAttribute("open");
  });

  wanderDialog.addEventListener("click", event => {
    if (event.target !== wanderDialog) return;
    if (typeof wanderDialog.close === "function") wanderDialog.close();
    else wanderDialog.removeAttribute("open");
  });
}


function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadPosts() {
  try {
    const response = await fetch("data/posts.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load posts");
    let posts = await response.json();
    const featured = posts.filter(p=>p.featured);
    posts = (featured.length?featured:posts).slice(0,9);

    mosaic.innerHTML = posts.map((post, index) => {
      if (post.type === "quote") {
        return `
          <article class="card quote">
            <span class="quote-mark">“</span>
            <blockquote>${escapeHtml(post.quote)}</blockquote>
            <cite>— ${escapeHtml(post.cite)}</cite>
          </article>`;
      }

      return `
        <button class="card ${post.size}" type="button" data-index="${index}">
          <img src="${post.image}" alt="" loading="lazy">
          <span class="card-copy">
            <span class="card-kicker">${escapeHtml(post.kicker)}</span>
            <span class="card-title">${escapeHtml(post.title)}</span>
            <span class="card-date">${escapeHtml(post.date)}</span>
          </span>
        </button>`;
    }).join("");

    mosaic.querySelectorAll("[data-index]").forEach(card => {
      card.addEventListener("click", () => openStory(posts[Number(card.dataset.index)]));
    });
  } catch (error) {
    console.error(error);
    mosaic.innerHTML = "<p>Stories are temporarily unavailable.</p>";
  }
}

function openStory(post) {
  dialog.querySelector(".dialog-media").innerHTML =
    `<img src="${post.image}" alt="${escapeHtml(post.title)}">`;
  dialog.querySelector(".dialog-meta").textContent = `${post.kicker} · ${post.date}`;
  dialog.querySelector(".dialog-title").textContent = post.title;
  dialog.querySelector(".dialog-caption").textContent = post.caption;
  dialog.showModal();
}

function updateLocalTime() {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/London",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date());

  document.querySelectorAll("[data-local-time]").forEach(el => el.textContent = formatted);
}

document.querySelectorAll(".dialog-close").forEach(button => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

document.querySelector(".menu-button").addEventListener("click", event => {
  const nav = document.querySelector("#site-nav");
  const open = nav.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".mobile-tabbar a").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".mobile-tabbar a").forEach(item => item.classList.remove("active"));
    link.classList.add("active");
  });
});

loadPosts();
loadWanderLocation();
setInterval(() => {
  updateWanderDetails();
}, 30000);

function renderBuildStamp() {
  const stamp = document.querySelector("#build-stamp");
  if (!stamp) return;
  const date = new Date(stamp.dataset.buildUtc);
  if (Number.isNaN(date.getTime())) {
    stamp.textContent = "v30";
    return;
  }
  const formatted = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short"
  }).format(date);
  stamp.textContent = `v30 · published ${formatted}`;
}
renderBuildStamp();
