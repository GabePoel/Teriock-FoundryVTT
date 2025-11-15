import { default as iconManifest } from "../../icons/icon-manifest.json" with { type: "json" };
import { toKebabCase } from "./string.mjs";

/**
 * Get a path relative to the Teriock system.
 * @param path
 * @returns {string}
 */
export function systemPath(path) {
  return "systems/teriock/src/" + path;
}

/**
 * Get the Foundry file path for some icon.
 * @param {Teriock.UI.IconCategory} category
 * @param {string} name
 * @returns {string}
 */
export function getImage(category, name) {
  return (
    iconManifest[toKebabCase(category)][name] ||
    systemPath("icons/documents/uncertainty.svg")
  );
}

/**
 * Get the icon for a given rank.
 * @param {Teriock.Parameters.Rank.RankClass} className
 * @param {number} rankNumber
 * @returns {string}
 */
export function getRankIcon(className, rankNumber) {
  if (rankNumber <= 10) {
    return systemPath(
      `icons/ranks/rank-${rankNumber}-${toKebabCase(className)}.webp`,
    );
  } else {
    return systemPath(`icons/classes/${className}.webp`);
  }
}
