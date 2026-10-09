import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readProgress, readBrief, sayProgress } from '../lib/progress.mjs';

// A site halfway through being written, laid out in a temporary directory:
// a brief with open questions, a catalogue, one page with some of its text,
// a collection the diary points at with no entry yet, settings without
// hours. Progress is read off these and nothing else.

function site({ brief = true, catalogue = true, written = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'jtk-progress-'));
  const write = (path, text) => {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), text);
  };
  if (brief) {
    write('BRIEF.md', [
      '# Corner Bakery — brief', '',
      'Read on 9 October. Sources: developer.', '',
      '## In one sentence', 'A bakery that wants more weekday orders.', '',
      '## The one action', 'Call.', '',
      '## Facts', '| Fact | Value | Source |', '| --- | --- | --- |', '| Name | Corner Bakery | developer |', '| Phone | NEEDS CLIENT | — |', '',
      '## Bookings', 'The kit: salon, whole.', '',
      '## Decisions', '', '',
      '## Open — NEEDS CLIENT', '- the phone number', '- opening hours on Sunday', '',
      '## Done when', '- [x] every fact has a source', '- [ ] the kit is taken whole', '- [ ] the developer said yes', '',
    ].join('\n'));
  }
  if (catalogue) {
    write('jtk/catalogue.json', JSON.stringify({
      contract: 2,
      blocks: [
        { type: 'hero', v: 1, label: 'Hero', fields: [
          { key: 'title', label: 'Title', kind: 'text', required: true },
          { key: 'lead', label: 'Lead', kind: 'textarea' },
          { key: 'cta_href', label: 'Link', kind: 'url' },
          { key: 'image', label: 'Picture', kind: 'media' },
        ] },
        { type: 'service', v: 1, label: 'Service', fields: [{ key: 'title', label: 'Name', kind: 'text', required: true }] },
      ],
      collections: [{ name: 'services', label: 'Services', prefix: '/services', type: 'service', pages: false }],
      modules: { bookings: { services: 'services' } },
    }));
  }
  write('jtk/content/index.json', JSON.stringify({
    path: '/', seo: {},
    blocks: [{ _key: 'h1', type: 'hero', v: 1, title: written ? 'Bread, every morning' : '', lead: written ? 'Since 1998.' : 'Since 1998.', cta_href: '#contact', image: '' }],
  }));
  write('jtk/bookings.json', JSON.stringify({ blocks: [{ type: 'bookings_config', v: 1, kit: 'salon', kit_version: '0.5.1', zone: 'Europe/Zurich' }] }));
  write('src/data/site.ts', "export const SITE = { name: '{{NAME}}' };\nexport const SCHEMA_TYPE = '{{SCHEMA_TYPE}}';\n");
  return root;
}

test('progress is read off the files: the brief, the pages, the collections, the settings', async () => {
  const p = await readProgress(site());
  assert.equal(p.rule, 'exact');
  assert.deepEqual(p.kit, { kind: 'salon', version: '0.5.1' });
  assert.equal(p.brief.facts, 2);
  assert.equal(p.brief.open, 2);
  assert.equal(p.brief.needsClient, 1, 'the phone, in the table — not the heading, not the checklist');
  assert.equal(p.brief.sections['Decisions'], false);
  assert.equal(p.brief.sections['Facts'], true);
  assert.deepEqual(p.brief.doneWhen, { done: 1, of: 3, items: [
    { done: true, says: 'every fact has a source' }, { done: false, says: 'the kit is taken whole' }, { done: false, says: 'the developer said yes' },
  ] });
  assert.equal(p.catalogue, true);
  assert.deepEqual(p.pages, [{ path: '/', written: false, filled: 1, of: 2, missing: 1 }]);
  assert.deepEqual(p.collections, { services: { entries: 0, expected: 1 } });
  assert.deepEqual(p.settings, { hours: false, zone: true, payment: '' });
  assert.deepEqual(p.facts, { placeholders: 2 });
  assert.equal(p.media, 0);
  assert.deepEqual(p.missing, [
    '2 questions for the client (Open — NEEDS CLIENT)',
    'the brief has no Decisions yet',
    '/: 1 of 2 fields, 1 required missing',
    'services: no entry yet',
    'the opening hours are not set (jtk/bookings.json)',
    'src/data/site.ts still carries 2 placeholders',
    'no picture yet',
  ]);
  assert.ok(p.changedAt !== null);
});

test('a page is written when its required text is there; a site with no catalogue is read by the weaker rule', async () => {
  const exact = await readProgress(site({ written: true }));
  assert.equal(exact.pages[0].written, true);
  assert.ok(!exact.missing.some((one) => one.startsWith('/:')));

  const loose = await readProgress(site({ catalogue: false, written: true }));
  assert.equal(loose.rule, 'has-text');
  assert.equal(loose.pages[0].written, true);
  assert.equal(loose.pages[0].of, 2, 'the url and the picture are not words');
  assert.ok(loose.missing.includes('jtk/catalogue.json is not written yet (npx @jtakeit/astro catalogue)'));
});

test('no brief is said first, and an empty tree is nothing but missing', async () => {
  const p = await readProgress(site({ brief: false }));
  assert.equal(p.brief, null);
  assert.equal(p.missing[0], 'BRIEF.md is not written yet');
  assert.equal(await readBrief(join(tmpdir(), 'no-such-brief.md')), null);

  const empty = await readProgress(mkdtempSync(join(tmpdir(), 'jtk-empty-')));
  assert.deepEqual(empty.pages, []);
  assert.equal(empty.changedAt, null);
  assert.ok(empty.missing.includes('no page has content yet'));
});

test('the terminal says the same list', async () => {
  const said = sayProgress(await readProgress(site()));
  assert.match(said, /brief: 2 fact\(s\), 2 open for the client, done when 1\/3/);
  assert.match(said, /todo \/  1\/2 fields, 1 required missing/);
  assert.match(said, /todo services: 0 entries \(≥ 1\)/);
  assert.match(said, /- no picture yet/);
});

test('the brief the scaffold writes has no words of its own', async () => {
  const root = mkdtempSync(join(tmpdir(), 'jtk-skeleton-'));
  writeFileSync(join(root, 'BRIEF.md'), [
    '# Probe — brief', '', 'Read on <date>. Sources: developer <date>.', '',
    '## In one sentence', '', '## The one action', '', '## Facts', '| Fact | Value | Source |', '| --- | --- | --- |', '',
    '## Bookings', 'The kit: salon, whole — or what was taken out, under Decisions.', '| Asked | Answer | Source |', '| --- | --- | --- |', '| Default | Confirmed / changed to | Source |', '| --- | --- | --- |', '',
    '## Decisions', '', '## Open — NEEDS CLIENT', '', '## Done when', '- [ ] every fact has a source, and every gap is NEEDS CLIENT', '- [ ] hours: when it is open', '',
  ].join('\n'));
  const b = await readBrief(join(root, 'BRIEF.md'));
  assert.deepEqual(Object.entries(b.sections).filter(([, has]) => has).map(([name]) => name), ['Done when']);
  assert.equal(b.facts, 0);
  assert.equal(b.needsClient, 0);
  assert.equal(b.doneWhen.of, 2);
});
