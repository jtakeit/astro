/**
 * Every sentence a visitor reads — read from `jtk/content/index.json`
 * rather than written here.
 *
 * The strings live in the repository's content document so that the studio's
 * admin can edit them: a commit under `jtk/` **is** the published state,
 * and publishing writes that file. This module is the adapter between that
 * document and the shape the components already import, which is why the
 * exports below look ordinary — nothing in a component has to know where its
 * text came from.
 *
 * Two things did not move, because they are not content:
 *   META  — the `<html lang>` value and the title suffix
 *   A11Y  — the skip link
 *
 * Comments and identifiers stay English. The values are the client's language.
 *
 * ── the document, and the file that ships with this scaffold ────────────────
 *
 * `jtk/content/index.json` is committed with empty strings in it, and that
 * is deliberate: a fresh project must `npm run build` on a laptop the minute
 * `fl-init` finishes, and a static import of a file that is not there is a build
 * error rather than an empty page. The first publish from the admin replaces it
 * wholesale.
 *
 * `jtk/catalogue.json` is **not** shipped. It describes what blocks a site
 * has, the admin seeds it from the registry on the first publish, and a copy
 * here would be a second one to keep in step by hand.
 */
import page from '../../jtk/content/index.json';
import { LOCALE } from '../content/blocks';

export const META = {
  /**
   * The `<html lang>` value and `inLanguage` in structured data.
   *
   * From `LOCALE` in `src/content/blocks.ts`, not written again here: that file
   * is what declares the site's languages to the platform, and a language
   * spelt in two places is a language that is eventually spelt two ways.
   */
  lang: LOCALE,
  /** `og:locale`, e.g. uk_UA, de_CH, en_GB. */
  ogLocale: '{{OG_LOCALE}}',
  /** Appended to every page title except the home page's. */
  titleSuffix: ' — {{NAME}}',
} as const;

/**
 * What the site says on its own behalf, rather than what the business says.
 *
 * Written by `fl-init` from the locale, not left blank: a skip link with no
 * words is a skip link a screen reader announces as nothing.
 */
/**
 * The privacy page's words.
 *
 * Short on purpose, and shorter than it was. What the **platform** does with an
 * enquiry — how long it keeps it, where — used to be six paragraphs here, in
 * every language a site is ever built in, going stale the day any of it
 * changed. It is one link now, and the text lives where the thing it describes
 * lives.
 *
 * What is left is the business's own: what their form asks for, that the site
 * runs on somebody, and how to reach them. The heading under `ownTitle` is left
 * empty for whoever is building the site — a generated paragraph about somebody
 * else's company is a guess wearing a legal shape.
 *
 * **None of it is required.** The platform asks for one link on a page that
 * opens and reads nothing around it; these words are a default so that a new
 * site has something true on day one, not a form anybody has to keep to.
 */
export const PRIVACY = {
  title: '{{UI_PRIVACY_TITLE}}',
  intro: '{{UI_PRIVACY_INTRO}}',

  formTitle: '{{UI_PRIVACY_FORM_TITLE}}',
  formBody: '{{UI_PRIVACY_FORM_BODY}}',

  /** Ends in a colon: the link follows it. */
  whoTitle: '{{UI_PRIVACY_WHO_TITLE}}',
  whoBody: '{{UI_PRIVACY_WHO_BODY}}',

  askTitle: '{{UI_PRIVACY_ASK_TITLE}}',
  askBody: '{{UI_PRIVACY_ASK_BODY}}',

  /** The business's own section. Empty on purpose: it is theirs to write. */
  ownTitle: '{{UI_PRIVACY_OWN_TITLE}}',
} as const;

export const A11Y = {
  skipToContent: '{{UI_SKIP_TO_CONTENT}}',
} as const;

type Block = Record<string, unknown> & { type: string };
type Item = Record<string, unknown>;

const blocks = page.blocks as unknown as Block[];

/**
 * A block by type, with its index.
 *
 * The index is what an annotation path is built from, so it has to come from the
 * document rather than be counted by hand in the markup — a block inserted above
 * this one moves it, and a hand-written path would then point at somebody else's
 * text.
 *
 * A block the document does not have is not an error: the admin can remove one,
 * and a page that threw at build time because a section was deleted would make
 * removing a section a deploy incident.
 */
export function block(type: string): { at: number; of: Block } {
  const at = blocks.findIndex((candidate) => candidate.type === type);
  return at === -1 ? { at: -1, of: { type } } : { at, of: blocks[at]! };
}

export const str = (of: Block, key: string): string => (of[key] as string) ?? '';
export const rows = (of: Block, key: string): Item[] => (of[key] as Item[]) ?? [];

/**
 * One picture of a gallery, as a component wants it.
 *
 * `name` is what `<Shot>` resolves — a slot in `src/assets` for a picture the
 * repository ships, or a key like `media/<site>/<hash>.jpg` for one the owner
 * uploaded. Both are local files by build time and both go through
 * `astro:assets`; nothing downstream has to know which it was given.
 */
export interface Shown {
  readonly name: string;
  readonly alt: string;
  /** `data-jtk-path` for this picture: `blocks[3].work[7].src`. */
  readonly path?: string;
  /** A clip's poster — the still every refused autoplay lands on. */
  readonly poster?: string;
}

/**
 * One picture of a block, as a component wants it.
 *
 * ── every photograph on the page is one of two things ───────────────────────
 *
 * A gallery item, or a field of its own. There is no third kind, and the
 * difference is not how it is stored — it is what an owner can do about it.
 * A photograph that is neither is a photograph only we can change, and "can you
 * swap the picture of me" becomes a message and a deploy.
 *
 * So the rule is: **a photograph that is on the page on purpose gets a field.**
 * Declare it, put the slot it already uses in the content document, and pass
 * the path to `<Shot>`:
 *
 *   const { at, of } = block('artist');
 *   const portrait = picture(of, at, 'portrait');
 *   <Shot name={portrait.name} alt={portrait.alt} path={portrait.path} ratio="4 / 5" />
 *
 * The value stays the slot the repository already ships — `artist-at-work` —
 * so nothing about the page changes until somebody chooses to change it.
 *
 * The alt text is a sibling field, `<key>_alt`, marked `no_tap_target`: a media
 * field's value is one string with nowhere to keep words, and there is nothing
 * on the page that *is* the alt text to tap. (A gallery item keeps its own alt
 * inside it, because a collection has room for one.)
 *
 * What stays out: a photograph that is structure rather than subject — a
 * texture, a rule, a shape behind a heading. That is design, and the catalogue
 * is the place where the difference is written down.
 */
export function picture(of: Block, at: number, key: string): Shown {
  return {
    name: str(of, key),
    alt: str(of, `${key}_alt`),
    path: pathAt(at, key),
  };
}

/**
 * A gallery field, as pictures.
 *
 * ── this function is the seam ───────────────────────────────────────────────
 *
 * The catalogue declares one field holding many pictures; the document stores
 * them as `[{ src, alt }]`, in the order they appear on the page; the admin
 * annotates each one at `blocks[3].work[7].src`. All three of those facts live
 * here and nowhere else, so a component takes a list and renders it:
 *
 *   const { at, of } = block('plates');
 *   <Gallery arrangement="wall" items={gallery(of, at, 'work')} />
 *
 * **Every picture carries its own path.** That is the half that cannot be
 * skipped: without it the owner sees their work on the page and cannot touch
 * it, `fl-catalogue` fails on exactly that, and a gallery is the longest list
 * on the site to have to fix afterwards.
 *
 * A field the document does not have is an empty list rather than an error. It
 * is what a site looks like on a laptop before it has ever been attached, and a
 * build that threw there could not be checked or pushed.
 */
export function gallery(of: Block, at: number, key: string): Shown[] {
  return rows(of, key).flatMap((item, i) => {
    const src = (item.src as string) ?? '';
    if (!src) return [];

    return [
      {
        name: src,
        alt: (item.alt as string) ?? '',
        poster: (item.poster as string) || undefined,
        path: pathAt(at, key, i, 'src'),
      },
    ];
  });
}

/**
 * The path of a field, for `data-jtk-path`.
 *
 * Returns undefined when annotations are off, so Astro drops the attribute
 * entirely and a production build carries no trace of the editor — the same
 * switch the build contract calls PUBLIC_JTK_ANNOTATE.
 *
 * **Every element whose text or image comes from content must carry one.** That
 * is not a convention: the annotation lint fails the build without it, because
 * an element that loses its path stops opening the editor *silently*, and
 * nobody finds out for a week.
 */
const ANNOTATE = import.meta.env.PUBLIC_JTK_ANNOTATE !== 'false';

export function flPath(
  type: string,
  field: string,
  item?: number,
  subField?: string,
): string | undefined {
  if (!ANNOTATE) return undefined;

  const { at } = block(type);
  if (at === -1) return undefined;

  return item === undefined
    ? `blocks[${at}].${field}`
    : `blocks[${at}].${field}[${item}].${subField}`;
}

/**
 * Every block, in the document's own order.
 *
 * The page renders this rather than looking blocks up by name, because a page is
 * a sequence and a generated one repeats types: two feature grids and three
 * prose sections are an ordinary landing page, and `block('feature_grid')` can
 * only ever find the first.
 *
 * The index is the block's own, which is what an annotation path is built from.
 */
export const PAGE: readonly Block[] = blocks;

/** The path of a field on the block at `at`, for `data-jtk-path`. */
export function pathAt(at: number, field: string, item?: number, subField?: string): string | undefined {
  if (!ANNOTATE) return undefined;
  if (at < 0 || at >= blocks.length) return undefined;

  return item === undefined
    ? `blocks[${at}].${field}`
    : `blocks[${at}].${field}[${item}].${subField}`;
}

const hero = block('hero').of;
const cta = block('cta_banner').of;

export const HOME = {
  /** Complete on its own — the home page passes suffix={false}. */
  title: (page.seo?.title as string) ?? '',
  /** ~150–160 characters, a sentence a person would read in a result list. */
  description: (page.seo?.description as string) ?? '',

  hero: {
    eyebrow: str(hero, 'eyebrow'),
    heading: str(hero, 'title'),
    lead: str(hero, 'lead'),
    cta: str(hero, 'cta_label'),
    ctaHref: str(hero, 'cta_href') || '#contact',
    image: str(hero, 'image'),
    imageAlt: str(hero, 'image_alt'),
  },
} as const;

/**
 * The lead form.
 *
 * Its labels belong to the business; its validation strings are interface, and
 * the catalogue marks those `client_editable: false` — there is nothing a
 * business owner wants to say in "Sending…".
 *
 * Which is why `fl-init` writes them from the locale rather than leaving them
 * blank. They were blank, in every language, and the form said nothing while
 * it sent, nothing when it had sent, and nothing when a field was empty — a
 * defect that no build catches, because an empty string is a valid string.
 *
 * Server-side validation has its own copy on the platform, behind `/api/lead`: the
 * browser never sees those strings until the server answers, so they cannot be
 * shared from here.
 */
export const FORM = {
  title: str(cta, 'title'),
  lead: str(cta, 'lead'),

  // The questions, which are the business's own — see blocks.ts.
  name: str(cta, 'name_label'),
  contact: str(cta, 'contact_label'),
  message: str(cta, 'message_label'),

  required: '{{UI_REQUIRED}}',
  requiredNote: str(cta, 'required_note'),
  privacy: '{{UI_PRIVACY}}',

  submit: str(cta, 'cta_label'),
  sending: '{{UI_SENDING}}',
  success: '{{UI_SUCCESS}}',
  error: '{{UI_ERROR}}',

  invalidName: '{{UI_INVALID_NAME}}',
  invalidContact: '{{UI_INVALID_CONTACT}}',
  invalidMessage: '{{UI_INVALID_MESSAGE}}',

  /** Shown while the Telegram bot is not connected. Preview only. */
  demoNote: '{{UI_DEMO_NOTE}}',
} as const;
