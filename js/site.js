const mosaic = document.querySelector("#mosaic");
const dialog = document.querySelector("#story-dialog");

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

document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());

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

updateLocalTime();
setInterval(updateLocalTime, 30000);
loadPosts();
