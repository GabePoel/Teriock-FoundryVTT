import { preLocalizeObject } from "../../helpers/localization.mjs";
import commandConfig from "./command-config.mjs";

/**
 * @import { ActiveEffectChangeRenderer } from "@client/documents/_types.mjs";
 */

const booleanTypes = ["upgrade", "downgrade", "override"];
const simpleTypes = ["add", "subtract", ...booleanTypes];
const numericalTypes = [...simpleTypes, "multiply"];
const formulaTypes = [...numericalTypes, "boost", "substitute"];
const harmTypes = [...formulaTypes, "typeAdd", "typeRemove", "typeSet"];

/** @type {Record<string, string[]>} */
const typeSubsets = {
  boolean: booleanTypes,
  formula: formulaTypes,
  harm: harmTypes,
  numerical: numericalTypes,
  simple: simpleTypes,
};

/** @enum {Teriock.Config.ChildChangeTargetEntry} */
const childTargets = {
  ability: { initial: true, label: "TERIOCK.DOCUMENTS.ActiveEffect.ability.plural" },
  armament: { label: "TERIOCK.DOCUMENTS.Item.armament.plural" },
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
    group: "offense",
    initial: true,
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
  "system.boosts.*": {
    group: "boosts",
    label: "TERIOCK.SYSTEMS.Child.FIELDS.boosts.all",
    targets: ["ability", "armament"],
    types: typeSubsets.formula,
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
  "system.damage.*": {
    group: "damage",
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.alt",
    targets: ["armament"],
    types: typeSubsets.harm,
  },
  "system.damage.base": {
    group: "damage",
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.base.label",
    targets: ["armament"],
    types: typeSubsets.harm,
  },
  "system.damage.twoHanded": {
    group: "damage",
    label: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.twoHanded.label",
    targets: ["armament"],
    types: typeSubsets.harm,
  },
  "system.hitBonus": {
    group: "offense",
    label: "TERIOCK.SYSTEMS.Attack.FIELDS.hitBonus.label",
    targets: ["ability", "armament"],
    types: typeSubsets.formula,
  },
  "system.piercing.raw": {
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
    group: "offense",
    label: "TERIOCK.SYSTEMS.Attack.FIELDS.warded.label",
    targets: ["ability", "armament"],
    types: typeSubsets.boolean,
  },
  ...Object.fromEntries(
    Object.entries(commandConfig).filter(([_k, v]) => v.numeric).map(([k, v]) => {
      return [`system.boosts.${k}`, {
        group: "boosts",
        label: v.label,
        targets: ["ability", "armament"],
        types: typeSubsets.formula,
      }];
    }),
  ),
};

const child = { groups, paths, targets: childTargets, typeSubsets };

// no sort
const phase = {
  initial: { hint: "EFFECT.CHANGES.PHASES.initial.hint", label: "EFFECT.CHANGES.PHASES.initial.label" },
  setup: {
    appliedByActor: true,
    appliesToChildren: true,
    hint: "TERIOCK.CHANGES.Phase.setup.hint",
    label: "TERIOCK.CHANGES.Phase.setup.label",
  },
  main: {
    appliedByActor: true,
    appliesToChildren: true,
    default: true,
    hint: "TERIOCK.CHANGES.Phase.main.hint",
    label: "TERIOCK.CHANGES.Phase.main.label",
  },
  final: { appliedByActor: true, hint: "EFFECT.CHANGES.PHASES.final.hint", label: "EFFECT.CHANGES.PHASES.final.label" },
};

/**
 * Render an active effect change row with custom context. This is for Foundry's normal change configs and not our
 * custom ones that are part of automations.
 * @type {ActiveEffectChangeRenderer}
 */
const render = (context) => {
  const field = types[context.change.type].value();
  if (field instanceof foundry.data.fields.SetField) {
    const { value } = context.change;
    context.change.value = [foundry.data.validators.isJSON(value) ? JSON.parse(value) : value].flat().filter(Boolean);
  }
  context.fields = { ...context.fields, value: field };
  return foundry.applications.handlebars.renderTemplate("templates/sheets/active-effect/change.hbs", context);
};

const harmTypesField = () => new teriock.data.fields.SlugSetField({ suggestions: true, types: ["damage", "drain"] });

/** @satisfies {Record<string, Teriock.Config.ChangeTypeEntry>} */
const types = {
  ...Object.fromEntries(
    simpleTypes.map(
      type => [type, {
        defaultPriority: CONST.ACTIVE_EFFECT_CHANGE_TYPES[type],
        label: `EFFECT.CHANGES.TYPES.${type}`,
        render,
        value: () => new teriock.data.fields.FormulaField(),
      }]
    ),
  ),
  boost: {
    defaultPriority: 60,
    label: "TERIOCK.EFFECTS.Changes.boost",
    render,
    value: () => new teriock.data.fields.FormulaField(),
  },
  multiply: {
    defaultPriority: CONST.ACTIVE_EFFECT_CHANGE_TYPES.multiply,
    label: "EFFECT.CHANGES.TYPES.multiply",
    render,
    value: () => new teriock.data.fields.FormulaField({ deterministic: true }),
  },
  substitute: {
    defaultPriority: 70,
    label: "TERIOCK.EFFECTS.Changes.substitute",
    render,
    value: () => new teriock.data.fields.FormulaField({ placeholder: "@base" }),
  },
  typeAdd: { defaultPriority: 15, label: "TERIOCK.EFFECTS.Changes.typeAdd", render, value: harmTypesField },
  typeRemove: { defaultPriority: 15, label: "TERIOCK.EFFECTS.Changes.typeRemove", render, value: harmTypesField },
  typeSet: { defaultPriority: 45, label: "TERIOCK.EFFECTS.Changes.typeSet", render, value: harmTypesField },
};

const parentTargets = { ActiveEffect: "DOCUMENT.ActiveEffect", Actor: "DOCUMENT.Actor", Item: "DOCUMENT.Item" };

const parent = { targets: parentTargets };

const defaultPhase = Object.entries(phase).find(([_k, v]) => v.default)[0];

const tokenPhase = "initial";

export default { child, defaultPhase, parent, phase, tokenPhase, types };

preLocalizeObject("CONFIG.change.child.groups");
preLocalizeObject("CONFIG.change.child.paths", { key: "label", sort: true });
preLocalizeObject("CONFIG.change.parent.target");
preLocalizeObject("CONFIG.change.phase", { keys: ["hint", "label"] });
preLocalizeObject("CONFIG.change.types", { keys: ["label"] });
