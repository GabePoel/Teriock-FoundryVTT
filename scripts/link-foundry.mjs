import { exec } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

let command = "";
let SRC = "";
const DST = path.resolve(".", "foundry");
const PLATFORM = os.platform();
const PATHS = ["client", "common", "templates", "public"];

if (PLATFORM === "linux") {command = "zenity --file-selection --directory";}
console.log("Please select a folder where Foundry is installed.");

exec(command, (err, stdout) => {
  if (err) {console.error(err);}
  if (stdout) {SRC = stdout.trim();}
  if (fs.existsSync(DST)) {
    fs.rmSync(DST, { force: true, recursive: true });
  }
  if (SRC) {
    const resourcesDir = path.join(SRC, "resources");
    if (fs.existsSync(resourcesDir)) {SRC = resourcesDir;}
    const appDir = path.join(SRC, "app");
    if (fs.existsSync(appDir)) {SRC = appDir;}
    fs.mkdirSync(DST);
    console.log("\n--- Linking Foundry Directories ---\n");
    for (const p of PATHS) {
      const src = path.join(SRC, p);
      const dst = path.join(DST, p);
      console.log(` - ${src} => ${dst}`);
      if (fs.existsSync(src)) {fs.symlinkSync(src, dst);}
    }
  } else {
    console.error("No valid Foundry folder selected");
  }
});
