import { SITE } from '../config/site';

export const prerender = true;

const pages = ['/', '/#projects', '/#docs'];

export function GET() {
  const urls = pages
    .map((path) => {
      const loc = new URL(path, SITE.url).toString();
      return `<url><loc>${loc}</loc><lastmod>${new Date().toISOString()}</lastmod></url>`;
    })
    .join('');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
