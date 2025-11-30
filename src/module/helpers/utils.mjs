import { iconStyles } from "../constants/display/_module.mjs";
import { TeriockRoll } from "../dice/_module.mjs";
import { TypeCollection } from "../documents/collections/_module.mjs";
import { getAbility, getItem, getProperty } from "./fetch.mjs";
import { systemPath } from "./path.mjs";

const { Document } = foundry.abstract;

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
 * Sort conditions.
 * @param {Teriock.Parameters.Condition.ConditionKey[]} conditions
 */
export function conditionSort(conditions) {
  conditions.sort((a, b) => {
    if (a === "dead") {
      return -1;
    }
    if (b === "dead") {
      return 1;
    }
    if (a === "unconscious") {
      return b === "dead" ? 1 : -1;
    }
    if (b === "unconscious") {
      return a === "dead" ? -1 : 1;
    }
    if (a === "down") {
      if (b === "dead" || b === "unconscious") {
        return 1;
      }
      return -1;
    }
    if (b === "down") {
      if (a === "dead" || a === "unconscious") {
        return -1;
      }
      return 1;
    }
    return a.localeCompare(b);
  });
  return conditions;
}

/**
 * Sort documents.
 * @template T
 * @param {T[]} docs
 * @param {object} [options]
 * @param {boolean} [options.alphabetical]
 * @returns {T[]}
 */
export function docSort(docs, options = {}) {
  return docs.sort((a, b) => {
    if (!options.alphabetical) {
      if (a.sort !== b.sort) {
        return a.sort - b.sort;
      }
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Sort ranks.
 * @param {TeriockRank[]} ranks
 * @returns {TeriockRank[]}
 */
export function rankSort(ranks) {
  return ranks.sort((a, b) => {
    if (a.system.innate !== b.system.innate) {
      return a.system.innate ? -1 : 1;
    }
    return a.sort - b.sort;
  });
}

/**
 * Sort abilities.
 * @param {TeriockAbility[]} abilities
 * @returns {TeriockAbility[]}
 */
export function abilitySort(abilities) {
  const abilityFormOrder = Object.keys(TERIOCK.options.ability.form || {});
  return abilities.sort((a, b) => {
    const typeA = a.system?.form || "";
    const typeB = b.system?.form || "";
    const indexA = abilityFormOrder.indexOf(typeA);
    const indexB = abilityFormOrder.indexOf(typeB);
    if (indexA !== indexB) {
      return indexA - indexB;
    }
    return (a.name || "").localeCompare(b.name || "");
  });
}

/**
 * Sort properties.
 * @param {TeriockProperty[]} properties
 * @returns {TeriockProperty[]}
 */
export function propertySort(properties) {
  const propertyFormOrder = Object.keys(TERIOCK.options.ability.form || {});
  return properties.sort((a, b) => {
    const typeA = a.system?.form || "";
    const typeB = b.system?.form || "";
    const indexA = propertyFormOrder.indexOf(typeA);
    const indexB = propertyFormOrder.indexOf(typeB);
    if (indexA !== indexB) {
      return indexA - indexB;
    }
    return (a.name || "").localeCompare(b.name || "");
  });
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
 * @param {UUID<T>} uuid - The UUID to convert.
 * @returns {SafeUUID<T>} The converted safe UUID.
 */
export function safeUuid(uuid) {
  return /** @type {SafeUUID<*>} */ (uuid.replace(/\./g, "_"));
}

/**
 * Convert a UUID to a string that can be safely used as a key in some document's system data.
 * @template T
 * @param {SafeUUID<T>} safeUuid - The safe UUID to convert.
 * @returns {UUID<T>} The original UUID.
 */
export function pureUuid(safeUuid) {
  return /** @type {UUID<T>} */ (safeUuid.replace(/_/g, "."));
}

/**
 * Re-pull each provided {@link ChildDocumentMixin} from the wiki.
 * @param {TeriockChild[]} docs - An array of {@link TeriockChild} documents to pull.
 * @param {object} [options]
 * @param {boolean} [options.skipSubs] - Skip any {@link TeriockEffect} findSubs.
 * @returns {Promise<void>}
 */
export async function refreshDocuments(docs, options = { skipSubs: true }) {
  const skipSubs = options?.skipSubs;
  const progress = foundry.ui.notifications.info(
    `Refreshing documents from wiki.`,
    {
      progress: true,
    },
  );
  let pct = 0;
  for (const doc of docs) {
    progress.update({
      message: `Refreshing ${doc.name}.`,
      pct: pct,
    });
    if (skipSubs && doc.documentName === "ActiveEffect" && doc.sup) {
      continue;
    }
    if (doc.metadata.wiki) {
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
  let selectedUser = null;
  // See if any user has the actor as a character
  game.users.forEach((user) => {
    if (user.character?.uuid === actor.uuid && user.active) {
      selectedUser = user;
    }
  });
  // See if any players have control over the actor
  if (!selectedUser) {
    game.users.forEach((user) => {
      if (
        !user.isActiveGM &&
        actor.canUserModify(user, "update") &&
        user.active
      ) {
        selectedUser = user;
      }
    });
  }
  // See if anyone has control over the actor
  if (!selectedUser) {
    game.users.forEach((user) => {
      if (actor.canUserModify(user, "update") && user.active) {
        selectedUser = user;
      }
    });
  }
  if (!selectedUser) {
    selectedUser = game.users.activeGM;
  }
  return selectedUser;
}

/**
 * Modify a change's prefix.
 * @param {EffectChangeData} change
 * @param {string} searchValue
 * @param {string} replaceValue
 * @returns {EffectChangeData}
 */
export function modifyChangePrefix(change, searchValue, replaceValue) {
  return {
    key: change.key.replace(searchValue, replaceValue),
    mode: change.mode,
    priority: change.priority,
    value: change.value,
  };
}

/**
 * Get the token for a {@link TeriockActor}.
 * @param {TeriockActor} actor
 * @returns {TeriockToken|null}
 */
export function actorToken(actor) {
  return actor.token?.object || actor.getActiveTokens?.()?.[0] || null;
}

/**
 * Creates an HTML icon element using Font Awesome classes.
 * @param {string} icon - The icon name to use.
 * @param {...Teriock.UI.IconStyle} styles - One or more Font Awesome style names (e.g., "solid", "duotone").
 * @returns {string} The HTML string for the icon element.
 */
export function makeIcon(icon, ...styles) {
  const classString = makeIconClass(icon, ...styles);
  return `<i class="${classString}"></i>`;
}

/**
 * Creates the class for an HTML icon element using Font Awesome classes.
 * @param {string} icon - The icon name to use.
 * @param {...Teriock.UI.IconStyle} styles - One or more Font Awesome style names (e.g., "solid", "duotone").
 * @returns {string} The HTML string for the icon element.
 */
export function makeIconClass(icon, ...styles) {
  const styleClasses = styles.map((s) => iconStyles[s] || s);
  const classString = styleClasses.map((s) => `fa-${s}`).join(" ");
  if (!icon.startsWith("fa-")) {
    icon = `fa-${icon}`;
  }
  return `${classString} ${icon}`;
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
 * @param {object} data - The roll data to use for the evaluation.
 * @param {object} options - Options that get passed to the roll.
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
 * Evaluates a die roll formula asynchronously and returns the total result.
 * @param {string} formula - The dice roll formula to evaluate.
 * @param {object} data - The roll data to use for the evaluation.
 * @param {object} options - Options that get passed to the roll.
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
  return roll.total;
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
  if (parsingString.includes("while up")) {
    parsedAbsentConditions.add("down");
  }
  if (parsingString.includes("while alive")) {
    parsedAbsentConditions.add("dead");
  }
  if (parsingString.includes("instant")) {
    parsedUnit = "instant";
  }
  if (parsingString.includes("until dawn")) {
    parsedUnit = "untilDawn";
  }

  // General condition parsing
  for (const condition of Object.keys(TERIOCK.index.conditions)) {
    if (parsingString.includes("not " + condition)) {
      parsedAbsentConditions.add(condition);
    } else if (parsingString.includes(condition)) {
      parsedPresentConditions.add(condition);
    }
  }
  const parsedStationary = parsingString.includes("stationary");
  // Use word boundaries for unit matching to avoid partial matches
  for (const unit of Object.keys(TERIOCK.options.ability.duration.unit)) {
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
 * Converts a number of seconds to a human-readable time string.
 * @param {number} totalSeconds - The total number of seconds to convert.
 * @returns {string} A human-readable time string.
 */
export function secondsToReadable(totalSeconds) {
  if (totalSeconds < 0) {
    return "0 seconds";
  }
  const units = [
    {
      name: "year",
      seconds: 365.25 * 24 * 60 * 60,
    },
    {
      name: "week",
      seconds: 7 * 24 * 60 * 60,
    },
    {
      name: "day",
      seconds: 24 * 60 * 60,
    },
    {
      name: "hr",
      seconds: 60 * 60,
    },
    {
      name: "min",
      seconds: 60,
    },
    {
      name: "sec",
      seconds: 1,
    },
  ];
  const parts = [];
  let remaining = Math.floor(totalSeconds);
  for (const unit of units) {
    const count = Math.floor(remaining / unit.seconds);
    if (count > 0) {
      parts.push(`${count} ${unit.name}`);
      remaining -= count * unit.seconds;
    }
  }
  return parts.length > 0 ? parts.join(", ") : "0 sec";
}

/**
 * Check if the {@link TeriockUser} owns and uses the given document.
 * @param {ClientDocument} document
 * @param {ID<TeriockUser>} userId
 * @returns {boolean}
 */
export function isOwnerAndCurrentUser(document, userId) {
  return game.user.id === userId && document.isOwner;
}

/**
 * Get the best current actor.
 * @returns {TeriockActor|null}
 */
export function getActor() {
  const speaker = ChatMessage.implementation.getSpeaker();
  const character = game.user.character;
  const token =
    (canvas.ready ? canvas.tokens.get(speaker.token) : null) || null;
  return token?.actor || game.actors.get(speaker.actor) || character || null;
}

/**
 * Get the best token for a given actor.
 * @param {TeriockActor} actor
 * @returns {TeriockToken | null}
 */
export function getToken(actor) {
  if (actor.token) {
    return actor.token.object;
  }
  const candidates = actor.getDependentTokens();
  const selected = game.canvas.tokens.controlled;
  const uuids = selected.map((t) => t.document.uuid);
  for (const candidate of candidates) {
    if (uuids.includes(candidate.uuid)) {
      return candidate.object;
    }
  }
  return null;
}

/**
 * Make common roll options.
 * @param {MouseEvent} event
 * @returns {Teriock.RollOptions.CommonRoll | Teriock.RollOptions.EquipmentRoll}
 */
export function makeCommonRollOptions(event) {
  let secret = game.settings.get("teriock", "secretEquipment");
  if (event.shiftKey) {
    secret = !secret;
  }
  return {
    advantage: event.altKey,
    disadvantage: event.shiftKey,
    crit: event.altKey,
    secret: secret,
    twoHanded: event.ctrlKey,
  };
}

/**
 * Convert the image path to one intended for token rings if possible.
 * @param {string} path
 * @returns {string}
 */
export function ringImage(path) {
  if (path.startsWith(systemPath("icons/creatures"))) {
    return path.replace(
      systemPath("icons/creatures"),
      systemPath("icons/tokens"),
    );
  }
  return path;
}

/**
 * Get the contents of a folder from its UUID.
 * @param {UUID<TeriockFolder>|TeriockFolder} folder
 * @param {object} [options]
 * @param {Teriock.Documents.CommonType[]} [options.types] - Subset of types to filter for.
 * @param {boolean} [options.uuids] - Get the UUIDs instead of the documents.
 * @returns {Promise<UUID<TeriockDocument>[]|TeriockDocument[]>}
 */
export async function folderContents(folder, options = {}) {
  const { types, uuids = true } = options;
  if (typeof folder === "string") {
    folder = await fromUuid(folder);
  }
  let out = [];
  if (folder) {
    out = folder.allContents;
    if (types) {
      out = out.filter((d) => types.includes(d.type));
    }
    if (uuids) {
      out = out.map((d) => d.uuid);
    } else if (folder.inCompendium) {
      out = Promise.all(out.map((d) => fromUuid(d.uuid)));
    }
  }
  return out;
}

/**
 * Helper function to send a query to the active GM if there is one.
 * @param {Teriock.QueryData.QueryName} queryName
 * @param {object} queryData
 * @param {Teriock.QueryData.QueryOptions} [queryOptions]
 * @returns {Promise<any>}
 */
export async function queryGM(queryName, queryData, queryOptions) {
  let {
    notifyFailure = true,
    failPrefix = "Could not complete query.",
    failReason = "No GM is currently signed in.",
    failMessage = "",
  } = queryOptions;
  if (!failMessage) {
    failMessage = `${failPrefix} ${failReason}`;
  }
  if (!game.users.activeGM && notifyFailure) {
    ui.notifications.warn(failMessage);
  }
  return await game.users.activeGM?.query(queryName, queryData, queryOptions);
}

/**
 * Maximum of two transformation levels.
 * @param {Teriock.Parameters.Shared.TransformationLevel} l1
 * @param {Teriock.Parameters.Shared.TransformationLevel} l2
 * @returns {Teriock.Parameters.Shared.TransformationLevel}
 */
export function upgradeTransformation(l1, l2) {
  if (l1 === "minor") {
    return l2;
  } else if (l1 === "full") {
    if (l2 === "greater") {
      return l2;
    }
  }
  return l1;
}

/**
 * Get a specific schema field from a document.
 * @param {TeriockDocument} doc
 * @param {string} path
 * @returns {DataSchema}
 */
export function getSchema(doc, path) {
  let schema;
  if (path.startsWith("system")) {
    schema = doc.system.schema.getField(path.replace("system.", ""));
  } else {
    schema = doc.schema.getField(path);
  }
  return schema;
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
 * Merge two objects and their arrays.
 * @param {object} original
 * @param {object} other
 * @returns {object}
 */
export function deepMerge(original, other) {
  const out = foundry.utils.deepClone(original);
  for (const [k, v] of Object.entries(other)) {
    const v1 = foundry.utils.deepClone(v);
    if (k in out) {
      const v0 = out[k];
      if (Array.isArray(v0) && Array.isArray(v1)) {
        v0.push(...v1);
      } else if (typeof v0 === "object" && typeof v1 === "object") {
        out[k] = deepMerge(out[v0], other[v1]);
      } else {
        out[k] = v1;
      }
    } else {
      out[k] = v1;
    }
  }
  return out;
}

/**
 * Ensure a document is not an index.
 * @param {TeriockDocument|Index<TeriockDocument>} syncDoc
 * @returns {Promise<TeriockDocument|void>}
 */
export async function resolveDocument(syncDoc) {
  if (!syncDoc) return;
  if (syncDoc instanceof Document) {
    return syncDoc;
  } else {
    return fromUuid(syncDoc.uuid);
  }
}

/**
 * Ensure all documents in an array are not indexes.
 * @param {(TeriockDocument|Index<TeriockDocument>)[]} syncDocs
 * @returns {Promise<TeriockDocument[]>}
 */
export async function resolveDocuments(syncDocs) {
  return Promise.all(syncDocs.map(async (syncDoc) => resolveDocument(syncDoc)));
}

/**
 * Ensure all documents in a collection are not indexes.
 * @param {TypeCollection} typeCollection
 * @returns {Promise<TypeCollection>}
 */
export async function resolveCollection(typeCollection) {
  const syncDocs = await resolveDocuments(typeCollection.contents);
  return new TypeCollection(syncDocs.map((d) => [d.id, d]));
}

/**
 * Ensure a document has all the predefined documents named.
 * @param {TeriockCommon} document
 * @param {Teriock.Documents.CommonType} type
 * @param {string[]} names
 * @returns {Promise<TeriockChild[]>}
 */
export async function ensureChildren(document, type, names) {
  const existing = document.childArray.filter((c) => c.type === type);
  names = names.filter((n) => !existing.map((e) => e.name).includes(n));
  let docs = [];
  let documentName = "Item";
  if (type === "ability") {
    documentName = "ActiveEffect";
    docs = await Promise.all(names.map((n) => getAbility(n)));
  } else if (type === "property") {
    documentName = "ActiveEffect";
    docs = await Promise.all(names.map((n) => getProperty(n)));
  } else if (type === "body") {
    docs = await Promise.all(names.map((n) => getItem(n, "bodyParts")));
  } else if (type === "equipment") {
    docs = await Promise.all(names.map((n) => getItem(n, "equipment")));
  }
  const data = docs.map((d) => d.toObject());
  return document.createChildDocuments(documentName, data);
}
