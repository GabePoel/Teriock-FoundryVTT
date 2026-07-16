import { default as iconManifest } from "../../icons/icon-manifest.json" with { type: "json" };
import indexConfig from "../constants/config/index-config.mjs";
import { toCamelCase } from "./string.mjs";

/**
 * Get a path relative to the Teriock system root.
 * @param path
 * @returns {string}
 */
export function systemPath(path) {
  return `systems/teriock/src/${path}`;
}

/**
 * Get the Foundry file path for some icon.
 * @param {Teriock.UI.IconCategory} category
 * @param {string} name
 * @param {string} [fallback]
 * @returns {string}
 */
export function getImage(category, name, fallback) {
  const out = fallback || systemPath("icons/documents/uncertainty.svg");
  let l1 = toCamelCase(category);
  if (!iconManifest[l1]) { l1 = indexConfig[category]; }
  if (!iconManifest[l1]) { return out; }
  return iconManifest[l1][toCamelCase(name)] || out;
}
