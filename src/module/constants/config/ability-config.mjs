import { preLocalizeConfig } from "../../helpers/localization.mjs";

export default {
  delivery: /** @enum {Teriock.Config.DeliveryEntry} */ {
    armor: { allowPiercing: true, contact: true, label: "TERIOCK.TERMS.Delivery.armor", needsItem: true },
    aura: { aoe: true, label: "TERIOCK.TERMS.Delivery.aura", ranged: true, sizes: "radius", template: "circle" },
    bite: { allowPiercing: true, contact: true, label: "TERIOCK.TERMS.Delivery.bite" },
    cone: { aoe: true, label: "TERIOCK.TERMS.Delivery.cone", ranged: true, sizes: "length", template: "cone" },
    hand: { allowPiercing: true, contact: true, label: "TERIOCK.TERMS.Delivery.hand" },
    item: { allowPiercing: true, contact: true, label: "TERIOCK.TERMS.Delivery.item", needsItem: true },
    missile: { allowPiercing: true, label: "TERIOCK.TERMS.Delivery.missile", ranged: true },
    self: { label: "TERIOCK.TERMS.Delivery.self" },
    shield: { allowPiercing: true, contact: true, label: "TERIOCK.TERMS.Delivery.shield", needsItem: true },
    sight: { label: "TERIOCK.TERMS.Delivery.sight", ranged: true },
    weapon: { allowPiercing: true, contact: true, label: "TERIOCK.TERMS.Delivery.weapon", needsItem: true },
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
  expansion: /** @enum {Teriock.Config.ExpansionEntry} */ {
    cascade: { label: "TERIOCK.TERMS.Expansion.cascade", ranged: true },
    detonate: {
      aoe: true,
      label: "TERIOCK.TERMS.Expansion.detonate",
      needsSaveAttribute: true,
      ranged: true,
      sizes: "radius",
    },
    fork: { label: "TERIOCK.TERMS.Expansion.fork", ranged: true },
    ripple: {
      aoe: true,
      label: "TERIOCK.TERMS.Expansion.ripple",
      needsSaveAttribute: true,
      ranged: true,
      sizes: "radius",
    },
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
  targets: /** @enum {Teriock.Config.TargetEntry} */ {
    ability: { label: "TERIOCK.TERMS.Targets.ability" },
    area: { label: "TERIOCK.TERMS.Targets.area" },
    arm: { label: "TERIOCK.TERMS.Targets.arm", targetsActor: true },
    armor: { label: "TERIOCK.TERMS.Targets.armor", targetsArmament: true },
    attack: { label: "TERIOCK.TERMS.Targets.attack" },
    creature: { label: "TERIOCK.TERMS.Targets.creature", targetsActor: true },
    item: { label: "TERIOCK.TERMS.Targets.item", targetsArmament: true },
    leg: { label: "TERIOCK.TERMS.Targets.leg", targetsActor: true },
    other: { label: "TERIOCK.TERMS.Targets.other" },
    self: { label: "TERIOCK.TERMS.Targets.self", targetsActor: true },
    ship: { label: "TERIOCK.TERMS.Targets.ship" },
    skill: { label: "TERIOCK.TERMS.Targets.skill" },
    spell: { label: "TERIOCK.TERMS.Targets.spell" },
    vitals: { label: "TERIOCK.TERMS.Targets.vitals", targetsActor: true },
    weapon: { label: "TERIOCK.TERMS.Targets.weapon", targetsArmament: true },
  },
};

preLocalizeConfig("config.ability.delivery", { keys: ["label"] });
preLocalizeConfig("config.ability.deliveryPackage");
preLocalizeConfig("config.ability.deliveryParent");
preLocalizeConfig("config.ability.duration.unit");
preLocalizeConfig("config.ability.executionTime.active");
preLocalizeConfig("config.ability.executionTime.passive");
preLocalizeConfig("config.ability.executionTime.reactive");
preLocalizeConfig("config.ability.executionTime.slow");
preLocalizeConfig("config.ability.expansion", { keys: ["label"] });
preLocalizeConfig("config.ability.featSaveImprovementAmount");
preLocalizeConfig("config.ability.interaction");
preLocalizeConfig("config.ability.maneuver");
preLocalizeConfig("config.ability.targetParent");
preLocalizeConfig("config.ability.targets", { keys: ["label"] });
