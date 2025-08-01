/**
 * Script is based on:
 * https://foundryvtt.wiki/en/development/guides/improving-intellisense
 */

import * as fs from "fs";
import yaml from "js-yaml";
import path from "path";

console.log("Reforging Symlinks");

// Check if foundry-config.yaml exists, if not copy from example
if (!fs.existsSync("foundry-config.yaml")) {
  if (fs.existsSync("example-foundry-config.yaml")) {
    try {
      await fs.promises.copyFile(
        "example-foundry-config.yaml",
        "foundry-config.yaml",
      );
      console.log("Copied example-foundry-config.yaml to foundry-config.yaml");
    } catch (err) {
      console.error(`Error copying config file: ${err}`);
      console.log(
        "Please manually copy example-foundry-config.yaml to foundry-config.yaml",
      );
      process.exit(1);
    }
  } else {
    console.log(
      "Neither foundry-config.yaml nor example-foundry-config.yaml exist.",
    );
    console.log(
      "Please create a foundry-config.yaml file with your Foundry installation path.",
    );
    process.exit(1);
  }
}

if (fs.existsSync("foundry-config.yaml")) {
  let fileRoot = "";
  try {
    const fc = await fs.promises.readFile("foundry-config.yaml", "utf-8");

    const foundryConfig = yaml.load(fc);

    let installPath = foundryConfig.installPath;
    if (installPath.startsWith("~")) {
      installPath = path.join(process.env.HOME, installPath.slice(1));
    } else if (installPath.startsWith("$HOME")) {
      installPath = path.join(process.env.HOME, installPath.slice(5));
    }

    // As of 13.338, the Node install is *not* nested but electron installs *are*
    const nested = fs.existsSync(path.join(installPath, "resources", "app"));

    if (nested) fileRoot = path.join(installPath, "resources", "app");
    else fileRoot = installPath;
  } catch (err) {
    console.error(`Error reading foundry-config.yaml: ${err}`);
  }

  try {
    await fs.promises.mkdir("foundry");
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
  }

  // Javascript files
  for (const p of ["client", "common", "tsconfig.json"]) {
    try {
      await fs.promises.symlink(
        path.join(fileRoot, p),
        path.join("foundry", p),
      );
    } catch (e) {
      if (e.code !== "EEXIST") throw e;
    }
  }

  // Language files
  try {
    await fs.promises.symlink(
      path.join(fileRoot, "public", "lang"),
      path.join("foundry", "lang"),
    );
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
  }
} else {
  console.log("Foundry config file did not exist.");
}
