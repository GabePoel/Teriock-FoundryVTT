import { preLocalizeObject } from "../../helpers/localization.mjs";

/**
 * @import { CalendarConfigDays } from "@client/data/_types.mjs";
 */

/** @returns {CalendarConfigDays|undefined} */
const days = () => game?.time?.calendar?.days;

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
    label: "TERIOCK.TIME.minute.label",
    plural: "TERIOCK.TIME.minute.plural",
    symbol: "TERIOCK.TIME.minute.symbol",
    get conversion() {
      return days()?.secondsPerMinute ?? 60;
    },
  },
  hour: {
    label: "TERIOCK.TIME.hour.label",
    plural: "TERIOCK.TIME.hour.plural",
    symbol: "TERIOCK.TIME.hour.symbol",
    get conversion() {
      return timeConfig.minute.conversion * (days()?.minutesPerHour ?? 60);
    },
  },
  day: {
    label: "TERIOCK.TIME.day.label",
    plural: "TERIOCK.TIME.day.plural",
    symbol: "TERIOCK.TIME.day.symbol",
    get conversion() {
      return timeConfig.hour.conversion * (days()?.hoursPerDay ?? 24);
    },
  },
  week: {
    label: "TERIOCK.TIME.week.label",
    plural: "TERIOCK.TIME.week.plural",
    symbol: "TERIOCK.TIME.week.symbol",
    get conversion() {
      return timeConfig.day.conversion * (days()?.values.length || 7);
    },
  },
  year: {
    label: "TERIOCK.TIME.year.label",
    plural: "TERIOCK.TIME.year.plural",
    symbol: "TERIOCK.TIME.year.symbol",
    get conversion() {
      const { daysPerLeapYear, daysPerYear = 365.25 } = days() ?? {};
      const interval = game?.time?.calendar?.years.leapYear?.leapInterval;
      return timeConfig.day.conversion
        * (interval ? daysPerYear + (daysPerLeapYear - daysPerYear) / interval : daysPerYear);
    },
  },
};

export default timeConfig;

preLocalizeObject("CONFIG.time", { keys: ["label", "plural", "symbol"] });
