const revealItems = Array.from(document.querySelectorAll(".reveal"));
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
const header = document.querySelector(".site-header");
const themeToggle = document.querySelector(".theme-toggle");
const menuOverlay = document.querySelector(".menu-overlay");
const scrollToTopBtn = document.getElementById("scrollToTop");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const yandexMapsKeyMeta = document.querySelector('meta[name="yandex-maps-key"]');
const systemScheme = window.matchMedia("(prefers-color-scheme: dark)");

const darkMapStyle = [
  { featureType: "all", elementType: "geometry", stylers: { color: "#1b1d24" } },
  { featureType: "water", elementType: "geometry", stylers: { color: "#0f1a24" } },
  { featureType: "landscape", elementType: "geometry", stylers: { color: "#14161c" } },
  { featureType: "road", elementType: "geometry", stylers: { color: "#2a2d35" } },
  { featureType: "road", elementType: "labels.text.fill", stylers: { color: "#c9c3b8" } },
  { featureType: "poi", elementType: "labels.text.fill", stylers: { color: "#9da7b4" } },
  { featureType: "administrative", elementType: "geometry", stylers: { color: "#2c2f38" } }
];

const mapRegistry = [];
let storedPreference = readThemePreference();
let yandexMapsPromise = null;

function readThemePreference() {
  try {
    const value = window.localStorage.getItem("theme-preference");
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function writeThemePreference(value) {
  try {
    if (value) {
      window.localStorage.setItem("theme-preference", value);
    } else {
      window.localStorage.removeItem("theme-preference");
    }
  } catch {
    // Ignore storage errors in private or restricted contexts.
  }
}

function getResolvedTheme() {
  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit === "light" || explicit === "dark") {
    return explicit;
  }
  return systemScheme.matches ? "dark" : "light";
}

function updateThemeToggle() {
  if (!themeToggle) {
    return;
  }
  const resolved = getResolvedTheme();
  const label =
    resolved === "dark"
      ? "Переключить тему оформления. Текущая тема: тёмная"
      : "Переключить тему оформления. Текущая тема: светлая";

  themeToggle.dataset.theme = resolved;
  themeToggle.setAttribute("aria-pressed", String(resolved === "dark"));
  themeToggle.setAttribute("aria-label", label);
}

function updateThemeColor() {
  if (!themeColorMeta) {
    return;
  }
  const resolved = getResolvedTheme();
  themeColorMeta.setAttribute("content", resolved === "dark" ? "#0f1014" : "#fdf8f1");
}

function registerMap(map, element) {
  mapRegistry.push({ map, element });
}

function applyMapTheme() {
  const resolved = getResolvedTheme();
  const styles = resolved === "dark" ? darkMapStyle : [];
  for (const entry of mapRegistry) {
    entry.element.classList.toggle("is-dark", resolved === "dark");
    try {
      entry.map.options.set("styles", styles);
    } catch {
      // Ignore if styles are unsupported by the current map instance.
    }
  }
}

function applyTheme(theme) {
  if (theme === "light" || theme === "dark") {
    document.documentElement.setAttribute("data-theme", theme);
  } else {
    document.documentElement.removeAttribute("data-theme");
  }

  updateThemeToggle();
  updateThemeColor();
  applyMapTheme();
}

function reveal(entry) {
  entry.target.classList.add("is-visible");
}

function setHeaderHeight() {
  if (!header) {
    return;
  }
  document.documentElement.style.setProperty("--header-height", `${header.offsetHeight}px`);
}

function setMenuState(isOpen) {
  if (!nav || !navToggle) {
    return;
  }
  nav.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
}

function closeMenu() {
  setMenuState(false);
}

function isTypingTarget(target) {
  return Boolean(
    target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable)
  );
}

function loadYandexMapsApi() {
  if (window.ymaps) {
    return Promise.resolve(window.ymaps);
  }
  if (yandexMapsPromise) {
    return yandexMapsPromise;
  }

  yandexMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const apiKey = yandexMapsKeyMeta?.getAttribute("content")?.trim();
    const query = new URLSearchParams({
      lang: "ru_RU",
      load: "package.full"
    });

    if (apiKey) {
      query.set("apikey", apiKey);
    }

    script.src = `https://api-maps.yandex.ru/2.1/?${query.toString()}`;
    script.async = true;
    script.onload = () => {
      if (!window.ymaps) {
        reject(new Error("Yandex Maps API is unavailable"));
        return;
      }
      window.ymaps.ready(() => resolve(window.ymaps));
    };
    script.onerror = () => reject(new Error("Failed to load Yandex Maps API"));
    document.head.append(script);
  });

  return yandexMapsPromise;
}

function readMapPayload(id) {
  const element = document.getElementById(id);
  if (!element) {
    return null;
  }
  try {
    return JSON.parse(element.textContent || "");
  } catch {
    return null;
  }
}

function createPlacemark(ymaps, point, iconSize = 36) {
  return new ymaps.Placemark(
    point.coordinates,
    {
      balloonContent: `${point.title}<br>${point.address}`
    },
    {
      iconLayout: "default#image",
      iconImageHref: "/images/icongreen.svg",
      iconImageSize: [iconSize, iconSize],
      iconImageOffset: [-(iconSize / 2), -(iconSize / 2)]
    }
  );
}

function renderStoresMap(ymaps, canvas, payload) {
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error("Stores map data is empty");
  }

  const map = new ymaps.Map(
    canvas,
    {
      center: payload[0].coordinates,
      zoom: 12,
      controls: ["zoomControl"]
    },
    { suppressMapOpenBlock: true }
  );

  const collection = new ymaps.GeoObjectCollection();
  for (const point of payload) {
    collection.add(createPlacemark(ymaps, point, 36));
  }

  map.geoObjects.add(collection);
  if (collection.getLength() > 0) {
    map.setBounds(collection.getBounds(), {
      checkZoomRange: true,
      zoomMargin: 40
    });
  }

  registerMap(map, canvas);
}

function renderStoreMap(ymaps, canvas, payload) {
  if (!payload || !Array.isArray(payload.coordinates)) {
    throw new Error("Store map data is invalid");
  }

  const map = new ymaps.Map(
    canvas,
    {
      center: payload.coordinates,
      zoom: 16,
      controls: ["zoomControl"]
    },
    { suppressMapOpenBlock: true }
  );

  map.geoObjects.add(createPlacemark(ymaps, payload, 40));
  registerMap(map, canvas);
}

async function handleMapTrigger(button) {
  const dataId = button.dataset.mapTrigger;
  if (!dataId) {
    return;
  }

  const mapBox = button.closest(".map-box");
  const canvas = mapBox?.querySelector("[data-map-canvas]");
  const placeholder = mapBox?.querySelector(".map-placeholder");
  const warning = mapBox?.querySelector(".map-warning");
  const payload = readMapPayload(dataId);

  if (!mapBox || !canvas || !payload || canvas.dataset.loaded === "true") {
    return;
  }

  button.disabled = true;
  button.textContent = "Загружаем карту…";

  try {
    const ymaps = await loadYandexMapsApi();
    if (Array.isArray(payload)) {
      renderStoresMap(ymaps, canvas, payload);
    } else {
      renderStoreMap(ymaps, canvas, payload);
    }

    canvas.dataset.loaded = "true";
    canvas.classList.remove("is-idle");
    placeholder?.remove();
    warning?.classList.remove("is-visible");
    applyMapTheme();
  } catch {
    if (warning) {
      warning.textContent = "Карта временно недоступна. Воспользуйтесь кнопкой Яндекс.Карт выше.";
      warning.classList.add("is-visible");
    }
    button.disabled = false;
    button.textContent = "Повторить загрузку";
  }
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const resolved = getResolvedTheme();
    storedPreference = resolved === "dark" ? "light" : "dark";
    writeThemePreference(storedPreference);
    applyTheme(storedPreference);
  });
}

systemScheme.addEventListener("change", () => {
  if (!storedPreference) {
    applyTheme(null);
    return;
  }
  updateThemeToggle();
  updateThemeColor();
  applyMapTheme();
});

applyTheme(storedPreference);
setHeaderHeight();
window.addEventListener("resize", () => {
  setHeaderHeight();
  if (window.innerWidth > 900) {
    closeMenu();
  }
});

if (scrollToTopBtn) {
  window.addEventListener("scroll", () => {
    scrollToTopBtn.classList.toggle("visible", window.pageYOffset > 300);
  });

  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const parallaxElements = document.querySelectorAll(".parallax-layer");
if (parallaxElements.length > 0) {
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) {
      return;
    }
    window.requestAnimationFrame(() => {
      const scrolled = window.pageYOffset;
      for (const element of parallaxElements) {
        const speed = Number.parseFloat(element.dataset.speed || "0.5");
        element.style.transform = `translateY(${-(scrolled * speed)}px)`;
      }
      ticking = false;
    });
    ticking = true;
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }
        reveal(entry);
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px 10% 0px" }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 18, 180)}ms`;
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    setMenuState(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

if (menuOverlay) {
  menuOverlay.addEventListener("click", closeMenu);
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") {
      return;
    }

    const target = document.querySelector(href);
    if (!target) {
      return;
    }

    event.preventDefault();
    const headerHeight = header ? header.offsetHeight : 0;
    const targetPosition = href === "#top" ? 0 : target.offsetTop - headerHeight - 20;
    window.scrollTo({ top: targetPosition, behavior: "smooth" });
    closeMenu();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav?.classList.contains("is-open")) {
    closeMenu();
    return;
  }

  if (event.key === "Home" && !event.ctrlKey && !isTypingTarget(event.target)) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

document.querySelectorAll("[data-map-trigger]").forEach((button) => {
  button.addEventListener("click", () => {
    handleMapTrigger(button);
  });
});
