/**
 * Generates the responsive WebP variants that index.html points its srcset
 * at.
 *
 * Source of truth is public/images/**; output goes next to it in
 * public/images/responsive/ and is committed, so a deploy never has to run
 * sharp. Re-run after adding or replacing a photograph:
 *
 *   npm run images
 *
 * Existing variants are left alone unless the source is newer, so the
 * common case is a no-op.
 */
import { readdir, stat, mkdir } from 'node:fs/promises';
import { join, extname, basename, relative } from 'node:path';
import sharp from 'sharp';

const SOURCE = 'public/images';
const OUTPUT = 'public/images/responsive';

// The ladder. Nothing on this page is painted wider than about 610 CSS px,
// so 1280 covers the largest slot on a 2× screen. The steps are close
// together on purpose: these are photographs of fabric, all high-frequency
// detail that WebP compresses badly, so the saving comes from the browser
// being able to pick a size near what it actually paints rather than
// rounding up to the next variant.
const WIDTHS = [160, 320, 480, 640, 768, 960, 1280];

const SOURCE_TYPES = new Set(['.jpg', '.jpeg', '.png']);

async function findImages(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (path.startsWith(OUTPUT)) continue;
      found.push(...(await findImages(path)));
    } else if (SOURCE_TYPES.has(extname(entry.name).toLowerCase())) {
      found.push(path);
    }
  }
  return found;
}

/** True when the variant is missing or older than the file it came from. */
async function isStale(target, source) {
  try {
    const [out, src] = await Promise.all([stat(target), stat(source)]);
    return src.mtimeMs > out.mtimeMs;
  } catch {
    return true;
  }
}

async function main() {
  const sources = await findImages(SOURCE);
  let written = 0;
  let skipped = 0;

  for (const source of sources) {
    const image = sharp(source);
    const { width: sourceWidth } = await image.metadata();
    const name = basename(source, extname(source));
    const folder = join(OUTPUT, relative(SOURCE, source), '..');
    await mkdir(folder, { recursive: true });

    // Never upscale. The narrowest width above the source is kept so the
    // source's own resolution is still represented in the srcset.
    const widths = WIDTHS.filter((w) => w < sourceWidth).concat(
      WIDTHS.some((w) => w >= sourceWidth) ? [sourceWidth] : [],
    );

    for (const width of widths) {
      const target = join(folder, `${name}-${width}.webp`);
      if (!(await isStale(target, source))) {
        skipped += 1;
        continue;
      }
      await image
        .clone()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 70, effort: 6, smartSubsample: true })
        .toFile(target);
      written += 1;
    }
  }

  console.log(
    `${sources.length} sources → ${written} variants written, ${skipped} already current.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
