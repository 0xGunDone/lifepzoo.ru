# lifepzoo.ru

Статический сайт сети зоомагазинов и ветаптек «Живая планета».

## Локальная работа

- Единый источник данных по магазинам: `data/stores.json`
- Генератор страниц и sitemap: `scripts/generate-site.mjs`
- Команда сборки: `npm run build`

После изменения адресов, координат, метаданных или структуры карточек обновляйте `data/stores.json` и запускайте сборку. Главная страница, страницы магазинов, `404.html` и `sitemap.xml` генерируются из одного набора данных.

## Ассеты

- Локальные шрифты лежат в `fonts/`, подключаются через `fonts.css`
- Адаптивные версии фото магазинов хранятся рядом с оригиналами: `*-480.webp`, `*-768.webp`, `*-1200.webp`
- OG-изображение главной: `images/og-home.webp`
- OG-изображения страниц магазинов: `places/<slug>/og.webp`
- Ключ Яндекс.Карт задаётся в `scripts/generate-site.mjs` и встраивается в `<meta name="yandex-maps-key">`; ограничьте его по домену в кабинете Яндекса

## Продакшн

- Домен: `https://lifepzoo.ru`
- Точка входа: `/index.html`
- Страницы магазинов: `/places/<slug>/`
- Карта сайта: `/sitemap.xml`
- Robots: `/robots.txt`
- Кастомный домен (GitHub Pages): файл `CNAME`

## Деплой

### Вариант 1. GitHub Pages

Это основной сценарий для текущего репозитория: сайт статический, собранные `html/css/js/webp` лежат в корне, `CNAME` уже добавлен.

1. Обновить данные и пересобрать сайт:
   - `npm run build`
2. Проверить изменения локально.
3. Закоммитить и отправить в `main`:
   - `git add -A`
   - `git commit -m "Update site content"`
   - `git push origin main`
4. В настройках репозитория GitHub включить GitHub Pages из ветки `main`, из корня репозитория.
5. В настройках Pages указать кастомный домен `lifepzoo.ru` и включить HTTPS.
6. Проверить после выкладки:
   - `https://lifepzoo.ru/`
   - `https://lifepzoo.ru/places/lenina/`
   - `https://lifepzoo.ru/sitemap.xml`
   - `https://lifepzoo.ru/robots.txt`

### Вариант 2. VPS + Nginx

Если сайт выкладывается не через GitHub Pages, а на сервер, используйте `deploy/nginx/lifepzoo.ru.conf` как стартовый конфиг для статики.

1. Собрать сайт:
   - `npm run build`
2. Скопировать публичные файлы на сервер в каталог `/var/www/product/lifepzoo.ru`:
   - `404.html`
   - `fonts/`
   - `fonts.css`
   - `images/`
   - `index.html`
   - `places/`
   - `robots.txt`
   - `script.js`
   - `sitemap.xml`
   - `styles.css`
3. Положить конфиг `deploy/nginx/lifepzoo.ru.conf` в `sites-available`, подключить его в `sites-enabled`.
4. Выполнить `sudo nginx -t && sudo systemctl reload nginx`.
5. Выпустить сертификат и настроить HTTPS. Текущий конфиг в репозитории покрывает только HTTP и раздачу статики, его нужно дополнить SSL-блоком или дать это сделать certbot.

Если нужен максимально простой прод без собственного сервера, выбирайте GitHub Pages. Если нужен полный контроль над заголовками, кэшем и SSL-конфигом на своей машине, используйте Nginx.

## Чеклист перед деплоем

1. Убедиться, что DNS для `lifepzoo.ru` указывает на хостинг.
2. Включить HTTPS и принудительный редирект HTTP -> HTTPS.
3. Проверить доступность:
   - `https://lifepzoo.ru/`
   - `https://lifepzoo.ru/sitemap.xml`
   - `https://lifepzoo.ru/robots.txt`
4. Добавить сайт в Яндекс.Вебмастер и Google Search Console.
