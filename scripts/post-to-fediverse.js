const fs = require("fs");
const path = require("path");
const https = require("https");
const matter = require("gray-matter");

const WF_HOST = "notes.iwebalmanac.net";
const WF_USER = "editor";
const TRACKING_FILE = path.join(__dirname, "../.posted-slugs.json");
const ENV_FILE = path.join(__dirname, "../.env");

const CONTENT_DIRS = [
  { src: "src/essays",      section: "essays",      label: "Essay" },
  { src: "src/discoveries", section: "discoveries",  label: "Discovery" },
  { src: "src/protocols",   section: "protocols",    label: "Protocol" },
];

function loadEnv() {
  if (!fs.existsSync(ENV_FILE)) return {};
  return Object.fromEntries(
    fs.readFileSync(ENV_FILE, "utf8")
      .split("\n")
      .filter(l => l.includes("="))
      .map(l => l.split("=").map(s => s.trim()))
  );
}

function apiRequest(method, urlPath, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = "Token " + token;
    if (data) headers["Content-Length"] = Buffer.byteLength(data);

    const req = https.request({
      hostname: WF_HOST,
      port: 443,
      path: urlPath,
      method,
      headers,
    }, res => {
      let raw = "";
      res.on("data", chunk => raw += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error("Bad JSON: " + raw)); }
      });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function getToken(password) {
  const res = await apiRequest("POST", "/api/auth/login", { alias: WF_USER, pass: password });
  if (!res.data || !res.data.access_token) throw new Error("Login failed: " + JSON.stringify(res));
  return res.data.access_token;
}

async function createPost(token, title, body) {
  const res = await apiRequest(
    "POST",
    `/api/collections/${WF_USER}/posts`,
    { title, body, lang: "en", rtl: false },
    token
  );
  if (!res.data || !res.data.id) throw new Error("Post failed: " + JSON.stringify(res));
  return res.data;
}

async function main() {
  const env = loadEnv();
  const password = env.WF_PASSWORD;
  if (!password) { console.log("  No WF_PASSWORD in .env — skipping fediverse post"); return; }

  const posted = fs.existsSync(TRACKING_FILE)
    ? JSON.parse(fs.readFileSync(TRACKING_FILE, "utf8"))
    : {};

  const newItems = [];
  for (const { src, section } of CONTENT_DIRS) {
    if (!fs.existsSync(src)) continue;
    const files = fs.readdirSync(src).filter(f => f.endsWith(".md"));
    for (const file of files) {
      const slug = file.replace(/\.md$/, "");
      const key = section + "/" + slug;
      if (posted[key]) continue;

      const raw = fs.readFileSync(path.join(src, file), "utf8");
      const { data } = matter(raw);
      if (!data.title) continue;

      newItems.push({ key, section, slug, title: data.title, description: data.description || "" });
    }
  }

  if (newItems.length === 0) { console.log("  No new content to post to fediverse."); return; }

  console.log(`  Posting ${newItems.length} new item(s) to WriteFreely...`);
  const token = await getToken(password);

  for (const item of newItems) {
    const url = `https://iwebalmanac.net/${item.section}/${item.slug}/`;
    const postBody = [
      item.description,
      "",
      `Read: ${url}`,
    ].join("\n");

    const result = await createPost(token, item.title, postBody);
    posted[item.key] = { postedAt: new Date().toISOString(), wfId: result.id };
    console.log(`  Posted: ${item.title} -> https://${WF_HOST}/editor/${result.id}`);
  }

  fs.writeFileSync(TRACKING_FILE, JSON.stringify(posted, null, 2));
  console.log("  Fediverse posting complete.");
}

main().catch(err => {
  console.error("  Fediverse post error:", err.message);
  process.exit(1);
});
