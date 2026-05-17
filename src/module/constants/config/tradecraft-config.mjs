import { preLocalize } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

export const tradecraftConfig = {
  artisan: {
    icon: icons.field.artisan,
    name: "TERIOCK.TERMS.Fields.artisan",
    tradecrafts: {
      artist: {
        icon: icons.tradecraft.artist,
        name: "TERIOCK.TERMS.Tradecrafts.artist",
      },
      blacksmith: {
        icon: icons.tradecraft.blacksmith,
        name: "TERIOCK.TERMS.Tradecrafts.blacksmith",
      },
      builder: {
        icon: icons.tradecraft.builder,
        name: "TERIOCK.TERMS.Tradecrafts.builder",
      },
      chef: {
        icon: icons.tradecraft.chef,
        name: "TERIOCK.TERMS.Tradecrafts.chef",
      },
      locksmith: {
        icon: icons.tradecraft.locksmith,
        name: "TERIOCK.TERMS.Tradecrafts.locksmith",
      },
      mariner: {
        icon: icons.tradecraft.mariner,
        name: "TERIOCK.TERMS.Tradecrafts.mariner",
      },
      tailor: {
        icon: icons.tradecraft.tailor,
        name: "TERIOCK.TERMS.Tradecrafts.tailor",
      },
    },
  },
  mediator: {
    icon: icons.field.mediator,
    name: "TERIOCK.TERMS.Fields.mediator",
    tradecrafts: {
      courtier: {
        icon: icons.tradecraft.courtier,
        name: "TERIOCK.TERMS.Tradecrafts.courtier",
      },
      enforcer: {
        icon: icons.tradecraft.enforcer,
        name: "TERIOCK.TERMS.Tradecrafts.enforcer",
      },
      gambler: {
        icon: icons.tradecraft.gambler,
        name: "TERIOCK.TERMS.Tradecrafts.gambler",
      },
      innkeeper: {
        icon: icons.tradecraft.innkeeper,
        name: "TERIOCK.TERMS.Tradecrafts.innkeeper",
      },
      peacekeeper: {
        icon: icons.tradecraft.peacekeeper,
        name: "TERIOCK.TERMS.Tradecrafts.peacekeeper",
      },
      performer: {
        icon: icons.tradecraft.performer,
        name: "TERIOCK.TERMS.Tradecrafts.performer",
      },
      trader: {
        icon: icons.tradecraft.trader,
        name: "TERIOCK.TERMS.Tradecrafts.trader",
      },
    },
  },
  prestige: {
    icon: icons.field.prestige,
    name: "TERIOCK.TERMS.Fields.prestige",
    tradecrafts: {
      metaphysicist: {
        icon: icons.tradecraft.metaphysicist,
        name: "TERIOCK.TERMS.Tradecrafts.metaphysicist",
      },
      tinkerer: {
        icon: icons.tradecraft.tinkerer,
        name: "TERIOCK.TERMS.Tradecrafts.tinkerer",
      },
    },
  },
  scholar: {
    icon: icons.field.scholar,
    name: "TERIOCK.TERMS.Fields.scholar",
    tradecrafts: {
      cartographer: {
        icon: icons.tradecraft.cartographer,
        name: "TERIOCK.TERMS.Tradecrafts.cartographer",
      },
      diplomat: {
        icon: icons.tradecraft.diplomat,
        name: "TERIOCK.TERMS.Tradecrafts.diplomat",
      },
      historian: {
        icon: icons.tradecraft.historian,
        name: "TERIOCK.TERMS.Tradecrafts.historian",
      },
      messenger: {
        icon: icons.tradecraft.messenger,
        name: "TERIOCK.TERMS.Tradecrafts.messenger",
      },
      priest: {
        icon: icons.tradecraft.priest,
        name: "TERIOCK.TERMS.Tradecrafts.priest",
      },
      scribe: {
        icon: icons.tradecraft.scribe,
        name: "TERIOCK.TERMS.Tradecrafts.scribe",
      },
      teacher: {
        icon: icons.tradecraft.teacher,
        name: "TERIOCK.TERMS.Tradecrafts.teacher",
      },
    },
  },
  survivalist: {
    icon: icons.field.survivalist,
    name: "TERIOCK.TERMS.Fields.survivalist",
    tradecrafts: {
      farmer: {
        icon: icons.tradecraft.farmer,
        name: "TERIOCK.TERMS.Tradecrafts.farmer",
      },
      herbalist: {
        icon: icons.tradecraft.herbalist,
        name: "TERIOCK.TERMS.Tradecrafts.herbalist",
      },
      hunter: {
        icon: icons.tradecraft.hunter,
        name: "TERIOCK.TERMS.Tradecrafts.hunter",
      },
      investigator: {
        icon: icons.tradecraft.investigator,
        name: "TERIOCK.TERMS.Tradecrafts.investigator",
      },
      miner: {
        icon: icons.tradecraft.miner,
        name: "TERIOCK.TERMS.Tradecrafts.miner",
      },
      tamer: {
        icon: icons.tradecraft.tamer,
        name: "TERIOCK.TERMS.Tradecrafts.tamer",
      },
      tracker: {
        icon: icons.tradecraft.tracker,
        name: "TERIOCK.TERMS.Tradecrafts.tracker",
      },
    },
  },
};

preLocalize("config.tradecraft", { keys: ["name"] });
preLocalize("config.tradecraft.artisan.tradecrafts", { keys: ["name"] });
preLocalize("config.tradecraft.mediator.tradecrafts", { keys: ["name"] });
preLocalize("config.tradecraft.scholar.tradecrafts", { keys: ["name"] });
preLocalize("config.tradecraft.survivalist.tradecrafts", { keys: ["name"] });
preLocalize("config.tradecraft.prestige.tradecrafts", { keys: ["name"] });
