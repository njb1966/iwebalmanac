import rss from "@astrojs/rss";
import { getPublishedEntries, entryUrl } from "../lib/content.js";
import { getSection } from "../lib/sections.js";

export async function GET(context) {
  const entries = await getPublishedEntries();

  return rss({
    title: "Independent Web Almanac",
    description:
      "Human-guided creative work, writing craft, reviews, interviews, and independent publishing.",
    site: context.site,
    items: entries.map((item) => {
      const section = getSection(item.section);

      return {
        title: item.entry.data.title,
        description: item.entry.data.description,
        pubDate: item.entry.data.date,
        link: entryUrl(item),
        categories: section ? [section.label] : [item.section],
      };
    }),
  });
}
