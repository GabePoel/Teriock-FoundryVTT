// The reference is like the index but with names localized.
// This is the better object to use when constructing anything user facing.

import { preLocalizeConfig } from "../../helpers/localization.mjs";
import {
  abilities,
  attributes,
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
  magicalProperties,
  materialProperties,
  powerSources,
  properties,
  statAttributes,
  tradecrafts,
  traits,
  weaponClasses,
  weaponFightingStyles,
} from "../index/_module.mjs";

const reference = {
  abilities: foundry.utils.deepClone(abilities),
  attributes: foundry.utils.deepClone(attributes),
  attributesFull: foundry.utils.deepClone(attributes),
  bodyParts: foundry.utils.deepClone(bodyParts),
  classes: foundry.utils.deepClone(classes),
  conditions: foundry.utils.deepClone(conditions),
  creatures: foundry.utils.deepClone(creatures),
  damageTypes: foundry.utils.deepClone(damageTypes),
  deathBag: foundry.utils.deepClone(deathBag),
  drainTypes: foundry.utils.deepClone(drainTypes),
  effectTypes: foundry.utils.deepClone(effectTypes),
  elements: foundry.utils.deepClone(elements),
  equipment: foundry.utils.deepClone(equipment),
  equipmentClasses: foundry.utils.deepClone(equipmentClasses),
  magicalProperties: foundry.utils.deepClone(magicalProperties),
  materialProperties: foundry.utils.deepClone(materialProperties),
  powerSources: foundry.utils.deepClone(powerSources),
  properties: foundry.utils.deepClone(properties),
  statAttributes: foundry.utils.deepClone(statAttributes),
  tradecrafts: foundry.utils.deepClone(tradecrafts),
  traits: foundry.utils.deepClone(traits),
  weaponClasses: foundry.utils.deepClone(weaponClasses),
  weaponFightingStyles: foundry.utils.deepClone(weaponFightingStyles),
};
export default reference;

preLocalizeConfig("reference.abilities", { prefix: "TERIOCK.TERMS.Abilities.", transform: "cc" });
preLocalizeConfig("reference.attributes", { prefix: "TERIOCK.TERMS.Attributes.", suffix: ".abbreviation", transform: "lc" });
preLocalizeConfig("reference.attributesFull", { prefix: "TERIOCK.TERMS.Attributes.", suffix: ".label", transform: "lc" });
preLocalizeConfig("reference.bodyParts", { prefix: "TERIOCK.TERMS.BodyParts.", transform: "cc" });
preLocalizeConfig("reference.classes", { prefix: "TERIOCK.TERMS.Classes.", transform: "cc" });
preLocalizeConfig("reference.conditions", { prefix: "TERIOCK.STATUSES.Conditions.", transform: "cc" });
preLocalizeConfig("reference.creatures", { prefix: "TERIOCK.TERMS.Creatures.", transform: "cc" });
preLocalizeConfig("reference.damageTypes", { prefix: "TERIOCK.TERMS.DamageTypes.", transform: "cc" });
preLocalizeConfig("reference.deathBag", { prefix: "TERIOCK.TERMS.StoneColor.", transform: "cc" });
preLocalizeConfig("reference.drainTypes", { prefix: "TERIOCK.TERMS.DrainTypes.", transform: "cc" });
preLocalizeConfig("reference.effectTypes", { prefix: "TERIOCK.TERMS.EffectTypes.", transform: "cc" });
preLocalizeConfig("reference.elements", { prefix: "TERIOCK.TERMS.Elements.", transform: "cc" });
preLocalizeConfig("reference.equipment", { prefix: "TERIOCK.TERMS.Equipment.", transform: "cc" });
preLocalizeConfig("reference.equipmentClasses", { prefix: "TERIOCK.TERMS.EquipmentClasses.", transform: "cc" });
preLocalizeConfig("reference.powerSources", { prefix: "TERIOCK.TERMS.PowerSources.", transform: "cc" });
preLocalizeConfig("reference.properties", { prefix: "TERIOCK.TERMS.Properties.", transform: "cc" });
preLocalizeConfig("reference.statAttributes", {
  prefix: "TERIOCK.TERMS.Attributes.",
  suffix: ".abbreviation",
  transform: "lc",
});
preLocalizeConfig("reference.traits", { prefix: "TERIOCK.TERMS.Traits.", transform: "cc" });
preLocalizeConfig("reference.tradecrafts", { prefix: "TERIOCK.TERMS.Tradecrafts.", transform: "cc" });
preLocalizeConfig("reference.traits", { prefix: "TERIOCK.TERMS.Traits.", transform: "cc" });
preLocalizeConfig("reference.weaponClasses", { prefix: "TERIOCK.TERMS.EquipmentClasses.", transform: "cc" });
preLocalizeConfig("reference.weaponFightingStyles", { prefix: "TERIOCK.TERMS.WeaponFightingStyles.", transform: "cc" });
preLocalizeConfig("reference.magicalProperties", { prefix: "TERIOCK.TERMS.Properties.", transform: "cc" });
preLocalizeConfig("reference.materialProperties", { prefix: "TERIOCK.TERMS.Properties.", transform: "cc" });
