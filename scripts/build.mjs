import archiver from "archiver";
import fs from "fs";
import path from "path";

const manifestPath = "./system.json";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
const VERSION = manifest.version;

const downloadUrl = `https://github.com/gabepoel/Teriock-FoundryVTT/releases/download/release-${VERSION}/teriock-release-${VERSION}.zip`;
manifest.download = downloadUrl;

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Updated original system.json download URL to version ${VERSION}`);

const ROOT = ".";
const DIST_DIR = path.join(ROOT, "dist");
const SYSTEM_DIR = path.join(DIST_DIR, "teriock");
const ZIP_PATH = path.join(DIST_DIR, `teriock-release-${VERSION}.zip`);
const ASSETS = ["css", "src", "packs", "lang", "system.json", "README.md"];

console.log(`--- Starting Build v${VERSION} ---`);

if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(SYSTEM_DIR, { recursive: true });

for (const asset of ASSETS) {
  const srcPath = path.join(ROOT, asset);
  const destPath = path.join(SYSTEM_DIR, asset);
  if (fs.existsSync(srcPath)) {
    await fs.promises.cp(srcPath, destPath, {
      dereference: true,
      recursive: true,
      force: true,
    });
    console.log(`Copied ${asset}`);
  }
}

async function createZip() {
  const output = fs.createWriteStream(ZIP_PATH);
  const archive = archiver("zip", { zlib: { level: 9 } });
  return new Promise((resolve, reject) => {
    output.on("close", () => {
      console.log(
        `Created ${path.basename(ZIP_PATH)} (${archive.pointer()} bytes)`,
      );
      resolve();
    });
    archive.on("error", (err) => reject(err));
    archive.pipe(output);
    archive.directory(SYSTEM_DIR, false);
    archive.finalize();
  });
}

await createZip();

console.log("--- Build Complete ---");
