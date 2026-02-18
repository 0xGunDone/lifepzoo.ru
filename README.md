# lifepzoo.ru

Статический сайт сети зоомагазинов и ветаптек «Живая планета».

## Продакшн

- Домен: `https://lifepzoo.ru`
- Точка входа: `/index.html`
- Страницы магазинов: `/places/<slug>/`
- Карта сайта: `/sitemap.xml`
- Robots: `/robots.txt`
- Кастомный домен (GitHub Pages): файл `CNAME`

## Чеклист перед деплоем

1. Убедиться, что DNS для `lifepzoo.ru` указывает на хостинг.
2. Включить HTTPS и принудительный редирект HTTP -> HTTPS.
3. Проверить доступность:
   - `https://lifepzoo.ru/`
   - `https://lifepzoo.ru/sitemap.xml`
   - `https://lifepzoo.ru/robots.txt`
4. Добавить сайт в Яндекс.Вебмастер и Google Search Console.
