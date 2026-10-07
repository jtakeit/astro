#!/usr/bin/env node
/**
 * jtk — the command line of @jtakeit/astro.
 *
 *   jtk create <slug> …     scaffold a site (lib/create.mjs)
 *   jtk catalogue …         write jtk/catalogue.json and check it (lib/catalogue.mjs)
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const [command, ...rest] = process.argv.slice(2);

switch (command) {
  case 'create': {
    const { create } = await import(pathToFileURL(join(HERE, '..', 'lib', 'create.mjs')).href);
    await create(rest);
    break;
  }
  case 'catalogue':
  case 'catalog': {
    // The tool is the kit's (@jtakeit/kit/catalogue); it signs the file as
    // this package, which is what wrote the declaration it reads.
    const { readFileSync } = await import('node:fs');
    const version = JSON.parse(readFileSync(join(HERE, '..', 'package.json'), 'utf8')).version;
    const args = rest.includes('--generator') ? rest : [...rest, '--generator', `@jtakeit/astro@${version}`];
    process.argv = [process.argv[0], process.argv[1], ...args];
    await import('@jtakeit/kit/catalogue');
    break;
  }
  default: {
    const { usage } = await import(pathToFileURL(join(HERE, '..', 'lib', 'create.mjs')).href);
    console.error(`@jtakeit/astro — the scaffold and the catalogue tool for a site on jtakeit

  jtk create <slug> [options]     scaffold a site into ./<slug>
  jtk catalogue [--emit-only] [--dist ./dist] [--judge]
                                  write jtk/catalogue.json from src/content/blocks.ts and
                                  check it against the built pages

${usage()}

The contract the platform holds this repository to is in docs/ of this package.`);
    process.exit(command === undefined || command === '--help' || command === '-h' ? 0 : 1);
  }
}
