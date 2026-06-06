import { getCollection } from "astro:content";
import { sectionIds } from "./sections.js";

export async function getPublishedEntries() {
  const all = [];

  for (const section of sectionIds) {
    const entries = await getCollection(section, ({ data }) => !data.draft);
    all.push(...entries.map((entry) => ({ section, entry })));
  }

  return all.sort((a, b) => {
    const aTime = a.entry.data.date.valueOf();
    const bTime = b.entry.data.date.valueOf();
    return bTime - aTime;
  });
}

export async function getPublishedSectionEntries(section) {
  const entries = await getCollection(section, ({ data }) => !data.draft);

  return entries
    .map((entry) => ({ section, entry }))
    .sort((a, b) => b.entry.data.date.valueOf() - a.entry.data.date.valueOf());
}

export function getFeaturedEntry(entries) {
  return entries.find((item) => item.entry.data.featured) || entries[0] || null;
}

export function entryUrl(item) {
  return `/${item.section}/${item.entry.slug}/`;
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
