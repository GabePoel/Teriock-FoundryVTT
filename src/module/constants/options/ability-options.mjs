import { preLocalize } from "../../helpers/localization.mjs";
import { colors, icons } from "../display/_module.mjs";
import { default as reference } from "../reference/_module.mjs";

export const abilityOptions = {
  maneuver: {
    active: "TERIOCK.TERMS.Maneuver.active",
    reactive: "TERIOCK.TERMS.Maneuver.reactive",
    passive: "TERIOCK.TERMS.Maneuver.passive",
    slow: "TERIOCK.TERMS.Maneuver.slow",
  },
  interaction: {
    attack: "TERIOCK.TERMS.Interaction.attack",
    block: "TERIOCK.TERMS.Interaction.block",
    feat: "TERIOCK.TERMS.Interaction.feat",
    manifest: "TERIOCK.TERMS.Interaction.manifest",
  },
  attribute: reference.statAttributes,
  featSaveAttribute: reference.attributes,
  executionTime: {
    active: {
      a0: "TERIOCK.TERMS.ExecutionTime.active.0",
      a1: "TERIOCK.TERMS.ExecutionTime.active.1",
      a2: "TERIOCK.TERMS.ExecutionTime.active.2",
      a3: "TERIOCK.TERMS.ExecutionTime.active.3",
    },
    reactive: {
      r0: "TERIOCK.TERMS.ExecutionTime.reactive.0",
      r1: "TERIOCK.TERMS.ExecutionTime.reactive.1",
    },
    passive: {
      passive: "TERIOCK.TERMS.Maneuver.passive",
    },
    slow: {
      longRest: "TERIOCK.TERMS.ExecutionTime.slow.longRest",
      shortRest: "TERIOCK.TERMS.ExecutionTime.slow.shortRest",
      custom: "TERIOCK.TERMS.ExecutionTime.slow.custom",
    },
  },
  effectTypes: reference.effectTypes,
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
  targetParent: {
    ability: "TERIOCK.TERMS.TargetParent.ability",
    item: "TERIOCK.TERMS.TargetParent.item",
  },
  delivery: {
    armor: "TERIOCK.TERMS.Delivery.armor",
    aura: "TERIOCK.TERMS.Delivery.aura",
    bite: "TERIOCK.TERMS.Delivery.bite",
    cone: "TERIOCK.TERMS.Delivery.cone",
    hand: "TERIOCK.TERMS.Delivery.hand",
    item: "TERIOCK.TERMS.Delivery.item",
    missile: "TERIOCK.TERMS.Delivery.missile",
    self: "TERIOCK.TERMS.Delivery.self",
    sight: "TERIOCK.TERMS.Delivery.sight",
    shield: "TERIOCK.TERMS.Delivery.shield",
    weapon: "TERIOCK.TERMS.Delivery.weapon",
  },
  deliveryPackage: {
    ball: "TERIOCK.TERMS.DeliveryPackage.ball",
    ray: "TERIOCK.TERMS.DeliveryPackage.ray",
    ritual: "TERIOCK.TERMS.DeliveryPackage.ritual",
    strike: "TERIOCK.TERMS.DeliveryPackage.strike",
    touch: "TERIOCK.TERMS.DeliveryPackage.touch",
  },
  deliveryParent: {
    item: "TERIOCK.TERMS.DeliveryParent.item",
  },
  class: reference.classes,
  elements: reference.elements,
  powerSources: reference.powerSources,
  expansion: {
    cascade: "TERIOCK.TERMS.Expansion.cascade",
    detonate: "TERIOCK.TERMS.Expansion.detonate",
    fork: "TERIOCK.TERMS.Expansion.fork",
    ripple: "TERIOCK.TERMS.Expansion.ripple",
  },
  manaCost: {
    x: "TERIOCK.TERMS.ManaCost.x",
  },
  hitCost: {
    x: "TERIOCK.TERMS.HitCost.x",
    hack: "TERIOCK.TERMS.HitCost.hack",
  },
  breakCost: {
    shatter: "TERIOCK.TERMS.BreakCost.shatter",
    destroy: "TERIOCK.TERMS.BreakCost.destroy",
  },
  featSaveImprovementAmount: {
    proficiency: "TERIOCK.TERMS.FeatSaveImprovementAmount.proficiency",
    fluency: "TERIOCK.TERMS.FeatSaveImprovementAmount.fluency",
  },
  costs: {
    verbal: "TERIOCK.TERMS.Costs.verbal",
    somatic: "TERIOCK.TERMS.Costs.somatic",
    material: "TERIOCK.TERMS.Costs.material",
    invoked: "TERIOCK.TERMS.Costs.invoked",
  },
  duration: {
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
  cost: {
    none: "TERIOCK.TERMS.Cost.none",
    static: "TERIOCK.TERMS.Cost.static",
    formula: "TERIOCK.TERMS.Cost.formula",
    variable: "TERIOCK.TERMS.Cost.variable",
  },
  form: {
    special: {
      name: "TERIOCK.TERMS.EffectForm.special",
      icon: icons.form.special,
      color: colors.purple,
    },
    normal: {
      name: "TERIOCK.TERMS.EffectForm.normal",
      icon: icons.form.normal,
      color: colors.green,
    },
    gifted: {
      name: "TERIOCK.TERMS.EffectForm.gifted",
      icon: icons.form.gifted,
      color: colors.blue,
    },
    echo: {
      name: "TERIOCK.TERMS.EffectForm.echo",
      icon: icons.form.echo,
      color: colors.orange,
    },
    intrinsic: {
      name: "TERIOCK.TERMS.EffectForm.intrinsic",
      icon: icons.form.intrinsic,
      color: colors.grey,
    },
    flaw: {
      name: "TERIOCK.TERMS.EffectForm.flaw",
      icon: icons.form.flaw,
      color: colors.red,
    },
  },
};

preLocalize("options.ability.cost");
preLocalize("options.ability.maneuver");
preLocalize("options.ability.interaction");
preLocalize("options.ability.executionTime.active");
preLocalize("options.ability.executionTime.reactive");
preLocalize("options.ability.executionTime.passive");
preLocalize("options.ability.executionTime.slow");
preLocalize("options.ability.targets");
preLocalize("options.ability.targetParent");
preLocalize("options.ability.delivery");
preLocalize("options.ability.deliveryPackage");
preLocalize("options.ability.deliveryParent");
preLocalize("options.ability.expansion");
preLocalize("options.ability.manaCost");
preLocalize("options.ability.hitCost");
preLocalize("options.ability.breakCost");
preLocalize("options.ability.featSaveImprovementAmount");
preLocalize("options.ability.costs");
preLocalize("options.ability.duration.unit");
preLocalize("options.ability.form", { key: "name" });
