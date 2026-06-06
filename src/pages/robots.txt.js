export function GET() {
  return new Response(
    `User-agent: *
Allow: /

Sitemap: https://iwebalmanac.net/sitemap.xml
`,
    {
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );
}
