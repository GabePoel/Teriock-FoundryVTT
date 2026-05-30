import { preLocalize } from "../../helpers/localization.mjs";

export default {
  delivery: {
    armor: "TERIOCK.TERMS.Delivery.armor",
    aura: "TERIOCK.TERMS.Delivery.aura",
    bite: "TERIOCK.TERMS.Delivery.bite",
    cone: "TERIOCK.TERMS.Delivery.cone",
    hand: "TERIOCK.TERMS.Delivery.hand",
    item: "TERIOCK.TERMS.Delivery.item",
    missile: "TERIOCK.TERMS.Delivery.missile",
    self: "TERIOCK.TERMS.Delivery.self",
    shield: "TERIOCK.TERMS.Delivery.shield",
    sight: "TERIOCK.TERMS.Delivery.sight",
    weapon: "TERIOCK.TERMS.Delivery.weapon",
  },
  deliveryPackage: {
    ball: "TERIOCK.TERMS.DeliveryPackage.ball",
    ray: "TERIOCK.TERMS.DeliveryPackage.ray",
    ritual: "TERIOCK.TERMS.DeliveryPackage.ritual",
    strike: "TERIOCK.TERMS.DeliveryPackage.strike",
    touch: "TERIOCK.TERMS.DeliveryPackage.touch",
  },
  deliveryParent: { item: "TERIOCK.TERMS.DeliveryParent.item" },
  duration: {
    // no sort
    unit: {
      instant: "TERIOCK.TERMS.Duration.unit.instant",
      second: "TERIOCK.TERMS.Duration.unit.second",
      minute: "TERIOCK.TERMS.Duration.unit.minute",
      hour: "TERIOCK.TERMS.Duration.unit.hour",
      day: "TERIOCK.TERMS.Duration.unit.day",
      week: "TERIOCK.TERMS.Duration.unit.week",
      month: "TERIOCK.TERMS.Duration.unit.month",
      year: "TERIOCK.TERMS.Duration.unit.year",
      noLimit: "TERIOCK.TERMS.Duration.unit.noLimit",
      untilDawn: "TERIOCK.TERMS.Duration.unit.untilDawn",
    },
  },
  // no sort
  executionTime: {
    active: {
      a0: "TERIOCK.TERMS.ExecutionTime.active.0",
      a1: "TERIOCK.TERMS.ExecutionTime.active.1",
      a2: "TERIOCK.TERMS.ExecutionTime.active.2",
      a3: "TERIOCK.TERMS.ExecutionTime.active.3",
    },
    reactive: { r0: "TERIOCK.TERMS.ExecutionTime.reactive.0", r1: "TERIOCK.TERMS.ExecutionTime.reactive.1" },
    passive: { passive: "TERIOCK.TERMS.Maneuver.passive" },
    // no sort
    slow: {
      longRest: "TERIOCK.TERMS.ExecutionTime.slow.longRest",
      shortRest: "TERIOCK.TERMS.ExecutionTime.slow.shortRest",
      custom: "TERIOCK.TERMS.ExecutionTime.slow.custom",
    },
  },
  expansion: {
    cascade: "TERIOCK.TERMS.Expansion.cascade",
    detonate: "TERIOCK.TERMS.Expansion.detonate",
    fork: "TERIOCK.TERMS.Expansion.fork",
    ripple: "TERIOCK.TERMS.Expansion.ripple",
  },
  interaction: {
    attack: "TERIOCK.TERMS.Interaction.attack",
    block: "TERIOCK.TERMS.Interaction.block",
    feat: "TERIOCK.TERMS.Interaction.feat",
    manifest: "TERIOCK.TERMS.Interaction.manifest",
  },
  // no sort
  maneuver: {
    active: "TERIOCK.TERMS.Maneuver.active",
    reactive: "TERIOCK.TERMS.Maneuver.reactive",
    passive: "TERIOCK.TERMS.Maneuver.passive",
    slow: "TERIOCK.TERMS.Maneuver.slow",
  },
  targetParent: { ability: "TERIOCK.TERMS.TargetParent.ability", item: "TERIOCK.TERMS.TargetParent.item" },
  // no sort
  targets: {
    ability: "TERIOCK.TERMS.Targets.ability",
    area: "TERIOCK.TERMS.Targets.area",
    arm: "TERIOCK.TERMS.Targets.arm",
    armor: "TERIOCK.TERMS.Targets.armor",
    attack: "TERIOCK.TERMS.Targets.attack",
    creature: "TERIOCK.TERMS.Targets.creature",
    item: "TERIOCK.TERMS.Targets.item",
    leg: "TERIOCK.TERMS.Targets.leg",
    self: "TERIOCK.TERMS.Targets.self",
    ship: "TERIOCK.TERMS.Targets.ship",
    skill: "TERIOCK.TERMS.Targets.skill",
    spell: "TERIOCK.TERMS.Targets.spell",
    vitals: "TERIOCK.TERMS.Targets.vitals",
    weapon: "TERIOCK.TERMS.Targets.weapon",
    other: "TERIOCK.TERMS.Targets.other",
  },
};

preLocalize("config.ability.delivery");
preLocalize("config.ability.deliveryPackage");
preLocalize("config.ability.deliveryParent");
preLocalize("config.ability.duration.unit");
preLocalize("config.ability.executionTime.active");
preLocalize("config.ability.executionTime.passive");
preLocalize("config.ability.executionTime.reactive");
preLocalize("config.ability.executionTime.slow");
preLocalize("config.ability.expansion");
preLocalize("config.ability.featSaveImprovementAmount");
preLocalize("config.ability.interaction");
preLocalize("config.ability.maneuver");
preLocalize("config.ability.targetParent");
preLocalize("config.ability.targets");
