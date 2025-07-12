import TeriockRoll from "../documents/roll.mjs";

/**
 * Creates an HTML icon element using Font Awesome classes.
 * @param {string} icon - The icon name to use.
 * @param {string} style - The Font Awesome style (solid, light, etc.). Defaults to "solid".
 * @returns {string} The HTML string for the icon element.
 */
export function makeIcon(icon, style = "solid") {
  return `<i class="fas fa-${style} fa-${icon}"></i>`;
}

/**
 * Converts a string to camelCase format.
 * @param {string} str - The string to convert.
 * @returns {string} The camelCase version of the string.
 */
export function toCamelCase(str) {
  return str
    .toLowerCase()
    .replace(/[-\s]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^[a-z]/, (c) => c.toLowerCase());
}

/**
 * Determines the appropriate dice icon based on the roll formula.
 * @param {string} rollFormula - The dice roll formula to analyze.
 * @returns {string} The Font Awesome class for the appropriate dice icon.
 */
export function getRollIcon(rollFormula) {
  const validDice = [4, 6, 8, 10, 12, 20];
  const roll = new TeriockRoll(rollFormula, {});
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
 * Converts an array of strings to camelCase format.
 * @param {string[]} names - The array of strings to convert.
 * @returns {string[]} An array of camelCase strings.
 */
export function toCamelCaseList(names) {
  return names.map((str) => toCamelCase(str));
}

/**
 * Creates a chat message with an image.
 * @param {string} img - The image URL to display in chat.
 * @returns {Promise<void>}
 */
export async function chatImage(img) {
  if (img) {
    await foundry.documents.ChatMessage.create({
      content: `
        <div
          class="timage"
          data-src="${img}"
          style="display: flex; justify-content: center;"
        >
          <img src="${img}" class="teriock-image" alt="Image">
        </div>`,
    });
  }
}

/**
 * Evaluates a die roll formula synchronously and returns the total result.
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
 * Evaluates a die roll formula synchronously and returns the total result.
 * Avoids having to generate roll data if it's not needed.
 * @param {string} formula - The dice roll formula to evaluate.
 * @param {TeriockActor|TeriockItem|TeriockEffect} document - The document to get roll data from.
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
  const rollData = document.actor?.getRollData() || document.getRollData() || {};
  return evaluateSync(formula, rollData, options);
}

/**
 * Evaluates a die roll formula asynchronously and returns the total result.
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
  return Number(roll.result);
}

/**
 * Parses a time string and returns a number of seconds.
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
 * Converts a number of seconds to a human-readable time string.
 * @param {number} totalSeconds - The total number of seconds to convert.
 * @returns {string} A human-readable time string.
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
 * @param {Object} obj - The source object to traverse and merge values from.
 * @param {string} path - Dot-separated path string, supports wildcards (`*`) for matching any key.
 * @param {string} [key] - Optional key to extract values from objects at the target path.
 * @returns {Object} The merged result object containing values found at the specified path and key.
 */
export function mergeLevel(obj, path, key) {
  const result = {};

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
