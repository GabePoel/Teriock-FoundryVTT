import { preLocalizeObject } from "../../helpers/localization.mjs";
import metaphysicsContext from "./metaphysics-context.mjs";
import usableContext from "./usable-context.mjs";

const abilityContext = {
  ...usableContext,
  basic: "TERIOCK.SYSTEMS.Ability.FIELDS.basic.label",
  conjured: "TERIOCK.COMMON.Conjured",
  es: "TERIOCK.SYSTEMS.Ability.FIELDS.elderSorcery.label",
  "grant.only": "TERIOCK.SYSTEMS.Ability.FIELDS.grantOnly.label",
  "grant.use": "TERIOCK.SYSTEMS.Ability.FIELDS.grantUse.label",
  guildmaster: "TERIOCK.SYSTEMS.Ability.FIELDS.guildmaster.label",
  invoked: "TERIOCK.SYSTEMS.Ability.FIELDS.invoked.label",
  lore: "TERIOCK.SYSTEMS.Ability.FIELDS.lore.label",
  revealed: "TERIOCK.SYSTEMS.Revealable.FIELDS.revealed.label",
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

  "expansion.range": "TERIOCK.SYSTEMS.Ability.FIELDS.expansion.range.label",
  range: "TERIOCK.SYSTEMS.Ability.FIELDS.range.label",

  "type.ability": "TYPES.ActiveEffect.ability",
};

export default abilityContext;

preLocalizeObject("ROLL_CONTEXT.ability");
Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.ability.maneuver).forEach(([k, v]) => {
    abilityContext[`maneuver.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.maneuver", { name: v.label });
  });
  Object.entries(TERIOCK.CONFIG.ability.interaction).forEach(([k, v]) => {
    abilityContext[`interaction.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.interaction", { name: v.label });
  });
  Object.entries(TERIOCK.CONFIG.ability.delivery).forEach(([k, v]) => {
    abilityContext[`delivery.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.delivery", { name: v.label });
  });
  ["ball", "contact", "ranged", "ray", "strike", "touch"].forEach(k => {
    abilityContext[`delivery.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.delivery", {
      name: _loc(`TERIOCK.TERMS.DeliveryPackage.${k}`),
    });
  });
  Object.keys(TERIOCK.CONFIG.ability.targets).forEach(k => {
    abilityContext[`target.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.target", {
      name: TERIOCK.CONFIG.ability.targets[k].label,
    });
  });
  Object.values(TERIOCK.CONFIG.ability.maneuver).forEach(m => {
    Object.values(m.executionTimes).forEach(v => {
      abilityContext[`time.${v.slug}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.time", { name: v.label });
    });
  });
  Object.entries(TERIOCK.CONFIG.ability.expansion).forEach(([k, v]) => {
    abilityContext[`expansion.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.expansion", { name: v.label });
  });
  Object.entries(TERIOCK.CONFIG.attribute).forEach(([k, v]) => {
    const name = v.abbreviation;
    abilityContext[`feat.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.feat", { name });
    abilityContext[`expansion.feat.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.expansionFeat", { name });
  });
  Object.entries(TERIOCK.CONFIG.effect.kind).forEach(([k, v]) => {
    abilityContext[`kind.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.kind", { name: v.label });
  });
  Object.entries(TERIOCK.CONFIG.cost.tweaks).forEach(([k, v]) => {
    abilityContext[`tweak.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.tweak", { name: v.label });
  });
  Object.entries(TERIOCK.CONFIG.cost.components.keys).forEach(([k, v]) => {
    abilityContext[`component.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.component", { name: v });
  });
  Object.entries(TERIOCK.CONFIG.stat).forEach(([k, v]) => {
    abilityContext[`cost.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.cost", { name: v.label });
  });
  Object.entries(TERIOCK.CONFIG.class.archetypes).forEach(([k, v]) => {
    abilityContext[`rank.archetype.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.class", { name: v.label });
  });
  Object.entries(TERIOCK.CONFIG.class.classes).forEach(([k, v]) => {
    abilityContext[`rank.class.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.class", { name: v.label });
  });
  abilityContext["rank.number"] = _loc("TERIOCK.ROLL_CONTEXT.Ability.rankNumber");
});

Hooks.once("teriock.metaphysicsContextInit", () => {
  Object.assign(abilityContext, metaphysicsContext);
});
