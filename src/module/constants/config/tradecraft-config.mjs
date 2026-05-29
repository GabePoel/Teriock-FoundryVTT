import { preLocalize } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

export default {
  fields: {
    artisan: { icon: icons.field.artisan, label: "TERIOCK.TERMS.Fields.artisan" },
    mediator: { icon: icons.field.mediator, label: "TERIOCK.TERMS.Fields.mediator" },
    prestige: { icon: icons.field.prestige, label: "TERIOCK.TERMS.Fields.prestige" },
    scholar: { icon: icons.field.scholar, label: "TERIOCK.TERMS.Fields.scholar" },
    survivalist: { icon: icons.field.survivalist, label: "TERIOCK.TERMS.Fields.survivalist" },
  },
  tradecrafts: {
    artist: { field: "artisan", icon: icons.tradecraft.artist, label: "TERIOCK.TERMS.Tradecrafts.artist" },
    blacksmith: { field: "artisan", icon: icons.tradecraft.blacksmith, label: "TERIOCK.TERMS.Tradecrafts.blacksmith" },
    builder: { field: "artisan", icon: icons.tradecraft.builder, label: "TERIOCK.TERMS.Tradecrafts.builder" },
    cartographer: {
      field: "scholar",
      icon: icons.tradecraft.cartographer,
      label: "TERIOCK.TERMS.Tradecrafts.cartographer",
    },
    chef: { field: "artisan", icon: icons.tradecraft.chef, label: "TERIOCK.TERMS.Tradecrafts.chef" },
    courtier: { field: "mediator", icon: icons.tradecraft.courtier, label: "TERIOCK.TERMS.Tradecrafts.courtier" },
    diplomat: { field: "scholar", icon: icons.tradecraft.diplomat, label: "TERIOCK.TERMS.Tradecrafts.diplomat" },
    enforcer: { field: "mediator", icon: icons.tradecraft.enforcer, label: "TERIOCK.TERMS.Tradecrafts.enforcer" },
    farmer: { field: "survivalist", icon: icons.tradecraft.farmer, label: "TERIOCK.TERMS.Tradecrafts.farmer" },
    gambler: { field: "mediator", icon: icons.tradecraft.gambler, label: "TERIOCK.TERMS.Tradecrafts.gambler" },
    herbalist: { field: "survivalist", icon: icons.tradecraft.herbalist, label: "TERIOCK.TERMS.Tradecrafts.herbalist" },
    historian: { field: "scholar", icon: icons.tradecraft.historian, label: "TERIOCK.TERMS.Tradecrafts.historian" },
    hunter: { field: "survivalist", icon: icons.tradecraft.hunter, label: "TERIOCK.TERMS.Tradecrafts.hunter" },
    innkeeper: { field: "mediator", icon: icons.tradecraft.innkeeper, label: "TERIOCK.TERMS.Tradecrafts.innkeeper" },
    investigator: {
      field: "survivalist",
      icon: icons.tradecraft.investigator,
      label: "TERIOCK.TERMS.Tradecrafts.investigator",
    },
    locksmith: { field: "artisan", icon: icons.tradecraft.locksmith, label: "TERIOCK.TERMS.Tradecrafts.locksmith" },
    mariner: { field: "artisan", icon: icons.tradecraft.mariner, label: "TERIOCK.TERMS.Tradecrafts.mariner" },
    messenger: { field: "scholar", icon: icons.tradecraft.messenger, label: "TERIOCK.TERMS.Tradecrafts.messenger" },
    metaphysicist: {
      field: "prestige",
      icon: icons.tradecraft.metaphysicist,
      label: "TERIOCK.TERMS.Tradecrafts.metaphysicist",
    },
    miner: { field: "survivalist", icon: icons.tradecraft.miner, label: "TERIOCK.TERMS.Tradecrafts.miner" },
    peacekeeper: {
      field: "mediator",
      icon: icons.tradecraft.peacekeeper,
      label: "TERIOCK.TERMS.Tradecrafts.peacekeeper",
    },
    performer: { field: "mediator", icon: icons.tradecraft.performer, label: "TERIOCK.TERMS.Tradecrafts.performer" },
    priest: { field: "scholar", icon: icons.tradecraft.priest, label: "TERIOCK.TERMS.Tradecrafts.priest" },
    scribe: { field: "scholar", icon: icons.tradecraft.scribe, label: "TERIOCK.TERMS.Tradecrafts.scribe" },
    tailor: { field: "artisan", icon: icons.tradecraft.tailor, label: "TERIOCK.TERMS.Tradecrafts.tailor" },
    tamer: { field: "survivalist", icon: icons.tradecraft.tamer, label: "TERIOCK.TERMS.Tradecrafts.tamer" },
    teacher: { field: "scholar", icon: icons.tradecraft.teacher, label: "TERIOCK.TERMS.Tradecrafts.teacher" },
    tinkerer: { field: "prestige", icon: icons.tradecraft.tinkerer, label: "TERIOCK.TERMS.Tradecrafts.tinkerer" },
    tracker: { field: "survivalist", icon: icons.tradecraft.tracker, label: "TERIOCK.TERMS.Tradecrafts.tracker" },
    trader: { field: "mediator", icon: icons.tradecraft.trader, label: "TERIOCK.TERMS.Tradecrafts.trader" },
  },
};

preLocalize("config.tradecraft.fields", { keys: ["label"] });
preLocalize("config.tradecraft.tradecrafts", { keys: ["label"] });
