const revealItems = Array.from(document.querySelectorAll('.reveal'));
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
const header = document.querySelector('.site-header');
const themeToggle = document.querySelector('.theme-toggle');
const menuOverlay = document.querySelector('.menu-overlay');
const mapWarning = document.querySelector('.map-warning');
const mapElement = document.getElementById('stores-map');
const storeMapElement = document.getElementById('store-map');
const systemScheme = window.matchMedia('(prefers-color-scheme: dark)');
const scrollToTopBtn = document.getElementById('scrollToTop');
const preloader = document.getElementById('preloader');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

const darkMapStyle = [
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: { color: '#1b1d24' }
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: { color: '#0f1a24' }
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: { color: '#14161c' }
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: { color: '#2a2d35' }
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: { color: '#c9c3b8' }
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: { color: '#9da7b4' }
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: { color: '#2c2f38' }
  }
];

const mapInstances = [];
const mapElements = [];
let storedPreference = localStorage.getItem('theme-preference');

// Declare all functions first
function getResolvedTheme() {
  const explicit = document.documentElement.getAttribute('data-theme');
  if (explicit === 'light' || explicit === 'dark') {
    return explicit;
  }
  return systemScheme.matches ? 'dark' : 'light';
}

function updateThemeToggle() {
  if (!themeToggle) return;
  const resolved = getResolvedTheme();
  themeToggle.dataset.theme = resolved;
  themeToggle.setAttribute('aria-pressed', String(resolved === 'dark'));
}

function updateThemeColor() {
  if (!themeColorMeta) return;
  const resolved = getResolvedTheme();
  const color = resolved === 'dark' ? '#0f1014' : '#fdf8f1';
  themeColorMeta.setAttribute('content', color);
}

function registerMap(map, element) {
  mapInstances.push(map);
  if (element) {
    mapElements.push(element);
  }
}

function applyMapTheme() {
  const resolved = getResolvedTheme();
  const styles = resolved === 'dark' ? darkMapStyle : [];
  mapInstances.forEach((map) => {
    try {
      map.options.set('styles', styles);
    } catch (error) {
      // Ignore style errors if map styles are unsupported.
    }
  });
  mapElements.forEach((element) => {
    element.classList.toggle('is-dark', resolved === 'dark');
  });
  if (mapWarning) {
    mapWarning.classList.toggle('is-dark', resolved === 'dark');
  }
}

function applyTheme(theme) {
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.setAttribute('data-theme', theme);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  updateThemeToggle();
  updateThemeColor();
  applyMapTheme();
}

function reveal(entry) {
  entry.target.classList.add('is-visible');
}

// Initialize theme
if (storedPreference !== 'light' && storedPreference !== 'dark') {
  storedPreference = null;
}

applyTheme(storedPreference);

// Preloader
window.addEventListener('load', () => {
  setTimeout(() => {
    if (preloader) {
      preloader.classList.add('hidden');
    }
  }, 500);
});

// Scroll to Top Button
if (scrollToTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      scrollToTopBtn.classList.add('visible');
    } else {
      scrollToTopBtn.classList.remove('visible');
    }
  });

  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Parallax Effect
const parallaxElements = document.querySelectorAll('.parallax-layer');
if (parallaxElements.length > 0) {
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        parallaxElements.forEach((el) => {
          const speed = parseFloat(el.dataset.speed) || 0.5;
          const yPos = -(scrolled * speed);
          el.style.transform = `translateY(${yPos}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  });
}

// Update Theme Toggle ARIA Label
function updateThemeLabel() {
  if (!themeToggle) return;
  const currentTheme = getResolvedTheme();
  const label = currentTheme === 'dark' 
    ? 'Переключить тему оформления. Текущая тема: тёмная'
    : 'Переключить тему оформления. Текущая тема: светлая';
  themeToggle.setAttribute('aria-label', label);
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const resolved = getResolvedTheme();
    const next = resolved === 'dark' ? 'light' : 'dark';
    storedPreference = next;
    localStorage.setItem('theme-preference', next);
    applyTheme(next);
    updateThemeLabel();
  });
  
  updateThemeLabel();
}

systemScheme.addEventListener('change', () => {
  if (!storedPreference) {
    applyTheme(null);
  }
});

// Lazy Loading Images
const lazyImages = document.querySelectorAll('img[loading="lazy"]');
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => imageObserver.observe(img));
} else {
  lazyImages.forEach(img => img.classList.add('loaded'));
}

// Track Phone Clicks (for analytics)
const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
phoneLinks.forEach(link => {
  link.addEventListener('click', () => {
    // Google Analytics event tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'click', {
        'event_category': 'Phone',
        'event_label': 'Phone Click',
        'value': link.href
      });
    }
    // Yandex Metrika event tracking
    if (typeof ym !== 'undefined') {
      // Замените YANDEX_COUNTER_ID на ваш реальный номер счетчика
      // ym(YANDEX_COUNTER_ID, 'reachGoal', 'phone_click');
      console.log('Phone click tracked (Yandex Metrika not configured)');
    }
  });
});

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#' || href === '#top') {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const targetPosition = target.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Keyboard Navigation Enhancement
document.addEventListener('keydown', (e) => {
  // ESC to close mobile menu
  if (e.key === 'Escape' && nav && nav.classList.contains('is-open')) {
    nav.classList.remove('is-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }
  
  // Home key to scroll to top
  if (e.key === 'Home' && !e.ctrlKey) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

// Reveal animation
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px 10% 0px' }
  );

  revealItems.forEach((item, index) => {
    const delay = Math.min(index * 18, 180);
    item.style.transitionDelay = `${delay}ms`;
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      }
    });
  });
}

if (menuOverlay && navToggle && nav) {
  menuOverlay.addEventListener('click', () => {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  });
}

const setHeaderHeight = () => {
  if (!header) return;
  document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
};

setHeaderHeight();
window.addEventListener('resize', setHeaderHeight);

if (mapElement && window.ymaps) {
  const locations = [
    'Проспект Ленина, 14 к2',
    'Улица Горького, 133',
    'Проспект Победы, 22/15',
    'Бульвар Гусева, 26',
    'Хрустальная, 10',
    'Оснабрюкская, 39',
    'улица Сергея Есенина, 1а (ТЦ Есенин)',
    'Комсомольский проспект, 8'
  ];

  ymaps.ready(() => {
    const map = new ymaps.Map(
      mapElement,
      {
        center: [56.8587, 35.9176],
        zoom: 12,
        controls: ['zoomControl']
      },
      { suppressMapOpenBlock: true }
    );

    registerMap(map, mapElement);
    applyMapTheme();

    const collection = new ymaps.GeoObjectCollection();
    map.geoObjects.add(collection);

    let pending = locations.length;
    let successCount = 0;
    const finalizeBounds = () => {
      if (pending > 0) return;
      const bounds = collection.getBounds();
      if (bounds && successCount > 0) {
        map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 40 });
      } else if (successCount === 0 && mapWarning) {
        mapWarning.textContent =
          'Метки не загрузились. Проверьте, что у ключа включён Геокодер и добавлен домен сайта.';
        mapWarning.classList.add('is-visible');
      }
    };

    locations.forEach((address) => {
      ymaps.geocode(`Тверь, ${address}`, { results: 1 }).then(
        (result) => {
          const first = result.geoObjects.get(0);
          if (first) {
            const coords = first.geometry.getCoordinates();
            const iconHref = mapElement.dataset.icon || 'images/icongreen.svg';
            const placemark = new ymaps.Placemark(
              coords,
              { balloonContent: `Живая планета — ${address}` },
              {
                iconLayout: 'default#image',
                iconImageHref: iconHref,
                iconImageSize: [36, 36],
                iconImageOffset: [-18, -18]
              }
            );
            collection.add(placemark);
            successCount += 1;
          }
          pending -= 1;
          finalizeBounds();
        },
        () => {
          pending -= 1;
          finalizeBounds();
        }
      );
    });
  });
} else if (mapElement) {
  mapElement.textContent = 'Карта временно недоступна. Позвоните, чтобы уточнить ближайший адрес.';
}

if (storeMapElement && window.ymaps) {
  const address = storeMapElement.dataset.address;
  const title = storeMapElement.dataset.title || address || 'Живая планета';
  const iconHref = storeMapElement.dataset.icon || '../../images/icongreen.svg';

  ymaps.ready(() => {
    const map = new ymaps.Map(
      storeMapElement,
      {
        center: [56.8587, 35.9176],
        zoom: 15,
        controls: ['zoomControl']
      },
      { suppressMapOpenBlock: true }
    );

    registerMap(map, storeMapElement);
    applyMapTheme();

    if (!address) {
      if (mapWarning) {
        mapWarning.textContent = 'Адрес магазина не указан. Позвоните, чтобы уточнить маршрут.';
        mapWarning.classList.add('is-visible');
      }
      return;
    }

    ymaps.geocode(`Тверь, ${address}`, { results: 1 }).then(
      (result) => {
        const first = result.geoObjects.get(0);
        if (!first) {
          if (mapWarning) {
            mapWarning.textContent = 'Не удалось найти адрес на карте. Позвоните, чтобы уточнить маршрут.';
            mapWarning.classList.add('is-visible');
          }
          return;
        }
        const coords = first.geometry.getCoordinates();
        const placemark = new ymaps.Placemark(
          coords,
          { balloonContent: `${title} — ${address}` },
          {
            iconLayout: 'default#image',
            iconImageHref: iconHref,
            iconImageSize: [40, 40],
            iconImageOffset: [-20, -20]
          }
        );
        map.geoObjects.add(placemark);
        map.setCenter(coords, 16, { duration: 300 });
      },
      () => {
        if (mapWarning) {
          mapWarning.textContent = 'Карта временно недоступна. Позвоните, чтобы уточнить маршрут.';
          mapWarning.classList.add('is-visible');
        }
      }
    );
  });
} else if (storeMapElement) {
  storeMapElement.textContent = 'Карта временно недоступна. Позвоните, чтобы уточнить маршрут.';
}
