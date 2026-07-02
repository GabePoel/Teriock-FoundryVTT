import { iconStyles } from "../constants/display/icon-styles.mjs";

/**
 * Creates an HTML icon using Font Awesome, Material Design, or Material Symbols classes.
 * @param {string} icon - The icon name to use.
 * @param {...Teriock.UI.IconStyle} styles - One or more style names or an alias (e.g., "solid", "duotone", "title").
 * @returns {string} The HTML string for the icon element.
 */
export function makeIcon(icon, ...styles) {
  const classString = makeIconClass(icon, ...styles);
  return `<i class="${classString}"></i>`;
}

/**
 * Creates an HTML icon element using Font Awesome, Material Design, or Material Symbols classes.
 * @param {string} icon - The icon name to use.
 * @param {...Teriock.UI.IconStyle} styles - One or more style names or an alias (e.g., "solid", "duotone", "title").
 * @returns {HTMLElement}
 */
export function makeIconElement(icon, ...styles) {
  return teriock.helpers.html.createElement("i", { className: makeIconClass(icon, ...styles) });
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
  const styleClasses = styles.map(s => iconStyles[s] || s).filter(s => typeof s === "string");
  if (icon.startsWith("ms-")) { start += " mic"; }
  if (icon.startsWith("mdi-")) {
    start += " mdi";
    if (styleClasses.includes("light") || styleClasses.includes("regular")) { icon = `${icon} ${icon}-outline`; }
  }
  const classString = styleClasses.map(s => `${prefix}${s}`).join(" ");
  return `${start} ${classString} ${icon}`;
}

/**
 * Determines the appropriate dice icon based on the roll formula.
 * @param {string} rollFormula - The dice roll formula to analyze.
 * @returns {string} The Font Awesome class for the appropriate dice icon.
 */
export function getRollIcon(rollFormula) {
  const polyhedralDice = [4, 6, 8, 10, 12, 20];
  const roll = new teriock.dice.rolls.BaseRoll(rollFormula, {});
  const dice = roll.dice;
  dice.sort((a, b) => b.faces - a.faces);
  for (const die of dice) {
    if (polyhedralDice.includes(die.faces)) { return `fa-dice-d${die.faces}`; }
    else if (die.faces === 2) { return "fa-coins"; }
    else if (die.faces === 100) { return "fa-percent"; }
  }
  return "fa-dice";
}
