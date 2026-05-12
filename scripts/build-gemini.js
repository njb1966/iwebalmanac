"use strict";
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const CONTENT_DIRS = [
  { src: "src/essays", gmiDir: "essays" },
  { src: "src/discoveries", gmiDir: "discoveries" },
  { src: "src/protocols", gmiDir: "protocols" },
  { src: "src/notes", gmiDir: "notes" },
];

const GEMINI_ROOT = "/srv/gemini/iwebalmanac.net";

function mdToGmi(md) {
  let lines = md.split("\n");
  let out = [];
  let inFence = false;

  for (let line of lines) {
    if (line.startsWith("```")) { inFence = !inFence; continue; }
    if (inFence) { out.push(line); continue; }
    if (/^#{1,3} /.test(line)) { out.push(line); continue; }
    if (/^---+$/.test(line.trim())) { out.push(""); continue; }
    if (/^[*-] /.test(line)) { line = "* " + line.replace(/^[*-] /, ""); }

    let links = [];
    line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, url) => {
      links.push("=> " + url + " " + text);
      return text;
    });
    line = line.replace(/\*\*([^*]+)\*\*/g, "$1");
    line = line.replace(/\*([^*]+)\*/g, "$1");
    line = line.replace(/_([^_]+)_/g, "$1");
    line = line.replace(/<[^>]+>/g, "");

    out.push(line);
    for (let l of links) out.push(l);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const NAV = `
=> gemini://gemini.iwebalmanac.net/ Home
=> gemini://gemini.iwebalmanac.net/essays/ Essays
=> gemini://gemini.iwebalmanac.net/discoveries/ Discoveries
=> gemini://gemini.iwebalmanac.net/protocols/ Protocols`.trim();

// Process each content directory
for (let { src, gmiDir } of CONTENT_DIRS) {
  const absSrc = path.join("/opt/iwebalmanac-site", src);
  if (!fs.existsSync(absSrc)) {
    console.log("  skipping (not found):", absSrc);
    continue;
  }

  const outDir = path.join(GEMINI_ROOT, gmiDir);
  fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(absSrc).filter(f => f.endsWith(".md"));
  const indexEntries = [];

  for (let file of files) {
    const raw = fs.readFileSync(path.join(absSrc, file), "utf8");
    const { data, content } = matter(raw);
    if (!data.title) continue;

    const slug = file.replace(/\.md$/, "");
    const gmiBody = mdToGmi(content);
    const dateStr = data.date ? formatDate(data.date) : "";

    const parts = [
      "# " + data.title,
      dateStr || null,
      "",
      gmiBody,
      "",
      "---",
      NAV,
    ].filter(l => l !== null);

    // Collapse runs of 3+ newlines that can sneak in
    const gmiContent = parts.join("\n").replace(/\n{3,}/g, "\n\n");

    const outFile = path.join(outDir, slug + ".gmi");
    fs.writeFileSync(outFile, gmiContent + "\n");
    console.log("  wrote", outFile);
    indexEntries.push({ title: data.title, date: data.date, slug });
  }

  // Write section index
  indexEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
  const sectionName = gmiDir.charAt(0).toUpperCase() + gmiDir.slice(1);
  const indexLines = [
    "# " + sectionName,
    "",
    ...indexEntries.map(e => {
      const d = e.date ? "  (" + formatDate(e.date) + ")" : "";
      return "=> " + e.slug + ".gmi " + e.title + d;
    }),
    "",
    "---",
    NAV,
  ];
  fs.writeFileSync(path.join(outDir, "index.gmi"), indexLines.join("\n") + "\n");
  console.log("  wrote index for", gmiDir);
}

// Write root index.gmi
const rootIndex = [
  "# Independent Web Almanac",
  "",
  "An independent publication about human-scale technology, open protocols, and building a web worth owning.",
  "",
  "## Sections",
  "",
  "=> essays/ Essays",
  "=> discoveries/ Discoveries",
  "=> protocols/ Protocols",
  "",
  "## Follow",
  "",
  "=> https://iwebalmanac.net Web",
  "=> https://notes.iwebalmanac.net Notes (ActivityPub)",
  "=> gemini://gemini.iwebalmanac.net This capsule",
  "",
  "=> pages/mission.gmi Mission",
].join("\n");
fs.writeFileSync(path.join(GEMINI_ROOT, "index.gmi"), rootIndex + "\n");
console.log("  wrote root index.gmi");

// Write mission page
const missionSrc = "/opt/iwebalmanac-site/src/pages/mission.md";
if (fs.existsSync(missionSrc)) {
  const raw = fs.readFileSync(missionSrc, "utf8");
  const { data, content } = matter(raw);
  const missionDir = path.join(GEMINI_ROOT, "pages");
  fs.mkdirSync(missionDir, { recursive: true });
  const gmiContent = [
    "# " + (data.title || "Mission"),
    "",
    mdToGmi(content),
    "",
    "---",
    NAV,
  ].join("\n");
  fs.writeFileSync(path.join(missionDir, "mission.gmi"), gmiContent + "\n");
  console.log("  wrote mission.gmi");
}

console.log("Gemini build complete.");
