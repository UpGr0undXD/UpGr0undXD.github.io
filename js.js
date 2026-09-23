/* =========================
   THEME TOGGLE
========================= */

const themeToggle = document.getElementById("theme-toggle");


// Load saved theme
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☾";
}


// Toggle theme
themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    localStorage.setItem(
        "theme",
        isDark ? "dark" : "light"
    );

    themeToggle.textContent =
        isDark ? "☾" : "☼";
});


/* =========================
   TYPING EFFECT
========================= */

const typingElement =
    document.getElementById("typing");

const phrases = [
    "explore.",
    "learn.",
    "build.",
    "think.",
    "repeat."
];

let phraseIndex = 0;
let characterIndex = 0;
let deleting = false;


function typeEffect() {

    const currentPhrase =
        phrases[phraseIndex];

    if (!deleting) {

        typingElement.textContent =
            currentPhrase.substring(
                0,
                characterIndex + 1
            );

        characterIndex++;

        if (
            characterIndex ===
            currentPhrase.length
        ) {

            deleting = true;

            setTimeout(
                typeEffect,
                1200
            );

            return;
        }

    } else {

        typingElement.textContent =
            currentPhrase.substring(
                0,
                characterIndex - 1
            );

        characterIndex--;

        if (characterIndex === 0) {

            deleting = false;

            phraseIndex =
                (phraseIndex + 1) %
                phrases.length;

        }
    }

    const speed =
        deleting ? 60 : 100;

    setTimeout(
        typeEffect,
        speed
    );
}


typeEffect();


/* =========================
   CURRENT YEAR
========================= */

const yearElement =
    document.getElementById("year");

yearElement.textContent =
    new Date().getFullYear();


/* =========================
   DYNAMIC NOTES (fetch + expand)
========================= */

const notesListEl = document.getElementById("notes-list");
const notesToggle = document.getElementById("notes-toggle");
let notesData = [];
let showingAll = false;
const initialNotesCount = 3;

async function loadNotes() {
    try {
        const res = await fetch('./article/article.json');
        if (!res.ok) throw new Error('Failed to fetch articles');
        notesData = await res.json();
        renderNotes();
    } catch (err) {
        console.error('loadNotes error', err);
    }
}

function renderNotes() {
    if (!notesListEl) return;

    const count = showingAll ? notesData.length : Math.min(initialNotesCount, notesData.length);
    notesListEl.innerHTML = '';

    notesData.slice(0, count).forEach((article) => {
        const articleEl = document.createElement('article');
        articleEl.className = 'note-card reveal';

        const noteMain = document.createElement('div');
        noteMain.className = 'note-main';

        const titleEl = document.createElement('h3');
        titleEl.textContent = article.title;

        const quoteEl = document.createElement('blockquote');
        quoteEl.className = 'note-quote';
        quoteEl.textContent = article.excerpt || '';

        const descEl = document.createElement('p');
        descEl.textContent = article.description;

        noteMain.appendChild(titleEl);
        if (article.excerpt) noteMain.appendChild(quoteEl);
        noteMain.appendChild(descEl);

        const dateEl = document.createElement('span');
        dateEl.className = 'note-date';
        dateEl.textContent = article.date;

        const linkEl = document.createElement('a');
        linkEl.href = article.url;
        linkEl.textContent = 'Read article →';

        articleEl.appendChild(dateEl);
        articleEl.appendChild(noteMain);
        articleEl.appendChild(linkEl);

        notesListEl.appendChild(articleEl);

        // If IntersectionObserver exists, observe the new element for reveal
        if (typeof observer !== 'undefined') {
            observer.observe(articleEl);
        }
    });

    if (!notesToggle) return;

    if (notesData.length <= initialNotesCount) {
        notesToggle.style.display = 'none';
    } else {
        notesToggle.style.display = 'inline-flex';
        notesToggle.textContent = showingAll ? '收起' : `更多文章 (${notesData.length - initialNotesCount})`;
        notesToggle.setAttribute('aria-expanded', String(showingAll));
    }
}

if (notesToggle) {
    notesToggle.addEventListener('click', () => {
        showingAll = !showingAll;
        renderNotes();
        // focus first newly revealed item for accessibility when expanding
        if (showingAll) {
            const firstExtra = notesListEl.querySelector('.note-card:nth-child(' + (initialNotesCount + 1) + ')');
            if (firstExtra) firstExtra.querySelector('a')?.focus();
        }
    });
}

loadNotes();


/* =========================
   SCROLL REVEAL
========================= */

const elementsToReveal =
    document.querySelectorAll(
        ".section, .project-card, .note-card, .fact-card"
    );


elementsToReveal.forEach(
    (element) => {
        element.classList.add("reveal");
    }
);


const observer =
    new IntersectionObserver(
        (entries) => {

            entries.forEach(
                (entry) => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "visible"
                        );

                    }

                }
            );

        },
        {
            threshold: 0.12
        }
    );


elementsToReveal.forEach(
    (element) => {
        observer.observe(element);
    }
);


/* =========================
   SMOOTH NAVIGATION
========================= */

const navLinks =
    document.querySelectorAll(
        'a[href^="#"]'
    );


navLinks.forEach(
    (link) => {

        link.addEventListener(
            "click",
            (event) => {

                const targetId =
                    link.getAttribute("href");

                if (
                    targetId === "#"
                ) {
                    return;
                }

                const target =
                    document.querySelector(
                        targetId
                    );

                if (!target) {
                    return;
                }

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    }
);


/* =========================
   DYNAMIC MUSIC LIST
========================= */

const musicListEl = document.getElementById("music-collapsible");
const musicFeaturedEl = document.getElementById("music-featured-list");
const musicToggle = document.querySelector(".music-toggle");

let musicData = [];
let showingAllMusic = false;
const initialMusicCount = 3;

function formatDescription(text = "") {
    return String(text).replace(/\n/g, "<br>");
}

function formatVideoUrl(url = "") {
    return String(url).replace("watch?v=", "embed/");
}

async function loadMusic() {
    try {
        const res = await fetch("./music/music.json");
        if (!res.ok) throw new Error("Failed to fetch music data");

        musicData = await res.json();
        renderFeaturedMusic();
        renderMusic();
    } catch (err) {
        console.error("loadMusic error", err);
    }
}

function renderFeaturedMusic() {
    if (!musicFeaturedEl) return;

    const featured = musicData.filter((item) => item.featured);
    musicFeaturedEl.innerHTML = "";

    featured.forEach((item) => {
        const card = document.createElement("div");
        card.className = "music-featured reveal";

        card.innerHTML = `
            <div class="music-featured-copy">
                <p class="music-kicker">Representative work</p>
                <h3>${item.title}</h3>
                <p>
                    ${item.subtitle || ""}
                    ${item.subtitle ? "<br>" : ""}
                    ${formatDescription(item.description)}
                </p>
                <div class="project-tags">
                    ${item.tags.map((tag) => `<span>${tag}</span>`).join("")}
                </div>
                <div class="music-actions">
                    <a href="${item.video}" target="_blank" class="button button-primary">
                        Watch performance ↗
                    </a>
                    ${item.pdf ? `<a href="${item.pdf}" target="_blank" class="button button-secondary">Open score PDF ↗</a>` : ""}
                </div>
            </div>
            <div class="music-featured-media">
                <iframe
                    width="560"
                    height="315"
                    src="${formatVideoUrl(item.video)}"
                    title="YouTube video player"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen>
                </iframe>
            </div>
        `;

        musicFeaturedEl.appendChild(card);

        if (typeof observer !== "undefined") {
            observer.observe(card);
        }
    });
}

function renderMusic() {
    if (!musicListEl) return;

    const extraItems = musicData.filter((item) => !item.featured);
    const count = showingAllMusic ? extraItems.length : Math.min(initialMusicCount, extraItems.length);

    musicListEl.innerHTML = "";

    extraItems.slice(0, count).forEach((item) => {
        const article = document.createElement("article");
        article.className = "music-work-item reveal";

        article.innerHTML = `
            <div class="music-work-media">
                <iframe
                    width="560"
                    height="315"
                    src="${formatVideoUrl(item.video)}"
                    title="YouTube video player"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen>
                </iframe>
            </div>

            <div class="music-work-content">
                <div class="music-work-number">${item.number || "0"}</div>
                <h3>${item.title}</h3>
                <p>
                    ${item.subtitle || ""}
                    ${item.subtitle ? "<br>" : ""}
                    ${formatDescription(item.description)}
                </p>

                <div class="project-tags">
                    ${item.tags.map((tag) => `<span>${tag}</span>`).join("")}
                </div>

                <div class="music-actions compact">
                    <a href="${item.video}" target="_blank">Video ↗</a>
                    ${item.pdf ? `<a href="${item.pdf}" target="_blank">PDF score ↗</a>` : ""}
                </div>
            </div>
        `;

        musicListEl.appendChild(article);

        if (typeof observer !== "undefined") {
            observer.observe(article);
        }
    });

    if (musicToggle) {
        const totalExtra = extraItems.length;
        musicToggle.style.display = totalExtra <= initialMusicCount ? "none" : "inline-flex";
        musicToggle.textContent = showingAllMusic ? "收起作品" : "展开更多作品";
        musicToggle.setAttribute("aria-expanded", String(showingAllMusic));
    }
}

if (musicToggle) {
  musicToggle.addEventListener("click", () => {
    showingAllMusic = !showingAllMusic;
    renderMusic();
  });
}

renderFeaturedMusic();
loadMusic();