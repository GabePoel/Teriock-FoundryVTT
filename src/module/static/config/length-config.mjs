import { preLocalizeObject } from "../../helpers/localization.mjs";

/** @enum {Teriock.Config.UnitEntry} */
// no sort
const lengthConfig = {
  in: {
    conversion: 1 / 12,
    label: "TERIOCK.LENGTH.in.label",
    plural: "TERIOCK.LENGTH.in.plural",
    scale: 0,
    symbol: "TERIOCK.LENGTH.in.symbol",
    system: "imperial",
  },
  ft: {
    conversion: 1,
    label: "TERIOCK.LENGTH.ft.label",
    plural: "TERIOCK.LENGTH.ft.plural",
    scale: 1,
    symbol: "TERIOCK.LENGTH.ft.symbol",
    system: "imperial",
  },
  mile: {
    conversion: 5280,
    label: "TERIOCK.LENGTH.mile.label",
    plural: "TERIOCK.LENGTH.mile.plural",
    scale: 2,
    symbol: "TERIOCK.LENGTH.mile.symbol",
    system: "imperial",
  },
};

export default lengthConfig;

preLocalizeObject("CONFIG.length", { keys: ["label", "plural", "symbol"] });
