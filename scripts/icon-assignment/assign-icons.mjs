import {
  access,
  copyFile,
  lstat,
  mkdir,
  readFile,
  rm,
  symlink,
} from "fs/promises";
import { basename, dirname, extname, join, relative, resolve } from "path";
import { argv, cwd, exit, platform } from "process";
import sharp from "sharp"; // ✨ NEW
import { toKebabCase } from "../../src/module/helpers/string.mjs";

const args = argv.slice(2);
const opts = {
  assignments: "assignments.json",
  imagesRoot: cwd(),
  out: "../../src/icons",
  dryRun: false,
};
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--assignments" || a === "-a") {
    opts.assignments = args[++i];
  } else if (a === "--images-root" || a === "-i") {
    opts.imagesRoot = args[++i];
  } else if (a === "--out" || a === "-o") {
    opts.out = args[++i];
  } else if (a === "--dry-run") {
    opts.dryRun = true;
  }
}

const SKIP_DIRS = ["death-bag-stones"];

const isWindows = platform === "win32";
const fileExists = async (p) => {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
};

const normalizePath = (p) => {
  if (!p) {
    return "";
  }
  try {
    p = decodeURI(p);
  } catch {}
  // remove accidental origins
  p = p.replace(/^https?:\/\/[^/]+\/?/i, "");
  return p
    .replace(/\\/g, "/")
    .replace(/^\.\/+/, "")
    .replace(/^\/+/, "")
    .replace(/\/{2,}/g, "/");
};

const uniqueName = (base, ext, usedSet) => {
  let name = base + ext;
  let n = 2;
  while (usedSet.has(name)) {
    name = `${base}-${n}${ext}`;
    n++;
  }
  usedSet.add(name);
  return name;
};

const isDirect = (v) => typeof v === "string" && !v.startsWith("@");
const isLink = (v) => typeof v === "string" && v.startsWith("@");

const parseLink = (raw, defaultCategory) => {
  const s = (raw || "").trim().replace(/^@/, "");
  if (!s) {
    return null;
  }
  const idx = s.indexOf(":");
  if (idx > -1) {
    const cat = s.slice(0, idx).trim().toLowerCase();
    const name = s.slice(idx + 1).trim();
    return {
      category: cat || defaultCategory,
      name,
    };
  }
  return {
    category: defaultCategory,
    name: s,
  };
};

const keyOf = (cat, name) => `${cat}||${name}`;

const isRasterExt = (ext) =>
  [".png", ".webp", ".jpg", ".jpeg", ".gif", ".avif", ".tiff", ".bmp"].includes(
    ext.toLowerCase(),
  );

async function writeSquare(srcAbs, destAbs) {
  const ext = extname(srcAbs).toLowerCase();

  // Vector or unknown → copy as-is
  if (ext === ".svg" || !isRasterExt(ext)) {
    await copyFile(srcAbs, destAbs);
    return;
  }

  // Respect EXIF orientation with rotate()
  const base = sharp(srcAbs, { limitInputPixels: false }).rotate();
  const meta = await base.metadata();
  const w = meta.width || 0;
  const h = meta.height || 0;

  if (!w || !h) {
    await copyFile(srcAbs, destAbs);
    return;
  }

  // Center-crop the largest possible square without scaling
  const size = Math.min(w, h);
  const left = Math.floor((w - size) / 2);
  const top = Math.floor((h - size) / 2);

  let pipeline = base.extract({
    left,
    top,
    width: size,
    height: size,
  });

  // Preserve original format
  const fmt = ext.replace(".", "");
  if (fmt === "jpg") {
    pipeline = pipeline.jpeg();
  } else if (fmt === "png") {
    pipeline = pipeline.png();
  } else if (fmt === "webp") {
    pipeline = pipeline.webp();
  } else if (fmt === "avif") {
    pipeline = pipeline.avif();
  } else if (fmt === "tiff") {
    pipeline = pipeline.tiff();
  } else if (fmt === "gif") {
    pipeline = pipeline.gif();
  } else if (fmt === "bmp") {
    pipeline = pipeline.bmp();
  }

  await pipeline.toFile(destAbs);
}

(async () => {
  const raw = await readFile(opts.assignments, "utf8");
  const data = JSON.parse(raw);

  // Accept both unified and legacy (flat abilities) formats.
  let categories = {};
  if (data && typeof data === "object") {
    const objectSections = Object.entries(data)
      .filter(([, v]) => v && typeof v === "object" && !Array.isArray(v))
      .map(([k]) => k);
    if (objectSections.length > 0) {
      for (const k of objectSections) {
        categories[k] = data[k];
      }
    } else {
      console.log("Legacy format detected; treating as { abilities: ... }");
      categories.abilities = data;
    }
  } else {
    throw new Error("assignments.json is not an object.");
  }

  if (!opts.dryRun) {
    await mkdir(opts.out, { recursive: true });
  }

  const directPath = new Map();
  const linkMap = new Map();
  const allItems = [];
  for (const [cat, section] of Object.entries(categories)) {
    for (const [name, val] of Object.entries(section)) {
      allItems.push({
        category: cat,
        name,
      });
      if (isDirect(val)) {
        directPath.set(keyOf(cat, name), normalizePath(val));
      } else if (isLink(val)) {
        const link = parseLink(val, cat);
        if (link) {
          linkMap.set(keyOf(cat, name), link);
        }
      }
    }
  }

  const resolveRootKey = (startCat, startName) => {
    const seen = new Set();
    let curCat = startCat,
      curName = startName;
    while (curCat && curName && !directPath.has(keyOf(curCat, curName))) {
      const k = keyOf(curCat, curName);
      if (seen.has(k)) {
        throw new Error(`Circular link detected at "${startCat}:${startName}"`);
      }
      seen.add(k);
      const link = linkMap.get(k);
      if (!link) {
        return null;
      }
      curCat = link.category || curCat;
      curName = link.name;
    }
    return curCat && curName ? keyOf(curCat, curName) : null;
  };

  const rootOf = new Map();
  const rootExt = new Map();
  const foundryRoots = new Set();
  for (const { category, name } of allItems) {
    const rKey = resolveRootKey(category, name);
    rootOf.set(keyOf(category, name), rKey);
    if (rKey) {
      const p = directPath.get(rKey);
      if (p.startsWith("images/Foundry/")) {
        foundryRoots.add(rKey);
      }
      if (!rootExt.has(rKey)) {
        rootExt.set(rKey, extname(p) || "");
      }
    }
  }

  const usedNamesByCat = new Map();
  const ensureCatDir = async (cat) => {
    const dir = resolve(opts.out, cat);
    if (!opts.dryRun) {
      await mkdir(dir, { recursive: true });
    }
    if (!usedNamesByCat.has(cat)) {
      usedNamesByCat.set(cat, new Set());
    }
    return dir;
  };
  for (const cat of Object.keys(categories)) {
    await ensureCatDir(cat);
  }

  const destNameForRoot = new Map();
  for (const rKey of new Set([...rootOf.values()].filter(Boolean))) {
    if (foundryRoots.has(rKey)) {
      continue;
    }
    const [rCat, rName] = rKey.split("||");
    const ext = rootExt.get(rKey) || "";
    const base = toKebabCase(rName);
    const used = usedNamesByCat.get(rCat);
    const name = uniqueName(base, ext, used);
    destNameForRoot.set(rKey, name);
  }

  // COPY (now: square-pad) each root image
  for (const [rKey, outName] of destNameForRoot.entries()) {
    const [rCat, rName] = rKey.split("||");
    const srcRel = directPath.get(rKey);
    const srcAbs = resolve(opts.imagesRoot, srcRel);

    const outDir = resolve(opts.out, rCat);
    const destAbs = resolve(outDir, outName);

    let toSkip = false;
    for (const d of SKIP_DIRS) {
      if (outDir.includes(d)) {
        toSkip = true;
      }
    }
    if (!toSkip) {
      if (!(await fileExists(srcAbs))) {
        console.warn(`Missing file for "${rCat}:${rName}": ${srcRel}`);
        continue;
      }
      if (opts.dryRun) {
        console.log(`[dry] COPY+SQUARE ${srcRel} -> ${join(rCat, outName)}`);
      } else {
        await writeSquare(srcAbs, destAbs); // ✨ changed
        console.log(`COPY+SQUARE ${srcRel} -> ${join(rCat, outName)}`);
      }
    }
  }

  // Links
  for (const { category: cat, name } of allItems) {
    const v = categories[cat][name];
    const rKey = rootOf.get(keyOf(cat, name));

    if (rKey && foundryRoots.has(rKey)) {
      console.warn(`Skipping "${cat}:${name}" as it links to a Foundry icon.`);
      continue;
    }

    if (isDirect(v)) {
      if (!rKey || !destNameForRoot.get(rKey)) {
        const srcRel = normalizePath(v);
        const ext = extname(srcRel) || ".png";
        const base = toKebabCase(name);
        const used = usedNamesByCat.get(cat);
        const outName = uniqueName(base, ext, used);
        const outDir = resolve(opts.out, cat);

        let toSkip = false;
        for (const d of SKIP_DIRS) {
          if (outDir.includes(d)) {
            toSkip = true;
          }
        }
        if (!toSkip) {
          if (opts.dryRun) {
            console.log(
              `[dry] COPY+SQUARE ${srcRel} -> ${join(cat, outName)} (late)`,
            );
          } else {
            const srcAbs = resolve(opts.imagesRoot, srcRel);
            if (!(await fileExists(srcAbs))) {
              console.warn(`Missing file for "${cat}:${name}": ${srcRel}`);
            } else {
              await writeSquare(srcAbs, resolve(outDir, outName)); // ✨ changed
              console.log(
                `COPY+SQUARE ${srcRel} -> ${join(cat, outName)} (late)`,
              );
            }
          }
        }
      }
      continue;
    }

    if (isLink(v)) {
      if (!rKey) {
        console.warn(`"${cat}:${name}" links to nothing resolvable. Skipping.`);
        continue;
      }

      const [rootCat, rootName] = rKey.split("||");
      const rootOutName = destNameForRoot.get(rKey);
      if (!rootOutName) {
        console.warn(
          `ℹRoot output for "${cat}:${name}" (${rootCat}:${rootName}) not created. Skipping link.`,
        );
        continue;
      }

      const ext = extname(rootOutName) || "";
      const base = toKebabCase(name);
      const used = usedNamesByCat.get(cat);
      const linkName = uniqueName(base, ext, used);

      const linkDir = resolve(opts.out, cat);
      const rootPath = resolve(opts.out, rootCat, rootOutName);
      const linkPath = resolve(linkDir, linkName);
      const targetRel =
        relative(dirname(linkPath), rootPath) || basename(rootPath);

      if (opts.dryRun) {
        console.log(`[dry] SYMLINK ${join(cat, linkName)} -> ${targetRel}`);
      } else {
        await rm(linkPath, { force: true }).catch(() => {});
        try {
          const type = isWindows ? "file" : undefined;
          await symlink(targetRel, linkPath, type);
          const st = await lstat(linkPath);
          if (!st.isSymbolicLink()) {
            console.error("Created output is not a symlink.");
          }
          console.log(`SYMLINK ${join(cat, linkName)} -> ${targetRel}`);
        } catch (err) {
          const canFallback =
            isWindows &&
            ["EPERM", "EACCES", "ENOTSUP", "UNKNOWN"].includes(err.code || "");
          if (canFallback) {
            await copyFile(rootPath, linkPath);
            console.warn(
              `Symlink failed (${err.code}). Fallback COPY -> ${join(cat, linkName)}`,
            );
          } else {
            throw err;
          }
        }
      }
    }
  }

  console.log("Done.");
})().catch((e) => {
  console.error(`${e.stack || e.message || e}`);
  exit(1);
});
