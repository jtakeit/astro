import { figures } from './figures.mjs';

/**
 * How this site turns markdown into HTML, in one place because two things ask.
 *
 * `astro.config.mjs` asks, for every `.md` Astro renders itself. And
 * `src/lib/entryLoader.ts` asks, because a post's prose is a *string* inside a
 * JSON document now and Astro's own `renderMarkdown` builds its renderer
 * **without** the configured plugins — that is its code, not a setting: it
 * passes `image`, `syntaxHighlight`, `shikiConfig`, `gfm` and `smartypants`,
 * and nothing else.
 *
 * So a body rendered through the loader would silently lose `figures.mjs`: a
 * row of three photographs would come out as three paragraphs, on the page but
 * not in the preview beside the editor, which is the worst way to find out.
 * The loader builds the same renderer with the same options, and this is the
 * one place either of them reads.
 */
/**
 * The default layout for a picture that has no props to carry one — which is
 * every picture in a body, because a body is markdown.
 *
 * Typed, because without the annotation `{ layout: 'constrained' }` widens to
 * `{ layout: string }` and `string` is not an `ImageLayout`. Under `// @ts-check`
 * that is an error in astro.config.mjs rather than a note here.
 *
 * This belongs to the **site's** image config and to nothing else. The markdown
 * processor also takes an `image` option, and it is a different thing entirely
 * — `{ domains, remotePatterns }`, about which remote pictures may be fetched —
 * so this must not be handed to it. It was, and it meant nothing there.
 *
 * @type {import('astro').AstroUserConfig['image']}
 */
export const IMAGE = { layout: 'constrained' };

export const HAST_PLUGINS = [figures()];
