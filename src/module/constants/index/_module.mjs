//noinspection JSUnusedGlobalSymbols

import { default as allConditions } from "../../../index/names/conditions.json" with { type: "json" };
import { default as allProperties } from "../../../index/names/properties.json" with { type: "json" };

delete allConditions.alive;
delete allConditions.up;

delete allProperties.shattered;
delete allProperties.glued;
delete allProperties.destroyed;

export { default as abilities } from "../../../index/names/abilities.json" with { type: "json" };
export { default as attributes } from "../../../index/names/attributes.json" with { type: "json" };
export { default as attributesFull } from "../../../index/names/attributes-full.json" with { type: "json" };
export { default as bodyParts } from "../../../index/names/body-parts.json" with { type: "json" };
export { default as classes } from "../../../index/names/classes.json" with { type: "json" };
export { default as commonAnimals } from "../../../index/names/common-animals.json" with { type: "json" };
export { allConditions as conditions };
export { default as coreRules } from "../../../index/names/core-rules.json" with { type: "json" };
export { default as creatures } from "../../../index/names/creatures.json" with { type: "json" };
export { default as currency } from "../../../index/names/currency.json" with { type: "json" };
export { default as damageTypes } from "../../../index/names/damage-types.json" with { type: "json" };
export { default as deathBag } from "../../../index/names/death-bag.json" with { type: "json" };
export { default as drainTypes } from "../../../index/names/drain-types.json" with { type: "json" };
export { default as effectTypes } from "../../../index/names/effect-types.json" with { type: "json" };
export { default as elements } from "../../../index/names/elements.json" with { type: "json" };
export { default as equipmentClasses } from "../../../index/names/equipment-classes.json" with { type: "json" };
export { default as equipment } from "../../../index/names/equipment.json" with { type: "json" };
export { default as hacks } from "../../../index/names/hacks.json" with { type: "json" };
export { default as humanoids } from "../../../index/names/humanoids.json" with { type: "json" };
export { default as keywords } from "../../../index/names/keywords.json" with { type: "json" };
export { default as magicalProperties } from "../../../index/names/magical-properties.json" with { type: "json" };
export { default as materialProperties } from "../../../index/names/material-properties.json" with { type: "json" };
export { default as powerSources } from "../../../index/names/power-sources.json" with { type: "json" };
export { allProperties as properties };
export { default as statAttributes } from "../../../index/names/stat-attributes.json" with { type: "json" };
export { default as tradecrafts } from "../../../index/names/tradecrafts.json" with { type: "json" };
export { default as traits } from "../../../index/names/traits.json" with { type: "json" };
export { default as undead } from "../../../index/names/undead.json" with { type: "json" };
export { default as weaponClasses } from "../../../index/names/weapon-classes.json" with { type: "json" };
export { default as weaponFightingStyles } from "../../../index/names/weapon-fighting-styles.json" with { type: "json" };
