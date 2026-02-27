// The reference is like the index but with names localized.
// This is the better object to use when constructing anything user facing.

import { preLocalize } from "../../helpers/localization.mjs";
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

preLocalize("reference.abilities", {
  prefix: "TERIOCK.TERMS.Abilities.",
  transform: "cc",
});
preLocalize("reference.attributes", {
  prefix: "TERIOCK.TERMS.Attributes.",
  suffix: ".label",
  transform: "lc",
});
preLocalize("reference.attributesFull", {
  prefix: "TERIOCK.TERMS.Attributes.",
  suffix: ".name",
  transform: "lc",
});
preLocalize("reference.bodyParts", {
  prefix: "TERIOCK.TERMS.BodyParts.",
  transform: "cc",
});
preLocalize("reference.classes", {
  prefix: "TERIOCK.TERMS.Classes.",
  transform: "cc",
});
preLocalize("reference.conditions", {
  prefix: "TERIOCK.STATUSES.Conditions.",
  transform: "cc",
});
preLocalize("reference.creatures", {
  prefix: "TERIOCK.TERMS.Creatures.",
  transform: "cc",
});
preLocalize("reference.damageTypes", {
  prefix: "TERIOCK.TERMS.DamageTypes.",
  transform: "cc",
});
preLocalize("reference.deathBag", {
  prefix: "TERIOCK.TERMS.StoneColor.",
  transform: "cc",
});
preLocalize("reference.drainTypes", {
  prefix: "TERIOCK.TERMS.DrainTypes.",
  transform: "cc",
});
preLocalize("reference.effectTypes", {
  prefix: "TERIOCK.TERMS.EffectTypes.",
  transform: "cc",
});
preLocalize("reference.elements", {
  prefix: "TERIOCK.TERMS.Elements.",
  transform: "cc",
});
preLocalize("reference.equipment", {
  prefix: "TERIOCK.TERMS.Equipment.",
  transform: "cc",
});
preLocalize("reference.equipmentClasses", {
  prefix: "TERIOCK.TERMS.EquipmentClasses.",
  transform: "cc",
});
preLocalize("reference.powerSources", {
  prefix: "TERIOCK.TERMS.PowerSources.",
  transform: "cc",
});
preLocalize("reference.properties", {
  prefix: "TERIOCK.TERMS.Properties.",
  transform: "cc",
});
preLocalize("reference.statAttributes", {
  prefix: "TERIOCK.TERMS.Attributes.",
  suffix: ".label",
  transform: "lc",
});
preLocalize("reference.traits", {
  prefix: "TERIOCK.TERMS.Traits.",
  transform: "cc",
});
preLocalize("reference.tradecrafts", {
  prefix: "TERIOCK.TERMS.Tradecrafts.",
  transform: "cc",
});
preLocalize("reference.traits", {
  prefix: "TERIOCK.TERMS.Traits.",
  transform: "cc",
});
preLocalize("reference.weaponClasses", {
  prefix: "TERIOCK.TERMS.EquipmentClasses.",
  transform: "cc",
});
preLocalize("reference.weaponFightingStyles", {
  prefix: "TERIOCK.TERMS.WeaponFightingStyles.",
  transform: "cc",
});
preLocalize("reference.magicalProperties", {
  prefix: "TERIOCK.TERMS.Properties.",
  transform: "cc",
});
preLocalize("reference.materialProperties", {
  prefix: "TERIOCK.TERMS.Properties.",
  transform: "cc",
});
