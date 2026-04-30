import { preLocalize } from "../../helpers/localization.mjs";

const booleanTypes = ["upgrade", "downgrade", "override"];
const simpleTypes = ["add", "subtract", ...booleanTypes];
const numericalTypes = [...simpleTypes, "multiply"];
const formulaTypes = [...numericalTypes, "boost"];
const harmTypes = [...formulaTypes, "addTypes", "setTypes", "removeTypes"];

/** @type {Record<string, Teriock.Changes.Type[]>} */
const typeSubsets = {
  boolean: booleanTypes,
  formula: formulaTypes,
  harm: harmTypes,
  numerical: numericalTypes,
  simple: simpleTypes,
};

/** @enum {Teriock.Config.ChildChangeCategoryEntry} */
const categories = {
  armament: {
    label: "TERIOCK.CHANGES.Target.armament",
    types: ["body", "equipment"],
  },
  ability: {
    label: "TERIOCK.CHANGES.Target.ability",
    types: ["ability"],
  },
};

/** @type {Record<string, Teriock.Config.ChildChangePathEntry>} */
const paths = {
  "system.attackPenalty": {
    categories: ["ability", "armament"],
    forExecution: true,
    label: "TERIOCK.SYSTEMS.Attack.FIELDS.attackPenalty.label",
    types: typeSubsets.formula,
  },
  "system.av.raw": {
    categories: ["armament"],
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.av.raw.label",
    types: typeSubsets.simple,
  },
  "system.bv.raw": {
    categories: ["armament"],
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.bv.raw.label",
    types: typeSubsets.simple,
  },
  "system.costs.tweaks.adept": {
    categories: ["ability"],
    label: "TERIOCK.COSTS.Tweaks.adept",
    types: typeSubsets.numerical,
  },
  "system.costs.tweaks.inept": {
    categories: ["ability"],
    label: "TERIOCK.COSTS.Tweaks.inept",
    types: typeSubsets.numerical,
  },
  "system.damage": {
    categories: ["armament"],
    forExecution: true,
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.label",
    types: typeSubsets.harm,
  },
  "system.damage.base": {
    categories: ["armament"],
    forExecution: true,
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.base.label",
    types: typeSubsets.harm,
  },
  "system.damage.twoHanded": {
    categories: ["armament"],
    forExecution: true,
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.twoHanded.label",
    types: typeSubsets.harm,
  },
  "system.hitBonus": {
    categories: ["ability", "armament"],
    forExecution: true,
    label: "TERIOCK.SYSTEMS.Attack.FIELDS.hitBonus.label",
    types: typeSubsets.formula,
  },
  "system.piercing.raw": {
    categories: ["ability", "armament"],
    forExecution: true,
    label: "TERIOCK.MODELS.Piercing.FIELDS.raw.label",
    types: typeSubsets.simple,
  },
  "system.warded": {
    categories: ["ability", "armament"],
    forExecution: true,
    label: "TERIOCK.SYSTEMS.Attack.FIELDS.warded.label",
    types: typeSubsets.boolean,
  },
  "system.spellTurning": {
    categories: ["armament"],
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.spellTurning.label",
    types: typeSubsets.boolean,
  },
  "system.vitals": {
    categories: ["armament"],
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.vitals.label",
    types: typeSubsets.boolean,
  },
  "system.range": {
    categories: ["armament"],
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.range.label",
    types: typeSubsets.formula,
  },
};

export default { categories, paths, typeSubsets };

preLocalize("config.childChanges.categories", { key: "label", sort: true });
preLocalize("config.childChanges.paths", { key: "label", sort: true });
