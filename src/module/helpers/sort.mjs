/**
 * @import { DataModel, Document, TypeDataModel } from "@common/abstract/_module.mjs";
 * @import { DataField } from "@common/data/fields.mjs";
 */

/**
 * Helper function to handle comparison between different values.
 * @param {*} aVal
 * @param {*} bVal
 * @param {DataField} [aField]
 * @param {DataField} [bField]
 * @return {number}
 */
function compare(aVal, bVal, aField, bField) {
  const aType = foundry.utils.getType(aVal);
  const bType = foundry.utils.getType(bVal);
  if (aType !== bType) { return 0; }
  if (aType === "Array") {
    if (aVal.length > 0 && bVal.length > 0) { return compare(aVal[0], bVal[0]); }
    return aVal.length - bVal.length;
  }
  if (aType === "Set") {
    if (aVal.size > 0 && bVal.size > 0) { return compare(aVal.first(), bVal.first()); }
    return aVal.size - bVal.size;
  }
  if (
    aField && bField && aField instanceof teriock.data.fields.FormulaField
    && bField instanceof teriock.data.fields.FormulaField
  ) {
    return teriock.dice.rolls.BaseRoll.meanValue(aVal || "0") - teriock.dice.rolls.BaseRoll.meanValue(bVal || "0");
  } else if (aType === "number") { return aVal - bVal; }
  else if (aType === "string") { return aVal.localeCompare(bVal); }
  else if (aType === "boolean") { return Number(aVal) - Number(bVal); }
  return 0;
}

/**
 * Build a sorter from one or more property paths. Later paths are used as tie-breakers. Handles formulas, numbers,
 * strings, booleans, arrays, and sets.
 * @param {...string} paths
 * @return {Teriock.Sort.DocumentSorter}
 */
export function pathSorterFactory(...paths) {
  const activePaths = paths.length === 1 ? [paths[0], "name", "_stats.createdTime"] : paths;
  return function pathSorter(a, b) {
    for (const path of activePaths) {
      const aField = a?.getFieldForProperty?.(path);
      const bField = b?.getFieldForProperty?.(path);
      const aVal = foundry.utils.getProperty(a, path);
      const bVal = foundry.utils.getProperty(b, path);
      const out = compare(aVal, bVal, aField, bField);
      if (out !== 0) { return out; }
    }
    return 0;
  };
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
  return (aKinds.indexOf(a?.system?.kind) - bKinds.indexOf(b?.system?.kind)) || pathSorterFactory("name")(a, b);
}

/**
 * Build a field sorter.
 * @param {DataModel | Document | TypeDataModel} model
 * @return {Teriock.Sort.FieldSorter}
 */
export function fieldSorterFactory(model) {
  return function fieldSorter(a, b) {
    const aField = model?.getFieldForProperty?.(a);
    const bField = model?.getFieldForProperty?.(b);
    if (aField?.label && bField?.label) { return _loc(aField.label).localeCompare(_loc(bField.label)); }
    return 0;
  };
}
