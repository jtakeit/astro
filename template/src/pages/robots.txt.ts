import type { APIRoute } from 'astro';
import { INDEXABLE, canonicalFor } from '../data/site';

/**
 * Driven by the same switch as the robots meta tag, the sitemap and llms.txt —
 * see src/data/site.ts. One flag, because a site that ships still telling
 * Google to go away is always a site where two of the four were flipped.
 *
 * AI crawlers are deliberately not excluded. Note that Cloudflare's *managed*
 * robots.txt, if it is on for the zone, blocks them regardless of this file —
 * check the zone setting too.
 */
export const GET: APIRoute = () => {
  const body = INDEXABLE
    ? ['User-agent: *', 'Allow: /', '', `Sitemap: ${canonicalFor('/sitemap.xml')}`, '']
    : ['User-agent: *', 'Disallow: /', ''];

  return new Response(body.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
