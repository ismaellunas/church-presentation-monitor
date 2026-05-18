// Generates PNG icons from the SVG sources in assets/ into public/.
// Run via `npm run icons`. Re-run if the source SVGs change.
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const publicDir = resolve(root, 'public');
mkdirSync(publicDir, { recursive: true });

const square = readFileSync(resolve(root, 'assets/icon.svg'));
const maskable = readFileSync(resolve(root, 'assets/icon-maskable.svg'));

const targets = [
  { input: square, output: 'icon-192.png', size: 192 },
  { input: square, output: 'icon-512.png', size: 512 },
  { input: maskable, output: 'icon-maskable-512.png', size: 512 },
  { input: square, output: 'apple-touch-icon.png', size: 180 },
  { input: square, output: 'favicon.svg', size: null },
];

for (const target of targets) {
  const outputPath = resolve(publicDir, target.output);
  if (target.size === null) {
    // Just copy the SVG.
    const { writeFileSync } = await import('node:fs');
    writeFileSync(outputPath, target.input);
    console.log(`wrote ${target.output}`);
    continue;
  }
  await sharp(target.input)
    .resize(target.size, target.size, { fit: 'contain' })
    .png()
    .toFile(outputPath);
  console.log(`wrote ${target.output} (${target.size}x${target.size})`);
}
