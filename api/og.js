export default async function handler(req, res) {
  const url = new URL(req.url, 'http://x');
  const target = url.searchParams.get('url') || null;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // Placeholder seguro (no hace scraping). La UI usará fallback por color si 'image' es null.
  return res.status(200).end(JSON.stringify({ image: null, target }));
}
