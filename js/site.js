const mosaic = document.querySelector("#mosaic");
const dialog = document.querySelector("#story-dialog");
const wanderDialog = document.querySelector("#wander-dialog");
const wanderTrigger = document.querySelector(".wander-trigger");

const LOCATION_API =
  "https://ogeneo-location-api.y5xvsnh5vq.workers.dev/api/location";

let currentWanderLocation = {
  city: "Camarillo",
  region: "California",
  country: "United States",
  timezone: "America/Los_Angeles",
  note: "Checking the map...",
  updatedAt: null
};

function formatLocation(location) {
  return [location.city, location.region]
    .filter(Boolean)
    .join(", ");
}

function formatUpdatedAt(value) {
  if (!value) return "Just now";

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

function updateWanderDetails() {
  const location = currentWanderLocation;
  const timezone = location.timezone || "UTC";
  const now = new Date();

  let time = "Unknown";
  let date = "Unknown";

  try {
    time = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit"
    }).format(now);

    date = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(now);
  } catch (error) {
    console.warn("Invalid timezone from location API:", timezone);
  }

  const locationEl = document.querySelector("[data-wander-location]");
  const countryEl = document.querySelector("[data-wander-country]");
  const noteEl = document.querySelector("[data-wander-note]");
  const timeEl = document.querySelector("[data-wander-time]");
  const dateEl = document.querySelector("[data-wander-date]");
  const updatedEl = document.querySelector("[data-wander-updated]");
  const mapEl = document.querySelector("[data-wander-map]");
  const mapLinkEl = document.querySelector("[data-wander-map-link]");
  const mapLabelEl = document.querySelector("[data-wander-map-label]");

  if (locationEl) locationEl.textContent = formatLocation(location);
  if (countryEl) countryEl.textContent = location.country || "";
  if (noteEl) noteEl.textContent = location.note || "Somewhere between here and there.";
  if (timeEl) timeEl.textContent = time;
  if (dateEl) dateEl.textContent = date;
  if (updatedEl) updatedEl.textContent = formatUpdatedAt(location.updatedAt);

  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    const query = `${latitude},${longitude}`;
    const latSpan = 0.16;
    const lonSpan = 0.22;
    const left = longitude - lonSpan;
    const bottom = latitude - latSpan;
    const right = longitude + lonSpan;
    const top = latitude + latSpan;

    const bbox = [left, bottom, right, top].join(",");
    const embedUrl =
      `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}` +
      `&layer=mapnik&marker=${encodeURIComponent(`${latitude},${longitude}`)}`;
    const openUrl =
      `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}` +
      `#map=11/${latitude}/${longitude}`;

    if (mapEl && mapEl.src !== embedUrl) mapEl.src = embedUrl;
    if (mapLinkEl) mapLinkEl.href = openUrl;
    if (mapLabelEl) {
      mapLabelEl.textContent = [location.city, location.region]
        .filter(Boolean)
        .join(", ");
    }
  }
}

async function loadWanderLocation() {
  try {
    const response = await fetch(LOCATION_API, { cache: "no-store" });
    if (!response.ok) throw new Error(`Location API returned ${response.status}`);

    const location = await response.json();

    currentWanderLocation = {
      city: location.city || "",
      region: location.region || "",
      country: location.country || "",
      timezone: location.timezone || "UTC",
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      note: location.note || "",
      updatedAt: location.updatedAt || null
    };
  } catch (error) {
    console.error("Could not load current location:", error);
    currentWanderLocation.note = "The compass is temporarily taking a coffee break.";
  }

  updateWanderDetails();
}

if (wanderTrigger && wanderDialog) {
  wanderTrigger.addEventListener("click", async () => {
    await loadWanderLocation();
    wanderDialog.showModal();
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
setInterval(updateWanderDetails, 30000);


function formatBuildStampTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short"
  }).format(date);
}

function updateBuildStamp() {
  const stamp = document.querySelector("#build-stamp");
  const servedEl = document.querySelector("[data-served-time]");
  if (!stamp || !servedEl) return;

  const buildUtc = stamp.dataset.buildUtc;
  const servedValue = document.lastModified;

  stamp.textContent =
    `v12 · built ${formatBuildStampTime(buildUtc)} · served ${formatBuildStampTime(servedValue)}`;
}

updateBuildStamp();
