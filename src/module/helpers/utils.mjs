import TeriockRoll from "../documents/roll.mjs";

/**
 * Convert the given unit to feet.
 * @param {number} range
 * @param {string} units
 * @returns {number}
 */
export function fromFeet(range, units) {
  switch (units) {
    case "in":
      return range / 12;
    case "ft":
      return range;
    case "yd":
      return range * 3;
    case "mi":
      return range * 1760;
    case "mm":
      return (range * 10) / 3000;
    case "cm":
      return (range * 10) / 300;
    case "dm":
      return (range * 10) / 30;
    case "m":
      return (range * 10) / 3;
    case "km":
      return (range * 10000) / 3;
    default:
      return range;
  }
}

/**
 * Convert from feet to the given unit.
 * @param {number} range
 * @param {string} units
 * @returns {number}
 */
export function toFeet(range, units) {
  switch (units) {
    case "in":
      return range * 12;
    case "ft":
      return range;
    case "yd":
      return range / 3;
    case "mi":
      return range / 1760;
    case "mm":
      return (range * 3000) / 10;
    case "cm":
      return (range * 300) / 10;
    case "dm":
      return (range * 30) / 10;
    case "m":
      return (range * 3) / 10;
    case "km":
      return (range * 3) / 10000;
    default:
      return range;
  }
}

/**
 * Convert between two units.
 * @param {number} range
 * @param {string} fromUnits
 * @param {string} toUnits
 * @returns {number}
 */
export function convertUnits(range, fromUnits, toUnits) {
  return toFeet(fromFeet(range, fromUnits), toUnits);
}

/**
 * Remove indentation from code block.
 * @param {string} str
 * @returns {string}
 */
export function dedent(str) {
  const lines = str.split("\n");
  const minIndent = lines
    .filter((line) => line.trim())
    .reduce((min, line) => {
      const match = line.match(/^(\s*)/);
      return Math.min(min, match ? match[1].length : 0);
    }, Infinity);
  return lines.map((line) => line.slice(minIndent)).join("\n");
}

/**
 * Convert a UUID to a string that can be safely used as a key in some document's system data.
 * @template T
 * @param {Teriock.UUID<T>} uuid - The UUID to convert.
 * @returns {Teriock.SafeUUID<T>} The converted safe UUID.
 */
export function safeUuid(uuid) {
  return /** @type {Teriock.SafeUUID<T>} */ (uuid.replace(/\./g, "_"));
}

/**
 * Convert a UUID to a string that can be safely used as a key in some document's system data.
 * @template T
 * @param {Teriock.SafeUUID<T>} safeUuid - The safe UUID to convert.
 * @returns {Teriock.UUID<T>} The original UUID.
 */
export function pureUuid(safeUuid) {
  return /** @type {Teriock.UUID<T>} */ (safeUuid.replace(/_/g, "."));
}

/**
 * Re-pull each provided {@link ChildDocumentMixin} from the wiki.
 * @param {TeriockEffect[]|TeriockItem[]} docs - An array of {@link ChildDocumentMixin}s to pull.
 * @param {object} [options]
 * @param {boolean} [options.skipSubs] - Skip any {@link TeriockEffect} subs.
 * @returns {Promise<void>}
 */
export async function refreshDocuments(docs, options = { skipSubs: true }) {
  const skipSubs = options?.skipSubs;
  const progress = ui.notifications.info(`Refreshing documents from wiki.`, {
    progress: true,
  });
  let pct = 0;
  for (const doc of docs) {
    progress.update({
      message: `Refreshing ${doc.name}.`,
      pct: pct,
    });
    if (skipSubs && doc.documentName === "ActiveEffect" && doc.sup) continue;
    if (doc.system.constructor.metadata.wiki) {
      await doc.system.wikiPull({ notify: false });
    }
    pct += 1 / docs.length;
    progress.update({
      message: `Refreshing ${doc.name}.`,
      pct: pct,
    });
  }
  progress.update({ pct: 1 });
}

/**
 * Designates a specific {@link TeriockUser} for a given {@link TeriockActor}.
 * @param {TeriockActor} actor
 * @returns {TeriockUser|null}
 */
export function selectUser(actor) {
  const users = /** @type {WorldCollection<TeriockUser>} */ game.users;
  /** @type {TeriockUser|null} */
  let selectedUser = null;
  // See if any user has the actor as a character
  users.forEach(
    /** @param {TeriockUser} user */ (user) => {
      if (user.character?.uuid === actor.uuid && user.isActive) {
        selectedUser = user;
      }
    },
  );
  // See if any players have control over the actor
  if (!selectedUser) {
    users.forEach(
      /** @param {TeriockUser} user */ (user) => {
        if (!user.isActiveGM && actor.canUserModify(user, "update")) {
          selectedUser = user;
        }
      },
    );
  }
  // See if anyone has control over the actor
  if (!selectedUser) {
    users.forEach(
      /** @param {TeriockUser} user */ (user) => {
        if (actor.canUserModify(user, "update")) {
          selectedUser = user;
        }
      },
    );
  }
  return selectedUser;
}

/**
 * Get the image for a {@link Token}.
 * @param {Token} token
 * @returns {string}
 */
export function tokenImage(token) {
  const tokenDoc = tokenDocument(token);
  return (
    tokenDoc?.texture?.src ||
    tokenDoc?.actor.token?.texture?.src ||
    tokenDoc?.actor.getActiveTokens()[0]?.texture?.src ||
    tokenDoc?.actor.prototypeToken?.texture?.src ||
    tokenDoc?.actor.img ||
    token?.texture?.src ||
    token?.actor.token?.texture?.src ||
    token?.actor.getActiveTokens()[0]?.texture?.src ||
    token?.actor.prototypeToken?.texture?.src ||
    token.actor.img
  );
}

/**
 * Get the name for a {@link Token}.
 * @param {Token} token
 * @returns {string}
 */
export function tokenName(token) {
  const tokenDoc = tokenDocument(token);
  return (
    tokenDoc?.name ||
    tokenDoc?.actor.token?.name ||
    tokenDoc?.actor.prototypeToken?.name ||
    tokenDoc?.actor.name ||
    token?.name ||
    token?.actor.token?.name ||
    token?.actor.prototypeToken?.name ||
    token.actor.name
  );
}

/**
 * Get the token for a {@link TeriockActor}.
 * @param {TeriockActor} actor
 * @returns {TeriockTokenDocument|null}
 */
export function actorToken(actor) {
  return (
    actor.token ||
    actor.getActiveTokens?.()?.[0] ||
    actor.prototypeToken ||
    null
  );
}

/**
 * Get the actor for a {@link Token}.
 * @param {Token} token
 * @returns {TeriockActor}
 */
export function tokenActor(token) {
  return token.actor;
}

/**
 * Get the document for a {@link Token}.
 * @param {Token} token
 * @returns {TeriockTokenDocument}
 */
export function tokenDocument(token) {
  return /** @type {TeriockTokenDocument} */ token.document;
}

/**
 * Creates an HTML icon element using Font Awesome classes.
 * @param {string} icon - The icon name to use.
 * @param {...Teriock.UI.IconStyle} styles - One or more Font Awesome style names (e.g., "solid", "duotone").
 * @returns {string} The HTML string for the icon element.
 */
export function makeIcon(icon, ...styles) {
  const styleClasses = styles.map(
    (s) => CONFIG.TERIOCK.display.iconStyles[s] || s,
  );
  const classString = styleClasses.map((s) => `fa-${s}`).join(" ");
  return `<i class="${classString} fa-${icon}"></i>`;
}

/**
 * Determines the appropriate dice icon based on the roll formula.
 * @param {string} rollFormula - The dice roll formula to analyze.
 * @returns {string} The Font Awesome class for the appropriate dice icon.
 */
export function getRollIcon(rollFormula) {
  const polyhedralDice = [4, 6, 8, 10, 12, 20];
  const roll = new TeriockRoll(rollFormula, {});
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
 * Avoids having to generate roll data if it's unnecessary.
 * @param {string} formula - The dice roll formula to evaluate.
 * @param {TeriockActor|TeriockItem|TeriockEffect} document - The document to get roll data from.
 * @param {Object} options - Options that get passed to the roll.
 * @returns {number} The total result of the evaluated roll.
 */
export function smartEvaluateSync(formula, document, options = { fail: 0 }) {
  const fail = options?.fail || 0;
  if (!formula) {
    return fail;
  }
  if (typeof formula !== "string") {
    return fail;
  }
  if (!isNaN(Number(formula))) {
    return Number(formula);
  }
  if (document.actor) {
    return evaluateSync(formula, document.actor, options);
  } else {
    return evaluateSync(formula, {}, options);
  }
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
 * Parses a duration string and returns a duration.
 * @param durationString
 * @returns {Duration}
 */
export function parseDurationString(durationString) {
  let parsingString = durationString.trim().toLowerCase().replace(/\.$/, "");
  let parsedUnit = "noLimit";
  let parsedQuantity = parseInt(parsingString) || 0;
  let parsedAbsentConditions = new Set();
  let parsedPresentConditions = new Set();
  // Handle special cases first
  if (parsingString === "while up") {
    parsedAbsentConditions.add("down");
  } else if (parsingString === "while alive") {
    parsedAbsentConditions.add("dead");
  } else if (parsingString === "instant") {
    parsedUnit = "instant";
  } else if (parsingString === "until dawn") {
    parsedUnit = "untilDawn";
  } else {
    // General condition parsing
    for (const condition of Object.keys(CONFIG.TERIOCK.index.conditions)) {
      if (parsingString.includes("not " + condition)) {
        parsedAbsentConditions.add(condition);
      } else if (parsingString.includes(condition)) {
        parsedPresentConditions.add(condition);
      }
    }
  }
  const parsedStationary = parsingString.includes("stationary");
  // Use word boundaries for unit matching to avoid partial matches
  for (const unit of Object.keys(
    CONFIG.TERIOCK.options.ability.duration.unit,
  )) {
    const regex = new RegExp(`\\b${unit}s?\\b`);
    if (regex.test(parsingString)) {
      parsedUnit = unit;
      break;
    }
  }

  return {
    unit: parsedUnit,
    quantity: parsedQuantity,
    description: durationString,
    conditions: {
      absent: parsedAbsentConditions,
      present: parsedPresentConditions,
    },
    stationary: parsedStationary,
  };
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
    Object.entries(units).flatMap(([seconds, aliases]) =>
      aliases.map((alias) => [alias, parseInt(seconds)]),
    ),
  );
  if (!(unit in conversions)) {
    return null;
  }
  return value * conversions[unit];
}

/**
 * Converts a number of seconds to a human-readable time string.
 *
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
    { name: "hr", seconds: 60 * 60 },
    { name: "min", seconds: 60 },
    { name: "sec", seconds: 1 },
  ];
  const parts = [];
  let remaining = Math.floor(totalSeconds);
  for (const unit of units) {
    const count = Math.floor(remaining / unit.seconds);
    if (count > 0) {
      // parts.push(`${count} ${unit.name}${count > 1 ? "s" : ""}`);
      parts.push(`${count} ${unit.name}`);
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

  function processPath(object, pathSegments, currentIndex = 0) {
    if (currentIndex >= pathSegments.length) {
      if (key) {
        if (typeof object === "object" && object !== null) {
          if (key in object) {
            Object.assign(result, object[key]);
          } else {
            Object.keys(object).forEach((itemKey) => {
              if (
                object[itemKey] &&
                typeof object[itemKey] === "object" &&
                key in object[itemKey]
              ) {
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

/**
 * Unfreeze, merge, and refreeze two objects.
 * @template T
 * @param {Readonly<T>} original
 * @param {Partial<T>} other
 * @returns Readonly<T>
 */
export function mergeFreeze(original, other) {
  return foundry.utils.deepFreeze(
    foundry.utils.mergeObject(
      foundry.utils.deepClone(original),
      foundry.utils.deepClone(other),
    ),
  );
}

/**
 * Wrapper to freeze an object with proper typing.
 * @template T
 * @param {T} obj
 * @returns {Readonly<T>}
 */
export function freeze(obj) {
  return foundry.utils.deepFreeze(obj);
}

/**
 * Check if the {@link TeriockUser} owns and uses the given document.
 * @param {ClientDocument} document
 * @param {string} userId
 * @returns {boolean}
 */
export function isOwnerAndCurrentUser(document, userId) {
  return game.user.id === userId && document.isOwner;
}
