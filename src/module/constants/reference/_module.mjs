// The reference is like the index but with names localized.
// This is the better object to use when constructing anything user facing.

import { preLocalize } from "../../helpers/localization.mjs";
import {
  abilities,
  attributes,
  classes,
  conditions,
  deathBag,
  effectTypes,
  elements,
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
  classes: foundry.utils.deepClone(classes),
  conditions: foundry.utils.deepClone(conditions),
  deathBag: foundry.utils.deepClone(deathBag),
  effectTypes: foundry.utils.deepClone(effectTypes),
  elements: foundry.utils.deepClone(elements),
  equipmentClasses: foundry.utils.deepClone(equipmentClasses),
  powerSources: foundry.utils.deepClone(powerSources),
  properties: foundry.utils.deepClone(properties),
  statAttributes: foundry.utils.deepClone(statAttributes),
  tradecrafts: foundry.utils.deepClone(tradecrafts),
  traits: foundry.utils.deepClone(traits),
  weaponClasses: foundry.utils.deepClone(weaponClasses),
  weaponFightingStyles: foundry.utils.deepClone(weaponFightingStyles),
  magicalProperties: foundry.utils.deepClone(magicalProperties),
  materialProperties: foundry.utils.deepClone(materialProperties),
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
preLocalize("reference.classes", {
  prefix: "TERIOCK.TERMS.Classes.",
  transform: "cc",
});
preLocalize("reference.attributes.conditions", {
  prefix: "TERIOCK.TERMS.Conditions.",
  transform: "cc",
});
preLocalize("reference.deathBag", {
  prefix: "TERIOCK.TERMS.StoneColor.",
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
