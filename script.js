/* ===== 1. ELEMENTS ===== */
const menuIcon = document.querySelector("#menu-icon");
const navbar = document.querySelector("#navbar");
const navLinks = document.querySelectorAll(".navbar a");
const sections = document.querySelectorAll("main section[id]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ===== 2. MOBILE MENU ===== */
function setMenu(open) {
    navbar.classList.toggle("open", open);
    menuIcon.setAttribute("aria-expanded", String(open));
    menuIcon.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    menuIcon.innerHTML = `<i class="bx ${open ? "bx-x" : "bx-menu"}"></i>`;
}

menuIcon.addEventListener("click", () => setMenu(!navbar.classList.contains("open")));

document.addEventListener("click", e => {
    if (navbar.classList.contains("open") && !navbar.contains(e.target) && !menuIcon.contains(e.target)) setMenu(false);
});

document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
window.addEventListener("resize", () => { if (window.innerWidth > 1000) setMenu(false); });

/* ===== 3. SECTION NAVIGATION ===== */
const ids = [...sections].map(s => s.id);

// Stagger delay for the cards on each page
sections.forEach(s => s.querySelectorAll(".card").forEach((c, i) => c.style.setProperty("--i", i)));

function showSection(id, updateURL = true) {
    const target = document.getElementById(id);
    if (!target || !ids.includes(id)) return;

    sections.forEach(s => {
        const active = s === target;
        s.classList.toggle("active", active);
        s.setAttribute("aria-hidden", String(!active));
    });

    navLinks.forEach(link => {
        const active = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("active", active);
        active ? link.setAttribute("aria-current", "page") : link.removeAttribute("aria-current");
    });

    // Show "Back to Home" everywhere except on Home
    document.body.dataset.page = id;

    setMenu(false);
    target.scrollTop = 0;
    document.title = `${id === "home" ? "Jarren Role" : target.querySelector("h2")?.textContent} | Portfolio`;

    if (updateURL && location.hash !== `#${id}`) history.pushState({ id }, "", `#${id}`);
}

document.addEventListener("click", e => {
    const link = e.target.closest('a[href^="#"]');
    const id = link?.getAttribute("href").slice(1);
    if (!id || !ids.includes(id)) return;
    e.preventDefault();
    showSection(id);
});

window.addEventListener("popstate", () => showSection(location.hash.slice(1) || "home", false));

// Left / right arrow keys move between sections
document.addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const current = ids.indexOf(document.querySelector("main section.active")?.id);
    const next = current + (e.key === "ArrowRight" ? 1 : -1);
    if (next >= 0 && next < ids.length) showSection(ids[next]);
});

showSection(location.hash.slice(1) || "home", false);

// Swipe left / right on touch screens to change pages
let touchX = 0, touchY = 0;
const viewport = document.querySelector("main");

viewport.addEventListener("touchstart", e => {
    touchX = e.changedTouches[0].clientX;
    touchY = e.changedTouches[0].clientY;
}, { passive: true });

viewport.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) < 70 || Math.abs(dy) > 50) return;
    const current = ids.indexOf(document.querySelector("main section.active")?.id);
    const next = current + (dx < 0 ? 1 : -1);
    if (next >= 0 && next < ids.length) showSection(ids[next]);
}, { passive: true });

// If the profile photo is missing, show initials instead of a broken image
const profileImg = document.querySelector(".image-ring img");
if (profileImg) {
    const useFallback = () => {
        profileImg.src = "data:image/svg+xml;utf8," + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#17090D"/>' +
            '<text x="50%" y="58%" font-family="Poppins,sans-serif" font-size="74" font-weight="800" fill="#E50935" text-anchor="middle">JR</text></svg>'
        );
    };
    // The error may already have happened before this script ran
    if (profileImg.complete && profileImg.naturalWidth === 0) useFallback();
    else profileImg.addEventListener("error", useFallback, { once: true });
}

/* ===== 4. TYPING ANIMATION ===== */
const typingEl = document.querySelector(".multiple-text");
const roles = ["IT Student", "Future Programmer", "Web Developer", "Network Enthusiast", "Future Cybersecurity Architect"];
let roleIndex = 0, charIndex = 0, deleting = false;

function typeRole() {
    if (!typingEl) return;
    if (reduceMotion.matches) { typingEl.textContent = roles[0]; return; }

    const role = roles[roleIndex];
    charIndex += deleting ? -1 : 1;
    typingEl.textContent = role.slice(0, charIndex);

    let delay = deleting ? 45 : 85;

    if (!deleting && charIndex === role.length) { deleting = true; delay = 1800; }
    else if (deleting && charIndex === 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; delay = 400; }

    setTimeout(typeRole, delay);
}
typeRole();

/* ===== 5. PARTICLES ===== */
const canvas = document.querySelector("#particles-bg");

if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [], w = 0, h = 0, frame = null;
    const mouse = { x: -999, y: -999 };
    window.addEventListener("pointermove", e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener("pointerleave", () => { mouse.x = mouse.y = -999; });

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = window.innerWidth; h = window.innerHeight;
        canvas.width = w * dpr; canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const count = Math.min(65, Math.floor(w / 17));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            r: Math.random() * 2 + .6,
            vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45,
            a: Math.random() * .55 + .2
        }));
        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        // Very small red glow following the cursor
        if (mouse.x >= 0 && mouse.y >= 0) {
            const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 20);
            glow.addColorStop(0, "rgba(229, 9, 53, 0.20)");
            glow.addColorStop(0.5, "rgba(229, 9, 53, 0.07)");
            glow.addColorStop(1, "rgba(229, 9, 53, 0)");
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, w, h);
        }

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const d = Math.hypot(dx, dy);
                if (d < 135) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(229,9,53,${0.18 * (1 - d / 135)})`;
                    ctx.lineWidth = .8;
                    ctx.stroke();
                }
            }
        }

        // Lines from nearby particles to the cursor
        particles.forEach(p => {
            const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
            if (d < 150) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(255,41,79,${0.35 * (1 - d / 150)})`;
                ctx.lineWidth = .8;
                ctx.stroke();
            }
        });

        ctx.shadowBlur = 12;
        ctx.shadowColor = "#E50935";
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,65,100,${p.a})`;
            ctx.fill();
        });
        ctx.shadowBlur = 0;
    }

    function tick() {
        particles.forEach(p => {
            const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
            if (d < 110 && d > 0) { p.x += (dx / d) * 0.8; p.y += (dy / d) * 0.8; }
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
        });
        draw();
        frame = requestAnimationFrame(tick);
    }

    function start() {
        cancelAnimationFrame(frame);
        frame = null;
        if (!document.hidden && !reduceMotion.matches) frame = requestAnimationFrame(tick);
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { resize(); start(); }, 120);
    });
    document.addEventListener("visibilitychange", start);
    reduceMotion.addEventListener("change", start);

    resize();
    start();
}

/* ===== 6. FOOTER YEAR ===== */
const yearEl = document.querySelector("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== 7. ACHIEVEMENTS: TABS + PHOTO PROOF VIEWER ===== */
(() => {
    /* Achievement tabs */
    const tabs = [...document.querySelectorAll(".ach-tab")];
    const panels = [...document.querySelectorAll(".ach-panel")];
    tabs.forEach(tab => tab.addEventListener("click", () => {
        tabs.forEach(t => {
            const on = t === tab;
            t.classList.toggle("active", on);
            t.setAttribute("aria-selected", String(on));
        });
        panels.forEach(p => { p.hidden = p.id !== tab.dataset.panel; p.scrollTop = 0; });
    }));

    /* Missing photo -> show "Add photo proof" placeholder */
    document.querySelectorAll(".proof img").forEach(img => {
        const fail = () => img.closest(".proof").classList.add("no-photo");
        if (img.complete && img.naturalWidth === 0) fail();
        else img.addEventListener("error", fail, { once: true });
    });

    /* Lightbox */
    const lb = document.getElementById("lightbox");
    const lbImg = lb.querySelector("img");
    const lbCap = lb.querySelector("figcaption");
    let list = [], idx = 0, lastFocus = null;

    const render = () => {
        const p = list[idx];
        lbImg.src = p.querySelector("img").src;
        lbImg.alt = p.querySelector("img").alt;
        lbCap.textContent = p.dataset.caption || "";
    };
    const open = p => {
        list = [...p.closest(".ach-panel").querySelectorAll(".proof:not(.no-photo)")];
        idx = list.indexOf(p);
        lastFocus = document.activeElement;
        lb.classList.toggle("single", list.length < 2);
        render();
        lb.classList.add("open");
        lb.setAttribute("aria-hidden", "false");
        lb.querySelector(".lb-close").focus();
    };
    const close = () => {
        lb.classList.remove("open");
        lb.setAttribute("aria-hidden", "true");
        lastFocus && lastFocus.focus();
    };
    const step = d => { idx = (idx + d + list.length) % list.length; render(); };

    document.querySelectorAll(".proof").forEach(p => p.addEventListener("click", () => {
        if (!p.classList.contains("no-photo")) open(p);
    }));

    lb.addEventListener("click", e => {
        if (e.target.closest(".lb-close") || e.target === lb) close();
        else if (e.target.closest(".lb-prev")) step(-1);
        else if (e.target.closest(".lb-next")) step(1);
    });

    // capture phase: stops the page-switching arrow keys while the viewer is open
    window.addEventListener("keydown", e => {
        if (!lb.classList.contains("open")) return;
        if (e.key === "Escape") close();
        else if (e.key === "ArrowRight" && list.length > 1) step(1);
        else if (e.key === "ArrowLeft" && list.length > 1) step(-1);
        else return;
        e.stopImmediatePropagation();
    }, true);
})();
