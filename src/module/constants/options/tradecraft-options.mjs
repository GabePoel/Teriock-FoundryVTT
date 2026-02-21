import { preLocalize } from "../../helpers/localization.mjs";
import { icons } from "../display/icons.mjs";

export const tradecraftOptions = {
  artisan: {
    name: "TERIOCK.TERMS.Fields.artisan",
    icon: icons.field.artisan,
    tradecrafts: {
      artist: {
        name: "TERIOCK.TERMS.Tradecrafts.artist",
        icon: icons.tradecraft.artist,
      },
      blacksmith: {
        name: "TERIOCK.TERMS.Tradecrafts.blacksmith",
        icon: icons.tradecraft.blacksmith,
      },
      builder: {
        name: "TERIOCK.TERMS.Tradecrafts.builder",
        icon: icons.tradecraft.builder,
      },
      chef: {
        name: "TERIOCK.TERMS.Tradecrafts.chef",
        icon: icons.tradecraft.chef,
      },
      locksmith: {
        name: "TERIOCK.TERMS.Tradecrafts.locksmith",
        icon: icons.tradecraft.locksmith,
      },
      mariner: {
        name: "TERIOCK.TERMS.Tradecrafts.mariner",
        icon: icons.tradecraft.mariner,
      },
      tailor: {
        name: "TERIOCK.TERMS.Tradecrafts.tailor",
        icon: icons.tradecraft.tailor,
      },
    },
  },
  mediator: {
    name: "TERIOCK.TERMS.Fields.mediator",
    icon: icons.field.mediator,
    tradecrafts: {
      courtier: {
        name: "TERIOCK.TERMS.Tradecrafts.courtier",
        icon: icons.tradecraft.courtier,
      },
      enforcer: {
        name: "TERIOCK.TERMS.Tradecrafts.enforcer",
        icon: icons.tradecraft.enforcer,
      },
      gambler: {
        name: "TERIOCK.TERMS.Tradecrafts.gambler",
        icon: icons.tradecraft.gambler,
      },
      innkeeper: {
        name: "TERIOCK.TERMS.Tradecrafts.innkeeper",
        icon: icons.tradecraft.innkeeper,
      },
      peacekeeper: {
        name: "TERIOCK.TERMS.Tradecrafts.peacekeeper",
        icon: icons.tradecraft.peacekeeper,
      },
      performer: {
        name: "TERIOCK.TERMS.Tradecrafts.performer",
        icon: icons.tradecraft.performer,
      },
      trader: {
        name: "TERIOCK.TERMS.Tradecrafts.trader",
        icon: icons.tradecraft.trader,
      },
    },
  },
  scholar: {
    name: "TERIOCK.TERMS.Fields.scholar",
    icon: icons.field.scholar,
    tradecrafts: {
      cartographer: {
        name: "TERIOCK.TERMS.Tradecrafts.cartographer",
        icon: icons.tradecraft.cartographer,
      },
      diplomat: {
        name: "TERIOCK.TERMS.Tradecrafts.diplomat",
        icon: icons.tradecraft.diplomat,
      },
      historian: {
        name: "TERIOCK.TERMS.Tradecrafts.historian",
        icon: icons.tradecraft.historian,
      },
      messenger: {
        name: "TERIOCK.TERMS.Tradecrafts.messenger",
        icon: icons.tradecraft.messenger,
      },
      priest: {
        name: "TERIOCK.TERMS.Tradecrafts.priest",
        icon: icons.tradecraft.priest,
      },
      scribe: {
        name: "TERIOCK.TERMS.Tradecrafts.scribe",
        icon: icons.tradecraft.scribe,
      },
      teacher: {
        name: "TERIOCK.TERMS.Tradecrafts.teacher",
        icon: icons.tradecraft.teacher,
      },
    },
  },
  survivalist: {
    name: "TERIOCK.TERMS.Fields.survivalist",
    icon: icons.field.survivalist,
    tradecrafts: {
      farmer: {
        name: "TERIOCK.TERMS.Tradecrafts.farmer",
        icon: icons.tradecraft.farmer,
      },
      herbalist: {
        name: "TERIOCK.TERMS.Tradecrafts.herbalist",
        icon: icons.tradecraft.herbalist,
      },
      hunter: {
        name: "TERIOCK.TERMS.Tradecrafts.hunter",
        icon: icons.tradecraft.hunter,
      },
      investigator: {
        name: "TERIOCK.TERMS.Tradecrafts.investigator",
        icon: icons.tradecraft.investigator,
      },
      miner: {
        name: "TERIOCK.TERMS.Tradecrafts.miner",
        icon: icons.tradecraft.miner,
      },
      tamer: {
        name: "TERIOCK.TERMS.Tradecrafts.tamer",
        icon: icons.tradecraft.tamer,
      },
      tracker: {
        name: "TERIOCK.TERMS.Tradecrafts.tracker",
        icon: icons.tradecraft.tracker,
      },
    },
  },
  prestige: {
    name: "TERIOCK.TERMS.Fields.prestige",
    icon: icons.field.prestige,
    tradecrafts: {
      metaphysicist: {
        name: "TERIOCK.TERMS.Tradecrafts.metaphysicist",
        icon: icons.tradecraft.metaphysicist,
      },
      tinkerer: {
        name: "TERIOCK.TERMS.Tradecrafts.tinkerer",
        icon: icons.tradecraft.tinkerer,
      },
    },
  },
};

preLocalize("options.tradecraft", { keys: ["name"] });
preLocalize("options.tradecraft.artisan.tradecrafts", { keys: ["name"] });
preLocalize("options.tradecraft.mediator.tradecrafts", { keys: ["name"] });
preLocalize("options.tradecraft.scholar.tradecrafts", { keys: ["name"] });
preLocalize("options.tradecraft.survivalist.tradecrafts", { keys: ["name"] });
preLocalize("options.tradecraft.prestige.tradecrafts", { keys: ["name"] });
