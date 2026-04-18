import { preLocalize } from "../../helpers/localization.mjs";
import { abilityConfig } from "../config/ability-config.mjs";
import { attributeConfig } from "../config/attribute-config.mjs";
import { costConfig } from "../config/cost-config.mjs";
import { effectConfig } from "../config/effect-config.mjs";
import usableContext from "./usable-context.mjs";

const abilityContext = {
  ...usableContext,
  basic: "TERIOCK.SYSTEMS.Ability.FIELDS.basic.label",
  es: "TERIOCK.SYSTEMS.Ability.FIELDS.elderSorcery.label",
  guildmaster: "TERIOCK.SYSTEMS.Ability.FIELDS.guildmaster.label",
  invoked: "TERIOCK.SYSTEMS.Ability.FIELDS.invoked.label",
  lore: "TERIOCK.SYSTEMS.Ability.FIELDS.lore.label",
  ritual: "TERIOCK.SYSTEMS.Ability.FIELDS.ritual.label",
  rotator: "TERIOCK.SYSTEMS.Ability.FIELDS.rotator.label",
  skill: "TERIOCK.SYSTEMS.Ability.FIELDS.skill.label",
  spell: "TERIOCK.SYSTEMS.Ability.FIELDS.spell.label",
  standard: "TERIOCK.SYSTEMS.Ability.FIELDS.standard.label",
  sustained: "TERIOCK.SYSTEMS.Ability.FIELDS.sustained.label",
  revealed: "TERIOCK.SYSTEMS.Revelation.FIELDS.revealed.label",
  grantOnly: "TERIOCK.SYSTEMS.Ability.FIELDS.grantOnly.label",

  ap: "TERIOCK.SYSTEMS.Attack.FIELDS.attackPenalty.label",
  hit: "TERIOCK.SYSTEMS.Attack.FIELDS.hitBonus.label",
  av0: "TERIOCK.TERMS.Properties.armorVoiding",
  ub: "TERIOCK.TERMS.Properties.unblockable",
  warded: "TERIOCK.SYSTEMS.Attack.FIELDS.warded.label",

  maneuver: "TERIOCK.SYSTEMS.Ability.FIELDS.maneuver.label",
  interaction: "TERIOCK.SYSTEMS.Ability.FIELDS.interaction.label",
  time: "TERIOCK.TERMS.Common.executionTime",
  range: "TERIOCK.SYSTEMS.Ability.FIELDS.range.label",
  form: "TERIOCK.SYSTEMS.BaseEffect.FIELDS.form.label",

  "delivery.ball": "TERIOCK.TERMS.DeliveryPackage.ball",
  "delivery.ray": "TERIOCK.TERMS.DeliveryPackage.ray",
  "delivery.touch": "TERIOCK.TERMS.DeliveryPackage.touch",
  "delivery.strike": "TERIOCK.TERMS.DeliveryPackage.strike",
  "delivery.item": "TERIOCK.TERMS.DeliveryParent.item",
  ability: "TYPES.ActiveEffect.ability",
};

export default abilityContext;

preLocalize("rollContext.ability");
Hooks.once("i18nInit", () => {
  Object.entries(abilityConfig.maneuver).forEach(([k, v]) => {
    abilityContext[`maneuver.${k}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Ability.maneuver",
      { name: _loc(v) },
    );
  });
  Object.entries(abilityConfig.interaction).forEach(([k, v]) => {
    abilityContext[`interaction.${k}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Ability.interaction",
      { name: _loc(v) },
    );
  });
  Object.entries(abilityConfig.delivery).forEach(([k, v]) => {
    abilityContext[`delivery.${k}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Ability.delivery",
      { name: _loc(v) },
    );
  });
  Object.keys(abilityConfig.targets).forEach((k) => {
    abilityContext[`target.${k}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Ability.target",
      { name: _loc(abilityConfig.targets[k]) },
    );
  });
  Object.entries(abilityConfig.executionTime).forEach(([_group, values]) => {
    Object.entries(values).forEach(([k, v]) => {
      abilityContext[`time.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.time", {
        name: _loc(v),
      });
    });
  });
  Object.entries(abilityConfig.expansion).forEach(([k, v]) => {
    abilityContext[`expansion.${k}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Ability.expansion",
      { name: _loc(v) },
    );
  });
  Object.entries(attributeConfig).forEach(([k, v]) => {
    const name = _loc(v.label);
    abilityContext[`attr.${k}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Ability.attribute",
      { name },
    );
    abilityContext[`expansion.attr.${k}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Ability.expansionAttribute",
      { name },
    );
  });
  Object.entries(effectConfig.form).forEach(([k, v]) => {
    abilityContext[`form.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Common.form", {
      name: _loc(v.label),
    });
  });
  Object.entries(TERIOCK.reference.elements).forEach(([k, v]) => {
    abilityContext[`element.${k}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Ability.element",
      { name: _loc(v) },
    );
    abilityContext[`element.${k.slice(0, 3).toLowerCase()}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Ability.element",
      { name: _loc(v) },
    );
  });
  Object.entries(TERIOCK.reference.effectTypes).forEach(([k, v]) => {
    abilityContext[`effect.${k}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Ability.effectType",
      { name: _loc(v) },
    );
  });
  Object.entries(TERIOCK.reference.powerSources).forEach(([k, v]) => {
    abilityContext[`power.${k}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Ability.powerSource",
      { name: _loc(v) },
    );
  });
  Object.entries(costConfig.tweaks).forEach(([k, v]) => {
    abilityContext[`tweaks.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.tweak", {
      name: _loc(v.label),
    });
  });
  Object.entries(costConfig.components.keys).forEach(([k, v]) => {
    abilityContext[`components.${k}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Ability.component",
      { name: _loc(v) },
    );
  });
  Object.entries(costConfig.primary.keys).forEach(([k, v]) => {
    abilityContext[`costs.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.cost", {
      name: _loc(v.label),
    });
  });
  Object.entries(TERIOCK.reference.classes).forEach(([k, v]) => {
    abilityContext[`class.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.class", {
      name: _loc(v),
    });
    abilityContext[`class.${k.slice(0, 3).toLowerCase()}`] = _loc(
      "TERIOCK.ROLL_CONTEXT.Ability.class",
      { name: _loc(v) },
    );
  });
  abilityContext["class.rank"] = _loc("TERIOCK.ROLL_CONTEXT.Ability.classRank");
});
