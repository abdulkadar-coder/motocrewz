const PRODUCTS = [
  {
    name: "NOMAD 01",
    type: "LONG-DISTANCE SCRAMBLER",
    badge: "MOST RIDDEN",
    tag: "The long-distance scrambler. Upright, unbothered, and happy to disappear into the horizon.",
    specs: ["689 CC", "187 KG", "6-SPEED"],
    price: "$12,400",
    img: "assets/p1.jpg",
    alt: "Nomad 01 custom scrambler by Motocrewz"
  },
  {
    name: "VULCAN 02",
    type: "CITY CAFÉ RACER",
    badge: "NEW BUILD",
    tag: "Low bars, lower patience. A stripped-back twin built to make the commute feel like a getaway.",
    specs: ["900 CC", "198 KG", "5-SPEED"],
    price: "$16,800",
    img: "assets/p2.jpg",
    alt: "Vulcan 02 café racer by Motocrewz"
  },
  {
    name: "GHOST 03",
    type: "MIDNIGHT TRACKER",
    badge: "12 MADE",
    tag: "Matte, minimal, and a little antisocial. Our most limited build — twelve made, each one numbered.",
    specs: ["1200 CC", "204 KG", "6-SPEED"],
    price: "$21,200",
    img: "assets/p3.jpg",
    alt: "Ghost 03 tracker by Motocrewz"
  }
];

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const pad = (n) => String(n).padStart(2, "0");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const body = document.body;
const intro = $("#intro");
const introPct = $("#introPct");

let introFinished = false;
let introTimer = null;
let introCount = null;
let revealsStarted = false;

// Lenis keeps the browser's native scroll model while softening wheel input.
// The site remains fully usable if either optional CDN library is unavailable.
let lenis = null;
if (!reducedMotion && window.Lenis) {
  lenis = new window.Lenis({
    autoRaf: true,
    anchors: true,
    duration: 1.05,
    smoothWheel: true
  });
}

function revealElement(el) {
  if (window.gsap && !reducedMotion) {
    window.gsap.to(el, {
      autoAlpha: 1,
      y: 0,
      duration: 0.9,
      delay: parseFloat(getComputedStyle(el).getPropertyValue("--d")) || 0,
      ease: "power3.out",
      overwrite: "auto",
      onComplete: () => el.classList.add("is-in")
    });
  } else {
    el.classList.add("is-in");
  }
}

function startReveals() {
  if (revealsStarted) return;
  revealsStarted = true;
  const els = $$("[data-reveal]");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    els.forEach(revealElement);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealElement(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  els.forEach((el) => io.observe(el));
}

// A short, sequenced arrival gives the hero a little more depth once the
// loading mark clears, while the CSS animation remains the no-GSAP fallback.
function animateHero() {
  if (!window.gsap || reducedMotion) return;
  const copy = $(".hero__copy");
  const media = $(".hero__media");
  if (!copy || !media) return;
  window.gsap.fromTo(media, { clipPath: "inset(8% 0 0 0 round 26px)", y: 24 }, {
    clipPath: "inset(0% 0 0 0 round 26px)", y: 0, duration: 1.2,
    ease: "power3.out", delay: 0.12, clearProps: "clipPath"
  });
}

function finishIntro() {
  if (introFinished) return;
  introFinished = true;
  clearTimeout(introTimer);
  clearInterval(introCount);
  if (introPct) introPct.textContent = "100";
  body.classList.remove("is-loading");
  if (intro) {
    intro.classList.add("is-done");
    setTimeout(() => intro.remove(), 1150);
  }
  startReveals();
  animateHero();
}

if (reducedMotion) {
  body.classList.remove("is-loading");
  if (intro) intro.remove();
  startReveals();
} else {
  let pct = 0;
  introCount = setInterval(() => {
    pct = Math.min(100, pct + 2 + Math.floor(Math.random() * 7));
    if (introPct) introPct.textContent = pad(pct);
    if (pct >= 100) clearInterval(introCount);
  }, 55);
  introTimer = setTimeout(finishIntro, 2650);
  if (intro) {
    intro.addEventListener("pointerdown", finishIntro);
    intro.addEventListener("wheel", finishIntro, { passive: true });
  }
  document.addEventListener("keydown", (e) => {
    if (!introFinished && ["Escape", "Enter", " "].includes(e.key)) finishIntro();
  });
}

const nav = $("#nav");
const navToggle = $("#navToggle");
const navLinks = $("#navLinks");

function onScroll() {
  if (!nav) return;
  nav.classList.toggle("is-scrolled", window.scrollY > 24);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

function closeMenu() {
  body.classList.remove("menu-open");
  if (navToggle) {
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }
}

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const open = body.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
}
if (navLinks) {
  $$("a", navLinks).forEach((link) => link.addEventListener("click", closeMenu));
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

const stage = $("#stage");
const dotsWrap = $("#dots");
const info = $("#bikeInfo");
const infoIndex = $("#bikeIndex");
const infoName = $("#bikeName");
const infoTag = $("#bikeTag");
const infoSpecs = $("#bikeSpecs");
const infoPrice = $("#bikePrice");
const prevBtn = $("#prevBtn");
const nextBtn = $("#nextBtn");

let current = 0;
let infoTimer = null;
let cards = [];

function buildCard(product, index) {
  const card = document.createElement("article");
  card.className = "bike";
  card.dataset.index = String(index);
  card.setAttribute("role", "group");
  card.setAttribute("aria-roledescription", "slide");
  card.setAttribute("aria-label", `${index + 1} of ${PRODUCTS.length}: ${product.name}`);
  card.innerHTML = `
    <img src="${product.img}" alt="${product.alt}" draggable="false" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">
    <div class="bike__top">
      <span class="bike__pill"><span class="dot"></span>${product.badge}</span>
      <span class="bike__no">N° ${pad(index + 1)}</span>
    </div>
    <div class="bike__bottom">
      <span class="bike__name">${product.name}</span>
      <span class="bike__type">${product.type}</span>
    </div>`;
  return card;
}

function buildDots() {
  PRODUCTS.forEach((product, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Show ${product.name}`);
    dot.setAttribute("aria-current", String(i === 0));
    dot.addEventListener("click", () => setActive(i));
    dotsWrap.appendChild(dot);
  });
}

function render() {
  if (!stage) return;
  PRODUCTS.forEach((product, i) => {
    const card = buildCard(product, i);
    stage.appendChild(card);
  });
  cards = $$(".bike", stage);
  buildDots();
  applyPositions(true);
}

function fillInfo(index) {
  const product = PRODUCTS[index];
  if (infoIndex) infoIndex.textContent = `${pad(index + 1)} / ${pad(PRODUCTS.length)}`;
  if (infoName) infoName.textContent = product.name;
  if (infoTag) infoTag.textContent = product.tag;
  if (infoPrice) infoPrice.textContent = product.price;
  if (infoSpecs) {
    infoSpecs.innerHTML = product.specs.map((spec) => `<span class="chip">${spec}</span>`).join("");
  }
}

function applyPositions(instant) {
  cards.forEach((card, index) => {
    let offset = index - current;
    const half = PRODUCTS.length / 2;
    if (offset > half) offset -= PRODUCTS.length;
    if (offset < -half) offset += PRODUCTS.length;

    let x = 0;
    let scale = 1;
    let rotate = 0;
    let opacity = 1;
    let z = 3;

    if (offset === -1) {
      x = -84;
      scale = 0.78;
      rotate = -6;
      opacity = 0.5;
      z = 2;
    } else if (offset === 1) {
      x = 84;
      scale = 0.78;
      rotate = 6;
      opacity = 0.5;
      z = 2;
    } else if (offset !== 0) {
      x = offset > 0 ? 150 : -150;
      scale = 0.6;
      rotate = offset > 0 ? 10 : -10;
      opacity = 0;
      z = 1;
    }

    card.style.setProperty("--x", `${x}%`);
    card.style.setProperty("--s", String(scale));
    card.style.setProperty("--r", `${rotate}deg`);
    card.style.setProperty("--o", String(opacity));
    card.style.setProperty("--z", String(z));
    card.dataset.active = String(offset === 0);
    card.style.pointerEvents = opacity === 0 ? "none" : "auto";
    if (!instant) card.setAttribute("aria-hidden", offset === 0 ? "false" : "true");
  });

  $$("#dots button").forEach((dot, i) => {
    dot.setAttribute("aria-current", String(i === current));
  });
}

function setActive(index, instant = false) {
  const total = PRODUCTS.length;
  current = ((index % total) + total) % total;
  applyPositions(instant);

  if (!info) return;
  if (instant) {
    fillInfo(current);
    return;
  }
  info.classList.add("is-changing");
  clearTimeout(infoTimer);
  infoTimer = setTimeout(() => {
    fillInfo(current);
    info.classList.remove("is-changing");
  }, 170);
}

if (prevBtn) prevBtn.addEventListener("click", () => setActive(current - 1));
if (nextBtn) nextBtn.addEventListener("click", () => setActive(current + 1));

let dragStart = null;
let pressCard = null;

if (stage) {
  stage.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragStart = e.clientX;
    pressCard = e.target.closest(".bike");
    stage.classList.add("is-dragging");
    e.preventDefault();
  });

  const endDrag = (e) => {
    if (dragStart === null) return;
    const delta = e.clientX - dragStart;
    const card = pressCard;
    dragStart = null;
    pressCard = null;
    stage.classList.remove("is-dragging");

    if (Math.abs(delta) > 55) {
      setActive(delta < 0 ? current + 1 : current - 1);
    } else if (card) {
      const index = Number(card.dataset.index);
      if (index !== current) setActive(index);
    }
  };

  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", () => {
    if (dragStart === null) return;
    dragStart = null;
    pressCard = null;
    stage.classList.remove("is-dragging");
  });

  stage.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActive(current + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActive(current - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(PRODUCTS.length - 1);
    }
  });
}

// React Bits inspired spotlight cards, adapted to this vanilla site. The
// highlight tracks the pointer without changing the carousel's own transforms.
if (!reducedMotion && window.matchMedia("(pointer:fine)").matches) {
  $$(".review").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
      if (window.gsap) {
        window.gsap.to(card, {
          rotateX: ((event.clientY - rect.top) / rect.height - 0.5) * -3,
          rotateY: ((event.clientX - rect.left) / rect.width - 0.5) * 3,
          duration: 0.35, ease: "power2.out", overwrite: true, transformPerspective: 900
        });
      }
    });
    card.addEventListener("pointerleave", () => {
      if (window.gsap) window.gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.55, ease: "power3.out" });
    });
  });
}

render();
if (cards.length) setActive(0, true);

const hero = $("#hero");
const heroImg = hero ? $(".hero__figure img", hero) : null;
let targetPX = 0;
let targetPY = 0;
let currentPX = 0;
let currentPY = 0;
let parallaxActive = false;

if (hero && heroImg && !reducedMotion && window.matchMedia("(pointer:fine)").matches) {
  const loop = () => {
    currentPX += (targetPX - currentPX) * 0.09;
    currentPY += (targetPY - currentPY) * 0.09;
    heroImg.style.setProperty("--px", `${currentPX.toFixed(2)}px`);
    heroImg.style.setProperty("--py", `${currentPY.toFixed(2)}px`);
    if (Math.abs(targetPX - currentPX) > 0.1 || Math.abs(targetPY - currentPY) > 0.1) {
      requestAnimationFrame(loop);
    } else {
      parallaxActive = false;
    }
  };

  hero.addEventListener("pointermove", (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    targetPX = x * 16;
    targetPY = y * 16;
    if (!parallaxActive) {
      parallaxActive = true;
      requestAnimationFrame(loop);
    }
  });

  hero.addEventListener("pointerleave", () => {
    targetPX = 0;
    targetPY = 0;
    if (!parallaxActive) {
      parallaxActive = true;
      requestAnimationFrame(loop);
    }
  });
}

const finePointer = window.matchMedia("(pointer:fine)").matches;
if (finePointer && !reducedMotion) {
  const dot = document.createElement("div");
  const ring = document.createElement("div");
  dot.className = "cursor-dot";
  ring.className = "cursor-ring";
  dot.style.opacity = "0";
  ring.style.opacity = "0";
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.documentElement.classList.add("has-custom-cursor");

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx;
  let ry = my;
  let cursorVisible = false;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!cursorVisible) {
      cursorVisible = true;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    }
  });

  const animateCursor = () => {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  };
  requestAnimationFrame(animateCursor);

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest("a, button, input, .bike, [data-cursor]")) {
      ring.classList.add("is-hover");
    } else {
      ring.classList.remove("is-hover");
    }
  });

  document.addEventListener("mouseleave", () => {
    dot.style.opacity = "0";
    ring.style.opacity = "0";
    cursorVisible = false;
  });
}

if (!reducedMotion && finePointer) {
  $$(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      el.style.setProperty("--mx", `${x * 0.22}px`);
      el.style.setProperty("--my", `${y * 0.3}px`);
    });
    el.addEventListener("pointerleave", () => {
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
    });
  });
}

const newsletter = $("#newsletter");
if (newsletter) {
  newsletter.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#email", newsletter);
    const button = $(".newsletter__btn", newsletter);
    if (!input || !button || !input.value) return;
    input.value = "";
    input.disabled = true;
    button.disabled = true;
    button.innerHTML = "You're in ✓";
    button.style.color = "var(--orange)";
  });
}

const year = $("#year");
if (year) year.textContent = new Date().getFullYear();
