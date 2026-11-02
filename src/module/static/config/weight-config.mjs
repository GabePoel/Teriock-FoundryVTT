import { preLocalizeObject } from "../../helpers/localization.mjs";

/** @enum {Teriock.Config.UnitEntry} */
// no sort
const weightConfig = {
  oz: {
    conversion: 1 / 16,
    label: "TERIOCK.WEIGHT.oz.label",
    plural: "TERIOCK.WEIGHT.oz.plural",
    scale: 0,
    symbol: "TERIOCK.WEIGHT.oz.symbol",
    system: "imperial",
  },
  lb: {
    conversion: 1,
    label: "TERIOCK.WEIGHT.lb.label",
    plural: "TERIOCK.WEIGHT.lb.plural",
    scale: 1,
    symbol: "TERIOCK.WEIGHT.lb.symbol",
    system: "imperial",
  },
  ton: {
    conversion: 2000,
    label: "TERIOCK.WEIGHT.ton.label",
    plural: "TERIOCK.WEIGHT.ton.plural",
    scale: 2,
    symbol: "TERIOCK.WEIGHT.ton.symbol",
    system: "imperial",
  },
};

export default weightConfig;

preLocalizeObject("CONFIG.weight", { keys: ["label", "plural", "symbol"] });
