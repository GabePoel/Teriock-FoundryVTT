import BaseRoll from "../dice/rolls/base-roll.mjs";

const { getProperty } = foundry.utils;

/**
 * Build a sorter for a number value, then name.
 * @param {string} path
 * @returns {Teriock.Sort.DocumentSorter}
 */
export function numberSorterFactory(path) {
  return (a, b) => ((getProperty(a, path) ?? 0) - (getProperty(b, path) ?? 0)) || nameSorter(a, b);
}

/**
 * Build a sorter for a string value, then name.
 * @param {string} path
 * @returns {Teriock.Sort.DocumentSorter}
 */
export function stringSorterFactory(path) {
  return (a, b) =>
    String(getProperty(a, path) ?? "").localeCompare(String(getProperty(b, path) ?? "")) || nameSorter(a, b);
}

/**
 * Build a sorter for a formula value, then name.
 * @param {string} path
 * @returns {Teriock.Sort.DocumentSorter}
 */
export function formulaSorterFactory(path) {
  return (a, b) =>
    (BaseRoll.meanValue(getProperty(a, path) || "0") - BaseRoll.meanValue(getProperty(b, path) || "0"))
    || nameSorter(a, b);
}

/**
 * Sort based on document name.
 * @param {TeriockDocument} a
 * @param {TeriockDocument} b
 * @returns {number}
 */
export function nameSorter(a, b) {
  return (a?.name ?? "").localeCompare(b?.name ?? "");
}

/**
 * Sort based on document sort key.
 * @param {TeriockDocument} a
 * @param {TeriockDocument} b
 * @returns {number}
 */
export function sortSorter(a, b) {
  return (a?.sort ?? 0) - (b?.sort ?? 0);
}

/**
 * Sort based on document age.
 * @param {TeriockDocument} a
 * @param {TeriockDocument} b
 * @returns {number}
 */
export function ageSorter(a, b) {
  return (a?._stats?.createdTime ?? 0) - (b?._stats?.createdTime ?? 0);
}

/**
 * Sort based on document kind, then name.
 * @param {TeriockDocument} a
 * @param {TeriockDocument} b
 * @returns {number}
 */
export function kindSorter(a, b) {
  const aKinds = Object.keys(a?.system?.constructor?.kinds?.() ?? {});
  const bKinds = Object.keys(b?.system?.constructor?.kinds?.() ?? {});
  return (aKinds.indexOf(a?.system?.kind) - bKinds.indexOf(b?.system?.kind)) || nameSorter(a, b);
}

/**
 * The sorter configured for a document type.
 * @param {Teriock.Documents.ChildType} type
 * @returns {Teriock.Sort.DocumentSorter}
 */
export function getTypeSorter(type) {
  return TERIOCK.config.document[type]?.sorter ?? nameSorter;
}

/**
 * Sort based on rank system.
 * @param {TeriockRank|TeriockArchetype} a
 * @param {TeriockRank|TeriockArchetype} b
 * @returns {number}
 */
export function rankSorter(a, b) {
  const aIsRank = a.type === "rank" && a.system?._source?.class;
  const bIsRank = b.type === "rank" && b.system?._source?.class;
  if (!aIsRank || !bIsRank) { return nameSorter(a, b); }
  if (a.system.innate !== b.system.innate) { return a.system.innate ? -1 : 1; }
  if (a.system._source.archetype === "everyman" && b.system._source.archetype !== "everyman") { return -1; }
  if (a.system._source.archetype !== "everyman" && b.system._source.archetype === "everyman") { return 1; }
  if (a.system._source.class !== b.system._source.class) {
    return a.system._source.class.localeCompare(b.system._source.class);
  }
  if (a.system.number !== b.system.number) { return a.system.number - b.system.number; }
  return nameSorter(a, b);
}

/**
 * Sort roll table results by their roll range, then sort key, then name.
 * @param {TeriockTableResult} a
 * @param {TeriockTableResult} b
 * @returns {number}
 */
export function tableResultSorter(a, b) {
  return ((a.range?.[0] ?? 0) - (b.range?.[0] ?? 0)) || sortSorter(a, b) || nameSorter(a, b);
}

/**
 * Sort conditions.
 * @param {Teriock.Keys.Condition[]} conditions
 */
export function conditionSort(conditions) {
  conditions.sort((a, b) => {
    if (a === "dead") { return -1; }
    if (b === "dead") { return 1; }
    if (a === "unconscious") { return b === "dead" ? 1 : -1; }
    if (b === "unconscious") { return a === "dead" ? -1 : 1; }
    if (a === "down") { return b === "dead" || b === "unconscious" ? 1 : -1; }
    if (b === "down") { return a === "dead" || a === "unconscious" ? -1 : 1; }
    return a.localeCompare(b);
  });
  return conditions;
}
