import ImageMagick from "magickwand.js";
import fs from "node:fs/promises";
import path from "node:path";

const {
  Magick,
  MagickCore,
} = await ImageMagick;

const ROOT = process.cwd();
const REF_PATH = path.join(ROOT, "ref.json");
const TEMPLATES_DIR = path.join(ROOT, "templates");
const OUT_TEMP = path.resolve(ROOT, "./temp");
const OUT_BASE = path.resolve(ROOT, "../../src/icons");
const OUT = path.resolve(ROOT, "../../src/icons/general");

const Q = 65535;

async function ensureLayout() {
  const stRef = await fs.stat(REF_PATH).catch(() => null);
  if (!stRef) {
    throw new Error("Error: ./ref.json reference file not found.");
  }

  const stTpl = await fs.stat(TEMPLATES_DIR).catch(() => null);
  if (!stTpl || !stTpl.isDirectory()) {
    throw new Error("Error: ./templates directory not found.");
  }

  await fs.mkdir(OUT_TEMP, { recursive: true });
  await fs.mkdir(OUT, { recursive: true });
}

/**
 * Read ref.json and validate it is { [groupToken]: { [variantName]: {dark,mid,light} } }
 * Returns the full parsed object.
 */
async function loadAllGroups() {
  const raw = JSON.parse(await fs.readFile(REF_PATH, "utf8"));
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Error: ref.json must be a JSON object with top-level groups.");
  }

  /** @type {Record<string, {outRel: string, variants: Record<string, {dark:string, mid:string, light:string}>}>} */
  const groups = {};
  console.log("Loading color schemes from ref.json...");

  for (const [ groupToken, spec ] of Object.entries(raw)) {
    if (!spec || typeof spec !== "object" || Array.isArray(spec)) {
      console.warn(`  Skipping group "${groupToken}" (must be an object).`);
      continue;
    }
    const outRel = typeof spec.out === "string" && spec.out.trim() ? spec.out.trim() : groupToken.toLowerCase();
    const colors = spec.colors;

    if (!colors || typeof colors !== "object" || Array.isArray(colors)) {
      console.warn(`  Skipping group "${groupToken}" (missing "colors" object).`);
      continue;
    }

    const validated = {};
    console.log(`- Group "${groupToken}" → out: "${outRel}" variants:`);
    for (const [ name, defs ] of Object.entries(colors)) {
      if (!defs
        || typeof defs
        !== "object"
        || typeof defs.dark
        !== "string"
        || typeof defs.mid
        !== "string"
        || typeof defs.light
        !== "string") {
        console.warn(`    • Skipping "${name}" (needs {dark, mid, light} hex strings).`);
        continue;
      }
      validated[name] = defs;
      console.log(`    • ${name}: Dark=${defs.dark}, Mid=${defs.mid}, Light=${defs.light}`);
    }

    if (Object.keys(validated).length) {
      groups[groupToken] = {
        outRel,
        variants: validated,
      };
    } else {
      console.warn(`  (No valid variants in group "${groupToken}")`);
    }
  }

  console.log("");
  if (!Object.keys(groups).length) {
    throw new Error("Error: No valid groups/variants found in ref.json.");
  }
  return groups;
}

/**
 * Given a list of filenames, bucket them by which group token they contain.
 * Only files that include the group token are added for that group.
 * Returns a map: { [groupToken]: string[] }
 */
async function findTemplatesByGroup(groupTokens) {
  const names = await fs.readdir(TEMPLATES_DIR);
  const files = names.map((n) => path.join(TEMPLATES_DIR, n)).filter(Boolean);

  /** @type {Record<string, string[]>} */
  const byGroup = {};
  for (const token of groupTokens) {
    byGroup[token] = files.filter((f) => path.basename(f).includes(token));
  }

  console.log("Scanning templates directory for group tokens...");
  for (const token of groupTokens) {
    const list = byGroup[token];
    if (!list || list.length === 0) {
      console.warn(`  No files containing "${token}" found in ./templates.`);
    } else {
      console.log(`  Found ${list.length} template file(s) for "${token}":`);
      for (const f of list) {
        console.log("    " + path.basename(f));
      }
    }
  }
  console.log("");
  return byGroup;
}

/**
 * @param {string} hex
 * @returns {{r: number, g: number, b: number}}
 */
function hexToRgb16(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const r8 = parseInt(m[1], 16), g8 = parseInt(m[2], 16), b8 = parseInt(m[3], 16);
  const r = Math.round((r8 / 255) * Q);
  const g = Math.round((g8 / 255) * Q);
  const b = Math.round((b8 / 255) * Q);
  return {
    r,
    g,
    b,
  };
}

/** @returns {number} */
function linearInterpolation(a, b, t) {
  return Math.round(a + (b - a) * t);
}

/**
 * Create a 256x1 gradient: [0..127] black→color, [128..255] color→white
 * @param {string} colorHex
 * @returns {Promise<Magick.Image>}
 */
async function makeThreeStopGradient(colorHex) {
  const {
    r: cr,
    g: cg,
    b: cb,
  } = hexToRgb16(colorHex);
  const w = 256, h = 1;
  const buf = new Uint16Array(w * h * 4);

  for (let x = 0; x < 128; x++) {
    const t = x / 127;
    const ri = linearInterpolation(0, cr, t);
    const gi = linearInterpolation(0, cg, t);
    const bi = linearInterpolation(0, cb, t);
    const i = x * 4;
    buf[i] = ri;
    buf[i + 1] = gi;
    buf[i + 2] = bi;
    buf[i + 3] = Q;
  }
  for (let x = 128; x < 256; x++) {
    const t = (x - 128) / 127;
    const ri = linearInterpolation(cr, Q, t);
    const gi = linearInterpolation(cg, Q, t);
    const bi = linearInterpolation(cb, Q, t);
    const i = x * 4;
    buf[i] = ri;
    buf[i + 1] = gi;
    buf[i + 2] = bi;
    buf[i + 3] = Q;
  }

  const gradient = new Magick.Image();
  await gradient.readAsync(w, h, "RGBA", buf);
  return gradient;
}

/**
 * Apply color lookup table: map grayscale intensities using gradient image.
 * @param {Magick.Blob|Magick.Image} grayscaleImg
 * @param {Magick.Blob|Magick.Image} gradientImg
 * @returns {Promise<Magick.Image>}
 */
async function applyCLUT(grayscaleImg, gradientImg) {
  const out = new Magick.Image(grayscaleImg);
  await out.clutAsync(gradientImg, MagickCore.CatromInterpolatePixel);
  return out;
}

/**
 * Convert to grayscale colorspace.
 * @param {Magick.Image} img
 * @returns {Promise<Magick.Image>}
 */
async function toGray(img) {
  const g = new Magick.Image(img);
  await g.colorSpaceAsync(MagickCore.GRAYColorspace);
  return g;
}

/**
 * Level 25%,75% mask with optional alpha scaling.
 * If `alpha` is provided (Uint16 w*h), multiplies mask by alpha so transparent areas contribute 0.
 */
async function makeMidMaskFromGray(grayImg, alpha) {
  const w = (await grayImg.sizeAsync()).width();
  const h = (await grayImg.sizeAsync()).height();
  const buf = new Uint16Array(w * h * 4);
  await grayImg.writeAsync(0, 0, w, h, "RGBA", buf);
  for (let i = 0, px = 0; i < buf.length; i += 4, px++) {
    const r = buf[i];
    const v = r / Q;
    let m = 0;
    if (v <= 0.25) {
      m = 0;
    } else if (v >= 0.75) {
      m = 1;
    } else {
      m = (v - 0.25) / 0.5;
    }

    const aScale = alpha ? alpha[px] / Q : 1;
    const q = Math.max(0, Math.min(1, m * aScale)) * Q;

    buf[i] = buf[i + 1] = buf[i + 2] = q;
    buf[i + 3] = Q;
  }
  const mask = new Magick.Image();
  await mask.readAsync(w, h, "RGBA", buf);
  return mask;
}

/**
 * Blend two images with a grayscale mask.
 * @param {Magick.Image} imgA
 * @param {Magick.Image} imgB
 * @param {Magick.Image} maskGray
 * @returns {Promise<Magick.Image>}
 */
async function blendWithMask(imgA, imgB, maskGray) {
  const size = await imgA.sizeAsync();
  const w = size.width(), h = size.height();
  const a = new Uint16Array(w * h * 4);
  const b = new Uint16Array(w * h * 4);
  const m = new Uint16Array(w * h * 4);

  await Promise.all([
    imgA.writeAsync(0, 0, w, h, "RGBA", a),
    imgB.writeAsync(0, 0, w, h, "RGBA", b),
    maskGray.writeAsync(0, 0, w, h, "RGBA", m),
  ]);

  for (let i = 0; i < a.length; i += 4) {
    const mw = m[i] / Q;
    for (let c = 0; c < 3; c++) {
      const av = a[i + c] / Q;
      const bv = b[i + c] / Q;
      a[i + c] = Math.round((av * (1 - mw) + bv * mw) * Q);
    }
  }

  const out = new Magick.Image();
  await out.readAsync(w, h, "RGBA", a);
  return out;
}

/**
 * Extract the alpha channel (as a 1D Uint16 array of length w*h) from an image.
 */
async function extractAlphaBuffer(img) {
  const size = await img.sizeAsync();
  const w = size.width(), h = size.height();
  const rgba = new Uint16Array(w * h * 4);
  await img.writeAsync(0, 0, w, h, "RGBA", rgba);
  const alpha = new Uint16Array(w * h);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j++) {
    alpha[j] = rgba[i + 3];
  }
  return {
    alpha,
    w,
    h,
  };
}

/**
 * Return a copy of `img` with its alpha channel replaced by `alpha` (Uint16 w*h).
 */
async function applyAlphaBuffer(img, alpha, w, h) {
  const rgba = new Uint16Array(w * h * 4);
  await img.writeAsync(0, 0, w, h, "RGBA", rgba);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j++) {
    rgba[i + 3] = alpha[j];
  }
  const out = new Magick.Image();
  await out.readAsync(w, h, "RGBA", rgba);
  return out;
}

/**
 * Process a single template for a given group.
 * @param {string} file
 * @param {string} groupToken
 * @param {{outRel: string, variants: Record<string, {dark:string, mid:string, light:string}>}} groupSpec
 * @returns {Promise<void>}
 */
async function processOneTemplate(file, groupToken, groupSpec) {
  const filename = path.basename(file);
  const ext = path.extname(filename).slice(1);
  const base = filename.slice(0, -(ext.length ? ext.length + 1 : 0));

  const outAbs = path.join(OUT_BASE, groupSpec.outRel);
  await fs.mkdir(outAbs, { recursive: true });

  console.log(`Processing template: ${filename} (group="${groupToken}" → out="${groupSpec.outRel}")`);

  const tpl = new Magick.Image();
  await tpl.readAsync(file);
  const {
    alpha: tplAlpha,
    w,
    h,
  } = await extractAlphaBuffer(tpl);

  const tplGray = await toGray(tpl);
  const midMask = await makeMidMaskFromGray(tplGray, tplAlpha);

  for (const [
    variantName, {
      dark,
      mid,
      light
    }
  ] of Object.entries(groupSpec.variants)) {
    const nameBase = base.replace(groupToken, variantName);

    const darkOutName = `${nameBase.replace(variantName, `${variantName}_dark`)}.${ext}`;
    const midOutName = `${nameBase.replace(variantName, `${variantName}_mid`)}.${ext}`;
    const lightOutName = `${nameBase.replace(variantName, `${variantName}_light`)}.${ext}`;
    const mergedName = `${nameBase}.${ext}`;

    const darkPath = path.join(OUT_TEMP, darkOutName);
    const midPath = path.join(OUT_TEMP, midOutName);
    const lightPath = path.join(OUT_TEMP, lightOutName);
    const mergedPath = path.join(outAbs, mergedName);

    try {
      const gDark = await makeThreeStopGradient(dark);
      let imgDark = await applyCLUT(tplGray, gDark);
      imgDark = await applyAlphaBuffer(imgDark, tplAlpha, w, h);
      await imgDark.writeAsync(darkPath);

      const gMid = await makeThreeStopGradient(mid);
      let imgMid = await applyCLUT(tplGray, gMid);
      imgMid = await applyAlphaBuffer(imgMid, tplAlpha, w, h);
      await imgMid.writeAsync(midPath);

      const gLight = await makeThreeStopGradient(light);
      let imgLight = await applyCLUT(tplGray, gLight);
      imgLight = await applyAlphaBuffer(imgLight, tplAlpha, w, h);
      await imgLight.writeAsync(lightPath);

      const step1 = await blendWithMask(imgDark, imgLight, tplGray);
      let merged = await blendWithMask(step1, imgMid, midMask);
      merged = await applyAlphaBuffer(merged, tplAlpha, w, h);
      await merged.writeAsync(mergedPath);

      console.log(`  ✔️ Created merged: ${path.relative(ROOT, mergedPath)}`);
      console.log("  ✔️ Cleaned up intermediate files");
    } catch (err) {
      console.error(`  ❌️ Failed processing ${variantName}: ${err.message}`);
    }
  }
  console.log("");
}

(async function main() {
  try {
    await ensureLayout();

    const groups = await loadAllGroups();
    const groupTokens = Object.keys(groups);

    const templatesByGroup = await findTemplatesByGroup(groupTokens);

    let processedAny = false;
    for (const [ groupToken, variants ] of Object.entries(groups)) {
      const templates = templatesByGroup[groupToken] || [];
      if (templates.length === 0) {
        console.warn(`Skipping group "${groupToken}" (no matching templates).`);
        continue;
      }
      for (const t of templates) {
        processedAny = true;
        await processOneTemplate(t, groupToken, variants);
      }
    }

    if (!processedAny) {
      console.error("No templates matched any group tokens.");
    }

    console.log("Colorization complete!\n");
    console.log("Output files created in ../general directory:");
    const created = (await fs.readdir(OUT_TEMP))
      .filter((n) => !groupTokens.some((g) => n.includes(g)))
      .sort((a, b) => a.localeCompare(b));
    for (const n of created) {
      console.log(n);
    }
    await fs.rm(OUT_TEMP, { recursive: true });
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
