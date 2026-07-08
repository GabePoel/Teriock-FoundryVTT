import { makeIconClass } from "../../helpers/icon.mjs";

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
 * CSS class string for a raw competence level.
 * @param {Teriock.System.CompetenceLevel} level
 * @returns {string}
 */
function competenceIconClass(level) {
  if (level >= 2) { return makeIconClass(TERIOCK.display.icons.ui.filled2, "solid"); }
  if (level >= 1) { return makeIconClass(TERIOCK.display.icons.ui.filled1, "light"); }
  return makeIconClass(TERIOCK.display.icons.ui.filled0, "light");
}

/**
 * CSS class string for a modifier based on its competence.
 * @param {BaseModifierModel} modifier
 * @returns {string}
 */
function modifierIconClass(modifier) {
  return competenceIconClass(modifier.competence.raw);
}

/**
 * CSS class string for a tradecraft score.
 * @param {number} score
 * @returns {string}
 */
function tradecraftScoreIconClass(score) {
  if (score >= 3) { return "fa-fw fa-light mic ms-check-circle"; }
  if (score >= 2) { return "fa-fw fa-regular fa-check-double"; }
  if (score >= 1) { return "fa-fw fa-regular fa-check"; }
  return "fa-fw fa-regular fa-xmark";
}

/**
 * Localized label for a tradecraft score.
 * @param {number} score
 * @returns {string}
 */
function tradecraftScoreLabel(score) {
  return _loc(`TERIOCK.SHEETS.Actor.TABS.Tradecrafts.score.${Math.min(Math.max(score ?? 0, 0), 3)}`);
}

/**
 * CSS class for a hackable body part's icon.
 * @param {Foundry.BarField} [bar]
 * @returns {string}
 */
function hackFill(bar) {
  const max = bar?.max || 0;
  const value = bar?.value || 0;
  if (value === 0) { return "mic fa-solid"; }
  else if (value === max) { return "mic fa-faint"; }
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
  if (!temp) { return "display: none;"; }
  if (max === value && !morganti) { return "border-right: none;"; }
  return "";
}

/**
 * Infer a name from an identifier.
 * @param {Identifier} identifier
 * @returns {string}
 */
function getName(identifier) {
  return game.teriock.identifiers.getName(identifier, { forced: true });
}

const formattingHelperEntries = [
  ["barLeft", barLeft],
  ["barLost", barLost],
  ["barTemp", barTemp],
  ["barTempHide", barTempHide],
  ["competenceIconClass", competenceIconClass],
  ["getName", getName],
  ["hackFill", hackFill],
  ["modifierIconClass", modifierIconClass],
  ["tradecraftScoreIconClass", tradecraftScoreIconClass],
  ["tradecraftScoreLabel", tradecraftScoreLabel],
];

export default formattingHelperEntries;
