// The reference is like the index but with names localized.
// This is the better object to use when constructing anything user facing.

import { preLocalizeConfig } from "../helpers/localization.mjs";
import { toCamelCase } from "../helpers/string.mjs";
import {
  classes,
  conditions,
  damageTypes,
  deathBag,
  effectTypes,
  elements,
  equipment,
  equipmentClasses,
  fightingStyles,
  powerSources,
  properties,
  tradecrafts,
  traits,
} from "./index.mjs";

/**
 * Build reference localization keys directly from the index because I'm lazy.
 * @template {Record<string, string>} T
 * @param {T} obj
 * @param {string} prefix
 * @param {(key: string) => string} [transform]
 * @returns {Record<keyof T, string>}
 */
function prefixKeys(obj, prefix, transform = toCamelCase) {
  return Object.fromEntries(Object.keys(obj).map(k => [k, `${prefix}.${transform(k)}`]));
}

const reference = {
  classes: prefixKeys(classes, "TERIOCK.TERMS.Classes"),
  conditions: prefixKeys(conditions, "TERIOCK.STATUSES.Conditions"),
  damageTypes: prefixKeys(damageTypes, "TERIOCK.TERMS.DamageTypes"),
  deathBag: prefixKeys(deathBag, "TERIOCK.TERMS.StoneColor"),
  effectTypes: prefixKeys(effectTypes, "TERIOCK.TERMS.EffectTypes"),
  elements: prefixKeys(elements, "TERIOCK.TERMS.Elements"),
  equipment: prefixKeys(equipment, "TERIOCK.TERMS.Equipment"),
  equipmentClasses: prefixKeys(equipmentClasses, "TERIOCK.TERMS.EquipmentClasses"),
  fightingStyles: prefixKeys(fightingStyles, "TERIOCK.TERMS.WeaponFightingStyles"),
  powerSources: prefixKeys(powerSources, "TERIOCK.TERMS.PowerSources"),
  properties: prefixKeys(properties, "TERIOCK.TERMS.Properties"),
  tradecrafts: prefixKeys(tradecrafts, "TERIOCK.TERMS.Tradecrafts"),
  traits: prefixKeys(traits, "TERIOCK.TERMS.Traits"),
};
export default reference;

for (const key of Object.keys(reference)) { preLocalizeConfig(`reference.${key}`); }
