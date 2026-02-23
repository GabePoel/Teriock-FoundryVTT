import { elementClass } from "../../helpers/html.mjs";
import { getRollIcon } from "../../helpers/utils.mjs";

export default function registerFormattingHelpers() {
  Handlebars.registerHelper("firstDie", (str) => {
    if (typeof str !== "string") {
      str = "";
    }
    return getRollIcon(str);
  });

  Handlebars.registerHelper("elements", (elements) => {
    elements = Array.from(elements);
    let out = game.i18n.localize("TERIOCK.TERMS.Common.celestial");
    if (elements && elements.length > 0) {
      out = elements
        .map((e) => e.charAt(0).toUpperCase() + e.slice(1))
        .join(
          elements.length > 2
            ? ", "
            : elements.length === 2
              ? ` ${game.i18n.localize("TERIOCK.SYSTEMS.Ability.FIELDS.elderSorcery.elementJoin")} `
              : "",
        );
      if (elements.length > 1) {
        const lastComma = out.lastIndexOf(", ");
        if (lastComma !== -1) {
          out =
            out.substring(0, lastComma) +
            ` ${game.i18n.localize("TERIOCK.SYSTEMS.Ability.FIELDS.elderSorcery.elementJoin")}` +
            out.substring(lastComma + 1);
        }
      }
    }
    return out;
  });

  Handlebars.registerHelper("elementClass", (elements) => {
    return elementClass(elements);
  });

  Handlebars.registerHelper("hackFill", (part) => {
    const min = part?.min || 0;
    const max = part?.max || 0;
    const value = part?.value || 0;
    if (value === min) {
      return "solid";
    } else if (value === max) {
      return "regular";
    } else {
      return "duotone fa-regular";
    }
  });

  function normalizeBarInputs(value, max, temp = 0) {
    return {
      value: Math.max(0, value ?? 0),
      max: Math.max(0, max ?? 0),
      temp: Math.max(0, temp ?? 0),
    };
  }

  Handlebars.registerHelper("frac", (value, max) => (value / max) * 100);

  Handlebars.registerHelper("barLeft", (value, max, temp = 0) => {
    const { value: v, max: m, temp: t } = normalizeBarInputs(value, max, temp);
    return Math.floor((v / (m + t)) * 100);
  });

  Handlebars.registerHelper("barTemp", (value, max, temp = 0) => {
    const { max: m, temp: t } = normalizeBarInputs(value, max, temp);
    return Math.ceil((t / (m + t)) * 100);
  });

  Handlebars.registerHelper("barLost", (value, max, temp = 0) => {
    const { value: v, max: m, temp: t } = normalizeBarInputs(value, max, temp);
    const left = Math.floor((v / (m + t)) * 100);
    const tempP = Math.ceil((t / (m + t)) * 100);
    return 100 - left - tempP;
  });

  Handlebars.registerHelper("barTempHide", (value, max, temp = 0) => {
    if (temp === 0) {
      return "display: none;";
    }
    if (max === value) {
      return "border-right: none;";
    }
    return "";
  });
}
