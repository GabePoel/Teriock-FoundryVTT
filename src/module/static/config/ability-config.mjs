import { preLocalizeObject } from "../../helpers/localization.mjs";

export default {
  attributeChange: {
    priority: 20,
    get phase() {
      return TERIOCK.CONFIG.change.defaultPhase;
    },
  },
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
      executionTimes: {
        a0: { label: "TERIOCK.TERMS.ExecutionTime.active.0" },
        a1: { actions: 1, label: "TERIOCK.TERMS.ExecutionTime.active.1" },
        a2: { actions: 2, label: "TERIOCK.TERMS.ExecutionTime.active.2" },
        a3: { actions: 3, label: "TERIOCK.TERMS.ExecutionTime.active.3" },
      },
      identifier: "core:active-maneuvers",
      label: "TERIOCK.TERMS.Maneuver.active",
    },
    reactive: /** @type {Teriock.Config.ManeuverEntry} */ {
      executionTimes: {
        r0: { label: "TERIOCK.TERMS.ExecutionTime.reactive.0" },
        r1: { label: "TERIOCK.TERMS.ExecutionTime.reactive.1", reactions: 1 },
      },
      identifier: "core:reactive-maneuvers",
      label: "TERIOCK.TERMS.Maneuver.reactive",
    },
    passive: /** @type {Teriock.Config.ManeuverEntry} */ {
      executionTimes: { passive: { label: "TERIOCK.TERMS.Maneuver.passive" } },
      identifier: "core:passive-maneuvers",
      label: "TERIOCK.TERMS.Maneuver.passive",
    },
    slow: /** @type {Teriock.Config.ManeuverEntry} */ {
      // no sort
      executionTimes: {
        longRest: { label: "TERIOCK.TERMS.ExecutionTime.slow.longRest" },
        shortRest: { label: "TERIOCK.TERMS.ExecutionTime.slow.shortRest" },
        custom: { label: "TERIOCK.TERMS.ExecutionTime.slow.custom" },
      },
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

preLocalizeObject("CONFIG.ability.delivery", { keys: ["label"] });
preLocalizeObject("CONFIG.ability.deliveryPackage");
preLocalizeObject("CONFIG.ability.deliveryParent");
preLocalizeObject("CONFIG.ability.duration.unit");
preLocalizeObject("CONFIG.ability.expansion", { keys: ["label"] });
preLocalizeObject("CONFIG.ability.featSaveImprovementAmount");
preLocalizeObject("CONFIG.ability.interaction", { keys: ["label"] });
preLocalizeObject("CONFIG.ability.interaction.attack.results");
preLocalizeObject("CONFIG.ability.interaction.block.results");
preLocalizeObject("CONFIG.ability.interaction.feat.results");
preLocalizeObject("CONFIG.ability.interaction.manifest.results");
preLocalizeObject("CONFIG.ability.maneuver", { keys: ["label"] });
preLocalizeObject("CONFIG.ability.maneuver.active.executionTimes", { keys: ["label"] });
preLocalizeObject("CONFIG.ability.maneuver.passive.executionTimes", { keys: ["label"] });
preLocalizeObject("CONFIG.ability.maneuver.reactive.executionTimes", { keys: ["label"] });
preLocalizeObject("CONFIG.ability.maneuver.slow.executionTimes", { keys: ["label"] });
preLocalizeObject("CONFIG.ability.targetParent");
preLocalizeObject("CONFIG.ability.targets", { keys: ["label"] });
