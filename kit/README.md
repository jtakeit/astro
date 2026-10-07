# @jtakeit/kit

The half of a site on [jtakeit](https://jtakeit.com) that does not depend on
how the site is built.

[`@jtakeit/astro`](https://www.npmjs.com/package/@jtakeit/astro) is the
scaffold the platform ships: an Astro project with the contract already on
it. Everything in it that is not Astro's lives here, so a site on any other
static generator — Eleventy, a Next export, Nuxt, SvelteKit, a Node script —
takes the same pieces instead of reproducing them. The scaffold itself
imports this package; there is one implementation of each piece and two
homes for it.

What the platform holds a repository to is in
[connecting a site](https://jtakeit.com/docs/guides/connecting-a-site), under
*On another generator*. This package is the pieces of that list that are
worth not writing twice.

## The booking form

The platform's diary, on the page: the free times fetched, a stay of several
nights, a class of cars, a party, the words in the business's kind, the
payment step, Turnstile when the host has it. The contract it keeps is
[bookings on the site](https://jtakeit.com/docs/guides/bookings-on-the-site);
`preflight` reads `data-sends` off the built page and books in exactly that
shape, so the form says what it sends and the element sends nothing else.

**At build time**, the markup:

```js
import { renderBookingForm } from '@jtakeit/kit/booking';

const html = renderBookingForm({
  services,                 // [{ slug, title, takes, costs, group }], the entries with `takes`
  resources,                // [{ slug, title }] — leave empty for a solo business
  locale: 'uk',             // uk, de or en: the words before the platform has spoken
  combine: settings.combine === true,   // jtk/bookings.json
  scale: settings.scale ?? '',          // 'daily' for a business that lets by the day
  kind: settings.kind ?? '',            // whose words to wait for
  currency: site.business.currency,
  api: `${base}api/`,       // where /api/ is from this page — under the preview the site is served at /p/<slug>/
});
```

Put the string on the page where the site sends people to book — the one
`page` in `jtk/bookings.json` names. In Eleventy that is a shortcode; in a
Next export `dangerouslySetInnerHTML`; in a script, a template literal.

**On the page**, the behaviour, once:

```html
<script type="module">import '@jtakeit/kit/elements/booking';</script>
```

The markup comes wrapped in `<jtk-booking>`, and the element wires the form
when it reaches the document — on load, and when the panel places it later.
A form written by hand is wired too, as long as it keeps the `data-*` hooks
and the input `name`s of the rendered one: `wireAll()` walks the document at
load and again on the panel's `fl:placed`.

**The look** is the site's to give. `@jtakeit/kit/booking.css` makes the form
legible and nothing more; `field`, `field__input`, `booking__slot`,
`booking__submit` are names to restyle with the site's own fields and
buttons. Keep the `[hidden]` rule.

Under `base` — a site served from a path, which every preview is — pass
`api` as your generator writes a root-relative address, so the form posts to
`/p/<slug>/api/book` on the preview and to `/api/book` on the site's own host.

## The enquiry form

`/api/lead`, which the platform serves beside every site. The form is a real
`<form method="post">` first — with scripts off the browser posts it and the
platform answers with a page — and the element only spares a working browser
the navigation. What the build's lint holds it to: a `name` control, one of
`contact`, `phone` or `email`, the honeypot `website`, and nothing else that
the collecting block does not declare in `asks`
([the contract](https://jtakeit.com/docs/reference/contract.md)).

```js
import { renderLeadForm } from '@jtakeit/kit/lead';

const html = renderLeadForm({
  action: `${base}api/lead`,      // under the preview the site is served at /p/<slug>/
  copy: { title, lead, name, contact, message, requiredNote, submit, sending, success, error, invalidName, invalidContact },
  asks: [{ key: 'topic', label: 'What it is about', kind: 'text', max: 120 }],   // the block's `asks`, labels resolved
  paths: { title: 'blocks[3].title', lead: 'blocks[3].lead', name_label: 'blocks[3].name_label', /* … */ },  // the block's fields' data-jtk-path, when annotating
});
```

```html
<script type="module">import '@jtakeit/kit/elements/lead';</script>
```

`copy` is the collecting block's own words — the owner edits them by tapping,
which is what `paths` annotates — and `asks` are the catalogue's, drawn fixed.
`@jtakeit/kit/lead.css` is the legible minimum; keep `.trap` off-screen
whatever you restyle.

## Also here

- `@jtakeit/kit/money` — a price as the page says it: «2 300 ₴», no kopecks
  on a whole price, no sign where the site has not said its currency.
- `@jtakeit/kit/booking/words` — the form's words per language, the salon's
  and the letting business's by the day, before the platform corrects them.

## What is next

The lead form the same way, then the catalogue tool, the kits, the
specimen-address rule and the `_meta.json` writer — everything of the
scaffold's that a site on anything could use. `@jtakeit/astro` stays the
scaffold and becomes a thin wrapper over this.
