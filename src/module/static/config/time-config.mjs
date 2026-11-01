import { preLocalizeObject } from "../../helpers/localization.mjs";

/** @enum {Teriock.Config.UnitEntry} */
// no sort
const timeConfig = {
  second: {
    conversion: 1,
    label: "TERIOCK.TIME.second.label",
    plural: "TERIOCK.TIME.second.plural",
    symbol: "TERIOCK.TIME.second.symbol",
  },
  minute: {
    conversion: 60,
    label: "TERIOCK.TIME.minute.label",
    plural: "TERIOCK.TIME.minute.plural",
    symbol: "TERIOCK.TIME.minute.symbol",
  },
  hour: {
    conversion: 60 * 60,
    label: "TERIOCK.TIME.hour.label",
    plural: "TERIOCK.TIME.hour.plural",
    symbol: "TERIOCK.TIME.hour.symbol",
  },
  day: {
    conversion: 60 * 60 * 24,
    label: "TERIOCK.TIME.day.label",
    plural: "TERIOCK.TIME.day.plural",
    symbol: "TERIOCK.TIME.day.symbol",
  },
  week: {
    conversion: 60 * 60 * 24 * 7,
    label: "TERIOCK.TIME.week.label",
    plural: "TERIOCK.TIME.week.plural",
    symbol: "TERIOCK.TIME.week.symbol",
  },
  year: {
    conversion: 60 * 60 * 24 * 365.25,
    label: "TERIOCK.TIME.year.label",
    plural: "TERIOCK.TIME.year.plural",
    symbol: "TERIOCK.TIME.year.symbol",
  },
};

export default timeConfig;

preLocalizeObject("CONFIG.time", { keys: ["label", "plural", "symbol"] });
