import { iconStyles } from "../constants/display/_module.mjs";
import { BaseRoll } from "../dice/rolls/_module.mjs";

/**
 * Creates an HTML icon using Font Awesome classes.
 * @param {string} icon - The icon name to use.
 * @param {...Teriock.UI.IconStyle} styles - One or more Font Awesome style names (e.g., "solid", "duotone").
 * @returns {string} The HTML string for the icon element.
 */
export function makeIcon(icon, ...styles) {
  const classString = makeIconClass(icon, ...styles);
  return `<i class="${classString}"></i>`;
}

/**
 * Creates an HTML icon element using Font Awesome classes.
 * @param {string} icon - The icon name to use.
 * @param {...Teriock.UI.IconStyle} styles - One or more Font Awesome style names (e.g., "solid", "duotone").
 * @returns {HTMLElement}
 */
export function makeIconElement(icon, ...styles) {
  const iconElement = document.createElement("i");
  iconElement.className = makeIconClass(icon, ...styles);
  return iconElement;
}

/**
 * Creates the class for an HTML icon element using Font Awesome classes.
 * @param {string} icon - The icon name to use.
 * @param {...Teriock.UI.IconStyle} styles - One or more Font Awesome style names (e.g., "solid", "duotone").
 * @returns {string} The HTML string for the icon element.
 */
export function makeIconClass(icon, ...styles) {
  if (!icon) return "";
  const styleClasses = styles
    .map((s) => iconStyles[s] || s)
    .filter((s) => typeof s === "string");
  const classString = styleClasses.map((s) => `fa-${s}`).join(" ");
  if (!icon.startsWith("fa-")) {
    icon = `fa-${icon}`;
  }
  return `fa-fw ${classString} ${icon}`;
}

/**
 * Determines the appropriate dice icon based on the roll formula.
 * @param {string} rollFormula - The dice roll formula to analyze.
 * @returns {string} The Font Awesome class for the appropriate dice icon.
 */
export function getRollIcon(rollFormula) {
  const polyhedralDice = [4, 6, 8, 10, 12, 20];
  const roll = new BaseRoll(rollFormula, {});
  const dice = roll.dice;
  dice.sort((a, b) => b.faces - a.faces);
  for (const die of dice) {
    if (polyhedralDice.includes(die.faces)) {
      return `dice-d${die.faces}`;
    } else if (die.faces === 2) {
      return "coin";
    } else if (die.faces === 100) {
      return "hundred-points";
    }
  }
  return "dice";
}

/**
 * Make fields fancy.
 * @param {Teriock.Sheet.DisplayField[]} displayFields
 * @returns {Teriock.Sheet.FancyDisplayField[]}
 */
export function fancifyFields(displayFields) {
  return displayFields
    .map((f) => {
      let fancy;
      if (typeof f === "string") {
        fancy = { path: f };
      } else {
        fancy = f;
      }
      const {
        classes = "",
        dataset = {},
        editable = true,
        label = "",
        path = fancy.path,
        visible = true,
      } = fancy;
      return {
        classes,
        dataset,
        editable,
        label,
        path,
        visible,
      };
    })
    .filter((f) => f.visible);
}

/**
 * Iterate through an array with a progress bar using batched processing.
 * @param {Array} arr
 * @param {string} message
 * @param {Function} callback
 * @param {object} [options]
 * @param {number} [options.batch=1]
 * @param {"info"|"success"|"warn"|"error"} [options.style="info"]
 */
export async function progressBar(arr, message, callback, options = {}) {
  const { batch = 1, style = "info" } = options;
  const count = arr.length;
  const progress = ui.notifications[style](message, {
    pct: 0,
    progress: true,
  });
  for (let i = 0; i < count; i += batch) {
    const chunk = arr.slice(i, i + batch);
    await Promise.all(chunk.map((item) => callback(item)));
    ui.notifications.update(progress, {
      pct: Math.min((i + batch) / count, 1),
    });
  }
}

/**
 * Prefix all keys in some object.
 * @param {object} obj
 * @param {string} prefix
 * @returns {object}
 */
export function prefixObject(obj, prefix) {
  return Object.fromEntries(
    Object.entries(foundry.utils.flattenObject(obj)).map(([k, v]) => [
      k.length > 0 ? `${prefix}.${k}` : prefix,
      v,
    ]),
  );
}

/**
 * Mixes a base class with any number of mixins.
 * @param {Class} Base - The class to be extended.
 * @param {Function[]} Mixins - The mixin functions to apply.
 * @returns {Class} The combined class.
 */
export function mix(Base, ...Mixins) {
  return Mixins.reduce((cls, mixin) => mixin(cls), Base);
}

/**
 * Sort an object by its keys.
 * @template T
 * @param {T} obj
 * @param {object} [options]
 * @param {boolean} [options.value]
 * @returns {T}
 */
export function sortObject(obj, options = {}) {
  const sortIndex = options.value ? 1 : 0;
  return Object.fromEntries(
    Object.entries(obj).sort((a, b) => {
      return a[sortIndex].toString().localeCompare(b[sortIndex].toString());
    }),
  );
}

/**
 * Map the values of an object.
 * @template T
 * @template U
 * @param {Record<string, T>} obj
 * @param {(T) => U} fn
 * @returns {Record<string, U>}
 */
export function objectMap(obj, fn) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v)]));
}
