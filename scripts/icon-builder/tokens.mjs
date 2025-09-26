import ImageMagick from "magickwand.js";
import fs from "node:fs/promises";
import path from "node:path";

const { Magick, MagickCore } = await ImageMagick;

//eslint-disable-next-line no-undef
const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src/icons/creatures");
const DEST_DIR = path.join(ROOT, "src/icons/tokens");

const Q = 65535;

/** Ensure destination folder exists */
async function ensureOutDir() {
  await fs.mkdir(DEST_DIR, { recursive: true });
}

/** Shallow read of a dir, returning absolute paths */
async function readDirAbs(dir) {
  const names = await fs.readdir(dir);
  return names.map((n) => path.join(dir, n));
}

/** Create parent directory for a path */
async function ensureParent(p) {
  await fs.mkdir(path.dirname(p), { recursive: true });
}

/** Copy a symlink without resolving it (mirror the same target) */
async function copySymlink(src, dest) {
  const target = await fs.readlink(src);
  await ensureParent(dest);
  // Try to create the same kind of link pointing to the same target
  await fs.symlink(target, dest).catch(async (e) => {
    // If a link already exists, replace it
    if (e && e.code === "EEXIST") {
      await fs.rm(dest, { force: true });
      await fs.symlink(target, dest);
    } else {
      throw e;
    }
  });
}

/** Read image file into Magick.Image */
async function readImage(file) {
  const img = new Magick.Image();
  await img.readAsync(file);
  return img;
}

/** Create a transparent canvas (RGBA) of given size */
async function makeTransparentCanvas(w, h) {
  const rgba = new Uint16Array(w * h * 4);
  const canvas = new Magick.Image();
  await canvas.readAsync(w, h, "RGBA", rgba);
  return canvas;
}

/** Composite B onto A at (x,y) using Over operator */
async function compositeOver(A, B, x, y) {
  const out = new Magick.Image(A);
  await out.compositeAsync(B, x, y, MagickCore.OverCompositeOp);
  return out;
}

/** Resize with a good filter */
async function resize(img, newW, newH) {
  const out = new Magick.Image(img);
  const geom = new Magick.Geometry(newW, newH);
  if (typeof out.resizeAsync === "function") {
    await out.resizeAsync(geom);
  } else if (typeof out.scaleAsync === "function") {
    await out.scaleAsync(geom);
  } else {
    throw new Error("ImageMagick binding missing resize/scale.");
  }
  return out;
}

/** Extract alpha as Uint16[w*h] */
async function extractAlphaBuffer(img) {
  const size = await img.sizeAsync();
  const w = size.width(),
    h = size.height();
  const rgba = new Uint16Array(w * h * 4);
  await img.writeAsync(0, 0, w, h, "RGBA", rgba);
  const a = new Uint16Array(w * h);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j++) {
    a[j] = rgba[i + 3];
  }
  return {
    alpha: a,
    w,
    h,
  };
}

/** Replace alpha with provided buffer */
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

/** Build a circular alpha mask (opaque inside circle, transparent outside) */
async function buildCircleMask(w, h) {
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  const r = Math.min(w, h) / 2;
  const r2 = r * r;

  const rgba = new Uint16Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    const dy = y - cy;
    for (let x = 0; x < w; x++) {
      const dx = x - cx;
      const inside = dx * dx + dy * dy <= r2;
      const idx = (y * w + x) * 4;
      // grayscale mask in RGB, full alpha (we only need one channel later)
      const v = inside ? Q : 0;
      rgba[idx] = v;
      rgba[idx + 1] = v;
      rgba[idx + 2] = v;
      rgba[idx + 3] = Q;
    }
  }

  const mask = new Magick.Image();
  await mask.readAsync(w, h, "RGBA", rgba);
  return mask;
}

/** Multiply two alpha buffers (Uint16) into a new one */
function multiplyAlpha(a, b) {
  const out = new Uint16Array(a.length);
  for (let i = 0; i < a.length; i++) {
    // (a*b)/Q with rounding
    out[i] = Math.round((a[i] * b[i]) / Q);
  }
  return out;
}

/** Convert a grayscale mask image to an Uint16 alpha buffer */
async function maskToAlpha(mask) {
  const { w, h, alpha } = await (async () => {
    const size = await mask.sizeAsync();
    const w = size.width(),
      h = size.height();
    const rgba = new Uint16Array(w * h * 4);
    await mask.writeAsync(0, 0, w, h, "RGBA", rgba);
    const alpha = new Uint16Array(w * h);
    // use R channel as the mask value
    for (let i = 0, j = 0; i < rgba.length; i += 4, j++) {
      alpha[j] = rgba[i];
    }
    return {
      w,
      h,
      alpha,
    };
  })();
  return {
    w,
    h,
    alpha,
  };
}

/** Process one regular file: apply circular crop first, then center 2/3-size image on transparent canvas */
async function processOneImage(srcPath, destPath) {
  const img = await readImage(srcPath);
  const size = await img.sizeAsync();
  const w = size.width(),
    h = size.height();

  if (w !== h) {
    console.warn(
      `Skipping non-square image: ${path.basename(srcPath)} (${w}x${h})`,
    );
    return;
  }

  // Build & apply the circular mask at full resolution ---
  const circleMask = await buildCircleMask(w, h);
  const { alpha: imgA } = await extractAlphaBuffer(img);
  const { alpha: maskA } = await maskToAlpha(circleMask);
  const maskedA = multiplyAlpha(imgA, maskA);
  const maskedFull = await applyAlphaBuffer(img, maskedA, w, h);

  // Scale the masked image to 2/3 size ---
  const s = Math.max(1, Math.round((2 * w) / 3));
  const scaled = await resize(maskedFull, s, s);

  // Composite centered on a transparent WxH canvas ---
  const canvas = await makeTransparentCanvas(w, h);
  const x = Math.round((w - s) / 2);
  const y = Math.round((h - s) / 2);
  const final = await compositeOver(canvas, scaled, x, y);

  await ensureParent(destPath);
  await final.writeAsync(destPath);
  console.log(`  ✔️ ${path.relative(ROOT, destPath)}`);
}

/** Main: replicate directory and process files */
async function main() {
  await ensureOutDir();

  const entries = await readDirAbs(SRC_DIR);
  if (!entries.length) {
    console.error(`No files found in ${path.relative(ROOT, SRC_DIR)}`);
  }

  for (const src of entries) {
    const rel = path.relative(SRC_DIR, src);
    const dest = path.join(DEST_DIR, rel);

    const st = await fs.lstat(src);
    if (st.isSymbolicLink()) {
      await copySymlink(src, dest);
      console.log(`  ↪ symlink: ${path.relative(ROOT, dest)}`);
      continue;
    }

    if (st.isFile()) {
      await processOneImage(src, dest);
    }
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e?.stack || e?.message || e);
});
