// The index is like the reference but with names always in English.
// We maintain a copy of this to access rules journals and the like.

import { default as allConditions } from "../../json/index/conditions.json" with { type: "json" };

const conditionsCopy = { ...allConditions };
delete conditionsCopy.alive;
delete conditionsCopy.up;
delete conditionsCopy.conscious;

export { default as abilities } from "../../json/index/abilities.json" with { type: "json" };
export { default as attributesFull } from "../../json/index/attributes-full.json" with { type: "json" };
export { default as bodyParts } from "../../json/index/body-parts.json" with { type: "json" };
export { default as classes } from "../../json/index/classes.json" with { type: "json" };
export { default as commonAnimals } from "../../json/index/common-animals.json" with { type: "json" };
export { conditionsCopy as conditions };
export { default as coreRules } from "../../json/index/core-rules.json" with { type: "json" };
export { default as creatures } from "../../json/index/creatures.json" with { type: "json" };
export { default as currency } from "../../json/index/currency.json" with { type: "json" };
export { default as damageTypes } from "../../json/index/damage-types.json" with { type: "json" };
export { default as deathBag } from "../../json/index/death-bag.json" with { type: "json" };
export { default as drainTypes } from "../../json/index/drain-types.json" with { type: "json" };
export { default as effectTypes } from "../../json/index/effect-types.json" with { type: "json" };
export { default as elements } from "../../json/index/elements.json" with { type: "json" };
export { default as equipmentClasses } from "../../json/index/equipment-classes.json" with { type: "json" };
export { default as equipment } from "../../json/index/equipment.json" with { type: "json" };
export { default as humanoids } from "../../json/index/humanoids.json" with { type: "json" };
export { default as keywords } from "../../json/index/keywords.json" with { type: "json" };
export { default as powerSources } from "../../json/index/power-sources.json" with { type: "json" };
export { default as properties } from "../../json/index/properties.json" with { type: "json" };
export { default as tradecrafts } from "../../json/index/tradecrafts.json" with { type: "json" };
export { default as traits } from "../../json/index/traits.json" with { type: "json" };
export { default as undead } from "../../json/index/undead.json" with { type: "json" };
export { default as weaponFightingStyles } from "../../json/index/weapon-fighting-styles.json" with { type: "json" };
