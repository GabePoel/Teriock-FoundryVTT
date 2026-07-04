import { preLocalize } from "../../helpers/localization.mjs";
import impactConfig from "./impact-config.mjs";

const booleanTypes = ["upgrade", "downgrade", "override"];
const simpleTypes = ["add", "subtract", ...booleanTypes];
const numericalTypes = [...simpleTypes, "multiply"];
const formulaTypes = [...numericalTypes, "boost", "substitute"];
const harmTypes = [...formulaTypes, "typeAdd", "typeRemove", "typeSet"];

/** @type {Record<string, Teriock.Changes.Type[]>} */
const typeSubsets = {
  boolean: booleanTypes,
  formula: formulaTypes,
  harm: harmTypes,
  numerical: numericalTypes,
  simple: simpleTypes,
};

/** @enum {Teriock.Config.ChildChangeTargetEntry} */
const childTargets = {
  ability: { label: "TERIOCK.CHANGES.Target.ability", types: ["ability"] },
  armament: { label: "TERIOCK.CHANGES.Target.armament", types: ["body", "equipment"] },
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
    forExecution: true,
    group: "offense",
    label: "TERIOCK.SYSTEMS.Attack.FIELDS.attackPenalty.label",
    targets: ["ability", "armament"],
    types: typeSubsets.formula,
  },
  "system.av.bonus": {
    group: "defense",
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.av.raw.label",
    targets: ["armament"],
    types: typeSubsets.simple,
  },
  "system.bv.bonus": {
    group: "defense",
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.bv.raw.label",
    targets: ["armament"],
    types: typeSubsets.simple,
  },
  "system.costs.tweaks.adept": {
    group: "costs",
    label: "TERIOCK.COSTS.Tweaks.adept",
    targets: ["ability"],
    types: typeSubsets.numerical,
  },
  "system.costs.tweaks.inept": {
    group: "costs",
    label: "TERIOCK.COSTS.Tweaks.inept",
    targets: ["ability"],
    types: typeSubsets.numerical,
  },
  "system.damage": {
    forExecution: true,
    group: "damage",
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.alt",
    targets: ["armament"],
    types: typeSubsets.harm,
  },
  "system.damage.base": {
    forExecution: true,
    group: "damage",
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.base.label",
    targets: ["armament"],
    types: typeSubsets.harm,
  },
  "system.damage.twoHanded": {
    forExecution: true,
    group: "damage",
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.twoHanded.label",
    targets: ["armament"],
    types: typeSubsets.harm,
  },
  "system.hitBonus": {
    forExecution: true,
    group: "offense",
    label: "TERIOCK.SYSTEMS.Attack.FIELDS.hitBonus.label",
    targets: ["ability", "armament"],
    types: typeSubsets.formula,
  },
  "system.piercing.raw": {
    forExecution: true,
    group: "offense",
    label: "TERIOCK.MODELS.Piercing.FIELDS.raw.label",
    targets: ["ability", "armament"],
    types: typeSubsets.simple,
  },
  "system.spellTurning": {
    group: "defense",
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.spellTurning.label",
    targets: ["armament"],
    types: typeSubsets.boolean,
  },
  "system.vitals": {
    group: "offense",
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.vitals.label",
    targets: ["armament"],
    types: typeSubsets.boolean,
  },
  "system.warded": {
    forExecution: true,
    group: "offense",
    label: "TERIOCK.SYSTEMS.Attack.FIELDS.warded.label",
    targets: ["ability", "armament"],
    types: typeSubsets.boolean,
  },
  ...Object.fromEntries(
    Object.entries(impactConfig).filter(([_k, v]) => !v.hidden).map(([k, v]) => {
      return [`system.boosts.${k}`, {
        forExecution: true,
        group: "boosts",
        label: v.label,
        targets: ["ability", "armament"],
        types: typeSubsets.formula,
      }];
    }),
  ),
};

const child = { groups, paths, targets: childTargets, typeSubsets };

const phase = {
  children: {
    applyToChildren: true,
    hint: "TERIOCK.CHANGES.Phase.children.hint",
    label: "TERIOCK.CHANGES.Phase.children.label",
  },
  derived: {
    applyToItems: true,
    default: true,
    hint: "TERIOCK.CHANGES.Phase.derived.hint",
    label: "TERIOCK.CHANGES.Phase.derived.label",
    visible: true,
  },
  special: {
    applyToItems: true,
    hint: "TERIOCK.CHANGES.Phase.special.hint",
    label: "TERIOCK.CHANGES.Phase.special.label",
    visible: true,
  },
};

const parentTargets = { Actor: "TERIOCK.CHANGES.Target.Actor", Item: "TERIOCK.CHANGES.Target.Item" };

const parent = { targets: parentTargets };

const defaultPhase = Object.entries(phase).find(([_k, v]) => v.default)[0];

const tokenPhase = "initial";

export default { child, defaultPhase, parent, phase, tokenPhase };

preLocalize("config.change.child.groups");
preLocalize("config.change.child.paths", { key: "label", sort: true });
preLocalize("config.change.parent.target");
preLocalize("config.change.phase", { keys: ["hint", "label"] });
