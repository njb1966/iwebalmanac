export function GET() {
  return new Response(
    `Independent Web Almanac

An editorial publication for human-guided creative work.

No ads. No analytics. No third-party JavaScript.
`,
    {
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );
}
