import { colors } from "../display/_module.mjs";
import * as index from "../index/_module.mjs";

export const abilityOptions = {
  maneuver: {
    active: "Active",
    reactive: "Reactive",
    passive: "Passive",
    slow: "Slow",
  },
  interaction: {
    attack: "Attack",
    block: "Block",
    feat: "Feat",
    manifest: "Manifest",
  },
  attribute: index.statAttributes,
  featSaveAttribute: index.attributes,
  executionTime: {
    active: {
      a0: "Free Action",
      a1: "Single Action",
      a2: "Double Action",
      a3: "Triple Action",
    },
    reactive: {
      r0: "Free Reaction",
      r1: "Reaction",
    },
    passive: {
      passive: "Passive",
    },
    slow: {
      longRest: "Long rest",
      shortRest: "Short rest",
      custom: "Custom",
    },
  },
  effectTypes: index.effectTypes,
  targets: {
    ability: "Ability",
    area: "Area",
    arm: "Arm",
    armor: "Armor",
    attack: "Attack",
    creature: "Creature",
    item: "Item",
    leg: "Leg",
    self: "Self",
    ship: "Ship",
    skill: "Skill",
    spell: "Spell",
    vitals: "Vitals",
    weapon: "Weapon",
    other: "Other",
  },
  targetParent: {
    ability: "Ability",
    item: "Item",
  },
  delivery: {
    armor: "Armor",
    aura: "Aura",
    bite: "Bite",
    cone: "Cone",
    hand: "Hand",
    item: "Item",
    missile: "Missile",
    self: "Self",
    sight: "Sight",
    shield: "Shield",
    weapon: "Weapon",
  },
  deliveryPackage: {
    ball: "Ball",
    ray: "Ray",
    ritual: "Ritual",
    strike: "Strike",
    touch: "Touch",
  },
  deliveryParent: {
    item: "Item",
  },
  class: index.classes,
  elements: index.elements,
  powerSources: index.powerSources,
  expansion: {
    cascade: "Cascade",
    detonate: "Detonate",
    fork: "Fork",
    ripple: "Ripple",
  },
  manaCost: {
    x: "Variable",
  },
  hitCost: {
    x: "Variable",
    hack: "Hack",
  },
  breakCost: {
    shatter: "Shatter",
    destroy: "Destroy",
  },
  featSaveImprovementAmount: {
    proficiency: "Proficiency",
    fluency: "Fluency",
  },
  costs: {
    verbal: "Verbal",
    somatic: "Somatic",
    material: "Material",
    invoked: "Invoked",
  },
  duration: {
    unit: {
      instant: "Instant",
      second: "Second",
      minute: "Minute",
      hour: "Hour",
      day: "Day",
      week: "Week",
      month: "Month",
      year: "Year",
      noLimit: "No Limit",
      untilDawn: "Until Dawn",
    },
  },
  form: {
    special: {
      name: "Special",
      icon: "star",
      color: colors.purple,
    },
    normal: {
      name: "Normal",
      icon: "diamond",
      color: colors.green,
    },
    gifted: {
      name: "Gifted",
      icon: "plus",
      color: colors.blue,
    },
    echo: {
      name: "Echo",
      icon: "circles-overlap",
      color: colors.orange,
    },
    intrinsic: {
      name: "Intrinsic",
      icon: "cube",
      color: colors.grey,
    },
    flaw: {
      name: "Flaw",
      icon: "ban",
      color: colors.red,
    },
  },
};
