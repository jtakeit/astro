# @jtakeit/astro

The scaffold and the catalogue tool for a site on [jtakeit](https://jtakeit.com) —
the platform's contract as a working Astro project, ready to build on.

jtakeit is an agent-driven platform for building and running websites for clients:
the site is written by an agent in a repository, and the platform runs the panel the
business owner edits it in, the enquiries and the bookings, the backups and the
domain. What the platform holds a repository to is small — a `jtk/catalogue.json`
that validates, a `data-jtk-path` on every editable field, a `dist/` from an Astro
build — and this package is that contract with a page already on it.

Astro is the only generator the platform builds today.

## Scaffold

```
npx @jtakeit/astro create <slug> --name "The Business" --locale de-CH
cd <slug> && npm ci && npm run dev
```

You get a static Astro project: a layout, a hero, a lead form posting to `/api/lead`
(the platform serves it), a booking form for the platform's diary, opening hours read
from `jtk/bookings.json`, pages for robots, sitemap and llms.txt, and
`src/content/blocks.ts` — the declaration of what the owner may edit. Nothing in it
decides how the site looks; every component is yours to replace.

## The catalogue

```
npx @jtakeit/astro catalogue              # write jtk/catalogue.json, build, check it against dist/
npx @jtakeit/astro catalogue --emit-only  # write it and stop
```

`jtk/catalogue.json` is derived from `src/content/blocks.ts` and checked against the
built pages in both directions: every declared field is rendered with its path, and
every annotated path is declared. The platform's own validator is the authority —
`validate_catalogue` over MCP, or `--judge` here with `JTK_API` and `JTK_TOKEN` set —
and this tool sits its exam.

## Then, on the platform

1. Push the repository somewhere the platform's GitHub App can reach.
2. `create_site`, then `attach_repo`.
3. `trigger_build`; `import_branch` after committing content; `publish`.
4. `get_preview_link` to look; the studio hands the owner's link to the client from
   the panel.

The whole of it, with the reasons, is in [docs/](docs/): `kit.md` first, then
`catalogue.md`, `pages.md`, `collections.md`, `lead-form.md`, `booking.md`,
`photos.md`, and the rest as you need them. The platform's own reference —
field kinds, modules, every error code — is what the MCP server hands an agent on
`initialize`, and at `https://docs.jtakeit.com`.

## Not here, on purpose

No deploy: the platform builds and serves. No server code: the form and the diary
are the platform's endpoints beside the site. No design system: what the site looks
like is the point of writing it.
