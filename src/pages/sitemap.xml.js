import { getPublishedEntries, entryUrl } from "../lib/content.js";
import { sections } from "../lib/sections.js";

export async function GET(context) {
  const entries = await getPublishedEntries();
  const site = context.site.toString().replace(/\/$/, "");
  const staticPaths = [
    "/",
    "/about/",
    "/editorial-philosophy/",
    "/follow/",
    ...sections.map((section) => `/${section.id}/`),
  ];

  const urls = [
    ...staticPaths,
    ...entries.map((item) => entryUrl(item)),
  ];

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${site}${url}</loc></url>`).join("\n")}
</urlset>`,
    {
      headers: {
        "Content-Type": "application/xml",
      },
    }
  );
}
