import { preLocalizeObject } from "../../helpers/localization.mjs";
import { icons } from "../display/_module.mjs";

export default {
  defaults: {
    ac: 10,
    f: 1,
    initiative: { base: "@mov.score", competence: 1 },
    maxCurses: 3,
    maxPresence: 1,
    p: 0,
    size: 3,
  },
  movement: {
    climb: /** @type {Teriock.Config.MovementEntry} */ {
      icon: icons.manifest.movement.climb,
      initial: 1,
      label: "TERIOCK.SHEETS.Actor.Details.movementSpeed.climb",
      movementAction: "climb",
      slug: "climb",
    },
    crawl: /** @type {Teriock.Config.MovementEntry} */ {
      icon: icons.manifest.movement.crawl,
      initial: 1,
      label: "TERIOCK.SHEETS.Actor.Details.movementSpeed.crawl",
      movementAction: "crawl",
      slug: "crawl",
    },
    difficultTerrain: /** @type {Teriock.Config.MovementEntry} */ {
      icon: icons.manifest.movement.difficultTerrain,
      initial: 2,
      label: "TERIOCK.SHEETS.Actor.Details.movementSpeed.difficultTerrain",
      slug: "difficult-terrain",
    },
    dig: /** @type {Teriock.Config.MovementEntry} */ {
      icon: icons.manifest.movement.dig,
      initial: 0,
      label: "TERIOCK.SHEETS.Actor.Details.movementSpeed.dig",
      movementAction: "burrow",
      slug: "dig",
    },
    dive: /** @type {Teriock.Config.MovementEntry} */ {
      direction: "vertical",
      icon: icons.manifest.movement.dive,
      initial: 1,
      label: "TERIOCK.SHEETS.Actor.Details.movementSpeed.dive",
      movementAction: "swim",
      slug: "dive",
    },
    fly: /** @type {Teriock.Config.MovementEntry} */ {
      icon: icons.manifest.movement.fly,
      initial: 0,
      label: "TERIOCK.SHEETS.Actor.Details.movementSpeed.fly",
      movementAction: "fly",
      slug: "fly",
    },
    hidden: /** @type {Teriock.Config.MovementEntry} */ {
      icon: icons.manifest.movement.hidden,
      initial: 1,
      label: "TERIOCK.SHEETS.Actor.Details.movementSpeed.hidden",
      slug: "hidden",
      status: "hidden",
    },
    leapHorizontal: /** @type {Teriock.Config.MovementEntry} */ {
      direction: "horizontal",
      icon: icons.manifest.movement.leapHorizontal,
      initial: 1,
      label: "TERIOCK.SHEETS.Actor.Details.movementSpeed.leapHorizontal",
      movementAction: "jump",
      slug: "leap-horizontal",
    },
    leapVertical: /** @type {Teriock.Config.MovementEntry} */ {
      direction: "vertical",
      icon: icons.manifest.movement.leapVertical,
      initial: 0,
      label: "TERIOCK.SHEETS.Actor.Details.movementSpeed.leapVertical",
      movementAction: "jump",
      slug: "leap-vertical",
    },
    swim: /** @type {Teriock.Config.MovementEntry} */ {
      direction: "horizontal",
      icon: icons.manifest.movement.swim,
      initial: 2,
      label: "TERIOCK.SHEETS.Actor.Details.movementSpeed.swim",
      movementAction: "swim",
      slug: "swim",
    },
    walk: /** @type {Teriock.Config.MovementEntry} */ {
      icon: icons.manifest.movement.walk,
      initial: 3,
      label: "TERIOCK.SHEETS.Actor.Details.movementSpeed.walk",
      movementAction: "walk",
      slug: "walk",
    },
  },
  scalingBases: {
    br: "TERIOCK.SYSTEMS.BaseActor.FIELDS.scaling.br.label",
    lvl: "TERIOCK.SYSTEMS.BaseActor.FIELDS.scaling.lvl.label",
  },
  /** @category Perception */
  senses: {
    blind: /** @type {Teriock.Config.SenseEntry} */ {
      detectionMode: "blindFighting",
      grantsSight: false,
      icon: icons.manifest.sense.blind,
      label: "TERIOCK.TERMS.Senses.blind",
    },
    dark: /** @type {Teriock.Config.SenseEntry} */ {
      detectionMode: "darkVision",
      grantsSight: true,
      icon: icons.manifest.sense.dark,
      label: "TERIOCK.TERMS.Senses.dark",
      visionMode: "darkvision",
    },
    ethereal: /** @type {Teriock.Config.SenseEntry} */ {
      detectionMode: "seeEthereal",
      grantsSight: false,
      icon: icons.manifest.sense.ethereal,
      label: "TERIOCK.TERMS.Senses.ethereal",
    },
    hearing: /** @type {Teriock.Config.SenseEntry} */ {
      detectionMode: "soundPerception",
      grantsSight: false,
      icon: icons.manifest.sense.hearing,
      label: "TERIOCK.TERMS.Senses.hearing",
    },
    invisible: /** @type {Teriock.Config.SenseEntry} */ {
      detectionMode: "seeInvisible",
      grantsSight: false,
      icon: icons.manifest.sense.invisible,
      label: "TERIOCK.TERMS.Senses.invisible",
    },
    sight: /** @type {Teriock.Config.SenseEntry} */ {
      grantsSight: false,
      icon: icons.manifest.sense.sight,
      label: "TERIOCK.TERMS.Senses.sight",
    },
    smell: /** @type {Teriock.Config.SenseEntry} */ {
      detectionMode: "scentPerception",
      grantsSight: false,
      icon: icons.manifest.sense.smell,
      label: "TERIOCK.TERMS.Senses.smell",
    },
    truth: /** @type {Teriock.Config.SenseEntry} */ {
      detectionMode: "trueSight",
      grantsSight: false,
      icon: icons.manifest.sense.truth,
      label: "TERIOCK.TERMS.Senses.truth",
    },
  },
  sizes: /** @type {Teriock.Config.SizeEntry[]} */ [
    { label: "TERIOCK.TERMS.Sizes.tiny", length: 0.5, max: 0.5, reach: 5, slug: "tiny" },
    { label: "TERIOCK.TERMS.Sizes.small", length: 1, max: 2, reach: 5, slug: "small" },
    { label: "TERIOCK.TERMS.Sizes.medium", length: 1, max: 4, reach: 5, slug: "medium" },
    { label: "TERIOCK.TERMS.Sizes.large", length: 2, max: 9, reach: 10, slug: "large" },
    { label: "TERIOCK.TERMS.Sizes.huge", length: 3, max: 14, reach: 15, slug: "huge" },
    { label: "TERIOCK.TERMS.Sizes.massive", length: 4, max: 19, reach: 20, slug: "massive" },
    { label: "TERIOCK.TERMS.Sizes.gargantuan", length: 5, max: 24, reach: 25, slug: "gargantuan" },
    { label: "TERIOCK.TERMS.Sizes.colossal", length: 6, max: Infinity, reach: 30, slug: "colossal" },
  ],
  speedAdjustments: {
    0: { label: "TERIOCK.TERMS.SpeedAdjustments.0", multiplier: 0 },
    1: { label: "TERIOCK.TERMS.SpeedAdjustments.1", multiplier: 0.25 },
    2: { label: "TERIOCK.TERMS.SpeedAdjustments.2", multiplier: 0.5 },
    3: { label: "TERIOCK.TERMS.SpeedAdjustments.3", multiplier: 1 },
    4: { label: "TERIOCK.TERMS.SpeedAdjustments.4", multiplier: 2 },
  },
};

preLocalizeObject("CONFIG.actor.movement", { key: "label" });
preLocalizeObject("CONFIG.actor.scalingBases");
preLocalizeObject("CONFIG.actor.senses", { key: "label", sort: true });
preLocalizeObject("CONFIG.actor.sizes", { keys: ["label"] });
preLocalizeObject("CONFIG.actor.speedAdjustments", { key: "label", sort: true });
