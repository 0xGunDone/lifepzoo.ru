import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const storesPath = path.join(rootDir, "data", "stores.json");

const SITE = {
  name: "Живая планета",
  domain: "https://lifepzoo.ru",
  city: "Тверь",
  phoneHref: "+74822755613",
  phoneDisplay: "+7 (4822) 75-56-13",
  shortPhone: "75-56-13",
  hoursDisplay: "Пн–Пт 10:00–20:00, Сб–Вс 10:00–18:00",
  deliveryThresholdLabel: "1500 ₽",
  deliveryThresholdText: "1500 руб",
  vkUrl: "https://vk.ru/tverzoo",
  instagramUrl: "https://www.instagram.com/tver.zooru",
  yandexMapsApiKey: "49c86b83-a47b-40c8-aaa9-f88b8e863d6e",
  ogHomeImage: "/images/og-home.webp"
};

const STORE_IMAGE = {
  width: 1536,
  height: 1024
};

const RESPONSIVE_WIDTHS = [480, 768, 1200];

const catalogItems = [
  ["Корма и лакомства", "Линейки от эконом до премиум и лечебные рационы."],
  ["Витамины и добавки", "Поддержка иммунитета, шерсти, суставов и пищеварения."],
  ["Ветпрепараты", "Средства для лечения и профилактики заболеваний животных."],
  ["Уход и гигиена", "Шампуни, наполнители, средства для чистоты и комфорта."],
  ["Амуниция", "Ошейники, поводки, шлейки, переноски и миски."],
  ["Игрушки и уют", "Лежаки, домики, одежда и развивающие игрушки."]
];

const bentoItems = [
  {
    classes: "bento-card large reveal",
    eyebrow: "Сеть 8 магазинов",
    title: "Ближе, чем кажется",
    text: "Мы работаем в разных районах Твери — выбирайте ближайший магазин и получайте консультацию на месте.",
    extra: `
      <div class="bento-stats">
        <div>
          <span class="bento-stat">8</span>
          <span class="bento-label">магазинов в городе</span>
        </div>
        <div>
          <span class="bento-stat">${SITE.deliveryThresholdLabel}</span>
          <span class="bento-label">доставка бесплатно</span>
        </div>
      </div>
    `
  },
  {
    classes: "bento-card tall accent reveal",
    icon: "💊",
    title: "Ветаптека",
    text: "Препараты для лечения и профилактики, подбор с учетом веса и возраста питомца."
  },
  {
    classes: "bento-card wide reveal",
    icon: "🍗",
    title: "Корма и лечебные рационы",
    text: "Эконом, премиум, диетические и специализированные корма для собак и кошек."
  },
  {
    classes: "bento-card reveal",
    icon: "🐾",
    title: "Уход и гигиена",
    text: "Шампуни, наполнители, средства для чистоты и ухода за шерстью."
  },
  {
    classes: "bento-card reveal",
    icon: "🦴",
    title: "Амуниция и аксессуары",
    text: "Ошейники, поводки, игрушки, миски, лежаки и одежда."
  },
  {
    classes: "bento-card highlight reveal",
    icon: "📦",
    title: "Быстрый заказ",
    text: "Позвоните — подберём, забронируем и подготовим заказ к выдаче."
  }
];

const steps = [
  ["01", "Свяжитесь с нами", "Позвоните или приходите в ближайший магазин — ответим на вопросы и уточним наличие."],
  ["02", "Подбираем решение", "Учитываем возраст, породу и особенности питомца: корм, витамины, уход или ветпрепараты."],
  ["03", "Быстро получаете заказ", `Самовывоз из магазина или бесплатная доставка по Твери от ${SITE.deliveryThresholdLabel}.`],
  ["04", "Поддержка и забота", "Помогаем с дальнейшими рекомендациями, чтобы питомец оставался здоровым и активным."]
];

const guideItems = [
  ["Возраст", "Щенкам и котятам нужны более калорийные рационы, взрослым — баланс поддержания, пожилым — щадящие формулы."],
  ["Размер и активность", "Мелкие и крупные породы имеют разную норму, а активным питомцам нужен повышенный уровень белка и энергии."],
  ["Здоровье", "Чувствительное пищеварение, стерилизация, кожа и шерсть, суставы — подбираем специализированные корма и добавки."]
];

const faqItems = [
  ["Есть ли доставка по Твери?", `Да, доставка бесплатная при сумме заказа от ${SITE.deliveryThresholdLabel}.`],
  ["Сколько магазинов в сети?", "У нас 8 магазинов в разных районах Твери."],
  ["Какие товары можно купить?", "Корма, витамины, лакомства, ветпрепараты, амуниция, средства гигиены и товары для ухода."],
  ["Можно ли получить консультацию?", "Да, наши продавцы помогут подобрать питание, уход и ветпрепараты под особенности питомца."],
  ["Какой график работы?", SITE.hoursDisplay + "."],
  ["Есть ли ветаптека?", "Да, «Живая планета» — сеть специализированных ветеринарных аптек-магазинов."]
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function pathToUrl(value) {
  return `${SITE.domain}${value}`;
}

function imageUrl(store, photoName) {
  return `/places/${store.slug}/${photoName}`;
}

function storeOgImage(store) {
  return `/places/${store.slug}/og.webp`;
}

function variantPath(imagePath, width) {
  return imagePath.replace(/\.webp$/, `-${width}.webp`);
}

async function loadStores() {
  const raw = await readFile(storesPath, "utf8");
  return JSON.parse(raw);
}

function routeUrl(routeAddress) {
  return `https://yandex.ru/maps/?mode=routes&rtext=~${encodeURIComponent(routeAddress)}`;
}

function cardAddress(store) {
  if (store.slug === "esenina") {
    return "Батино, ул. Сергея Есенина, 1а (ТЦ «Есенин»)";
  }
  return store.displayAddress;
}

function storePagePath(store) {
  return `/places/${store.slug}/`;
}

function storeDisplayName(store) {
  return `${SITE.name} — ${cardAddress(store)}`;
}

function jsonLdScript(payload) {
  return `<script type="application/ld+json">${JSON.stringify(payload)}</script>`;
}

function buildStoreSchema(store) {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: storeDisplayName(store),
    url: pathToUrl(storePagePath(store)),
    image: pathToUrl(imageUrl(store, store.photos[0])),
    telephone: SITE.phoneDisplay,
    address: {
      "@type": "PostalAddress",
      streetAddress: store.displayAddress,
      addressLocality: SITE.city,
      addressCountry: "RU"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: store.coordinates[0],
      longitude: store.coordinates[1]
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "10:00",
        closes: "20:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "10:00",
        closes: "18:00"
      }
    ],
    parentOrganization: {
      "@type": "Organization",
      name: SITE.name
    }
  };
}

async function responsiveSources(imagePath) {
  const candidates = [];
  for (const width of RESPONSIVE_WIDTHS) {
    const candidate = variantPath(imagePath, width);
    try {
      await access(path.join(rootDir, candidate.replace(/^\//, "")));
      candidates.push(`${candidate} ${width}w`);
    } catch {
      // Ignore missing variants and fall back to the original image.
    }
  }
  candidates.push(`${imagePath} ${STORE_IMAGE.width}w`);
  return candidates.join(", ");
}

async function renderPhoto(imagePath, alt, options = {}) {
  const srcset = await responsiveSources(imagePath);
  const sizes = options.sizes || "(max-width: 720px) 92vw, 40vw";
  const loading = options.loading || "lazy";
  const fetchpriority = options.fetchpriority ? ` fetchpriority="${options.fetchpriority}"` : "";
  return `<img src="${imagePath}" srcset="${srcset}" sizes="${sizes}" alt="${escapeHtml(alt)}" width="${STORE_IMAGE.width}" height="${STORE_IMAGE.height}" loading="${loading}" decoding="async"${fetchpriority} />`;
}

function renderHead({
  title,
  description,
  canonical,
  ogImage,
  ldJson,
  twitterCard = "summary_large_image",
  preloadImages = []
}) {
  const preloads = preloadImages
    .map((image) => `<link rel="preload" as="image" href="${image}" />`)
    .join("\n  ");

  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${canonical}" />
  <meta name="theme-color" content="#0f1014" />
  <meta name="color-scheme" content="light dark" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:site_name" content="${SITE.name}" />
  <meta property="og:locale" content="ru_RU" />
  <meta property="og:image" content="${pathToUrl(ogImage)}" />
  <meta name="twitter:card" content="${twitterCard}" />
  <meta name="twitter:image" content="${pathToUrl(ogImage)}" />
  <meta name="yandex-maps-key" content="${SITE.yandexMapsApiKey}" />
  <link rel="icon" type="image/svg+xml" href="/images/icongreen.svg" />
  <link rel="apple-touch-icon" href="/images/icongreen.svg" />
  <link rel="preload" href="/fonts/manrope-cyrillic.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/fonts/unbounded-cyrillic.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="/fonts.css" />
  <link rel="stylesheet" href="/styles.css" />
  ${preloads}
  ${jsonLdScript(ldJson)}
</head>`;
}

function renderHeader(home) {
  const navPrefix = home ? "" : "/";
  return `
  <a href="#main-content" class="skip-link">Перейти к основному содержанию</a>

  <div class="noise"></div>
  <div class="paw-pattern" aria-hidden="true"></div>

  <button class="scroll-to-top" id="scrollToTop" aria-label="Наверх">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  </button>

  <header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="/" aria-label="${SITE.name}">
        <img class="logo-icon" src="/images/icongreen.svg" alt="${SITE.name}" width="59" height="59" />
        <div class="logo-stack">
          <img class="logo-text" src="/images/text.svg" alt="${SITE.name}" width="180" height="36" />
        </div>
      </a>
      <nav id="main-nav" class="nav" aria-label="Основная навигация">
        <a href="${navPrefix}#about">О сети</a>
        <a href="${navPrefix}#catalog">Ассортимент</a>
        <a href="${navPrefix}#stores">Магазины</a>
        <a href="${navPrefix}#contacts">Контакты</a>
        <a class="nav-cta" href="tel:${SITE.phoneHref}" aria-label="Позвонить по телефону ${SITE.phoneDisplay}">
          <span class="nav-cta-icon" aria-hidden="true">&#9742;&#xfe0e;</span>
        </a>
      </nav>
      <div class="header-actions">
        <button class="theme-toggle" type="button" aria-label="Переключить тему оформления. Текущая тема: светлая">
          <span class="theme-toggle-track" aria-hidden="true" role="presentation">
            <span class="theme-toggle-icon sun">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v3"></path>
                <path d="M12 19v3"></path>
                <path d="M2 12h3"></path>
                <path d="M19 12h3"></path>
                <path d="M4.6 4.6l2.1 2.1"></path>
                <path d="M17.3 17.3l2.1 2.1"></path>
                <path d="M4.6 19.4l2.1-2.1"></path>
                <path d="M17.3 6.7l2.1-2.1"></path>
              </svg>
            </span>
            <span class="theme-toggle-icon moon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 1 0 11.5 11.5z"></path>
              </svg>
            </span>
            <span class="theme-toggle-thumb"></span>
          </span>
        </button>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="main-nav">Меню</button>
      </div>
    </div>
  </header>

  <div class="menu-overlay" aria-hidden="true"></div>`;
}

function renderFooter(year = new Date().getFullYear()) {
  return `
  <footer class="footer">
    <div class="container footer-inner">
      <div>
        <div class="footer-brand">
          <img src="/images/icongreen.svg" alt="${SITE.name}" width="59" height="59" />
          <img class="logo-text" src="/images/text.svg" alt="${SITE.name}" width="180" height="36" />
        </div>
      </div>
      <div class="footer-info">© ${year}. ${SITE.city}. Сделано с ❤️ к животным by lapkee.studio</div>
    </div>
  </footer>`;
}

function renderMobileNav(home) {
  const navPrefix = home ? "" : "/";
  return `
  <nav class="mobile-nav" aria-label="Мобильная навигация">
    <div class="mobile-nav-inner">
      <a href="tel:${SITE.phoneHref}" class="mobile-nav-item">
        <svg class="mobile-nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
        <span>Звонок</span>
      </a>
      <a href="${navPrefix}#catalog" class="mobile-nav-item">
        <svg class="mobile-nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
        <span>Каталог</span>
      </a>
      <a href="${navPrefix}#stores" class="mobile-nav-item">
        <svg class="mobile-nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>Магазины</span>
      </a>
      <a href="${navPrefix}#contacts" class="mobile-nav-item">
        <svg class="mobile-nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16v12H4z"/>
          <path d="M22 7l-10 7L2 7"/>
        </svg>
        <span>Контакты</span>
      </a>
    </div>
  </nav>`;
}

function renderMapShell({ id, ariaLabel, dataId, buttonLabel }) {
  return `
        <div class="map-box reveal">
          <div id="${id}" class="map-canvas is-idle" data-map-canvas="${id}" aria-label="${ariaLabel}"></div>
          <div class="map-placeholder">
            <p>Интерактивная карта загружается только по запросу, чтобы страница открывалась быстрее.</p>
            <button class="btn ghost map-load-button" type="button" data-map-trigger="${dataId}">${buttonLabel}</button>
          </div>
          <div class="map-warning" role="status" aria-live="polite"></div>
        </div>`;
}

async function renderHome(stores) {
  const heroPrimary = await renderPhoto("/places/komsomolsky/1.webp", "Магазин Живая планета в Твери", {
    sizes: "(max-width: 720px) 92vw, (max-width: 1200px) 54vw, 42vw",
    loading: "eager",
    fetchpriority: "high"
  });
  const heroSecondary = await renderPhoto("/places/lenina/1.webp", "Интерьер магазина Живая планета", {
    sizes: "(max-width: 720px) 92vw, (max-width: 1200px) 40vw, 30vw",
    loading: "eager"
  });

  const storesJsonLd = stores.map(buildStoreSchema);
  const homeLdJson = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE.name,
      url: `${SITE.domain}/`,
      logo: pathToUrl("/images/icongreen.svg"),
      description: "Сеть зоомагазинов и ветеринарных аптек в Твери.",
      areaServed: SITE.city,
      telephone: SITE.phoneDisplay,
      sameAs: [SITE.vkUrl, SITE.instagramUrl]
    },
    ...storesJsonLd,
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer
        }
      }))
    }
  ];

  const storeCards = stores
    .map((store) => {
      const route = routeUrl(store.routeAddress);
      return `
          <article class="store-card reveal">
            <h3><a class="store-title-link" href="${storePagePath(store)}">${cardAddress(store)}</a></h3>
            <p>Ежедневно: ${SITE.hoursDisplay}</p>
            <div class="store-card-actions">
              <a class="store-page-link" href="${storePagePath(store)}">Подробнее о магазине</a>
              <a class="store-route-link" href="${route}" target="_blank" rel="noreferrer">Маршрут</a>
            </div>
          </article>`;
    })
    .join("");

  const benefits = bentoItems
    .map((item) => `
          <article class="${item.classes}">
            ${item.eyebrow ? `<div class="bento-eyebrow">${item.eyebrow}</div>` : ""}
            ${item.icon ? `<span class="bento-icon">${item.icon}</span>` : ""}
            <h3>${item.title}</h3>
            <p>${item.text}</p>
            ${item.extra || ""}
          </article>`)
    .join("");

  const catalog = catalogItems
    .map(
      ([title, text]) => `
          <article class="catalog-card reveal">
            <h3>${title}</h3>
            <p>${text}</p>
          </article>`
    )
    .join("");

  const stepsMarkup = steps
    .map(
      ([num, title, text]) => `
          <article class="step-card reveal">
            <div class="step-num">${num}</div>
            <h3>${title}</h3>
            <p>${text}</p>
          </article>`
    )
    .join("");

  const guideMarkup = guideItems
    .map(
      ([title, text]) => `
          <article class="guide-card reveal">
            <h3>${title}</h3>
            <p>${text}</p>
          </article>`
    )
    .join("");

  const faqMarkup = faqItems
    .map(
      ([question, answer]) => `
          <details class="faq-item reveal">
            <summary>${question}</summary>
            <p>${answer}</p>
          </details>`
    )
    .join("");

  const storeMapData = stores.map((store) => ({
    title: storeDisplayName(store),
    address: cardAddress(store),
    url: storePagePath(store),
    coordinates: store.coordinates
  }));

  return `${renderHead({
    title: `${SITE.name} — зоомагазин и ветаптека в Твери`,
    description: `Сеть зоомагазинов и ветеринарных аптек в Твери: корма, витамины, лекарства и товары для питомцев. 8 магазинов, бесплатная доставка от ${SITE.deliveryThresholdText}.`,
    canonical: `${SITE.domain}/`,
    ogImage: SITE.ogHomeImage,
    ldJson: homeLdJson,
    preloadImages: ["/places/komsomolsky/1-1200.webp", "/places/lenina/1-768.webp"]
  })}
<body>
  ${renderHeader(true)}

  <main id="top">
    <section class="hero" id="main-content">
      <div class="container hero-grid">
        <div class="hero-copy reveal">
          <div class="pill">8 магазинов в Твери</div>
          <h1>Зоомагазин и ветаптека в Твери — забота о питомцах в каждом районе</h1>
          <p class="lead">
            Корма, витамины, лекарства, уход, амуниция и уют для ваших любимцев. Ветаптека и консультации — в шаговой доступности.
          </p>
          <div class="trust-badge">
            <span>🏪 8 магазинов</span>
            <span>•</span>
            <span>🚚 Доставка от ${SITE.deliveryThresholdLabel}</span>
            <span>•</span>
            <span>💬 Консультация</span>
          </div>
          <div class="hero-actions">
            <a class="btn primary" href="tel:${SITE.phoneHref}">${SITE.phoneDisplay}</a>
            <a class="btn ghost" href="#stores">Адреса магазинов</a>
          </div>
          <div class="hero-meta">
            <div>
              <span class="meta-label">Бесплатная доставка</span>
              <span class="meta-value">от ${SITE.deliveryThresholdText} по Твери</span>
            </div>
            <div>
              <span class="meta-label">VK</span>
              <span class="meta-value"><a href="${SITE.vkUrl}" target="_blank" rel="noreferrer">vk.ru/tverzoo</a></span>
            </div>
            <div>
              <span class="meta-label">Instagram</span>
              <span class="meta-value"><a href="${SITE.instagramUrl}" target="_blank" rel="noreferrer">@tver.zooru</a></span>
            </div>
          </div>
        </div>
        <div class="hero-visual reveal">
          <div class="hero-photo primary">
            ${heroPrimary}
          </div>
          <div class="hero-photo secondary">
            ${heroSecondary}
          </div>
          <div class="hero-glow" aria-hidden="true"></div>
          <div class="hero-card">
            <div class="card-top">
              <span class="tag">Ветаптека</span>
              <span class="tag green">Зоомагазин</span>
            </div>
            <div class="card-brand">
              <img src="/images/icongreen.svg" alt="" aria-hidden="true" width="59" height="59" />
              <span>Официальная сеть</span>
            </div>
            <h2>${SITE.name}</h2>
            <p>Специализированная сеть ветеринарных аптек-магазинов.</p>
            <div class="card-list">
              <div>
                <span class="dot"></span>
                <span>Широкий выбор кормов: от эконом до премиум</span>
              </div>
              <div>
                <span class="dot"></span>
                <span>Лекарства и профилактика заболеваний животных</span>
              </div>
              <div>
                <span class="dot"></span>
                <span>Консультации по уходу, кормлению и содержанию</span>
              </div>
            </div>
            <div class="card-footer">
              <span>Работаем ежедневно</span>
              <span class="hours">${SITE.hoursDisplay}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-ticker" aria-hidden="true">
        <div class="ticker-track">
          <span>Корма • Ветаптека • Витамины • Игрушки • Уход • Консультации • Доставка по Твери •</span>
          <span>Корма • Ветаптека • Витамины • Игрушки • Уход • Консультации • Доставка по Твери •</span>
        </div>
      </div>
      <div class="hero-shapes" aria-hidden="true" role="presentation">
        <span class="shape one parallax-layer" data-speed="0.5"></span>
        <span class="shape two parallax-layer" data-speed="0.6"></span>
        <span class="shape three parallax-layer" data-speed="0.7"></span>
      </div>
    </section>

    <section id="about" class="about">
      <div class="container about-grid">
        <div class="about-copy reveal">
          <h2>Сеть зоомагазинов и ветаптек «${SITE.name}»</h2>
          <p>
            Мы следим за актуальными акциями, делимся полезными советами и радуем вас интересными новостями. В каждом магазине — внимательные продавцы и большой выбор товаров для питомцев.
          </p>
          <div class="stats">
            <div class="stat">
              <span class="stat-num">8</span>
              <span class="stat-label">магазинов в Твери</span>
            </div>
            <div class="stat">
              <span class="stat-num">${SITE.deliveryThresholdLabel}</span>
              <span class="stat-label">порог бесплатной доставки</span>
            </div>
            <div class="stat">
              <span class="stat-num">100+</span>
              <span class="stat-label">товаров для здоровья и ухода</span>
            </div>
          </div>
        </div>
        <div class="about-panel reveal">
          <h3>Что у нас есть</h3>
          <ul>
            <li>Корма, лакомства и витамины</li>
            <li>Средства по уходу и гигиене</li>
            <li>Игрушки, одежда, лежаки и аксессуары</li>
            <li>Ветеринарные препараты и профилактика</li>
          </ul>
          <div class="note">Продавцы помогут подобрать питание и уход с учетом возраста и особенностей питомца.</div>
        </div>
      </div>
    </section>

    <section id="benefits" class="bento">
      <div class="container">
        <div class="section-head reveal">
          <h2>${SITE.name} — всё для здоровья и комфорта питомцев</h2>
          <p>Сеть зоомагазинов и ветаптек в Твери, где легко найти питание, уход и ветеринарные решения в одном месте.</p>
        </div>
        <div class="bento-grid">
          ${benefits}
        </div>
      </div>
    </section>

    <section id="catalog" class="catalog">
      <div class="container">
        <div class="section-head reveal">
          <h2>Ассортимент</h2>
          <p>От ежедневного питания до товаров для активных прогулок и комфорта дома.</p>
        </div>
        <div class="catalog-grid">
          ${catalog}
        </div>
      </div>
    </section>

    <section id="how" class="steps">
      <div class="container">
        <div class="section-head reveal">
          <h2>Как мы помогаем</h2>
          <p>Простой путь от запроса до заботы о питомце — с консультацией и подбором под ваши задачи.</p>
        </div>
        <div class="steps-grid">
          ${stepsMarkup}
        </div>
      </div>
    </section>

    <section id="guide" class="guide">
      <div class="container">
        <div class="section-head reveal">
          <h2>Как подобрать корм</h2>
          <p>Учитываем возраст, размер и здоровье питомца — это основа правильного питания.</p>
        </div>
        <div class="guide-grid">
          ${guideMarkup}
        </div>
        <div class="guide-note reveal">Нужна помощь? Мы подскажем по составам и подберём рацион под конкретные потребности питомца.</div>
      </div>
    </section>

    <section id="pharmacy" class="pharmacy">
      <div class="container pharmacy-grid">
        <div class="pharmacy-copy reveal">
          <h2>Ветаптека рядом с домом</h2>
          <p>
            У нас широкий ассортимент ветеринарных препаратов для лечения и профилактики заболеваний животных. Поможем подобрать средства и объясним, как правильно применять.
          </p>
          <div class="pharmacy-tags">
            <span>Профилактика</span>
            <span>Лечение</span>
            <span>Консультации</span>
          </div>
        </div>
        <div class="pharmacy-card reveal">
          <h3>Почему выбирают нас</h3>
          <div class="pharmacy-points">
            <div>
              <span class="icon">✦</span>
              <span>Специализированные аптечные товары</span>
            </div>
            <div>
              <span class="icon">✦</span>
              <span>Подбор с учетом веса и возраста питомца</span>
            </div>
            <div>
              <span class="icon">✦</span>
              <span>Регулярные акции и розыгрыши</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="delivery" class="delivery">
      <div class="container delivery-grid">
        <div class="delivery-card reveal">
          <h2>Бесплатная доставка по Твери</h2>
          <p>Оформляйте заказ на товары для питомцев и получайте доставку бесплатно при сумме от ${SITE.deliveryThresholdText}.</p>
          <div class="delivery-highlight">
            <span>от ${SITE.deliveryThresholdLabel}</span>
            <span>по городу</span>
          </div>
        </div>
        <div class="delivery-note reveal">
          <h3>Нужна консультация?</h3>
          <p>Позвоните нам — подскажем по наличию, составам и подбору товаров.</p>
          <a class="btn primary" href="tel:${SITE.phoneHref}">Позвонить</a>
        </div>
      </div>
    </section>

    <section id="promos" class="promo">
      <div class="container promo-grid">
        <div class="promo-copy reveal">
          <h2>Акции, розыгрыши и полезные советы</h2>
          <p>В нашей группе VK вы можете следить за скидками, розыгрышами и подборками по уходу, кормлению и здоровью питомцев.</p>
          <div class="promo-actions">
            <a class="btn primary" href="${SITE.vkUrl}" target="_blank" rel="noreferrer">Перейти в VK</a>
            <a class="btn ghost" href="${SITE.instagramUrl}" target="_blank" rel="noreferrer">Перейти в Instagram</a>
          </div>
          <div class="promo-tags">
            <span>Скидки на корма</span>
            <span>Розыгрыши</span>
            <span>Подбор рациона</span>
            <span>Советы по уходу</span>
          </div>
        </div>
        <div class="promo-card reveal">
          <div class="promo-card-top">
            <span class="promo-label">${SITE.name}</span>
            <span class="promo-badge">8 магазинов</span>
          </div>
          <h3>Всегда рядом с вами</h3>
          <p>Соберём заказ заранее, подготовим к выдаче и подскажем, где удобнее забрать.</p>
          <div class="promo-list">
            <div><span class="dot"></span>Единый телефон для всех точек</div>
            <div><span class="dot"></span>Консультации по уходу и лечению</div>
            <div><span class="dot"></span>Быстрый поиск редких позиций</div>
          </div>
        </div>
      </div>
    </section>

    <section id="stores" class="stores">
      <div class="container">
        <div class="section-head reveal">
          <h2>Наши магазины в Твери</h2>
          <p>8 магазинов в разных районах города. Единый номер для связи: ${SITE.shortPhone}.</p>
        </div>
        <div class="stores-grid">
          ${storeCards}
        </div>
        <div class="stores-note reveal">
          <p>Если нужен конкретный товар — позвоните заранее, мы проверим наличие и забронируем.</p>
        </div>
      </div>
    </section>

    <section id="map" class="map-section">
      <div class="container map-grid">
        <div class="map-info reveal">
          <h2>Карта магазинов «${SITE.name}»</h2>
          <p>Интерактивная карта загружается только по запросу, поэтому главная страница открывается заметно быстрее.</p>
          <div class="map-list">
            ${stores.map((store) => `<span>${cardAddress(store)}</span>`).join("")}
          </div>
          <p class="map-note">Если карта не нужна, можно сразу перейти на страницу магазина или построить маршрут в Яндекс.Картах.</p>
        </div>
        ${renderMapShell({
          id: "stores-map",
          ariaLabel: "Карта магазинов Живая планета",
          dataId: "stores-map-data",
          buttonLabel: "Показать карту"
        })}
      </div>
      <script id="stores-map-data" type="application/json">${JSON.stringify(storeMapData)}</script>
    </section>

    <section class="seo">
      <div class="container seo-grid">
        <div class="seo-copy reveal">
          <h2>Зоомагазин и ветаптека в Твери</h2>
          <p>«${SITE.name}» — это сеть зоомагазинов в Твери, где можно купить корма для собак и кошек, витамины, лакомства, средства по уходу и аксессуары для питомцев. Мы подбираем товары под возраст, породу и особенности вашего любимца, чтобы питание и уход были действительно полезными.</p>
          <p>В наших ветаптеках представлены препараты для лечения и профилактики заболеваний животных. Консультируем по составам и назначению, помогаем подобрать средства для шерсти, суставов, пищеварения и иммунитета. Если нужен конкретный товар — звоните заранее, чтобы мы проверили наличие.</p>
          <p>Ищете зоомагазин рядом с домом? Выбирайте ближайший адрес на карте и приходите за кормами, ветпрепаратами и аксессуарами для питомцев. Мы работаем ежедневно и помогаем подобрать решения для собак, кошек и других домашних животных.</p>
        </div>
        <div class="seo-panel reveal">
          <h3>Почему нас выбирают</h3>
          <ul>
            <li>Широкий выбор кормов от эконом до премиум сегмента</li>
            <li>Товары для гигиены, прогулок и комфортного отдыха</li>
            <li>Ветеринарные препараты и профилактика</li>
            <li>Бесплатная доставка по Твери от ${SITE.deliveryThresholdText}</li>
          </ul>
          <div class="seo-callout">Мы рядом в каждом районе Твери — выберите ближайший магазин.</div>
        </div>
      </div>
    </section>

    <section id="faq" class="faq">
      <div class="container">
        <div class="section-head reveal">
          <h2>Частые вопросы</h2>
          <p>Короткие ответы о доставке, товарах и работе магазинов.</p>
        </div>
        <div class="faq-grid">
          ${faqMarkup}
        </div>
      </div>
    </section>

    <section id="contacts" class="contacts">
      <div class="container contacts-grid">
        <div class="contacts-card reveal">
          <h2>Контакты</h2>
          <p>Единый телефон для всех магазинов и ветаптек.</p>
          <a class="phone" href="tel:${SITE.phoneHref}">${SITE.phoneDisplay}</a>
          <p class="small">Можно писать в личные сообщения и следить за акциями в VK, а также в Instagram.</p>
          <a class="btn primary" href="${SITE.vkUrl}" target="_blank" rel="noreferrer">vk.ru/tverzoo</a>
          <a class="btn ghost" href="${SITE.instagramUrl}" target="_blank" rel="noreferrer">@tver.zooru</a>
        </div>
        <div class="contacts-info reveal">
          <img class="contact-mark" src="/images/icongreen.svg" alt="" aria-hidden="true" width="59" height="59" />
          <h3>Мы рядом</h3>
          <p>Выбирайте ближайший магазин — мы работаем ежедневно, без выходных.</p>
          <div class="contact-tags">
            <span>Зоомагазин</span>
            <span>Ветаптека</span>
            <span>Доставка</span>
          </div>
        </div>
      </div>
    </section>
  </main>

  ${renderFooter()}
  ${renderMobileNav(true)}
  <script src="/script.js"></script>
</body>
</html>`;
}

async function renderStorePage(store) {
  const storeDescription = `Магазин «${SITE.name}» по адресу ${cardAddress(store)} в Твери. Зоомагазин и ветаптека: корма, витамины, лекарства и товары для питомцев.`;
  const heroImage = await renderPhoto(imageUrl(store, store.photos[0]), `Магазин ${storeDisplayName(store)}`, {
    sizes: "(max-width: 720px) 92vw, 48vw",
    loading: "eager",
    fetchpriority: "high"
  });
  const galleryImages = await Promise.all(
    store.photos.slice(1).map((photo, index) =>
      renderPhoto(imageUrl(store, photo), `${storeDisplayName(store)} — фото ${index + 2}`, {
        sizes: "(max-width: 720px) 92vw, 42vw"
      })
    )
  );

  const mapPayload = {
    title: storeDisplayName(store),
    address: cardAddress(store),
    coordinates: store.coordinates
  };

  return `${renderHead({
    title: `${storeDisplayName(store)} | ${SITE.city}`,
    description: storeDescription,
    canonical: `${SITE.domain}${storePagePath(store)}`,
    ogImage: storeOgImage(store),
    ldJson: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE.name,
        url: `${SITE.domain}/`,
        logo: pathToUrl("/images/icongreen.svg"),
        description: "Сеть зоомагазинов и ветеринарных аптек в Твери.",
        areaServed: SITE.city,
        telephone: SITE.phoneDisplay,
        sameAs: [SITE.vkUrl, SITE.instagramUrl]
      },
      buildStoreSchema(store)
    ],
    preloadImages: [variantPath(imageUrl(store, store.photos[0]), 1200)]
  })}
<body>
  ${renderHeader(false)}

  <main id="main-content" class="store-page">
    <section class="store-hero">
      <div class="container store-hero-grid">
        <div class="store-hero-copy reveal">
          <a class="breadcrumb" href="/#stores">← Все магазины</a>
          <h1>${storeDisplayName(store)}</h1>
          <p class="lead">Зоомагазин и ветаптека в Твери. Корма, витамины, ветеринарные препараты и товары для питомцев — всегда рядом.</p>
          <div class="store-meta">
            <div class="store-meta-item"><span>Адрес</span>${cardAddress(store)}</div>
            <div class="store-meta-item"><span>Время работы</span>${SITE.hoursDisplay}</div>
            <div class="store-meta-item"><span>Телефон</span>${SITE.phoneDisplay}</div>
          </div>
          <div class="hero-actions">
            <a class="btn primary" href="tel:${SITE.phoneHref}">Позвонить</a>
            <a class="btn ghost" href="${routeUrl(store.routeAddress)}" target="_blank" rel="noreferrer">Маршрут</a>
          </div>
        </div>
        <div class="store-hero-card reveal">
          ${heroImage}
        </div>
      </div>
    </section>

    ${galleryImages.length > 0 ? `
    <section class="store-gallery">
      <div class="container">
        <div class="section-head reveal">
          <h2>Фото магазина</h2>
          <p>Интерьер и витрина магазина «${SITE.name}» по адресу ${cardAddress(store)}.</p>
        </div>
        <div class="gallery-grid">
          ${galleryImages.join("")}
        </div>
      </div>
    </section>` : ""}

    <section class="map-section">
      <div class="container map-grid">
        <div class="map-info reveal">
          <h2>Как добраться</h2>
          <p>Интерактивная карта загружается только по запросу. Если нужен быстрый маршрут, откройте Яндекс.Карты одной кнопкой.</p>
          <div class="map-list">
            <span>${cardAddress(store)}</span>
            <span>Телефон: ${SITE.phoneDisplay}</span>
            <span>График: ${SITE.hoursDisplay}</span>
          </div>
          <a class="btn ghost" href="${routeUrl(store.routeAddress)}" target="_blank" rel="noreferrer">Открыть в Яндекс.Картах</a>
        </div>
        ${renderMapShell({
          id: "store-map",
          ariaLabel: `Карта магазина ${storeDisplayName(store)}`,
          dataId: "store-map-data",
          buttonLabel: "Показать карту магазина"
        })}
      </div>
      <script id="store-map-data" type="application/json">${JSON.stringify(mapPayload)}</script>
    </section>
  </main>

  ${renderFooter()}
  ${renderMobileNav(false)}
  <script src="/script.js"></script>
</body>
</html>`;
}

function render404() {
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Страница не найдена | ${SITE.name}</title>
  <meta name="robots" content="noindex,follow" />
  <meta name="theme-color" content="#0f1014" />
  <meta name="color-scheme" content="light dark" />
  <link rel="canonical" href="${SITE.domain}/404.html" />
  <link rel="icon" type="image/svg+xml" href="/images/icongreen.svg" />
  <link rel="stylesheet" href="/fonts.css" />
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <main class="store-page" id="main-content">
    <section class="store-hero">
      <div class="container" style="text-align:center; max-width: 760px;">
        <div class="pill">Ошибка 404</div>
        <h1>Страница не найдена</h1>
        <p class="lead">Ссылка устарела или введён неверный адрес. Вернитесь на главную страницу сайта.</p>
        <div class="hero-actions" style="justify-content:center;">
          <a class="btn primary" href="/">На главную</a>
          <a class="btn ghost" href="tel:${SITE.phoneHref}">Позвонить</a>
        </div>
      </div>
    </section>
  </main>
</body>
</html>`;
}

function renderSitemap(stores) {
  const date = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE.domain}/`, changefreq: "weekly", priority: "1.0" },
    ...stores.map((store) => ({
      loc: `${SITE.domain}${storePagePath(store)}`,
      changefreq: "monthly",
      priority: "0.8"
    }))
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
}

async function main() {
  const stores = await loadStores();
  await mkdir(path.join(rootDir, "places"), { recursive: true });

  await writeFile(path.join(rootDir, "index.html"), await renderHome(stores));
  await writeFile(path.join(rootDir, "404.html"), render404());
  await writeFile(path.join(rootDir, "sitemap.xml"), renderSitemap(stores));

  for (const store of stores) {
    const dir = path.join(rootDir, "places", store.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "index.html"), await renderStorePage(store));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
