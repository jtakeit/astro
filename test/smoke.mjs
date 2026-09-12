// The scaffold writes a project with every token filled and nothing of the
// studio's left in it; the catalogue tool emits a file from it.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const bin = resolve('bin/jtk.mjs');
const dir = mkdtempSync(join(tmpdir(), 'jtk-smoke-'));
const fail = (m) => { console.error(`smoke: ${m}`); process.exit(1); };

try {
  execFileSync('node', [bin, 'create', 'smoke-salon', '--name', 'Smoke Salon', '--locale', 'de-CH', '--out', join(dir, 'site'), '--no-git'], { stdio: 'pipe' });
  const site = join(dir, 'site');
  for (const must of ['package.json', 'astro.config.mjs', 'src/content/blocks.ts', 'src/copy/de-CH.ts', 'jtk/design.json', '.gitignore', 'jtakeit-meta.mjs']) {
    if (!existsSync(join(site, must))) fail(`missing ${must}`);
  }
  for (const never of ['functions', 'src/copy/LOCALE.ts', 'fastlane-meta.mjs', '.fastlane', 'STATUS.md']) {
    if (existsSync(join(site, never))) fail(`${never} should not be scaffolded`);
  }
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
  for (const f of walk(site)) {
    if (/\.(png|jpe?g|webp|avif|gif|ico|woff2?)$/i.test(f)) continue;
    const body = readFileSync(f, 'utf8');
    const left = body.match(/\{\{[A-Z_]+\}\}/g);
    if (left) fail(`${f} still carries ${left.join(', ')}`);
    if (/wrangler|functions\/api|fastlane:/.test(body)) fail(`${f} still names the studio's tooling`);
  }
  const pkg = JSON.parse(readFileSync(join(site, 'package.json'), 'utf8'));
  if (pkg.name !== 'smoke-salon') fail('package name is not the slug');
  if (pkg.scripts.deploy) fail('a deploy script was scaffolded');
  const de = readFileSync(join(site, 'src/copy/de-CH.ts'), 'utf8');
  if (!de.includes('Zum Inhalt springen')) fail('the copy is not in the site\'s language');
  console.log('smoke: the scaffold is whole');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
