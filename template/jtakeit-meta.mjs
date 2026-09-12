import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { specimenAddresses } from './specimens.mjs';
import { BLOCKS, COLLECTIONS, LOCALES } from './src/content/blocks.ts';

/**
 * `_meta.json` — what the edge needs to know that the HTML cannot say.
 *
 * Cloudflare Pages read `_redirects` and `_headers` out of the build. The
 * studio serves sites from its own Worker instead, and this file is what
 * replaced them: one small object beside the pages, written by the build.
 *
 * ── drafts, and why the list has to exist ───────────────────────────────────
 *
 * An entry nobody has finished is **built** — that is how its author looks at
 * it before it is out — and it is in no listing, no feed and no sitemap. What
 * stops a stranger reading it is the edge, and the edge is serving static
 * objects: it has no way to tell a draft from a page except to be told. This is
 * being told.
 *
 * It is the same mechanism that already decides who sees `data-jtk-path`: one
 * artifact, one place that decides who sees what is in it.
 *
 * ── and the specimens, which have no file at all ────────────────────────────
 *
 * The build also draws one page per arrangement, so that the admin can lift
 * this site's own markup for a block a post has just been given. They are
 * generated from the declaration rather than written, so looking for their
 * documents finds nothing — and a draft nobody can find is a draft the edge
 * hands to anybody. They are derived the same way the loader derives them,
 * from `specimens.mjs`, which is why that rule lives in one file.
 *
 * The file is written whatever happens, empty lists and all, because a missing
 * one and an empty one mean different things to whoever is debugging.
 *
 * ── the disclosure is not here any more ────────────────────────────────────
 *
 * It briefly was: a version number this file wrote, which the platform read and
 * believed. It is gone, and what replaced it is better in the way that matters
 * — the platform now reads the built pages and looks for the address itself,
 * so what used to be a claim is a check. See PROCESSING_URL in
 * src/content/blocks.ts.
 */
export function jtakeitMeta() {
  return {
    name: 'jtakeit-meta',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const drafts = [
          ...(await hiddenEntries()),
          ...specimenAddresses(COLLECTIONS, BLOCKS, LOCALES),
        ].sort();
        const meta = { redirects: [], drafts };

        await writeFile(join(fileURLToPath(dir), '_meta.json'), JSON.stringify(meta, null, 2) + '\n');
        if (drafts.length > 0) {
          logger.info(`${drafts.length} unfinished entr${drafts.length === 1 ? 'y' : 'ies'} — served only to an editing session`);
        }
      },
    },
  };
}

/**
 * Every entry whose document says it is not on the site yet.
 *
 * A document, not frontmatter: an entry is a page of blocks in a `.json` file
 * now, and this went on reading `.md` after that changed — so it found no
 * drafts at all, and every unfinished post was served to anybody who guessed
 * the address. Nothing failed and nothing was logged, which is how a silent
 * list stays wrong.
 */
async function hiddenEntries() {
  const root = join(process.cwd(), 'jtk', 'content');
  const out = [];

  const walk = async (at) => {
    let entries;
    try {
      entries = await readdir(at, { withFileTypes: true });
    } catch {
      return; // a site with no content directory is a site with no drafts
    }

    for (const entry of entries) {
      const full = join(at, entry.name);
      if (entry.isDirectory()) {
        // The pictures the build downloaded beside an entry.
        if (entry.name !== 'media') await walk(full);
        continue;
      }
      if (!entry.name.endsWith('.json')) continue;

      let document;
      try {
        document = JSON.parse(await readFile(full, 'utf8'));
      } catch {
        continue; // unreadable JSON is the build's error to report, not this one
      }
      // Only an entry carries this key at all; a page has no `visible` and is
      // not a draft. `=== false` and not falsy: absent means listed.
      if (document?.visible === false) {
        const name = relative(root, full).split(sep).join('/').replace(/\.json$/, '');
        out.push(`/${name}/`);
      }
    }
  };

  await walk(root);
  return out.sort();
}
