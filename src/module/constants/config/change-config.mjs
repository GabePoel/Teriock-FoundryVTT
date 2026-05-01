import { preLocalize } from "../../helpers/localization.mjs";
import { impactConfig } from "./impact-config.mjs";

const booleanTypes = ["upgrade", "downgrade", "override"];
const simpleTypes = ["add", "subtract", ...booleanTypes];
const numericalTypes = [...simpleTypes, "multiply"];
const formulaTypes = [...numericalTypes, "boost"];
const harmTypes = [...formulaTypes, "typeAdd", "typeRemove", "typeSet"];

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

const groups = {
  boosts: "TERIOCK.TERMS.ChangeGroups.boosts",
  costs: "TERIOCK.TERMS.ChangeGroups.costs",
  damage: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.label",
  defense: "TERIOCK.TERMS.ChangeGroups.defense",
  offense: "TERIOCK.TERMS.ChangeGroups.offense",
};

/** @type {Record<string, Teriock.Config.ChildChangePathEntry>} */
const paths = {
  "system.attackPenalty": {
    categories: ["ability", "armament"],
    forExecution: true,
    group: "offense",
    label: "TERIOCK.SYSTEMS.Attack.FIELDS.attackPenalty.label",
    types: typeSubsets.formula,
  },
  "system.av.bonus": {
    categories: ["armament"],
    group: "defense",
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.av.raw.label",
    types: typeSubsets.simple,
  },
  "system.bv.bonus": {
    categories: ["armament"],
    group: "defense",
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.bv.raw.label",
    types: typeSubsets.simple,
  },
  "system.costs.tweaks.adept": {
    categories: ["ability"],
    group: "costs",
    label: "TERIOCK.COSTS.Tweaks.adept",
    types: typeSubsets.numerical,
  },
  "system.costs.tweaks.inept": {
    categories: ["ability"],
    group: "costs",
    label: "TERIOCK.COSTS.Tweaks.inept",
    types: typeSubsets.numerical,
  },
  "system.damage": {
    categories: ["armament"],
    group: "damage",
    forExecution: true,
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.alt",
    types: typeSubsets.harm,
  },
  "system.damage.base": {
    categories: ["armament"],
    group: "damage",
    forExecution: true,
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.base.label",
    types: typeSubsets.harm,
  },
  "system.damage.twoHanded": {
    categories: ["armament"],
    group: "damage",
    forExecution: true,
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.twoHanded.label",
    types: typeSubsets.harm,
  },
  "system.hitBonus": {
    categories: ["ability", "armament"],
    group: "offense",
    forExecution: true,
    label: "TERIOCK.SYSTEMS.Attack.FIELDS.hitBonus.label",
    types: typeSubsets.formula,
  },
  "system.piercing.raw": {
    categories: ["ability", "armament"],
    group: "offense",
    forExecution: true,
    label: "TERIOCK.MODELS.Piercing.FIELDS.raw.label",
    types: typeSubsets.simple,
  },
  "system.warded": {
    categories: ["ability", "armament"],
    forExecution: true,
    group: "offense",
    label: "TERIOCK.SYSTEMS.Attack.FIELDS.warded.label",
    types: typeSubsets.boolean,
  },
  "system.spellTurning": {
    categories: ["armament"],
    group: "defense",
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.spellTurning.label",
    types: typeSubsets.boolean,
  },
  "system.vitals": {
    categories: ["armament"],
    group: "offense",
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.vitals.label",
    types: typeSubsets.boolean,
  },
  ...Object.fromEntries(
    Object.entries(impactConfig)
      .filter(([_k, v]) => !v.hidden)
      .map(([k, v]) => {
        return [
          `system.boosts.${k}`,
          {
            categories: ["ability", "armament"],
            forExecution: true,
            group: "boosts",
            label: v.label,
            types: typeSubsets.formula,
          },
        ];
      }),
  ),
};

const child = { categories, paths, typeSubsets, groups };

const phase = {
  normal: {
    default: true,
    hint: "TERIOCK.CHANGES.Phase.normal.hint",
    label: "TERIOCK.CHANGES.Phase.normal.label",
  },
  children: {
    hint: "TERIOCK.CHANGES.Phase.children.hint",
    label: "TERIOCK.CHANGES.Phase.children.label",
  },
};

const target = {
  Actor: "TERIOCK.CHANGES.Target.Actor",
  Item: "TERIOCK.CHANGES.Target.Item",
};

const defaultPhase = Object.entries(phase).find(([_k, v]) => v.default)[0];

export default { child, phase, target, defaultPhase };

preLocalize("config.change.child.groups");
preLocalize("config.change.child.categories", { key: "label", sort: true });
preLocalize("config.change.child.paths", { key: "label", sort: true });
preLocalize("config.change.phase", { keys: ["hint", "label"] });
preLocalize("config.change.target");
