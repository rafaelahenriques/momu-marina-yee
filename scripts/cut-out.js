/**
 * Cuts the looks for the lineup out of their backdrops.
 *
 * The studio shots in assets/looks/ were taken against a seamless backdrop
 * that nothing in the clothes comes close to: a flat neutral grey. A flood
 * fill from the edges of the frame through neutral, backdrop-light pixels
 * finds all of it without reaching into the figure. Where the backdrop
 * darkens under the feet, that shadow is kept as a soft, transparent one, so
 * the figure still stands on whatever it is placed over.
 *
 *   npm run cutouts && npm run images
 *
 * Output is a transparent PNG per look in public/images/looks/, which the
 * image script then turns into WebP variants like any other source.
 */
import { mkdir } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const SOURCE = 'assets/looks';
const OUTPUT = 'public/images/looks';

// Tall enough for the lineup's largest slot on a 2× screen.
const MAX_HEIGHT = 1600;

// shadow: keep the floor shadow (studio shots). A gradient backdrop has no
// shadow worth keeping, only darker corners, so it is removed outright.
//
// Not every look can be cut. The archive denim jacket is on a white mannequin
// against a white backdrop, and the two are the same colour where they meet,
// so it stays a photograph in the lineup rather than a figure.
const LOOKS = [
  { file: 'parker-bis-coat.webp', shadow: true },
  { file: 'parka.webp', shadow: true },
  { file: 'wide-leg-jeans.webp', shadow: true },
];

// A pixel is backdrop if it is grey (channels within this of each other)...
const NEUTRAL = 16;
// ...and no darker than this below the backdrop's own colour.
const SHADOW_DEPTH = 60;

async function cutOut({ file, shadow }) {
  const { data, info } = await sharp(join(SOURCE, file))
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  const lum = (i) => (data[i] + data[i + 1] + data[i + 2]) / 3;
  const spread = (i) =>
    Math.max(data[i], data[i + 1], data[i + 2]) -
    Math.min(data[i], data[i + 1], data[i + 2]);

  // The backdrop's colour: the lightest of the four corners, so a vignette
  // or a shadow reaching one corner cannot drag it down.
  const corner = (x, y) => lum((y * width + x) * 3);
  const backdrop = Math.max(
    corner(2, 2),
    corner(width - 3, 2),
    corner(2, height - 3),
    corner(width - 3, height - 3),
  );
  const floor = backdrop - SHADOW_DEPTH;

  const isBackdrop = (p) => {
    const i = p * 3;
    return spread(i) < NEUTRAL && lum(i) > floor;
  };

  // Flood fill from every edge pixel. Iterative: a recursive fill would run
  // out of stack on a two-million-pixel photograph.
  const alpha = Buffer.alloc(width * height, 255);
  const seen = new Uint8Array(width * height);
  const stack = [];
  for (let x = 0; x < width; x++) stack.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y++) stack.push(y * width, y * width + width - 1);

  while (stack.length) {
    const p = stack.pop();
    if (seen[p] || !isBackdrop(p)) continue;
    seen[p] = 1;

    // Lighter than the backdrop's shadow line is simply gone; darker is
    // shadow, kept in proportion to how dark it is.
    const depth = backdrop - lum(p * 3);
    alpha[p] = shadow && depth > 6 ? Math.min(200, depth * 3) : 0;
    if (shadow && depth > 6) {
      data[p * 3] = data[p * 3 + 1] = data[p * 3 + 2] = 0;
    }

    const x = p % width;
    if (x > 0) stack.push(p - 1);
    if (x < width - 1) stack.push(p + 1);
    if (p >= width) stack.push(p - width);
    if (p < width * (height - 1)) stack.push(p + width);
  }

  // A slight blur on the mask only, to soften the cut edge.
  const softened = await sharp(alpha, { raw: { width, height, channels: 1 } })
    .blur(0.7)
    .extractChannel(0)
    .raw()
    .toBuffer();

  const name = basename(file, extname(file));
  const cut = await sharp(data, { raw: { width, height, channels: 3 } })
    .joinChannel(softened, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();

  await sharp(cut)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 10 })
    .resize({ height: MAX_HEIGHT, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(join(OUTPUT, `${name}.png`));

  return name;
}

async function main() {
  await mkdir(OUTPUT, { recursive: true });
  for (const look of LOOKS) {
    console.log(`cut ${await cutOut(look)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
