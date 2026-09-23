import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { icons, images } from "../display/_module.mjs";

export default {
  fields: {
    artisan: { icon: icons.manifest.field.artisan, label: "TERIOCK.TERMS.Fields.artisan" },
    mediator: { icon: icons.manifest.field.mediator, label: "TERIOCK.TERMS.Fields.mediator" },
    prestige: { icon: icons.manifest.field.prestige, label: "TERIOCK.TERMS.Fields.prestige" },
    scholar: { icon: icons.manifest.field.scholar, label: "TERIOCK.TERMS.Fields.scholar" },
    survivalist: { icon: icons.manifest.field.survivalist, label: "TERIOCK.TERMS.Fields.survivalist" },
  },
  tradecrafts: {
    artist: {
      field: "artisan",
      icon: icons.manifest.tradecraft.artist,
      img: images.manifest.tradecraft.artist,
      label: "TERIOCK.TERMS.Tradecrafts.artist",
    },
    blacksmith: {
      field: "artisan",
      icon: icons.manifest.tradecraft.blacksmith,
      img: images.manifest.tradecraft.blacksmith,
      label: "TERIOCK.TERMS.Tradecrafts.blacksmith",
    },
    builder: {
      field: "artisan",
      icon: icons.manifest.tradecraft.builder,
      img: images.manifest.tradecraft.builder,
      label: "TERIOCK.TERMS.Tradecrafts.builder",
    },
    cartographer: {
      field: "scholar",
      icon: icons.manifest.tradecraft.cartographer,
      img: images.manifest.tradecraft.cartographer,
      label: "TERIOCK.TERMS.Tradecrafts.cartographer",
    },
    chef: {
      field: "artisan",
      icon: icons.manifest.tradecraft.chef,
      img: images.manifest.tradecraft.chef,
      label: "TERIOCK.TERMS.Tradecrafts.chef",
    },
    courtier: {
      field: "mediator",
      icon: icons.manifest.tradecraft.courtier,
      img: images.manifest.tradecraft.courtier,
      label: "TERIOCK.TERMS.Tradecrafts.courtier",
    },
    diplomat: {
      field: "scholar",
      icon: icons.manifest.tradecraft.diplomat,
      img: images.manifest.tradecraft.diplomat,
      label: "TERIOCK.TERMS.Tradecrafts.diplomat",
    },
    enforcer: {
      field: "mediator",
      icon: icons.manifest.tradecraft.enforcer,
      img: images.manifest.tradecraft.enforcer,
      label: "TERIOCK.TERMS.Tradecrafts.enforcer",
    },
    farmer: {
      field: "survivalist",
      icon: icons.manifest.tradecraft.farmer,
      img: images.manifest.tradecraft.farmer,
      label: "TERIOCK.TERMS.Tradecrafts.farmer",
    },
    gambler: {
      field: "mediator",
      icon: icons.manifest.tradecraft.gambler,
      img: images.manifest.tradecraft.gambler,
      label: "TERIOCK.TERMS.Tradecrafts.gambler",
    },
    herbalist: {
      field: "survivalist",
      icon: icons.manifest.tradecraft.herbalist,
      img: images.manifest.tradecraft.herbalist,
      label: "TERIOCK.TERMS.Tradecrafts.herbalist",
    },
    historian: {
      field: "scholar",
      icon: icons.manifest.tradecraft.historian,
      img: images.manifest.tradecraft.historian,
      label: "TERIOCK.TERMS.Tradecrafts.historian",
    },
    hunter: {
      field: "survivalist",
      icon: icons.manifest.tradecraft.hunter,
      img: images.manifest.tradecraft.hunter,
      label: "TERIOCK.TERMS.Tradecrafts.hunter",
    },
    innkeeper: {
      field: "mediator",
      icon: icons.manifest.tradecraft.innkeeper,
      img: images.manifest.tradecraft.innkeeper,
      label: "TERIOCK.TERMS.Tradecrafts.innkeeper",
    },
    investigator: {
      field: "survivalist",
      icon: icons.manifest.tradecraft.investigator,
      img: images.manifest.tradecraft.investigator,
      label: "TERIOCK.TERMS.Tradecrafts.investigator",
    },
    locksmith: {
      field: "artisan",
      icon: icons.manifest.tradecraft.locksmith,
      img: images.manifest.tradecraft.locksmith,
      label: "TERIOCK.TERMS.Tradecrafts.locksmith",
    },
    mariner: {
      field: "artisan",
      icon: icons.manifest.tradecraft.mariner,
      img: images.manifest.tradecraft.mariner,
      label: "TERIOCK.TERMS.Tradecrafts.mariner",
    },
    messenger: {
      field: "scholar",
      icon: icons.manifest.tradecraft.messenger,
      img: images.manifest.tradecraft.messenger,
      label: "TERIOCK.TERMS.Tradecrafts.messenger",
    },
    metaphysicist: {
      field: "prestige",
      icon: icons.manifest.tradecraft.metaphysicist,
      img: images.manifest.tradecraft.metaphysicist,
      label: "TERIOCK.TERMS.Tradecrafts.metaphysicist",
    },
    miner: {
      field: "survivalist",
      icon: icons.manifest.tradecraft.miner,
      img: images.manifest.tradecraft.miner,
      label: "TERIOCK.TERMS.Tradecrafts.miner",
    },
    peacekeeper: {
      field: "mediator",
      icon: icons.manifest.tradecraft.peacekeeper,
      img: images.manifest.tradecraft.peacekeeper,
      label: "TERIOCK.TERMS.Tradecrafts.peacekeeper",
    },
    performer: {
      field: "mediator",
      icon: icons.manifest.tradecraft.performer,
      img: images.manifest.tradecraft.performer,
      label: "TERIOCK.TERMS.Tradecrafts.performer",
    },
    priest: {
      field: "scholar",
      icon: icons.manifest.tradecraft.priest,
      img: images.manifest.tradecraft.priest,
      label: "TERIOCK.TERMS.Tradecrafts.priest",
    },
    scribe: {
      field: "scholar",
      icon: icons.manifest.tradecraft.scribe,
      img: images.manifest.tradecraft.scribe,
      label: "TERIOCK.TERMS.Tradecrafts.scribe",
    },
    tailor: {
      field: "artisan",
      icon: icons.manifest.tradecraft.tailor,
      img: images.manifest.tradecraft.tailor,
      label: "TERIOCK.TERMS.Tradecrafts.tailor",
    },
    tamer: {
      field: "survivalist",
      icon: icons.manifest.tradecraft.tamer,
      img: images.manifest.tradecraft.tamer,
      label: "TERIOCK.TERMS.Tradecrafts.tamer",
    },
    teacher: {
      field: "scholar",
      icon: icons.manifest.tradecraft.teacher,
      img: images.manifest.tradecraft.teacher,
      label: "TERIOCK.TERMS.Tradecrafts.teacher",
    },
    tinkerer: {
      field: "prestige",
      icon: icons.manifest.tradecraft.tinkerer,
      img: images.manifest.tradecraft.tinkerer,
      label: "TERIOCK.TERMS.Tradecrafts.tinkerer",
    },
    tracker: {
      field: "survivalist",
      icon: icons.manifest.tradecraft.tracker,
      img: images.manifest.tradecraft.tracker,
      label: "TERIOCK.TERMS.Tradecrafts.tracker",
    },
    trader: {
      field: "mediator",
      icon: icons.manifest.tradecraft.trader,
      img: images.manifest.tradecraft.trader,
      label: "TERIOCK.TERMS.Tradecrafts.trader",
    },
  },
};

preLocalizeConfig("config.tradecraft.fields", { keys: ["label"] });
preLocalizeConfig("config.tradecraft.tradecrafts", { keys: ["label"] });
