/** @import { Document } from "@common/abstract/_module.mjs"; */
import TeriockRoll from "../documents/roll.mjs";

/**
 * @param {string} icon
 * @param {string} style
 * @returns {string}
 */
export function makeIcon(icon, style = "solid") {
  return `<i class="fas fa-${style} fa-${icon}"></i>`;
}

/**
 * @param {string} str
 * @returns {string}
 */
export function toCamelCase(str) {
  return str
    .toLowerCase()
    .replace(/[-\s]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^[a-z]/, (c) => c.toLowerCase());
}

/**
 * @param {string} rollFormula
 * @returns {string}
 */
export function getRollIcon(rollFormula) {
  const validDice = [4, 6, 8, 10, 12, 20];
  const roll = new TeriockRoll(rollFormula);
  const dice = roll.dice;
  dice.sort((a, b) => b.faces - a.faces);
  for (const die of dice) {
    if (validDice.includes(die.faces)) {
      return `fas fa-dice-d${die.faces}`;
    }
  }
  return "fas fa-dice";
}

/**
 * @param {string[]} names
 * @returns {string[]}
 */
export function toCamelCaseList(names) {
  return names.map((str) => toCamelCase(str));
}

/**
 * @param {string} img
 * @returns {Promise<void>}
 */
export async function chatImage(img) {
  if (img) {
    await ChatMessage.create({
      content: `
        <div
          class="timage"
          data-src="${img}"
          style="display: flex; justify-content: center;"
        >
          <img src="${img}" class="teriock-image">
        </div>`,
    });
  }
}

/**
 * @param {string} string
 * @param {number} length
 * @returns {string}
 */
export function abbreviate(string, length = 3) {
  return string.toLowerCase().slice(0, length);
}

/**
 * Evaluates a dice roll formula synchronously and returns the total result.
 *
 * @param {string} formula - The dice roll formula to evaluate.
 * @param {Object} data - The roll data to use for the evaluation.
 * @param {Object} options - Options that get passed to the roll.
 * @returns {number} The total result of the evaluated roll.
 */
export function evaluateSync(formula, data = {}, options = {}) {
  if (!formula) {
    return 0;
  }
  if (typeof formula !== "string") {
    return 0;
  }
  if (!isNaN(Number(formula))) {
    return Number(formula);
  }
  const roll = new TeriockRoll(formula, data);
  roll.evaluateSync(options);
  return roll.total;
}

/**
 * Evaluates a dice roll formula synchronously and returns the total result.
 * Avoids having to generate roll data if it's not needed.
 *
 * @param {string} formula - The dice roll formula to evaluate.
 * @param {Document} document - The document to get roll data from.
 * @param {Object} options - Options that get passed to the roll.
 * @returns {number} The total result of the evaluated roll.
 */
export function smartEvaluateSync(formula, document, options = {}) {
  if (!formula) {
    return 0;
  }
  if (typeof formula !== "string") {
    return 0;
  }
  if (!isNaN(Number(formula))) {
    return Number(formula);
  }
  const rollData = document.getActor()?.getRollData() || {};
  return evaluateSync(formula, rollData, options);
}

/**
 * Evaluates a dice roll formula asynchronously and returns the total result.
 *
 * @param {string} formula - The dice roll formula to evaluate.
 * @param {Object} data - The roll data to use for the evaluation.
 * @param {Object} options - Options that get passed to the roll.
 * @returns {Promise<number>} The total result of the evaluated roll.
 */
export async function evaluateAsync(formula, data = {}, options = {}) {
  if (!formula) {
    return 0;
  }
  if (typeof formula !== "string") {
    return 0;
  }
  if (!isNaN(Number(formula))) {
    return Number(formula);
  }
  const roll = new TeriockRoll(formula, data);
  await roll.evaluate(options);
  return roll.result;
}

/**
 * Parses a time string and returns a number of seconds.
 *
 * @param {string} timeString - The time string to parse.
 * @returns {number|null} A number of seconds corresponding to the duration, or null if invalid.
 */
export function parseTimeString(timeString) {
  const cleanStr = timeString.toLowerCase().trim();
  const match = cleanStr.match(/^(\d+(?:\.\d+)?)\s*([a-z]+)$/);
  if (!match) {
    return null;
  }
  const value = parseFloat(match[1]);
  const unit = match[2];
  const units = {
    1: ["s", "sec", "secs", "second", "seconds"],
    60: ["m", "min", "mins", "minute", "minutes"],
    3600: ["h", "hr", "hrs", "hour", "hours"],
    86400: ["d", "day", "days"],
    604800: ["w", "week", "weeks"],
    31557600: ["y", "yr", "yrs", "year", "years"],
  };

  const conversions = Object.fromEntries(
    Object.entries(units).flatMap(([seconds, aliases]) => aliases.map((alias) => [alias, parseInt(seconds)])),
  );
  if (!(unit in conversions)) {
    return null;
  }
  return value * conversions[unit];
}

/**
 * @param {number} totalSeconds
 * @returns {string}
 */
export function secondsToReadable(totalSeconds) {
  if (totalSeconds < 0) {
    return "0 seconds";
  }
  const units = [
    { name: "year", seconds: 365.25 * 24 * 60 * 60 },
    { name: "week", seconds: 7 * 24 * 60 * 60 },
    { name: "day", seconds: 24 * 60 * 60 },
    { name: "hour", seconds: 60 * 60 },
    { name: "minute", seconds: 60 },
    { name: "second", seconds: 1 },
  ];
  const parts = [];
  let remaining = Math.floor(totalSeconds);
  for (const unit of units) {
    const count = Math.floor(remaining / unit.seconds);
    if (count > 0) {
      parts.push(`${count} ${unit.name}${count > 1 ? "s" : ""}`);
      remaining -= count * unit.seconds;
    }
  }
  return parts.length > 0 ? parts.join(", ") : "0 sec";
}

/**
 * Merges values from a nested object structure based on a dot-separated path and an optional key.
 *
 * Traverses the given object (`obj`) following the specified `path`, which can include wildcards (`*`)
 * to match any key at that level. If a `key` is provided, only values associated with that key are merged
 * into the result. If no `key` is provided, all values at the target path are merged.
 *
 * @param {Object} obj - The source object to traverse and merge values from.
 * @param {string} path - Dot-separated path string, supports wildcards (`*`) for matching any key.
 * @param {string} [key] - Optional key to extract values from objects at the target path.
 * @returns {Object} The merged result object containing values found at the specified path and key.
 */
export function mergeLevel(obj, path, key) {
  const result = {};

  function getValueAtPath(object, pathArray) {
    return pathArray.reduce((current, segment) => {
      if (current === null || current === undefined) return undefined;
      return current[segment];
    }, object);
  }

  function processPath(object, pathSegments, currentIndex = 0) {
    if (currentIndex >= pathSegments.length) {
      if (key) {
        if (typeof object === "object" && object !== null) {
          if (key in object) {
            Object.assign(result, object[key]);
          } else {
            Object.keys(object).forEach((itemKey) => {
              if (object[itemKey] && typeof object[itemKey] === "object" && key in object[itemKey]) {
                result[itemKey] = object[itemKey][key];
              }
            });
          }
        }
      } else {
        Object.assign(result, object);
      }
      return;
    }

    const currentSegment = pathSegments[currentIndex];

    if (currentSegment === "*") {
      if (typeof object === "object" && object !== null) {
        Object.keys(object).forEach((objKey) => {
          processPath(object[objKey], pathSegments, currentIndex + 1);
        });
      }
    } else {
      if (object && typeof object === "object" && currentSegment in object) {
        processPath(object[currentSegment], pathSegments, currentIndex + 1);
      }
    }
  }

  const pathSegments = path.split(".");

  processPath(obj, pathSegments);

  return result;
}
