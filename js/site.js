const mosaic = document.querySelector("#mosaic");
const storyDialog = document.querySelector("#story-dialog");
const locationDialog = document.querySelector("#location-dialog");

async function loadStories() {
  try {
    const response = await fetch("data/posts.json");
    if (!response.ok) throw new Error("Could not load posts");
    const posts = await response.json();
    renderStories(posts);
  } catch (error) {
    mosaic.innerHTML = `<p>Stories are temporarily hiding under the bed.</p>`;
    console.error(error);
  }
}

function renderStories(posts) {
  mosaic.innerHTML = posts.map((post, index) => {
    if (post.type === "quote") {
      return `
        <article class="story-card quote" aria-label="${escapeHtml(post.location)}">
          <div class="quote-inner">
            <blockquote>“${escapeHtml(post.quote)}”</blockquote>
            <p>${escapeHtml(post.location)}</p>
          </div>
        </article>`;
    }

    return `
      <button class="story-card ${post.size}" type="button" data-story-index="${index}">
        <img src="${post.image}" alt="" loading="lazy">
        <span class="story-overlay">
          <span class="story-meta">
            <span>${escapeHtml(post.location)}</span>
            <span>${escapeHtml(post.date)}</span>
          </span>
          <span class="story-title">${escapeHtml(post.title)}</span>
        </span>
      </button>`;
  }).join("");

  mosaic.querySelectorAll("[data-story-index]").forEach(card => {
    card.addEventListener("click", () => openStory(posts[Number(card.dataset.storyIndex)]));
  });
}

function openStory(post) {
  storyDialog.querySelector(".dialog-media").innerHTML =
    `<img src="${post.image}" alt="${escapeHtml(post.title)}">`;
  storyDialog.querySelector(".dialog-meta").textContent = `${post.location} · ${post.date}`;
  storyDialog.querySelector(".dialog-title").textContent = post.title;
  storyDialog.querySelector(".dialog-caption").textContent = post.caption;
  storyDialog.showModal();
}

function updateYorkTime() {
  const now = new Date();
  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "numeric",
    minute: "2-digit",
    weekday: "long"
  }).format(now);

  document.querySelector("[data-local-time]").textContent = `${formatted} local time`;
  document.querySelector("[data-popup-time]").textContent = formatted;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.querySelectorAll(".dialog-close").forEach(button => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

document.querySelector("[data-location-trigger]").addEventListener("click", () => {
  locationDialog.showModal();
});

document.querySelector(".menu-button").addEventListener("click", event => {
  const nav = document.querySelector("#site-nav");
  const isOpen = nav.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".site-nav a").forEach(link => {
  link.addEventListener("click", () => document.querySelector("#site-nav").classList.remove("open"));
});

updateYorkTime();
setInterval(updateYorkTime, 30000);
loadStories();
