// The scaffold writes a project with every token filled and nothing of the
// studio's left in it; the catalogue tool emits a file from it.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
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

  // The catalogue tool, on the scaffold it just wrote: the file is emitted, and
  // a module the site turns on gets its settings seeded in the platform's one
  // shape — once, never over a file that is already there.
  execFileSync('node', [bin, 'catalogue', '--emit-only'], { cwd: site, stdio: 'pipe' });
  if (!existsSync(join(site, 'jtk/catalogue.json'))) fail('jtk catalogue wrote no catalogue');
  if (existsSync(join(site, 'jtk/bookings.json'))) fail('a site without modules was given a diary');

  const blocks = join(site, 'src/content/blocks.ts');
  writeFileSync(blocks, readFileSync(blocks, 'utf8').replace(
    'export const MODULES: Modules = {};',
    "export const MODULES: Modules = { bookings: { services: 'services', resources: 'masters' } };",
  ));
  execFileSync('node', [bin, 'catalogue', '--emit-only'], { cwd: site, stdio: 'pipe' });
  const seeded = JSON.parse(readFileSync(join(site, 'jtk/bookings.json'), 'utf8'));
  if (seeded.blocks?.[0]?.type !== 'bookings_config' || seeded.blocks[0].v !== 1) fail('the diary was not seeded as one bookings_config block');
  if (!JSON.parse(readFileSync(join(site, 'jtk/catalogue.json'), 'utf8')).modules?.bookings) fail('MODULES did not reach the catalogue');

  seeded.blocks[0].zone = 'Europe/Zurich';
  writeFileSync(join(site, 'jtk/bookings.json'), JSON.stringify(seeded));
  execFileSync('node', [bin, 'catalogue', '--emit-only'], { cwd: site, stdio: 'pipe' });
  if (JSON.parse(readFileSync(join(site, 'jtk/bookings.json'), 'utf8')).blocks[0].zone !== 'Europe/Zurich') fail('the tool wrote over a diary that was already there');

  // A booking kit, laid out: the kit is the platform's (jtakeit:///kits/<kind>.md);
  // this one is made up and small, to hold the laying out, not the kinds.
  const kitFile = join(dir, 'kit.json');
  writeFileSync(kitFile, JSON.stringify({
    kind: 'car_rental', about: 'A test kit.', ask: ['zone: the time zone'],
    catalogue: {
      blocks: [
        { type: 'tariff', v: 1, label: { uk: 'Тариф', en: 'Rate', de: 'Tarif' }, fields: [
          { key: 'title', label: 'Name', kind: 'text', required: true, max: 80, client_editable: true },
          { key: 'takes', label: 'Takes', kind: 'duration', required: true, client_editable: true },
        ] },
        { type: 'car', v: 1, label: 'Car', fields: [{ key: 'title', label: 'Name', kind: 'text', required: true, max: 80, client_editable: true }] },
      ],
      collections: [
        { name: 'services', label: 'Rates', one: 'rate', prefix: '/rates', type: 'tariff', pages: false },
        { name: 'cars', label: 'Cars', prefix: '/cars', type: 'car' },
      ],
      modules: { bookings: { services: 'services', resources: 'cars' } },
    },
    settings: { kind: 'car_rental', scale: 'daily' },
    entries: [{ collection: 'services', slug: 'day', fields: { title: { uk: 'Доба', en: 'Day', de: 'Tag' }, takes: 1440 } }],
  }));
  const rental = join(dir, 'rental');
  execFileSync('node', [bin, 'create', 'smoke-rental', '--locale', 'de-CH', '--kit', kitFile, '--out', rental, '--no-git'], { stdio: 'pipe' });
  const laid = readFileSync(join(rental, 'src/content/blocks.ts'), 'utf8');
  if (!laid.includes('BLOCKS.push(') || !laid.includes('"prefix": "/rates"') || !laid.includes('"resources": "cars"')) fail('the kit did not reach blocks.ts');
  const diary = JSON.parse(readFileSync(join(rental, 'jtk/bookings.json'), 'utf8')).blocks[0];
  if (diary.type !== 'bookings_config' || diary.kind !== 'car_rental' || diary.page !== '/rates') fail('the kit\'s settings are not the diary\'s, with the form on the rates');
  const day = JSON.parse(readFileSync(join(rental, 'jtk/content/rates/day.json'), 'utf8'));
  if (day.collection !== 'services' || day.path !== '/rates/day' || day.blocks[0].title !== 'Tag' || day.blocks[0].type !== 'tariff') fail('the kit\'s rate is not an entry in the site\'s language');
  execFileSync('node', [bin, 'catalogue', '--emit-only'], { cwd: rental, stdio: 'pipe' });
  const emitted = JSON.parse(readFileSync(join(rental, 'jtk/catalogue.json'), 'utf8'));
  if (emitted.modules?.bookings?.resources !== 'cars' || !emitted.blocks.some((b) => b.type === 'tariff')) fail('the kit did not reach the catalogue');

  // A kit is a file; a kind alone is told where the file is.
  const refused = (args) => {
    try { execFileSync('node', [bin, 'create', 'smoke-no', ...args, '--out', join(dir, 'no'), '--no-git'], { stdio: 'pipe' }); return false; } catch { return true; }
  };
  if (!refused(['--kind', 'car_rental'])) fail('--kind without --kit was not refused');
  writeFileSync(join(dir, 'bad.json'), '{"kind": "car_rental"}');
  if (!refused(['--kit', join(dir, 'bad.json')])) fail('a file that is not a kit was laid out');

  console.log('smoke: the scaffold is whole');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
