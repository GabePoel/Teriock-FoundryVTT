import { icons } from "../static/display/_module.mjs";
import { createElement } from "./display.mjs";

/**
 * Creates an HTML icon using Font Awesome, Material Design, or Material Symbols classes.
 * @param {string} icon - The icon name to use.
 * @param {...Teriock.UI.IconStyle} styles - One or more style names or an alias (e.g., "solid", "duotone", "title").
 * @returns {string} The HTML string for the icon element.
 */
export function makeIcon(icon, ...styles) {
  return `<i class="${makeIconClass(icon, ...styles)}"></i>`;
}

/**
 * Creates an HTML icon element using Font Awesome, Material Design, or Material Symbols classes.
 * @param {string} icon - The icon name to use.
 * @param {...Teriock.UI.IconStyle} styles - One or more style names or an alias (e.g., "solid", "duotone", "title").
 * @returns {HTMLElement}
 */
export function makeIconElement(icon, ...styles) {
  return createElement("i", { className: makeIconClass(icon, ...styles) });
}

/**
 * Creates the class for an HTML icon element using Font Awesome, Material Design, or Material Symbols classes.
 * @param {string} icon - The icon name to use.
 * @param {...Teriock.UI.IconStyle} styles - One or more style names or an alias (e.g., "solid", "duotone", "title").
 * @returns {string} The HTML string for the icon element.
 */
export function makeIconClass(icon, ...styles) {
  if (!icon) { return ""; }
  const prefix = "fa-";
  let start = "fa-fw";
  const styleClasses = styles.map(s => icons.styles[s] || s).filter(s => typeof s === "string");
  if (icon.startsWith("ms-")) { start += " mic"; }
  if (icon.startsWith("mdi-")) {
    start += " mdi";
    if (styleClasses.includes("light") || styleClasses.includes("regular")) { icon = `${icon} ${icon}-outline`; }
  }
  if (icon.startsWith(prefix) && styleClasses.every(s => ["fw", "inline"].includes(s))) { styleClasses.push("solid"); }
  const classString = styleClasses.map(s => `${prefix}${s}`).join(" ");
  return `${start} ${classString} ${icon}`;
}

/**
 * Determines the appropriate dice icon based on the roll formula.
 * @param {string} rollFormula - The dice roll formula to analyze.
 * @returns {string} The CSS class for the appropriate dice icon.
 */
export function getRollIcon(rollFormula) {
  const dice = new teriock.dice.rolls.BaseRoll(rollFormula, {}).dice.sort((a, b) => b.faces - a.faces);
  return TERIOCK.DISPLAY.icons.manifest.dice[`d${dice[0]?.faces}`] ?? TERIOCK.DISPLAY.icons.manifest.ui.dice;
}

/**
 * Format a string to an infinity icon if it's null.
 * @param {string|number|null} val
 * @returns {string}
 */
export function asInf(val) {
  if (["", Infinity, null, undefined].includes(val)) {
    return makeIcon(TERIOCK.DISPLAY.icons.manifest.ui.infinity, "text");
  }
  return val;
}
