# Independent Web Almanac

Independent Web Almanac is a static editorial publication about human-guided creative work, independent publishing, writing craft, reviews, interviews, and practical resources.

The site is built with Astro, Markdown content collections, and plain CSS. It does not require a database, analytics, third-party JavaScript, or external font calls.

## Development

```bash
npm install
npm run dev
npm run build
```

Content lives in `src/content/` and is organized by section:

- `fiction`
- `essays`
- `reviews`
- `interviews`
- `resources`

Draft entries use `draft: true` and are excluded from generated pages, feeds, and the sitemap.
