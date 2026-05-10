import {
  inferNameFromIdentifier,
  makeIconClass,
} from "../../helpers/utils.mjs";

export default function registerFormattingHelpers() {
  Handlebars.registerHelper("modifierIconClass", (modifier) => {
    if (modifier.competence.fluent) {
      return makeIconClass(TERIOCK.display.icons.ui.filled2, "solid");
    }
    if (modifier.competence.proficient) {
      return makeIconClass(TERIOCK.display.icons.ui.filled1, "light");
    }
    return makeIconClass(TERIOCK.display.icons.ui.filled0, "light");
  });

  Handlebars.registerHelper("hackFill", (part) => {
    const min = part?.min || 0;
    const max = part?.max || 0;
    const value = part?.value || 0;
    if (value === min) return "mic fa-solid";
    else if (value === max) return "mic fa-faint";
    return "mic fa-intermediate";
  });

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
    if (temp === 0) return "display: none;";
    if (max === value) return "border-right: none;";
    return "";
  });

  Handlebars.registerHelper("inferName", inferNameFromIdentifier);
}

function normalizeBarInputs(value, max, temp = 0) {
  return {
    max: Math.max(0, max ?? 0),
    temp: Math.max(0, temp ?? 0),
    value: Math.max(0, value ?? 0),
  };
}
