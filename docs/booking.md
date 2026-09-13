# The booking form

The diary is the platform's; the page draws it. Six addresses on the site's
own host answer everything a visitor needs, and nothing about availability is
computed in the repository — which is what lets the owner change their hours
in the admin and have the site offer them the next minute, with no rebuild.

Template: `src/components/BookingForm.astro`. Copy it,
keep the script, restyle the markup. The contract in full is
[bookings-on-the-site](https://jtakeit.com/docs/guides/bookings-on-the-site)
in the platform's docs.

## Turning it on

The site's catalogue declares the module and binds two collections:

```jsonc
"modules": {
  "bookings": {
    "services":  "services",   // entries with `takes` (minutes) and, to be payable, `costs`
    "resources": "masters"     // entries that get occupied; one entry is a solo business
  }
}
```

Both are ordinary collections the owner edits in the admin — the team page and
the diary's masters are the **same entries**. A service entry carries `takes`
as a `duration` field; a master entry may carry its own weekly `hours`. The
business's hours, days off and confirmation mode are the module's settings
document, which the owner edits under the diary; the repository never holds
them.

## The page

```astro
---
import BookingForm from '../components/BookingForm.astro';
import { listed } from '../lib/entries';                                // src/lib/entries.ts: the visible entries, in the collection's order
import bookings from '../../jtk/bookings.json';
const services = (await listed('services')).map((e) => ({
  slug: e.id, title: String(e.data.title),
  takes: e.data.takes, costs: e.data.costs, group: e.data.group,      // for the checklist's total and headings
}));
const masters  = (await listed('masters')).map((e) => ({ slug: e.id, title: String(e.data.title) }));
const combine  = bookings.blocks[0].combine === true;                  // jtk/bookings.json, the owner's setting
```

An entry is `{ id, data }` — the slug and the block's fields — which is what
`src/lib/entries.ts` exports (`listed`, `everyEntry`, `href`); there is no
`entries()` and never was one, which this page used to claim.

And `jtk/bookings.json` says **where the form is** — `"page": "/angebote"` in its
block — because the form is placed by a page template rather than by a block, so
nothing else can tell the panel which page to open when the owner presses *Try
booking*. Empty means the front page.

```ts
---
<BookingForm services={services} resources={masters} locale="de" combine={combine} currency="CHF" />
```

With `combine` on — the module's setting, the owner's to flip — the services
are a checklist under their `group` headings with a running total of minutes
and money, and the visit is booked as one: the same person, the sum of the
lengths, the sum of the prices. Off, the form is one choice, as it always was.
Only services with a `takes` belong on the form; a price-list row without one
is refused by the platform, so filter before passing.

Pass `resources` only when the visitor should choose; leave it out for a solo
business and the platform assigns. The words are the component's, per locale;
the page's own copy stays in `jtk/content`.

## Its look is the site's to give

The component is a reference for the flow, not a design. It ships with
class names — `field`, `field__input`, `booking__slot`, `booking__submit` —
and a minimal `<style>` that makes it legible and nothing more. **Restyle
it before it goes out**, the way you restyle everything else the scaffold
ships: the site's own field styles, the site's own buttons for the time
slots and the press, the site's panel around it. A booking form that looks
like a browser default on a page that does not is the first thing the
studio sees. Keep the `data-*` hooks and the input `name`s: the script is
wired to them.

## What the component does, in order

1. `GET /api/turnstile` — the widget's key, or `""`. With a key it renders the
   Turnstile widget and sends the token as `turnstile`; without one it renders
   nothing. **The site carries no key**: which widget covers a host is the
   platform's decision, and a client's own domain is put into one the moment it
   is attached.
2. `GET /api/availability?service=&from=&to=[&resource=]` — the free starts
   for one day, as UTC instants, with the business's `zone` beside them for
   the clock. `service` repeats for a visit of several; the platform sums the
   lengths and offers only the resources that do all of them.
3. `POST /api/book` — the visitor's choice, with `services: [...]` for a visit
   of several (`service` alone is the one-service form). `409` means the time went while
   the page was open, and the component reloads the day. The answer carries
   `state` (*confirmed* or *pending*), `manage_path` (the visitor's own page:
   cancel, move, add to calendar) and `telegram_url` (reminders).
4. `POST /api/pay` — only when `amount_minor` is not zero. The slot is held
   thirty minutes; the platform's Checkout page comes back to `manage_path`.

## The band it sits in

The same rule as the lead form: give it something to stand beside — the price
list, the opening line, the master's photograph — or let it use the width.
`fl-check` fails a form band that uses less than 45% of a 1920px screen.

## In the preview

The form works on the studio's preview exactly as on the live site: the
platform answers `/p/<slug>/api/…` behind the preview's session, against the
same demo. A client can book a test appointment in their own diary before they
have paid, which is the sale.

`manage_path` already carries the prefix on a preview — `/p/<slug>/_booking/…`
— and the visitor's page is served there, so the link is used as it arrives.
A "received" page of your own writes every address through `under()`, the
`/_booking/<token>` fallback included: `href="/angebote/"` on it is the one
link a visitor presses right after booking, and on a preview it led to "no
site is attached to this address".

## A record, not a post — and every fact once

What the module reads is a record the diary occupies or offers, and the panel
draws it as a form. Shape the two entry types for that, not for the blog:

- **A service** is short fields — `title`, `takes`, `costs`, a `group` if the
  price list has headings, one line — with **no `body`** and **`pages: false`**
  on the collection. It is a row of the price list the form reads, not a page.
- **A resource** — a master, a chair, a table, a room — is a `title` with its
  own `hours`, what it `does`, `seats` or `spots`, a line and a photograph if
  the page wants them. A master may have a page and a paragraph about her; a
  billiard table with an excerpt, a cover and eight thousand characters of
  body is the blog's shape copied without a reason.

And a fact lives once. The owner's opening hours are the module's settings,
which publish writes to `jtk/bookings.json`; the page reads them from there
(`OpeningHours.astro` below). The prices are the services' `costs`, and the
price list on the page is the same entries the form reads. **Never type hours
or prices again as text** on a page block: the copy goes stale the day the
owner changes the panel's.

`validate_catalogue` says both as advice — `JTK_W_MODULE_POST`,
`JTK_W_MODULE_TWIN` — under `advice`, refusing nothing; `jtk catalogue --judge`
prints them. Act on them before the first build.

### Opening hours from the module

```astro
---
import OpeningHours from '../components/OpeningHours.astro';
---
<OpeningHours locale="de" />
```

`src/components/OpeningHours.astro` reads `jtk/bookings.json`
if it is there — a repository nobody has published yet has none, and the
component draws nothing rather than failing the build — and lists the week in
the site's language, two rows for a day with a break. Restyle it like the rest.

## What not to do

- Do not compute free times on the page from the hours in `jtk/content` — the
  diary's bookings live in the platform and the page cannot see them.
- Do not put a Turnstile key in the repository.
- Do not draw your own "your booking" page unless the design needs it; the
  platform's at `manage_path` is the floor and works from day one.
