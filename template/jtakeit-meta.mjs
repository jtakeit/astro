import { fileURLToPath } from 'node:url';
import { writeMeta } from '@jtakeit/kit/meta';
import { readProgress } from '@jtakeit/kit/progress';
import { BLOCKS, COLLECTIONS, LOCALES } from './src/content/blocks.ts';

/**
 * `_meta.json` — what the edge needs to know that the HTML cannot say.
 *
 * The file is `@jtakeit/kit`'s (`writeMeta`): the unfinished entries read
 * off `jtk/content`, the specimen pages derived from the declaration, and
 * the directory this generator keeps its hashed files in — `/_astro/`, which
 * the edge caches for a year. This hook only says when to write it and
 * what Astro's answers to those are; a site on another generator calls the
 * same function from its own build step.
 *
 * ── the disclosure is not here any more ────────────────────────────────────
 *
 * It briefly was: a version number this file wrote, which the platform read
 * and believed. It is gone, and what replaced it is better in the way that
 * matters — the platform now reads the built pages and looks for the address
 * itself, so what used to be a claim is a check. See PROCESSING_URL in
 * src/content/blocks.ts.
 */
export function jtakeitMeta() {
  return {
    name: 'jtakeit-meta',
    hooks: {
      // `/_jtk/progress.json` on the dev server: where the site is, read off
      // the files on every request (jtakeit-core, wiki/73). The panel reads it
      // through a dev session the way it reads the pages, from the same
      // machine; `jtkit progress` prints the same reading for the agent. Open
      // to any origin because the panel is on another one, and because
      // nothing in it is a secret — counts, paths and sentences.
      'astro:server:setup': ({ server }) => {
        server.middlewares.use('/_jtk/progress.json', async (req, res) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'no-store');
          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
          }
          try {
            const progress = await readProgress(process.cwd());
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(progress));
          } catch (why) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: why.message }));
          }
        });
      },
      'astro:build:done': async ({ dir, logger }) => {
        const meta = await writeMeta(fileURLToPath(dir), {
          collections: COLLECTIONS,
          blocks: BLOCKS,
          locales: LOCALES,
          immutable: ['/_astro/'],
        });
        const drafts = meta.drafts.length;
        if (drafts > 0) {
          logger.info(`${drafts} unfinished entr${drafts === 1 ? 'y' : 'ies'} and specimen page(s) — served only to an editing session`);
        }
      },
    },
  };
}
