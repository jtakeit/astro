#!/usr/bin/env node
/**
 * jtkit — the command line of @jtakeit/kit, for a site on any generator.
 *
 *   jtkit apply --kit <kind>|<file> [--locale uk] [--api <url>] [--root <dir>]
 *       lay a booking kit out: jtk/bookings.json, the rates as entries, and the
 *       kit's types, collections and module into jtk/catalogue.json
 *   jtkit catalogue [--declaration src/content/blocks.ts] [--emit-only] [--dist ./dist] [--judge]
 *       write jtk/catalogue.json from a declaration and check it against the built pages
 */
import { pathToFileURL } from 'node:url';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { relative } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const [command, ...rest] = process.argv.slice(2);
const has = (name) => rest.includes(`--${name}`);
const flag = (name, fallback) => {
  const at = rest.indexOf(`--${name}`);
  return at === -1 ? fallback : rest[at + 1];
};

switch (command) {
  case 'apply': {
    const { loadKit, layKitFiles } = await import(pathToFileURL(join(HERE, '..', 'lib', 'kits.mjs')).href);
    const asked = has('kit') ? flag('kit', '') : has('kind') ? flag('kind', '') : '';
    if (asked === '') {
      console.error('jtkit apply: --kit <kind> or --kit <file> says which kit');
      process.exit(1);
    }
    const root = resolve(flag('root', process.cwd()));
    try {
      const kit = await loadKit(asked, flag('api', undefined));
      const written = layKitFiles(root, kit, { locale: flag('locale', 'en'), catalogue: true });
      console.log(`${written.length} files written under ${relative(process.cwd(), root) || '.'}:`);
      for (const file of written) console.log(`  ${relative(root, file)}`);
      console.log(`\nThe «${kit.kind}» kit is laid out. Ask, never make up:`);
      for (const line of kit.ask ?? []) console.log(`  - ${line}`);
      console.log(`What the kit chose for the business — say each back and get a yes: jtakeit:///kits/${kit.kind}.md, «Taken by default».`);
    } catch (why) {
      console.error(`jtkit apply: ${why.message}`);
      process.exit(1);
    }
    break;
  }
  case 'catalogue':
  case 'catalog': {
    process.argv = [process.argv[0], process.argv[1], ...rest];
    await import(pathToFileURL(join(HERE, '..', 'lib', 'catalogue.mjs')).href);
    break;
  }
  default: {
    console.error(`@jtakeit/kit — the framework-free half of a site on jtakeit

  jtkit apply --kit <kind>|<file> [--locale uk] [--api <url>] [--root <dir>]
  jtkit catalogue [--declaration src/content/blocks.ts] [--emit-only] [--dist ./dist] [--judge]

The contract the platform holds a repository to: https://jtakeit.com/docs/guides/connecting-a-site`);
    process.exit(command === undefined || command === '--help' || command === '-h' ? 0 : 1);
  }
}
