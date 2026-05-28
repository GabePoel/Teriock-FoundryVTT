import { default as iconManifest } from "../../icons/icon-manifest.json" with { type: "json" };
import { indexConfig } from "../constants/config/index-config.mjs";
import { toCamelCase, toKebabCase } from "./string.mjs";

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
  if (!iconManifest[l1]) l1 = indexConfig[category];
  if (!iconManifest[l1]) return out;
  return iconManifest[l1][toCamelCase(name)] || out;
}

/**
 * Get the icon for a given rank.
 * @param {Teriock.Keys.Class} className
 * @param {number} rankNumber
 * @returns {string}
 */
export function getRankImage(className, rankNumber) {
  if (rankNumber <= 10) return systemPath(`icons/ranks/rank-${rankNumber}-${toKebabCase(className)}.webp`);
  else return systemPath(`icons/classes/${className}.webp`);
}
