import { inferNameFromIdentifier, makeIconClass } from "../../helpers/utils.mjs";

/**
 * Clamp bar inputs to non-negative numbers for percentage helpers.
 * @param {number} value
 * @param {number} max
 * @param {number} [temp=0]
 * @returns {{ max: number, temp: number, value: number }}
 */
function normalizeBarInputs(value, max, temp = 0) {
  return { max: Math.max(0, max ?? 0), temp: Math.max(0, temp ?? 0), value: Math.max(0, value ?? 0) };
}

/**
 * CSS class string for a modifier based on its competence.
 * @param {BaseModifierModel} modifier
 * @returns {string}
 */
function modifierIconClass(modifier) {
  if (modifier.competence.fluent) return makeIconClass(TERIOCK.display.icons.ui.filled2, "solid");
  if (modifier.competence.proficient) return makeIconClass(TERIOCK.display.icons.ui.filled1, "light");
  return makeIconClass(TERIOCK.display.icons.ui.filled0, "light");
}

/**
 * CSS class for a hackable body part's icon.
 * @param {Foundry.BarField} [bar]
 * @returns {string}
 */
function hackFill(bar) {
  const max = bar?.max || 0;
  const value = bar?.value || 0;
  if (value === 0) return "mic fa-solid";
  else if (value === max) return "mic fa-faint";
  return "mic fa-intermediate";
}

/**
 * Percentage width of the remaining portion of a stat bar.
 * @param {number} value
 * @param {number} max
 * @param {number} [temp=0]
 * @returns {number}
 */
function barLeft(value, max, temp = 0) {
  const { max: m, temp: t, value: v } = normalizeBarInputs(value, max, temp);
  return Math.floor((v / (m + t)) * 100);
}

/**
 * Percentage width of the temp portion of a stat bar.
 * @param {number} value
 * @param {number} max
 * @param {number} [temp=0]
 * @returns {number}
 */
function barTemp(value, max, temp = 0) {
  const { max: m, temp: t } = normalizeBarInputs(value, max, temp);
  return Math.ceil((t / (m + t)) * 100);
}

/**
 * Percentage width of the lost portion of a stat bar.
 * @param {number} value
 * @param {number} max
 * @param {number} [temp=0]
 * @returns {number}
 */
function barLost(value, max, temp = 0) {
  const { max: m, temp: t, value: v } = normalizeBarInputs(value, max, temp);
  const left = Math.floor((v / (m + t)) * 100);
  const tempP = Math.ceil((t / (m + t)) * 100);
  return 100 - left - tempP;
}

/**
 * Inline style snippet which controls whether the right border of a stat bar is displayed.
 * @param {number} value
 * @param {number} max
 * @param {number} [temp=0]
 * @param {number} [morganti=0]
 * @returns {string}
 */
function barTempHide(value, max, temp = 0, morganti = 0) {
  if (!temp) return "display: none;";
  if (max === value && !morganti) return "border-right: none;";
  return "";
}

const formattingHelperEntries = [
  ["barLeft", barLeft],
  ["barLost", barLost],
  ["barTemp", barTemp],
  ["barTempHide", barTempHide],
  ["hackFill", hackFill],
  ["inferName", inferNameFromIdentifier],
  ["modifierIconClass", modifierIconClass],
];

export default formattingHelperEntries;
