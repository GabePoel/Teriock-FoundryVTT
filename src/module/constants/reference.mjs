// The reference is like the index but with names localized.
// This is the better object to use when constructing anything user facing.

import { preLocalizeConfig } from "../helpers/localization.mjs";
import { toCamelCase } from "../helpers/string.mjs";
import {
  abilities,
  bodyParts,
  classes,
  conditions,
  creatures,
  damageTypes,
  deathBag,
  drainTypes,
  effectTypes,
  elements,
  equipment,
  equipmentClasses,
  powerSources,
  properties,
  tradecrafts,
  traits,
  weaponFightingStyles,
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
  abilities: prefixKeys(abilities, "TERIOCK.TERMS.Abilities"),
  bodyParts: prefixKeys(bodyParts, "TERIOCK.TERMS.BodyParts"),
  classes: prefixKeys(classes, "TERIOCK.TERMS.Classes"),
  conditions: prefixKeys(conditions, "TERIOCK.STATUSES.Conditions"),
  creatures: prefixKeys(creatures, "TERIOCK.TERMS.Creatures"),
  damageTypes: prefixKeys(damageTypes, "TERIOCK.TERMS.DamageTypes"),
  deathBag: prefixKeys(deathBag, "TERIOCK.TERMS.StoneColor"),
  drainTypes: prefixKeys(drainTypes, "TERIOCK.TERMS.DrainTypes"),
  effectTypes: prefixKeys(effectTypes, "TERIOCK.TERMS.EffectTypes"),
  elements: prefixKeys(elements, "TERIOCK.TERMS.Elements"),
  equipment: prefixKeys(equipment, "TERIOCK.TERMS.Equipment"),
  equipmentClasses: prefixKeys(equipmentClasses, "TERIOCK.TERMS.EquipmentClasses"),
  powerSources: prefixKeys(powerSources, "TERIOCK.TERMS.PowerSources"),
  properties: prefixKeys(properties, "TERIOCK.TERMS.Properties"),
  tradecrafts: prefixKeys(tradecrafts, "TERIOCK.TERMS.Tradecrafts"),
  traits: prefixKeys(traits, "TERIOCK.TERMS.Traits"),
  weaponFightingStyles: prefixKeys(weaponFightingStyles, "TERIOCK.TERMS.WeaponFightingStyles"),
};
export default reference;

for (const key of Object.keys(reference)) { preLocalizeConfig(`reference.${key}`); }
