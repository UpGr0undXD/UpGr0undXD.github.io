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