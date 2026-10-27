const PRODUCTS = [
  {
    name: "NOMAD 01",
    type: "LONG-DISTANCE SCRAMBLER",
    badge: "MOST RIDDEN",
    tag: "The long-distance scrambler. Upright, unbothered, and happy to disappear into the horizon.",
    specs: ["689 CC", "187 KG", "6-SPEED"],
    price: "$12,400",
    img: "assets/p1.jpg",
    alt: "Nomad 01 custom scrambler by Motocrewz",
    sheet: {
      code: "MC–01",
      built: "24",
      series: "No. 01 / 24",
      title: "Nomad 01",
      type: "Long-distance scrambler",
      note: "A tall, neutral scrambler built around the long road out of Lisbon. Soft suspension, a flat seat, and enough tank to forget the next town.",
      finish: "Sand / Olive",
      swatch: "linear-gradient(135deg,#c8b08a 0 55%,#5e6248 55%)",
      lead: "12 weeks",
      specs: [
        ["Engine", "689 cc parallel twin"],
        ["Power", "74 hp @ 8,000"],
        ["Torque", "68 Nm @ 6,500"],
        ["Wet weight", "187 kg"],
        ["Wheelbase", "1,445 mm"],
        ["Seat height", "830 mm"],
        ["Tank", "13.5 L"],
        ["Gearbox", "6-speed"],
      ],
    },
  },
  {
    name: "VULCAN 02",
    type: "CITY CAFÉ RACER",
    badge: "NEW BUILD",
    tag: "Low bars, lower patience. A stripped-back twin built to make the commute feel like a getaway.",
    specs: ["900 CC", "198 KG", "5-SPEED"],
    price: "$16,800",
    img: "assets/p2.jpg",
    alt: "Vulcan 02 café racer by Motocrewz",
    sheet: {
      code: "MC–02",
      built: "18",
      series: "No. 02 / 18",
      title: "Vulcan 02",
      type: "City café racer",
      note: "Low bars, rearsets, and a trimmed subframe. A city bike that takes the long way home — and looks good doing it.",
      finish: "Oxblood / Cream",
      swatch: "linear-gradient(135deg,#5a1d1a 0 55%,#ede7db 55%)",
      lead: "14 weeks",
      specs: [
        ["Engine", "900 cc air-cooled twin"],
        ["Power", "68 hp @ 7,000"],
        ["Torque", "72 Nm @ 5,500"],
        ["Wet weight", "198 kg"],
        ["Wheelbase", "1,410 mm"],
        ["Seat height", "805 mm"],
        ["Tank", "12 L"],
        ["Gearbox", "5-speed"],
      ],
    },
  },
  {
    name: "GHOST 03",
    type: "MIDNIGHT TRACKER",
    badge: "12 MADE",
    tag: "Matte, minimal, and a little antisocial. Our most limited build — twelve made, each one numbered.",
    specs: ["1200 CC", "204 KG", "6-SPEED"],
    price: "$21,200",
    img: "assets/p3.jpg",
    alt: "Ghost 03 tracker by Motocrewz",
    sheet: {
      code: "MC–03",
      built: "12",
      series: "No. 03 / 12",
      title: "Ghost 03",
      type: "Midnight tracker",
      note: "Matte, minimal, and a little antisocial. Twelve numbered builds, each with its own tank graphic and no two alike.",
      finish: "Graphite / Signal orange",
      swatch: "linear-gradient(135deg,#2b2a27 0 55%,#d8552b 55%)",
      lead: "16 weeks",
      specs: [
        ["Engine", "1,200 cc V-twin"],
        ["Power", "112 hp @ 8,500"],
        ["Torque", "118 Nm @ 6,000"],
        ["Wet weight", "204 kg"],
        ["Wheelbase", "1,520 mm"],
        ["Seat height", "820 mm"],
        ["Tank", "15 L"],
        ["Gearbox", "6-speed"],
      ],
    },
  },
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
let revealsStarted = false; // Lenis keeps the browser's native scroll model while softening wheel input.
// The site remains fully usable if either optional CDN library is unavailable.
let lenis = null;
const scrollTriggerReady = Boolean(window.gsap && window.ScrollTrigger);
if (scrollTriggerReady) window.gsap.registerPlugin(window.ScrollTrigger);
if (!reducedMotion && window.Lenis) {
  lenis = new window.Lenis({ autoRaf: !scrollTriggerReady, anchors: true, duration: 1.05, smoothWheel: true });
  if (scrollTriggerReady) {
    lenis.on("scroll", window.ScrollTrigger.update);
    window.gsap.ticker.add((time) => lenis.raf(time * 1000));
    window.gsap.ticker.lagSmoothing(0);
  }
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
      onComplete: () => el.classList.add("is-in"),
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
    { threshold: 0.12, rootMargin: "0px 0px -2% 0px" },
  );
  els.forEach((el) => io.observe(el));
} // The intro clears, reveals begin, and the full-bleed hero settles into place.
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
const navLabel = $(".nav__label");
function onScroll() {
  if (!nav) return;
  nav.classList.toggle("is-scrolled", window.scrollY > 24);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
function closeMenu() {
  body.classList.remove("menu-open");
  if (lenis) lenis.start();
  if (navToggle) {
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }
  if (navLabel) navLabel.textContent = "Menu";
}
if (navToggle) {
  navToggle.addEventListener("click", () => {
    const open = body.classList.toggle("menu-open");
    if (lenis) open ? lenis.stop() : lenis.start();
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (navLabel) navLabel.textContent = open ? "Close" : "Menu";
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
const buildSheet = $("#buildSheet");
const sheetCode = $("#sheetCode");
const sheetBuilt = $("#sheetBuilt");
const sheetName = $("#sheetName");
const sheetType = $("#sheetType");
const sheetNote = $("#sheetNote");
const sheetFinish = $("#sheetFinish");
const sheetSwatch = $("#sheetSwatch");
const sheetLedger = $("#sheetLedger");
const sheetPrice = $("#sheetPrice");
const sheetLead = $("#sheetLead");
const sheetSeries = $("#sheetSeries");
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
  card.innerHTML = `    <img src="${product.img}" alt="${product.alt}" draggable="false" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">    <div class="bike__top">      <span class="bike__pill"><span class="dot"></span>${product.badge}</span>      <span class="bike__no">N° ${pad(index + 1)}</span>    </div>    <div class="bike__bottom">      <span class="bike__name">${product.name}</span>      <span class="bike__type">${product.type}</span>    </div>`;
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
function fillSheet(index) {
  if (!buildSheet) return;
  const product = PRODUCTS[index];
  const data = product.sheet;
  if (!data) return;
  if (sheetCode) sheetCode.textContent = data.code;
  if (sheetBuilt) sheetBuilt.textContent = data.built;
  if (sheetName) sheetName.textContent = data.title;
  if (sheetType) sheetType.textContent = data.type;
  if (sheetNote) sheetNote.textContent = data.note;
  if (sheetFinish) sheetFinish.textContent = data.finish;
  if (sheetSwatch) sheetSwatch.style.background = data.swatch;
  if (sheetPrice) sheetPrice.textContent = product.price;
  if (sheetLead) sheetLead.textContent = data.lead;
  if (sheetSeries) sheetSeries.textContent = data.series;
  if (sheetLedger) {
    sheetLedger.innerHTML = data.specs
      .map(([label, value]) => `<div class="build-sheet__row"><dt>${label}</dt><dd>${value}</dd></div>`)
      .join("");
  }
}
function fillDetails(index) {
  fillInfo(index);
  fillSheet(index);
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
  if (instant) {
    fillDetails(current);
    return;
  }
  if (info) info.classList.add("is-changing");
  if (buildSheet) buildSheet.classList.add("is-changing");
  clearTimeout(infoTimer);
  infoTimer = setTimeout(() => {
    fillDetails(current);
    if (info) info.classList.remove("is-changing");
    if (buildSheet) buildSheet.classList.remove("is-changing");
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
} // React Bits inspired spotlight cards, adapted to this vanilla site. The
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
          duration: 0.35,
          ease: "power2.out",
          overwrite: true,
          transformPerspective: 900,
        });
      }
    });
    card.addEventListener("pointerleave", () => {
      if (window.gsap) window.gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.55, ease: "power3.out" });
    });
  });
}
render();
if (cards.length) setActive(0, true); // The carousel settles into place as it enters, rather than snapping in.
if (stage && !reducedMotion && scrollTriggerReady) {
  window.gsap.from(stage, {
    y: 46,
    scale: 0.975,
    ease: "power3.out",
    duration: 1.2,
    scrollTrigger: { trigger: stage, start: "top 82%", once: true },
  });
}
const hero = $("#hero");
const heroBg = hero ? $(".hero__bg", hero) : null;
let targetPX = 0;
let targetPY = 0;
let currentPX = 0;
let currentPY = 0;
let parallaxActive = false;
if (hero && heroBg && !reducedMotion && window.matchMedia("(pointer:fine)").matches) {
  const loop = () => {
    currentPX += (targetPX - currentPX) * 0.09;
    currentPY += (targetPY - currentPY) * 0.09;
    heroBg.style.setProperty("--px", `${currentPX.toFixed(2)}px`);
    heroBg.style.setProperty("--py", `${currentPY.toFixed(2)}px`);
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
    targetPX = x * 18;
    targetPY = y * 18;
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
} // The hero type recedes as the photograph hands over to the next section.
if (hero && !reducedMotion && scrollTriggerReady) {
  const heroInner = $(".hero__inner", hero);
  if (heroInner) {
    window.gsap.to(heroInner, {
      y: -40,
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
    });
  }
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
