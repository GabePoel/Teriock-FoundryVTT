import { preLocalizeConfig } from "../../helpers/localization.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";
import usableContext from "./usable-context.mjs";

const abilityContext = {
  ...usableContext,
  basic: "TERIOCK.SYSTEMS.Ability.FIELDS.basic.label",
  es: "TERIOCK.SYSTEMS.Ability.FIELDS.elderSorcery.label",
  grantOnly: "TERIOCK.SYSTEMS.Ability.FIELDS.grantOnly.label",
  grantUse: "TERIOCK.SYSTEMS.Ability.FIELDS.grantUse.label",
  guildmaster: "TERIOCK.SYSTEMS.Ability.FIELDS.guildmaster.label",
  invoked: "TERIOCK.SYSTEMS.Ability.FIELDS.invoked.label",
  lore: "TERIOCK.SYSTEMS.Ability.FIELDS.lore.label",
  revealed: "TERIOCK.SYSTEMS.Revelation.FIELDS.revealed.label",
  ritual: "TERIOCK.SYSTEMS.Ability.FIELDS.ritual.label",
  rotator: "TERIOCK.SYSTEMS.Ability.FIELDS.rotator.label",
  skill: "TERIOCK.SYSTEMS.Ability.FIELDS.skill.label",
  spell: "TERIOCK.SYSTEMS.Ability.FIELDS.spell.label",
  standard: "TERIOCK.SYSTEMS.Ability.FIELDS.standard.label",
  sustained: "TERIOCK.SYSTEMS.Ability.FIELDS.sustained.label",

  ap: "TERIOCK.SYSTEMS.Attack.FIELDS.attackPenalty.label",
  av0: "TERIOCK.TERMS.Properties.armorVoiding",
  hit: "TERIOCK.SYSTEMS.Attack.FIELDS.hitBonus.label",
  ub: "TERIOCK.TERMS.Properties.unblockable",
  warded: "TERIOCK.SYSTEMS.Attack.FIELDS.warded.label",

  form: "TERIOCK.SYSTEMS.BaseEffect.FIELDS.form.label",
  interaction: "TERIOCK.SYSTEMS.Ability.FIELDS.interaction.label",
  maneuver: "TERIOCK.SYSTEMS.Ability.FIELDS.maneuver.label",
  range: "TERIOCK.SYSTEMS.Ability.FIELDS.range.label",
  time: "TERIOCK.TERMS.Common.executionTime",

  ability: "TYPES.ActiveEffect.ability",
  "delivery.ball": "TERIOCK.TERMS.DeliveryPackage.ball",
  "delivery.item": "TERIOCK.TERMS.DeliveryParent.item",
  "delivery.ray": "TERIOCK.TERMS.DeliveryPackage.ray",
  "delivery.strike": "TERIOCK.TERMS.DeliveryPackage.strike",
  "delivery.touch": "TERIOCK.TERMS.DeliveryPackage.touch",
};

export default abilityContext;

preLocalizeConfig("rollContext.ability");
Hooks.once("i18nInit", () => {
  Object.entries(TERIOCK.config.ability.maneuver).forEach(([k, v]) => {
    abilityContext[`maneuver.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.maneuver", { name: _loc(v) });
  });
  Object.entries(TERIOCK.config.ability.interaction).forEach(([k, v]) => {
    abilityContext[`interaction.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.interaction", { name: _loc(v) });
  });
  Object.entries(TERIOCK.config.ability.delivery).forEach(([k, v]) => {
    abilityContext[`delivery.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.delivery", { name: v.label });
  });
  Object.keys(TERIOCK.config.ability.targets).forEach(k => {
    abilityContext[`target.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.target", {
      name: TERIOCK.config.ability.targets[k].label,
    });
  });
  Object.entries(TERIOCK.config.ability.executionTime).forEach(([_group, values]) => {
    Object.entries(values).forEach(([k, v]) => {
      abilityContext[`time.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.time", { name: _loc(v) });
    });
  });
  Object.entries(TERIOCK.config.ability.expansion).forEach(([k, v]) => {
    abilityContext[`expansion.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.expansion", { name: v.label });
  });
  Object.entries(TERIOCK.config.attribute).forEach(([k, v]) => {
    const name = _loc(v.abbreviation);
    abilityContext[`attr.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.attribute", { name });
    abilityContext[`expansion.attr.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.expansionAttribute", { name });
  });
  Object.entries(TERIOCK.config.effect.form).forEach(([k, v]) => {
    abilityContext[`form.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.form", { name: _loc(v.label) });
  });
  Object.entries(TERIOCK.config.cost.tweaks).forEach(([k, v]) => {
    abilityContext[`tweaks.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.tweak", { name: _loc(v.label) });
  });
  Object.entries(TERIOCK.config.cost.components.keys).forEach(([k, v]) => {
    abilityContext[`components.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.component", { name: _loc(v) });
  });
  Object.entries(TERIOCK.config.cost.primary.keys).forEach(([k, v]) => {
    abilityContext[`costs.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.cost", { name: _loc(v.label) });
  });
  Object.entries(TERIOCK.reference.classes).forEach(([k, v]) => {
    abilityContext[`class.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.class", { name: _loc(v) });
  });
  abilityContext["class.rank"] = _loc("TERIOCK.ROLL_CONTEXT.Ability.classRank");
});

Hooks.once("teriock.i18nMetaphysicsInit", () => {
  Object.assign(abilityContext, metaphysicsContext);
});
