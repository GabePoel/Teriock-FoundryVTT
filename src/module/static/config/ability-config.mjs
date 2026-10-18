import { preLocalizeConfig } from "../../helpers/localization.mjs";

export default {
  delivery: {
    armor: /** @type {Teriock.Config.DeliveryEntry} */ {
      allowPiercing: true,
      contact: true,
      identifier: "core:item-delivery",
      label: "TERIOCK.TERMS.Delivery.armor",
      needsItem: true,
    },
    aura: /** @type {Teriock.Config.DeliveryEntry} */ {
      aoe: true,
      identifier: "core:aura-delivery",
      label: "TERIOCK.TERMS.Delivery.aura",
      ranged: true,
      sizes: "radius",
      template: "circle",
    },
    bite: /** @type {Teriock.Config.DeliveryEntry} */ {
      allowPiercing: true,
      contact: true,
      identifier: "core:bite-delivery",
      label: "TERIOCK.TERMS.Delivery.bite",
    },
    cone: /** @type {Teriock.Config.DeliveryEntry} */ {
      aoe: true,
      identifier: "core:cone-delivery",
      label: "TERIOCK.TERMS.Delivery.cone",
      ranged: true,
      sizes: "length",
      template: "cone",
    },
    hand: /** @type {Teriock.Config.DeliveryEntry} */ {
      allowPiercing: true,
      contact: true,
      identifier: "core:hand-delivery",
      label: "TERIOCK.TERMS.Delivery.hand",
    },
    item: /** @type {Teriock.Config.DeliveryEntry} */ {
      allowPiercing: true,
      contact: true,
      identifier: "core:item-delivery",
      label: "TERIOCK.TERMS.Delivery.item",
      needsItem: true,
    },
    missile: /** @type {Teriock.Config.DeliveryEntry} */ {
      allowPiercing: true,
      identifier: "core:missile-delivery",
      label: "TERIOCK.TERMS.Delivery.missile",
      ranged: true,
    },
    self: /** @type {Teriock.Config.DeliveryEntry} */ {
      identifier: "core:self-delivery",
      label: "TERIOCK.TERMS.Delivery.self",
    },
    shield: /** @type {Teriock.Config.DeliveryEntry} */ {
      allowPiercing: true,
      contact: true,
      identifier: "core:item-delivery",
      label: "TERIOCK.TERMS.Delivery.shield",
      needsItem: true,
    },
    sight: /** @type {Teriock.Config.DeliveryEntry} */ {
      identifier: "core:sight-delivery",
      label: "TERIOCK.TERMS.Delivery.sight",
      ranged: true,
    },
    weapon: /** @type {Teriock.Config.DeliveryEntry} */ {
      allowPiercing: true,
      contact: true,
      identifier: "core:item-delivery",
      label: "TERIOCK.TERMS.Delivery.weapon",
      needsItem: true,
    },
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
    cascade: /** @type {Teriock.Config.ExpansionEntry} */ {
      identifier: "core:cascade-expansion",
      label: "TERIOCK.TERMS.Expansion.cascade",
      ranged: true,
    },
    detonate: /** @type {Teriock.Config.ExpansionEntry} */ {
      aoe: true,
      identifier: "core:detonate-expansion",
      label: "TERIOCK.TERMS.Expansion.detonate",
      needsSaveAttribute: true,
      ranged: true,
      sizes: "radius",
    },
    fork: /** @type {Teriock.Config.ExpansionEntry} */ {
      identifier: "core:expansions",
      label: "TERIOCK.TERMS.Expansion.fork",
      ranged: true,
    },
    ripple: /** @type {Teriock.Config.ExpansionEntry} */ {
      aoe: true,
      identifier: "core:expansions",
      label: "TERIOCK.TERMS.Expansion.ripple",
      needsSaveAttribute: true,
      ranged: true,
      sizes: "radius",
    },
  },
  interaction: {
    attack: /** @type {Teriock.Config.InteractionEntry} */ {
      identifier: "core:attack-interaction",
      label: "TERIOCK.TERMS.Interaction.attack",
      results: {
        hit: "TERIOCK.SYSTEMS.Ability.FIELDS.results.hit.label",
        miss: "TERIOCK.SYSTEMS.Ability.FIELDS.results.miss.label",
      },
    },
    block: /** @type {Teriock.Config.InteractionEntry} */ {
      identifier: "core:block-interaction",
      label: "TERIOCK.TERMS.Interaction.block",
      results: {
        fail: "TERIOCK.SYSTEMS.Ability.FIELDS.results.fail.label",
        save: "TERIOCK.SYSTEMS.Ability.FIELDS.results.save.label",
      },
    },
    feat: /** @type {Teriock.Config.InteractionEntry} */ {
      identifier: "core:feat-interaction",
      label: "TERIOCK.TERMS.Interaction.feat",
      results: {
        fail: "TERIOCK.SYSTEMS.Ability.FIELDS.results.fail.label",
        save: "TERIOCK.SYSTEMS.Ability.FIELDS.results.save.label",
      },
    },
    manifest: /** @type {Teriock.Config.InteractionEntry} */ {
      identifier: "core:manifest-interaction",
      label: "TERIOCK.TERMS.Interaction.manifest",
      results: { use: "TERIOCK.SYSTEMS.Ability.FIELDS.results.use.label" },
    },
  },
  // no sort
  maneuver: {
    active: /** @type {Teriock.Config.ManeuverEntry} */ {
      identifier: "core:active-maneuvers",
      label: "TERIOCK.TERMS.Maneuver.active",
    },
    reactive: /** @type {Teriock.Config.ManeuverEntry} */ {
      identifier: "core:reactive-maneuvers",
      label: "TERIOCK.TERMS.Maneuver.reactive",
    },
    passive: /** @type {Teriock.Config.ManeuverEntry} */ {
      identifier: "core:passive-maneuvers",
      label: "TERIOCK.TERMS.Maneuver.passive",
    },
    slow: /** @type {Teriock.Config.ManeuverEntry} */ {
      identifier: "core:slow-maneuvers",
      label: "TERIOCK.TERMS.Maneuver.slow",
    },
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

preLocalizeConfig("CONFIG.ability.delivery", { keys: ["label"] });
preLocalizeConfig("CONFIG.ability.deliveryPackage");
preLocalizeConfig("CONFIG.ability.deliveryParent");
preLocalizeConfig("CONFIG.ability.duration.unit");
preLocalizeConfig("CONFIG.ability.executionTime.active");
preLocalizeConfig("CONFIG.ability.executionTime.passive");
preLocalizeConfig("CONFIG.ability.executionTime.reactive");
preLocalizeConfig("CONFIG.ability.executionTime.slow");
preLocalizeConfig("CONFIG.ability.expansion", { keys: ["label"] });
preLocalizeConfig("CONFIG.ability.featSaveImprovementAmount");
preLocalizeConfig("CONFIG.ability.interaction", { keys: ["label"] });
preLocalizeConfig("CONFIG.ability.interaction.attack.results");
preLocalizeConfig("CONFIG.ability.interaction.block.results");
preLocalizeConfig("CONFIG.ability.interaction.feat.results");
preLocalizeConfig("CONFIG.ability.interaction.manifest.results");
preLocalizeConfig("CONFIG.ability.maneuver", { keys: ["label"] });
preLocalizeConfig("CONFIG.ability.targetParent");
preLocalizeConfig("CONFIG.ability.targets", { keys: ["label"] });
