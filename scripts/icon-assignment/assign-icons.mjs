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

/* ---------------- Main ---------------- */
(async () => {
  const raw = await readFile(opts.assignments, "utf8");
  const data = JSON.parse(raw);

  // Accept both unified and legacy (flat abilities) formats.
  // Unified: { abilities: {...}, classes: {...}, ... }
  // Legacy : { "Fire Ball": "icons/1.webp", ... }  -> treat as abilities
  let categories = {};
  if (data && typeof data === "object") {
    const objectSections = Object.entries(data)
      .filter(([, v]) => v && typeof v === "object" && !Array.isArray(v))
      .map(([k]) => k);
    if (objectSections.length > 0) {
      // unified: keep all object sections (don’t hardcode list so it’s future-proof)
      for (const k of objectSections) {
        categories[k] = data[k];
      }
    } else {
      // legacy: assume the entire file is abilities
      console.log("Legacy format detected; treating as { abilities: ... }");
      categories.abilities = data;
    }
  } else {
    throw new Error("assignments.json is not an object.");
  }

  // Ensure base out dir
  if (!opts.dryRun) {
    await mkdir(opts.out, { recursive: true });
  }

  // Build global maps:
  // directPath: Map<cat||name, normalized image path>
  // linkMap: Map<cat||name, {category, name}>
  const directPath = new Map();
  const linkMap = new Map();
  const allItems = []; // [{category, name}]
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

  // Resolve the first ancestor that has a direct image (cross-category allowed)
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
      } // chain ended without a direct image
      // follow
      curCat = link.category || curCat;
      curName = link.name;
    }
    return curCat && curName ? keyOf(curCat, curName) : null;
  };

  // Precompute roots & ext per root
  const rootOf = new Map(); // Map<cat||name, rootKey|null>
  const rootExt = new Map(); // Map<rootKey, ".png"|".webp"|...>
  // Precompute roots that point to Foundry images
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

  // Prepare per-category output dirs and name registries
  const usedNamesByCat = new Map(); // Map<category, Set<filename>>
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

  // Allocate filenames for each root (copy destination lives in its OWN category)
  const destNameForRoot = new Map(); // Map<rootKey, filename>
  for (const rKey of new Set([...rootOf.values()].filter(Boolean))) {
    // Skip Foundry roots
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

  // COPY each root image to its category folder
  for (const [rKey, outName] of destNameForRoot.entries()) {
    const [rCat, rName] = rKey.split("||");
    const srcRel = directPath.get(rKey);
    const srcAbs = resolve(opts.imagesRoot, srcRel);

    // The check for 'Foundry' is now done before allocating,
    // so we don't need a check here anymore.
    // if (srcRel.startsWith("images/Foundry/")) continue;

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
        console.log(`[dry] COPY ${srcRel} -> ${join(rCat, outName)}`);
      } else {
        await copyFile(srcAbs, destAbs);
        console.log(`COPY ${srcRel} -> ${join(rCat, outName)}`);
      }
    }
  }

  // For every item:
  // - If direct: already copied as a root (or allocate now if somehow missing)
  // - If link: create a symlink in the ITEM's category pointing to the ROOT's copied file
  for (const { category: cat, name } of allItems) {
    const v = categories[cat][name];
    const rKey = rootOf.get(keyOf(cat, name));

    // Skip items that resolve to a Foundry icon
    if (rKey && foundryRoots.has(rKey)) {
      console.warn(`Skipping "${cat}:${name}" as it links to a Foundry icon.`);
      continue;
    }

    if (isDirect(v)) {
      // Directs should be covered above as roots. In rare cases, ensure it exists:
      if (!rKey || !destNameForRoot.get(rKey)) {
        const srcRel = normalizePath(v);
        const ext = extname(srcRel) || ".png";
        const base = toKebabCase(name);
        const used = usedNamesByCat.get(cat);
        const outName = uniqueName(base, ext, used);
        const outDir = resolve(opts.out, cat);
        console.log(srcRel, ext, base, used, outName, outDir);

        let toSkip = false;
        for (const d of SKIP_DIRS) {
          if (outDir.includes(d)) {
            toSkip = true;
          }
        }
        if (!toSkip) {
          if (opts.dryRun) {
            console.log(`[dry] COPY ${srcRel} -> ${join(cat, outName)} (late)`);
          } else {
            const srcAbs = resolve(opts.imagesRoot, srcRel);
            if (!(await fileExists(srcAbs))) {
              console.warn(`Missing file for "${cat}:${name}": ${srcRel}`);
            } else {
              await copyFile(srcAbs, resolve(outDir, outName));
              console.log(`COPY ${srcRel} -> ${join(cat, outName)} (late)`);
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

      // The linked item's filename lives in ITS OWN category, with same ext as root file
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
