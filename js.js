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