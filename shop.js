/* ============================================================
   MOTOCREWZ — Parts & Sundries
   Catalogue, cart and reservation checkout (no payment gateway)
   ============================================================ */
(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const STORAGE_KEY = "mc-cart-v1";
  const FREE_SHIPPING = 150;
  const SHIP_COST = { standard: 9, express: 24, pickup: 0 };
  const moneyFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  const money = (value) => moneyFmt.format(value);

  const CATEGORIES = {
    spare: "Spare parts",
    exhaust: "Exhausts",
    apparel: "Apparel",
    care: "Care",
  };

  /* ---------------- catalogue ---------------- */
  const PRODUCTS = [
    {
      id: "vulcan-two-into-one",
      name: "Vulcan 2-into-1",
      category: "exhaust",
      price: 890,
      code: "MC-EX-02",
      meta: "304 stainless &middot; hand TIG",
      blurb: "The signature pipe. Two headers, one collector, a deep idle and a top-end that sounds like a promise.",
      art: "exhaustTwo",
      badge: "Crew pick",
      wide: true,
    },
    {
      id: "riser-bar",
      name: "Alloy Riser Bar",
      category: "spare",
      price: 189,
      code: "MC-SP-01",
      meta: "31.8 mm &middot; 7075 alloy",
      blurb: "A tall, neutral bar with just enough sweep. Black anodised, laser-etched and ready for the long road.",
      art: "bar",
      badge: "New",
    },
    {
      id: "pod-filter-kit",
      name: "Pod Filter Kit",
      category: "spare",
      price: 74,
      code: "MC-SP-02",
      meta: "Dual pod &middot; washable",
      blurb: "Breathes easier, sounds better. A pair of oiled cotton pods with the adapters to fit the 689 twin.",
      art: "filter",
    },
    {
      id: "titanium-slip-on",
      name: "Titanium Slip-On",
      category: "exhaust",
      price: 640,
      code: "MC-EX-03",
      meta: "Grade 1 titanium &middot; 2.1 kg",
      blurb: "The lightweight option for the rider who counts grams. Brushed titanium, carbon hanger, removable baffle.",
      art: "slipon",
      badge: "New",
    },
    {
      id: "chain-sprocket-set",
      name: "Chain & Sprocket Set",
      category: "spare",
      price: 168,
      code: "MC-SP-03",
      meta: "520 pitch &middot; 15/42",
      blurb: "Steel front, hard-anodised rear, X-ring chain. The whole driveline in one box, cut to length.",
      art: "chain",
      low: true,
    },
    {
      id: "field-jacket",
      name: "Crew Field Jacket",
      category: "apparel",
      price: 310,
      code: "MC-AP-01",
      meta: "Waxed cotton &middot; quilted liner",
      blurb: "Built for cold mornings and long detours. Waxed 10 oz cotton, moleskin collar, four deep pockets.",
      art: "jacket",
    },
    {
      id: "baffle-insert-kit",
      name: "Baffle Insert Kit",
      category: "exhaust",
      price: 95,
      code: "MC-EX-04",
      meta: "Removable &middot; 92 dB",
      blurb: "Track-day manners for a weekend voice. Slip-in baffles with a stainless retaining bolt, sold as a pair.",
      art: "baffle",
    },
    {
      id: "billet-clutch-perch",
      name: "Billet Clutch Perch",
      category: "spare",
      price: 128,
      code: "MC-SP-04",
      meta: "CNC 6061 &middot; folding lever",
      blurb: "A proper perch with a folding lever that survives a tip-over. Machined, anodised and rebuilt in minutes.",
      art: "clutch",
    },
    {
      id: "rear-rack",
      name: "Rear Rack / Pannier Bridge",
      category: "spare",
      price: 245,
      code: "MC-SP-05",
      meta: "Steel &middot; black powdercoat",
      blurb: "A flat, quiet rack that carries a roll bag or a set of soft panniers without ruining the lines.",
      art: "rack",
    },
    {
      id: "foundry-tee",
      name: "Foundry Garage Tee",
      category: "apparel",
      price: 48,
      code: "MC-AP-02",
      meta: "240 gsm &middot; ecru",
      blurb: "Heavyweight cotton, boxy cut, small chest mark. The shirt you reach for when the bike is already dirty.",
      art: "tee",
    },
    {
      id: "waxed-gloves",
      name: "Waxed Riding Gloves",
      category: "apparel",
      price: 85,
      code: "MC-AP-03",
      meta: "Goat leather &middot; tan",
      blurb: "Thin enough to feel the grips, tough enough for a slide. Waxed goat leather with touch-friendly tips.",
      art: "gloves",
    },
    {
      id: "long-way-cap",
      name: "Long Way Cap",
      category: "apparel",
      price: 38,
      code: "MC-AP-04",
      meta: "Washed canvas &middot; brass clasp",
      blurb: "Six panels, a soft brim and a small embroidered mark. For the part of the ride after the helmet comes off.",
      art: "cap",
    },
    {
      id: "chain-lube",
      name: "Dry Film Chain Lube",
      category: "care",
      price: 18,
      code: "MC-CA-01",
      meta: "400 ml &middot; dry film",
      blurb: "Goes on wet, dries clean, does not fling. The workshop's only chain lube for the last six years.",
      art: "lube",
    },
    {
      id: "patina-wax",
      name: "Patina Wax",
      category: "care",
      price: 26,
      code: "MC-CA-02",
      meta: "250 ml &middot; matte finish",
      blurb: "A hard wax for paint, chrome and leather. Adds depth, shrugs off rain and smells like the garage.",
      art: "wax",
    },
    {
      id: "tool-roll",
      name: "Waxed Tool Roll",
      category: "care",
      price: 64,
      code: "MC-CA-03",
      meta: "Waxed canvas &middot; 12 pockets",
      blurb: "Twelve pockets, a leather tie and enough room for the tools you actually use. Rolls tight, opens flat.",
      art: "roll",
      low: true,
    },
  ];

  /* ---------------- line art ---------------- */
  const ART = {
    bar: `
      <path d="M32 156c24 0 30-26 52-26h64"/>
      <path d="M288 156c-24 0-30-26-52-26h-32"/>
      <rect x="136" y="112" width="48" height="18" rx="5"/>
      <path d="M144 130v30M176 130v30M136 160h48"/>
      <path class="art-accent" d="M36 156h22M262 156h22"/>
      <path d="M150 112V98h20v14" opacity=".4"/>`,
    filter: `
      <ellipse cx="152" cy="82" rx="48" ry="14"/>
      <path d="M104 82v58M200 82v58"/>
      <ellipse cx="152" cy="140" rx="48" ry="14"/>
      <path d="M106 96h92M106 110h92M106 124h92" opacity=".45"/>
      <path d="M200 106h34c12 0 20 8 20 18s-8 18-20 18h-14"/>
      <path class="art-accent" d="M104 126h96"/>
      <circle cx="152" cy="82" r="6" class="art-fill"/>
      <path d="M130 64h44" opacity=".45"/>`,
    clutch: `
      <circle cx="134" cy="118" r="30"/>
      <circle cx="134" cy="118" r="13" class="art-fill"/>
      <path d="M164 118h22c22 0 34-17 58-17h32"/>
      <path d="M164 118h24c18 0 30 15 56 15h20"/>
      <path d="M134 148v32M116 180h36"/>
      <path d="M186 101c14-10 30-10 42-4"/>
      <path class="art-accent" d="M254 90l12-9M262 106l12-9"/>`,
    rack: `
      <path d="M70 104h180v58H70z"/>
      <path d="M70 123h180M70 145h180M100 104v58M130 104v58M160 104v58M190 104v58M220 104v58" opacity=".4"/>
      <path d="M88 162l-14 32M232 162l14 32"/>
      <path d="M68 196h42M210 196h42"/>
      <circle cx="82" cy="116" r="3"/><circle cx="238" cy="116" r="3"/>
      <path class="art-accent" d="M70 104h180"/>
      <path d="M150 162v18" opacity=".35"/>`,
    chain: `
      <circle cx="108" cy="142" r="46"/>
      <circle cx="108" cy="142" r="34" stroke-dasharray="5 8" opacity=".5"/>
      <circle cx="108" cy="142" r="11"/>
      <circle cx="216" cy="96" r="29"/>
      <circle cx="216" cy="96" r="19" stroke-dasharray="4 7" opacity=".5"/>
      <circle cx="216" cy="96" r="7"/>
      <path d="M108 96 216 67M108 188 216 125" stroke-width="5" stroke-dasharray="2 8" opacity=".7"/>
      <path class="art-accent" d="M101 100l8-7M101 184l8 7"/>
      <path d="M108 131v22M97 142h22" opacity=".35"/>`,
    slipon: `
      <g transform="translate(154 132) rotate(-9)">
        <rect x="-74" y="-25" width="150" height="50" rx="24"/>
        <path d="M-74-17l-30-8v50l30-8z"/>
        <path d="M-64-25v50M66-25v50" opacity=".45"/>
        <rect x="8" y="-25" width="9" height="50" class="art-fill"/>
        <ellipse cx="76" cy="0" rx="13" ry="25"/>
        <path d="M-40-25c-2-14 6-24 18-28"/>
      </g>
      <path d="M70 158l-14 34M56 192h30"/>
      <path class="art-accent" d="M158 106l18-14M170 116l18-14"/>
      <circle cx="150" cy="97" r="3" class="art-fill"/>`,
    exhaustTwo: `
      <path d="M46 80c36 0 44 28 78 34s58 12 82 32" stroke-width="2.4"/>
      <path d="M34 116c36 6 46 24 78 32s60 18 88 38" stroke-width="2.4"/>
      <path d="M46 80c-9 0-16 7-16 16v10M34 116c-9 2-14 9-12 18"/>
      <path d="M80 82V66M88 86V70M62 118V102M70 122V106" class="art-accent"/>
      <g transform="translate(196 158) rotate(12)">
        <rect x="0" y="-22" width="104" height="44" rx="21"/>
        <path d="M0-14l-26-7v42l26-7z"/>
        <rect x="52" y="-22" width="8" height="44" class="art-fill"/>
        <ellipse cx="104" cy="0" rx="11" ry="22"/>
        <path d="M24-22v44" opacity=".4"/>
      </g>
      <path d="M238 190v28M230 218h28" opacity=".3"/>
      <path d="M240 108v-22" opacity=".3"/>`,
    baffle: `
      <g transform="translate(160 120)">
        <rect x="-88" y="-31" width="150" height="62" rx="28"/>
        <path d="M-88-21l-20-6v54l20-6z"/>
        <path d="M-30-31v62" opacity=".45"/>
        <ellipse cx="62" cy="0" rx="15" ry="31"/>
        <path class="art-accent" d="M-62-21c0-16 12-29 29-31"/>
      </g>
      <g class="art-fill">
        <circle cx="106" cy="103" r="2.3"/><circle cx="126" cy="112" r="2.3"/>
        <circle cx="112" cy="128" r="2.3"/><circle cx="132" cy="136" r="2.3"/>
        <circle cx="120" cy="146" r="2.3"/>
      </g>
      <path class="art-accent" d="M222 84l16-14M234 98l16-14"/>`,
    jacket: `
      <path d="M118 62l-32 15-26 68 24 10 12-24v60h88v-60l12 24 24-10-26-68-32-15-17 16h-14z"/>
      <path d="M130 62c0 9 6 15 14 15s14-6 14-15"/>
      <path d="M144 77v114"/>
      <path d="M122 116h-22M166 116h22"/>
      <path d="M114 146h-18v26h18M174 146h18v26h-18"/>
      <path class="art-accent" d="M164 92h14v11h-14z"/>
      <path d="M139 84l5 18-5 12" opacity=".4"/>
      <path d="M96 88l-10 12M192 88l10 12" opacity=".3"/>`,
    tee: `
      <path d="M118 66l-40 19 17 37 23-10v79h84V112l23 10 17-37-40-19-20 13h-44z"/>
      <path d="M118 66c0 12 12 20 42 20s42-8 42-20"/>
      <circle cx="160" cy="128" r="14" class="art-accent"/>
      <path class="art-accent" d="M160 119v18M151 128h18"/>
      <path d="M132 190v-22M188 190v-22" opacity=".2"/>`,
    gloves: `
      <path d="M98 178c-10-24-13-46-7-55 5-7 14-3 16 5l5 16V84c0-9 13-9 13 0v32h1V74c0-9 13-9 13 0v42h1V78c0-9 13-9 13 0v38h1V88c0-9 13-9 13 0v32l12 18c7 11 1 22-11 26l-34 12c-19 7-36 0-44-15z"/>
      <path d="M125 116V84M139 116V78M153 116V88" opacity=".45"/>
      <path d="M110 146c18 9 38 11 58 5"/>
      <path class="art-accent" d="M104 156l38 8v13l-38-8z"/>
      <path d="M178 118l14-8" opacity=".35"/>`,
    cap: `
      <path d="M84 148c0-44 31-74 72-74s68 28 68 68v8H84z"/>
      <path d="M84 150h136c20 0 36 7 46 20-24 12-54 14-84 10-34-4-70-13-98-30z"/>
      <path d="M156 74v76M130 80c6 16 8 42 6 68M184 82c-4 16-4 42-2 66" opacity=".3"/>
      <circle cx="156" cy="69" r="6" class="art-fill"/>
      <path class="art-accent" d="M140 138h32"/>`,
    lube: `
      <path d="M126 96h68v92h-68z"/>
      <path d="M136 96V78h48v18"/>
      <path d="M146 78V60h28v18"/>
      <path d="M174 60l14-18" class="art-accent"/>
      <rect x="138" y="116" width="44" height="42" rx="2"/>
      <path d="M146 128h28M146 138h28M146 148h18" opacity=".45"/>
      <path d="M116 188h88"/>
      <path d="M160 96V86" opacity=".35"/>`,
    wax: `
      <ellipse cx="160" cy="102" rx="62" ry="18"/>
      <path d="M98 102v50c0 10 28 18 62 18s62-8 62-18v-50"/>
      <ellipse cx="160" cy="152" rx="62" ry="18" opacity=".35"/>
      <ellipse cx="160" cy="102" rx="48" ry="12"/>
      <path class="art-accent" d="M124 134h72"/>
      <path d="M160 92l24-30" opacity=".4"/>
      <path d="M184 62l10-4" opacity=".4"/>`,
    roll: `
      <path d="M76 88h168v90H76z"/>
      <path d="M76 88c0-14 9-23 23-23s23 9 23 23M198 88c0-14 9-23 23-23s23 9 23 23"/>
      <path d="M96 88v90M128 88v90M160 88v90M192 88v90M224 88v90" opacity=".28"/>
      <path d="M100 106h20v34h-20zM132 106h20v40h-20zM164 106h20v30h-20zM196 106h20v38h-20z"/>
      <path class="art-accent" d="M110 100V84M142 100V82M174 100V86M206 100V88"/>
      <path d="M76 88h168"/>`,
  };

  const artSvg = (product) => `
    <svg viewBox="0 0 320 240" fill="none" stroke="currentColor" stroke-width="1.6"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      ${ART[product.art] || ""}
    </svg>`;

  /* ---------------- elements ---------------- */
  const els = {
    nav: $("#nav"),
    navToggle: $("#navToggle"),
    navLinks: $("#navLinks"),
    grid: $("#productGrid"),
    filters: $("#filters"),
    search: $("#searchInput"),
    searchClear: $("#searchClear"),
    sort: $("#sortSelect"),
    resultCount: $("#resultCount"),
    clearFilters: $("#clearFilters"),
    emptyState: $("#emptyState"),
    emptyReset: $("#emptyReset"),
    catalog: $("#catalog"),
    cartOpen: $("#cartOpen"),
    drawer: $("#cartDrawer"),
    cartClose: $("#cartClose"),
    cartItems: $("#cartItems"),
    cartEmpty: $("#cartEmpty"),
    cartFoot: $("#cartFoot"),
    cartCountLabel: $("#cartCountLabel"),
    cartSubtotal: $("#cartSubtotal"),
    cartBrowse: $("#cartBrowse"),
    cartContinue: $("#cartContinue"),
    checkoutStart: $("#checkoutStart"),
    shipProgress: $("#shipProgress"),
    shipText: $("#shipText"),
    shipPct: $("#shipPct"),
    shipBar: $("#shipBar"),
    scrim: $("#scrim"),
    dock: $("#cartDock"),
    dockCount: $("#dockCount"),
    dockTotal: $("#dockTotal"),
    toast: $("#toast"),
    toastText: $("#toastText"),
    toastView: $("#toastView"),
    status: $("#shopStatus"),
    checkout: $("#checkout"),
    checkoutClose: $("#checkoutClose"),
    checkoutScroll: $("#checkoutScroll"),
    checkoutDone: $("#checkoutDone"),
    checkoutForm: $("#checkoutForm"),
    checkoutBack: $("#checkoutBack"),
    summaryItems: $("#summaryItems"),
    summaryCount: $("#summaryCount"),
    summarySubtotal: $("#summarySubtotal"),
    summaryShipping: $("#summaryShipping"),
    summaryTotal: $("#summaryTotal"),
    doneRef: $("#doneRef"),
    doneEmail: $("#doneEmail"),
    doneTotal: $("#doneTotal"),
    doneShop: $("#doneShop"),
    doneCart: $("#doneCart"),
    terms: $("#terms"),
    termsError: $("#termsError"),
    newsletter: $("#newsletter"),
    newsletterEmail: $("#newsletterEmail"),
    newsletterStatus: $("#newsletterStatus"),
    pickupNote: $("#pickupNote"),
    year: $("#year"),
  };

  /* ---------------- state ---------------- */
  let cart = loadCart();
  let filter = "all";
  let query = "";
  let sort = "featured";
  let shipMethod = "standard";
  let cartOpen = false;
  let checkoutOpen = false;
  let cartReturnFocus = null;
  let checkoutReturnFocus = null;
  let toastTimer = null;
  let lastOrder = null;

  const reduceMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- storage ---------------- */
  function productById(id) {
    return PRODUCTS.find((product) => product.id === id);
  }

  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const clean = {};
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return clean;
      Object.keys(raw).forEach((id) => {
        const qty = Math.floor(Number(raw[id]));
        if (productById(id) && qty > 0) clean[id] = Math.min(99, qty);
      });
      return clean;
    } catch (error) {
      return {};
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      /* private mode or quota — the cart still works for this visit */
    }
  }

  function cartEntries() {
    return PRODUCTS.filter((product) => (cart[product.id] || 0) > 0).map((product) => ({
      product,
      qty: cart[product.id],
    }));
  }

  function cartCount() {
    return cartEntries().reduce((total, entry) => total + entry.qty, 0);
  }

  function subtotal() {
    return cartEntries().reduce((total, entry) => total + entry.product.price * entry.qty, 0);
  }

  function shippingCost() {
    if (shipMethod === "pickup") return 0;
    if (shipMethod === "express") return SHIP_COST.express;
    return subtotal() >= FREE_SHIPPING ? 0 : SHIP_COST.standard;
  }

  /* ---------------- announcements ---------------- */
  function announce(message) {
    if (!els.status) return;
    els.status.textContent = "";
    window.setTimeout(() => {
      els.status.textContent = message;
    }, 30);
  }

  function showToast(message) {
    if (!els.toast) return;
    els.toastText.textContent = message;
    els.toast.classList.add("is-open");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(hideToast, 3800);
  }

  function hideToast() {
    if (!els.toast) return;
    els.toast.classList.remove("is-open");
    window.clearTimeout(toastTimer);
  }

  /* ---------------- catalogue rendering ---------------- */
  function filteredProducts() {
    const needle = query.trim().toLowerCase();
    let items = PRODUCTS.filter((product) => {
      const inCategory = filter === "all" || product.category === filter;
      if (!inCategory) return false;
      if (!needle) return true;
      const haystack = [
        product.name,
        product.meta,
        product.blurb,
        product.code,
        CATEGORIES[product.category],
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });

    if (sort === "price-asc") items = items.slice().sort((a, b) => a.price - b.price);
    if (sort === "price-desc") items = items.slice().sort((a, b) => b.price - a.price);
    if (sort === "name-asc") items = items.slice().sort((a, b) => a.name.localeCompare(b.name));

    return items;
  }

  function cardHTML(product) {
    return `
      <article class="product${product.wide ? " product--wide" : ""}" data-product="${product.id}">
        <div class="product__media">
          <div class="product__media-top">
            <span class="product__cat">${CATEGORIES[product.category]}</span>
            ${product.badge ? `<span class="product__badge">${product.badge}</span>` : ""}
          </div>
          <div class="product__art" aria-hidden="true">${artSvg(product)}</div>
          <span class="product__code">${product.code}</span>
        </div>
        <div class="product__body">
          <div class="product__head">
            <h3 class="product__name">${product.name}</h3>
            <p class="product__meta">${product.meta}</p>
          </div>
          <p class="product__blurb">${product.blurb}</p>
          <p class="product__stock${product.low ? " is-low" : ""}"><i aria-hidden="true"></i>${product.low ? "Low stock" : "In stock"}</p>
          <div class="product__foot">
            <span class="product__price">${money(product.price)}</span>
            <button class="product__add" type="button" data-add="${product.id}" aria-label="Add ${product.name} to cart">
              <span class="product__add-label">Add to cart</span>
              <span class="product__add-icon" aria-hidden="true">+</span>
            </button>
          </div>
        </div>
      </article>`;
  }

  function updateFilterCounts() {
    const counts = { all: PRODUCTS.length, spare: 0, exhaust: 0, apparel: 0, care: 0 };
    PRODUCTS.forEach((product) => {
      counts[product.category] += 1;
    });
    $$("[data-count]").forEach((node) => {
      const key = node.dataset.count;
      node.textContent = counts[key] ?? 0;
    });
  }

  function renderProducts() {
    const items = filteredProducts();
    els.grid.innerHTML = items.map(cardHTML).join("");
    els.grid.setAttribute("aria-busy", "false");

    els.resultCount.textContent = `${items.length} ${items.length === 1 ? "object" : "objects"}`;
    els.emptyState.hidden = items.length !== 0;

    const isFiltered = filter !== "all" || query.trim() !== "" || sort !== "featured";
    els.clearFilters.hidden = !isFiltered;
    els.searchClear.hidden = query === "";

    $$(".filter").forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function setFilter(next) {
    filter = CATEGORIES[next] ? next : "all";
    renderProducts();
  }

  function resetFilters() {
    filter = "all";
    query = "";
    sort = "featured";
    els.search.value = "";
    els.sort.value = "featured";
    renderProducts();
    els.searchClear.hidden = true;
  }

  function scrollToCatalog() {
    els.catalog.scrollIntoView({
      behavior: reduceMotion() ? "auto" : "smooth",
      block: "start",
    });
  }

  /* ---------------- cart rendering ---------------- */
  function cartItemHTML(product, qty) {
    return `
      <article class="cart-item" data-cart-item="${product.id}">
        <div class="cart-item__art" aria-hidden="true">${artSvg(product)}</div>
        <div class="cart-item__body">
          <div class="cart-item__head">
            <h3>${product.name}</h3>
            <button class="cart-item__remove" type="button" data-remove="${product.id}" aria-label="Remove ${product.name} from cart">Remove</button>
          </div>
          <p class="cart-item__meta">${product.meta}</p>
          <div class="cart-item__foot">
            <div class="qty" role="group" aria-label="Quantity for ${product.name}">
              <button type="button" data-qty="-1" data-id="${product.id}" aria-label="Decrease quantity of ${product.name}">&minus;</button>
              <span aria-live="polite">${qty}</span>
              <button type="button" data-qty="1" data-id="${product.id}" aria-label="Increase quantity of ${product.name}">+</button>
            </div>
            <strong>${money(product.price * qty)}</strong>
          </div>
        </div>
      </article>`;
  }

  function renderCart() {
    const entries = cartEntries();
    const count = entries.reduce((total, entry) => total + entry.qty, 0);
    const sub = entries.reduce((total, entry) => total + entry.product.price * entry.qty, 0);

    $$("[data-cart-count]").forEach((node) => {
      node.textContent = count;
      node.dataset.empty = count === 0 ? "true" : "false";
    });

    els.cartOpen.setAttribute("aria-label", `Open cart, ${count} ${count === 1 ? "item" : "items"}`);
    els.cartCountLabel.textContent = `(${count})`;

    els.cartItems.innerHTML = entries.map((entry) => cartItemHTML(entry.product, entry.qty)).join("");
    els.cartEmpty.hidden = count !== 0;
    els.cartFoot.hidden = count === 0;
    els.shipProgress.hidden = count === 0;
    els.cartSubtotal.textContent = money(sub);

    const remaining = FREE_SHIPPING - sub;
    if (remaining > 0) {
      els.shipText.textContent = `${money(remaining)} away from free shipping`;
      els.shipPct.textContent = `${Math.min(99, Math.round((sub / FREE_SHIPPING) * 100))}%`;
      els.shipBar.style.width = `${Math.min(100, (sub / FREE_SHIPPING) * 100)}%`;
    } else {
      els.shipText.textContent = "Free standard shipping unlocked";
      els.shipPct.textContent = "100%";
      els.shipBar.style.width = "100%";
    }

    els.dockCount.textContent = count;
    els.dockTotal.textContent = money(sub);
    els.dock.hidden = count === 0;
    document.body.classList.toggle("has-cart", count > 0);

    updateShipPrices();

    if (checkoutOpen) renderCheckoutTotals();
  }

  function bumpCartCount() {
    $$("[data-cart-count]").forEach((node) => {
      node.classList.remove("is-bumping");
      void node.offsetWidth;
      node.classList.add("is-bumping");
      window.setTimeout(() => node.classList.remove("is-bumping"), 500);
    });
  }

  function flashAddButton(id) {
    const button = els.grid.querySelector(`[data-add="${id}"]`);
    if (!button) return;
    const label = button.querySelector(".product__add-label");
    const icon = button.querySelector(".product__add-icon");
    button.classList.add("is-added");
    if (label) label.textContent = "Added";
    if (icon) icon.textContent = "✓";
    window.clearTimeout(button._addedTimer);
    button._addedTimer = window.setTimeout(() => {
      button.classList.remove("is-added");
      if (label) label.textContent = "Add to cart";
      if (icon) icon.textContent = "+";
    }, 1500);
  }

  function addToCart(id) {
    const product = productById(id);
    if (!product) return;
    cart[id] = Math.min(99, (cart[id] || 0) + 1);
    saveCart();
    renderCart();
    bumpCartCount();
    flashAddButton(id);
    showToast(`${product.name} added to cart`);
  }

  function updateQuantity(id, delta) {
    if (!productById(id)) return;
    const next = (cart[id] || 0) + delta;
    if (next <= 0) {
      delete cart[id];
      announce(`${productById(id).name} removed from cart.`);
    } else {
      cart[id] = Math.min(99, next);
    }
    saveCart();
    renderCart();
    const control = els.cartItems.querySelector(`[data-qty="${delta}"][data-id="${id}"]`);
    if (control) {
      control.focus({ preventScroll: true });
    } else {
      focusAfterCartRemoval();
    }
  }

  function removeFromCart(id) {
    const product = productById(id);
    if (!product) return;
    delete cart[id];
    saveCart();
    renderCart();
    announce(`${product.name} removed from cart.`);
    focusAfterCartRemoval();
  }

  function focusAfterCartRemoval() {
    const next = els.cartItems.querySelector("[data-remove]");
    (next || els.cartClose).focus({ preventScroll: true });
  }

  /* ---------------- shipping + summary ---------------- */
  const DELIVERY_FIELDS = ["address", "city", "postal", "country"];

  function syncShippingUI() {
    if (els.pickupNote) els.pickupNote.hidden = shipMethod !== "pickup";
    if (shipMethod === "pickup") {
      DELIVERY_FIELDS.forEach((id) => setFieldError(id, ""));
    }
  }

  function updateShipPrices() {
    const sub = subtotal();
    $$("[data-ship-price]").forEach((node) => {
      const method = node.dataset.shipPrice;
      if (method === "pickup") {
        node.textContent = "Free";
      } else if (method === "express") {
        node.textContent = money(SHIP_COST.express);
      } else {
        node.textContent = sub >= FREE_SHIPPING ? "Free" : money(SHIP_COST.standard);
      }
    });
  }

  function renderCheckoutTotals() {
    const sub = subtotal();
    const ship = shippingCost();
    els.summarySubtotal.textContent = money(sub);
    els.summaryShipping.textContent = ship === 0 ? "Free" : money(ship);
    els.summaryTotal.textContent = money(sub + ship);
    updateShipPrices();
    syncShippingUI();
  }

  function summaryItemHTML(product, qty) {
    return `
      <li>
        <span class="summary__art" aria-hidden="true">${artSvg(product)}</span>
        <span class="summary__item-copy">
          <strong>${product.name}</strong>
          <span>${product.code} &middot; Qty ${qty}</span>
        </span>
        <span class="summary__item-price">${money(product.price * qty)}</span>
      </li>`;
  }

  function renderCheckout() {
    const entries = cartEntries();
    if (entries.length === 0) {
      closeCheckout(false);
      openCart(els.cartOpen);
      return;
    }

    els.summaryItems.innerHTML = entries
      .map((entry) => summaryItemHTML(entry.product, entry.qty))
      .join("");
    const count = entries.reduce((total, entry) => total + entry.qty, 0);
    els.summaryCount.textContent = `${count} ${count === 1 ? "item" : "items"}`;

    $$('input[name="shipping"]').forEach((radio) => {
      radio.checked = radio.value === shipMethod;
    });

    renderCheckoutTotals();
  }

  /* ---------------- overlays ---------------- */
  function syncScrollLock() {
    document.body.classList.toggle("is-locked", cartOpen || checkoutOpen);
  }

  // Visibility transitions mean focus() silently fails while an overlay is
  // still computed as hidden. Retry across frames until it is focusable.
  function focusWhenOpen(el, tries = 12) {
    if (!el) return;
    const attempt = () => {
      if (!el.isConnected) return;
      if (getComputedStyle(el).visibility === "hidden") {
        if (tries-- > 0) window.requestAnimationFrame(attempt);
        return;
      }
      el.focus({ preventScroll: true });
      if (document.activeElement !== el && tries-- > 0) {
        window.requestAnimationFrame(attempt);
      }
    };
    window.requestAnimationFrame(attempt);
  }

  function openCart(opener) {
    if (cartOpen) return;
    closeMenu(false);
    cartReturnFocus = opener || document.activeElement;
    cartOpen = true;
    els.drawer.classList.add("is-open");
    els.drawer.removeAttribute("inert");
    els.drawer.setAttribute("aria-hidden", "false");
    els.scrim.classList.add("is-open");
    els.scrim.setAttribute("aria-hidden", "false");
    renderCart();
    syncScrollLock();
    focusWhenOpen(els.cartClose);
  }

  function closeCart(restoreFocus = true) {
    if (!cartOpen) return;
    cartOpen = false;
    els.drawer.classList.remove("is-open");
    els.drawer.setAttribute("aria-hidden", "true");
    els.drawer.setAttribute("inert", "");
    els.scrim.classList.remove("is-open");
    els.scrim.setAttribute("aria-hidden", "true");
    syncScrollLock();
    if (restoreFocus && cartReturnFocus && document.contains(cartReturnFocus)) {
      cartReturnFocus.focus({ preventScroll: true });
    }
  }

  function openCheckout() {
    if (cartCount() === 0) {
      openCart(els.cartOpen);
      return;
    }

    checkoutReturnFocus = cartOpen ? els.cartOpen : document.activeElement;
    if (cartOpen) closeCart(false);

    checkoutOpen = true;
    els.checkoutDone.hidden = true;
    els.checkoutScroll.hidden = false;
    els.checkout.classList.add("is-open");
    els.checkout.removeAttribute("inert");
    els.checkout.setAttribute("aria-hidden", "false");
    renderCheckout();
    syncScrollLock();
    window.requestAnimationFrame(() => {
      els.checkoutScroll.scrollTop = 0;
    });
    focusWhenOpen(els.checkoutClose);
  }

  function closeCheckout(restoreFocus = true) {
    if (!checkoutOpen) return;
    checkoutOpen = false;
    els.checkout.classList.remove("is-open");
    els.checkout.setAttribute("aria-hidden", "true");
    els.checkout.setAttribute("inert", "");
    syncScrollLock();
    if (restoreFocus && checkoutReturnFocus && document.contains(checkoutReturnFocus)) {
      checkoutReturnFocus.focus({ preventScroll: true });
    }
  }

  function openMenu() {
    if (document.body.classList.contains("menu-open")) return;
    document.body.classList.add("menu-open");
    els.navToggle.setAttribute("aria-expanded", "true");
    els.navToggle.setAttribute("aria-label", "Close menu");
    focusWhenOpen(els.navLinks.querySelector(".nav__link"));
  }

  function closeMenu(restoreFocus = true) {
    if (!document.body.classList.contains("menu-open")) return;
    document.body.classList.remove("menu-open");
    els.navToggle.setAttribute("aria-expanded", "false");
    els.navToggle.setAttribute("aria-label", "Open menu");
    if (restoreFocus) els.navToggle.focus({ preventScroll: true });
  }

  function trapFocus(container, event) {
    const focusable = $$(
      'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
      container
    ).filter((node) => node.getClientRects().length > 0 && !node.closest("[hidden]"));

    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!container.contains(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ---------------- validation ---------------- */
  const validators = {
    email: (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? "" : "Enter a valid email address.",
    firstName: (value) => (value.trim().length >= 2 ? "" : "Enter your first name."),
    lastName: (value) => (value.trim().length >= 2 ? "" : "Enter your last name."),
    address: (value) => (value.trim().length >= 4 ? "" : "Enter a delivery address."),
    city: (value) => (value.trim().length >= 2 ? "" : "Enter your city."),
    postal: (value) => (value.trim().length >= 3 ? "" : "Enter a postal code."),
    country: (value) => (value ? "" : "Choose a delivery country."),
  };

  function setFieldError(id, message) {
    const input = document.getElementById(id);
    if (!input) return;
    const field = input.closest(".field");
    const error = document.getElementById(`${id}Error`);
    if (!field || !error) return;
    if (message) {
      field.classList.add("is-invalid");
      input.setAttribute("aria-invalid", "true");
      error.textContent = message;
    } else {
      field.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
      error.textContent = "";
    }
  }

  function clearField(field) {
    if (!field) return;
    field.classList.remove("is-invalid");
    const control = field.querySelector("input,select,textarea");
    if (control) control.removeAttribute("aria-invalid");
    const error = field.querySelector(".field__error");
    if (error) error.textContent = "";
  }

  function validateCheckout() {
    let firstInvalid = null;

    Object.keys(validators).forEach((id) => {
      const input = document.getElementById(id);
      if (!input) return;
      if (shipMethod === "pickup" && DELIVERY_FIELDS.includes(id)) {
        setFieldError(id, "");
        return;
      }
      const message = validators[id](input.value);
      setFieldError(id, message);
      if (message && !firstInvalid) firstInvalid = input;
    });

    const terms = els.terms;
    const termsWrap = terms.closest(".check");
    els.termsError.textContent = "";
    termsWrap.classList.remove("is-invalid");

    if (!terms.checked) {
      els.termsError.textContent = "Please confirm the reservation before placing the order.";
      termsWrap.classList.add("is-invalid");
      if (!firstInvalid) firstInvalid = terms;
    }

    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({
        behavior: reduceMotion() ? "auto" : "smooth",
        block: "center",
      });
      announce("Please check the highlighted checkout fields.");
      return false;
    }
    return true;
  }

  function orderReference() {
    return `MC-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  }

  /* ---------------- checkout submit ---------------- */
  function placeOrder(event) {
    event.preventDefault();
    if (!validateCheckout()) return;

    lastOrder = {
      ref: orderReference(),
      email: els.checkoutForm.email.value.trim(),
      total: subtotal() + shippingCost(),
    };

    els.doneRef.textContent = lastOrder.ref;
    els.doneEmail.textContent = lastOrder.email;
    els.doneTotal.textContent = money(lastOrder.total);

    els.checkoutScroll.hidden = true;
    els.checkoutDone.hidden = false;
    els.checkoutDone.scrollTop = 0;

    const doneInner = els.checkoutDone.querySelector(".checkout__done-inner");
    if (doneInner) {
      doneInner.setAttribute("tabindex", "-1");
      window.requestAnimationFrame(() => doneInner.focus({ preventScroll: true }));
    }

    announce(
      `Order ${lastOrder.ref} reserved for ${lastOrder.email}. Payment gateway not connected. No charge was made.`
    );
  }

  /* ---------------- events ---------------- */
  // products
  els.grid.addEventListener("click", (event) => {
    const add = event.target.closest("[data-add]");
    if (!add) return;
    addToCart(add.dataset.add);
  });

  // filters
  els.filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    setFilter(button.dataset.filter);
    announce(`${filter === "all" ? "All" : CATEGORIES[filter]} shown. ${filteredProducts().length} objects.`);
  });

  // search
  els.search.addEventListener("input", () => {
    query = els.search.value;
    renderProducts();
  });

  els.search.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.search.value) {
      event.preventDefault();
      els.search.value = "";
      query = "";
      renderProducts();
      els.search.focus();
    }
  });

  els.searchClear.addEventListener("click", () => {
    els.search.value = "";
    query = "";
    renderProducts();
    els.search.focus();
  });

  els.sort.addEventListener("change", () => {
    sort = els.sort.value;
    renderProducts();
  });

  els.clearFilters.addEventListener("click", resetFilters);
  els.emptyReset.addEventListener("click", () => {
    resetFilters();
    els.search.focus();
  });

  // menu filter links + footer links
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-shop-filter]");
    if (!link) return;
    event.preventDefault();
    setFilter(link.dataset.shopFilter);
    closeMenu(false);
    scrollToCatalog();
  });

  // cart line items
  els.cartItems.addEventListener("click", (event) => {
    const remove = event.target.closest("[data-remove]");
    if (remove) {
      removeFromCart(remove.dataset.remove);
      return;
    }
    const quantity = event.target.closest("[data-qty]");
    if (quantity) {
      updateQuantity(quantity.dataset.id, Number(quantity.dataset.qty));
    }
  });

  // overlays
  els.cartOpen.addEventListener("click", () => openCart(els.cartOpen));
  els.dock.addEventListener("click", () => openCart(els.dock));
  els.toastView.addEventListener("click", () => {
    hideToast();
    openCart(els.cartOpen);
  });
  els.cartClose.addEventListener("click", () => closeCart());
  els.scrim.addEventListener("click", () => closeCart());
  els.cartContinue.addEventListener("click", () => closeCart());
  els.cartBrowse.addEventListener("click", () => {
    closeCart(false);
    scrollToCatalog();
  });
  els.checkoutStart.addEventListener("click", () => openCheckout());
  els.checkoutClose.addEventListener("click", () => closeCheckout());
  els.checkoutBack.addEventListener("click", () => {
    closeCheckout(false);
    openCart(els.cartOpen);
  });
  els.doneCart.addEventListener("click", () => {
    closeCheckout(false);
    openCart(els.cartOpen);
  });
  els.doneShop.addEventListener("click", () => {
    closeCheckout();
    scrollToCatalog();
  });

  // menu
  els.navToggle.addEventListener("click", () => {
    if (document.body.classList.contains("menu-open")) closeMenu();
    else openMenu();
  });

  $$("a", els.navLinks).forEach((link) => {
    link.addEventListener("click", () => closeMenu(false));
  });

  // checkout form
  els.checkoutForm.addEventListener("submit", placeOrder);

  els.checkoutForm.addEventListener("input", (event) => {
    const field = event.target.closest(".field");
    if (field) clearField(field);
  });

  els.checkoutForm.addEventListener("change", (event) => {
    if (event.target.name === "shipping") {
      shipMethod = event.target.value;
      renderCheckoutTotals();
      return;
    }
    if (event.target.id === "terms") {
      els.termsError.textContent = "";
      event.target.closest(".check").classList.remove("is-invalid");
      return;
    }
    const field = event.target.closest(".field");
    if (field) clearField(field);
  });

  // newsletter
  if (els.newsletter) {
    els.newsletter.addEventListener("submit", (event) => {
      event.preventDefault();
      els.newsletterStatus.textContent = "You're on the list. We'll write when the next batch lands.";
      els.newsletterEmail.value = "";
    });
  }

  // keyboard
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (checkoutOpen) {
        closeCheckout();
        return;
      }
      if (cartOpen) {
        closeCart();
        return;
      }
      if (document.body.classList.contains("menu-open")) {
        closeMenu();
        return;
      }
      hideToast();
      return;
    }

    if (event.key !== "Tab") return;

    if (checkoutOpen) {
      trapFocus(els.checkout, event);
    } else if (cartOpen) {
      trapFocus(els.drawer, event);
    } else if (document.body.classList.contains("menu-open")) {
      trapFocus(els.navLinks, event);
    }
  });

  // cross-tab cart sync
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    cart = loadCart();
    renderCart();
  });

  /* ---------------- boot ---------------- */
  if (els.year) els.year.textContent = new Date().getFullYear();
  updateFilterCounts();
  renderProducts();
  renderCart();
})();
