import ImageMagick from "magickwand.js";
import fs from "node:fs/promises";
import path from "node:path";

const { Magick, MagickCore } = await ImageMagick;

const CLASSES_DIR = "../../src/icons/classes";
const NUMBERS_DIR = "./numbers";
const OUT_DIR = "../../src/icons/ranks";
const GRAVITY = "center";
const GEOMETRY = "+0+0";

/**
 * @param {string} dir
 * @returns {Promise<void>}
 */
async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * @example
 * ```js
 * const { dx, dy } = parseGeometry("+0+0")
 * ```
 * @param {string} geom
 * @returns {{dx: number, dy: number}}
 */
function parseGeometry(geom) {
  const m = geom.match(/^([+-]\d+)([+-]\d+)$/);
  if (!m) {
    throw new Error(
      `Invalid GEOMETRY "${geom}". Expected like "+0+0" or "-5+12".`,
    );
  }
  return {
    dx: parseInt(m[1], 10),
    dy: parseInt(m[2], 10),
  };
}

/**
 * @param {number} baseW
 * @param {number} baseH
 * @param {number} overW
 * @param {number} overH
 * @param {string} gravity
 * @returns {{x: number, y: number}}
 */
function gravityAnchor(baseW, baseH, overW, overH, gravity) {
  let x = 0,
    y = 0;
  switch (gravity.toLowerCase()) {
    case "center":
      x = Math.round((baseW - overW) / 2);
      y = Math.round((baseH - overH) / 2);
      break;
    case "north":
      x = Math.round((baseW - overW) / 2);
      y = 0;
      break;
    case "south":
      x = Math.round((baseW - overW) / 2);
      y = baseH - overH;
      break;
    case "west":
      x = 0;
      y = Math.round((baseH - overH) / 2);
      break;
    case "east":
      x = baseW - overW;
      y = Math.round((baseH - overH) / 2);
      break;
    case "northwest":
      x = 0;
      y = 0;
      break;
    case "northeast":
      x = baseW - overW;
      y = 0;
      break;
    case "southwest":
      x = 0;
      y = baseH - overH;
      break;
    case "southeast":
      x = baseW - overW;
      y = baseH - overH;
      break;
    default:
      throw new Error(`Unsupported gravity "${gravity}"`);
  }
  return {
    x,
    y,
  };
}

/**
 * @param {string} filePath
 * @returns {Promise<Magick.Image>}
 */
async function readWebp(filePath) {
  const img = new Magick.Image();
  await img.readAsync(filePath);
  return img;
}

/**
 * @param {Magick.Image} baseImg
 * @param {Magick.Image} overlayImg
 * @param {number} x
 * @param {number} y
 * @returns {Promise<Magick.Image>}
 */
async function compositeAt(baseImg, overlayImg, x, y) {
  const out = new Magick.Image(baseImg);
  await out.compositeAsync(overlayImg, x, y, MagickCore.OverCompositeOp);
  return out;
}

/**
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function listWebp(dir) {
  const abs = path.resolve(dir);
  const entries = await fs.readdir(abs);
  return entries
    .filter((n) => n.toLowerCase().endsWith(".webp"))
    .map((n) => path.join(abs, n));
}

(async function main() {
  try {
    await ensureDir(OUT_DIR);

    const classFiles = await listWebp(CLASSES_DIR);
    const numberFiles = await listWebp(NUMBERS_DIR);

    if (classFiles.length === 0) {
      console.error(`No .webp files found in ${CLASSES_DIR}`);
      //eslint-disable-next-line no-undef
      process.exit(1);
    }
    if (numberFiles.length === 0) {
      console.error(`No .webp files found in ${NUMBERS_DIR}`);
      //eslint-disable-next-line no-undef
      process.exit(1);
    }

    const { dx, dy } = parseGeometry(GEOMETRY);

    for (const classPath of classFiles) {
      const classBase = path.basename(classPath, ".webp"); // e.g., "warrior"
      const classImg = await readWebp(classPath);
      const classSize = await classImg.sizeAsync();
      const baseW = classSize.width();
      const baseH = classSize.height();

      for (const numPath of numberFiles) {
        const numBase = path.basename(numPath, ".webp"); // e.g., "01"
        const numImg = await readWebp(numPath);
        const numSize = await numImg.sizeAsync();
        const overW = numSize.width();
        const overH = numSize.height();

        // gravity anchor + geometry offsets
        const { x: gx, y: gy } = gravityAnchor(
          baseW,
          baseH,
          overW,
          overH,
          GRAVITY,
        );
        const x = gx + dx;
        const y = gy + dy;

        // Compose and write
        const composed = await compositeAt(classImg, numImg, x, y);
        const outName = `rank-${numBase}-${classBase}.webp`;
        const outPath = path.resolve(OUT_DIR, outName);
        await composed.writeAsync(outPath);
        console.log(`Wrote ${outPath}`);
      }
    }
  } catch (err) {
    console.error(err.message || err);
    //eslint-disable-next-line no-undef
    process.exit(1);
  }
})();
