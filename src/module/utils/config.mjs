import { default as thumbnails } from "../../assets/thumbnails/manifest.json" with { type: "json" };
import { default as index } from "../../json/wiki-index.json" with { type: "json" };
import { toCamelCase } from "./string.mjs";

/**
 * Build a simple config from the wiki index.
 * @template {keyof typeof index} K
 * @param {K} indexKey
 * @param {string} localizationPrefix
 * @returns {Record<keyof typeof index[K], Teriock.Config.SimpleEntry>}
 */
export function wikiIndexToConfig(indexKey, localizationPrefix) {
  return /** @type {Record<keyof typeof index[K], Teriock.Config.SimpleEntry>} */ (Object.fromEntries(
    Object.keys(index[indexKey]).map(k => {
      const entry = { label: `${localizationPrefix}.${toCamelCase(k)}` };
      const img = thumbnails[indexKey]?.[toCamelCase(k)];
      if (img) { entry.img = img; }
      return [k, entry];
    }),
  ));
}

/**
 * Get the trigger config group that a trigger belongs to.
 * @param {Teriock.System.Trigger} trigger
 * @returns {Teriock.Fields.DynamicChoiceGroup|undefined}
 */
export function getTriggerGroup(trigger) {
  return Object.values(TERIOCK.config.trigger).find(g => g.choices?.[trigger]);
}
