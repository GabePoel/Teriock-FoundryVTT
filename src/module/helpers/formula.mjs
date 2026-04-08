import { BaseRoll } from "../dice/rolls/_module.mjs";
import { isKebabCase } from "./string.mjs";

/**
 * Add something to a formula.
 * @param {Teriock.System.FormulaString} value - Original formula.
 * @param {Teriock.System.FormulaString} delta - Modification to formula.
 * @returns {Teriock.System.FormulaString}
 */
export function addFormula(value, delta) {
  const operator = delta.startsWith("-") ? "-" : "+";
  delta = delta.replace(/^[+-]/, "").trim();
  if (!formulaExists(value)) return delta;
  if (!formulaExists(delta)) return value;
  return `${value} ${operator} ${delta}`;
}

/**
 * Boost a formula.
 * @param {Teriock.System.FormulaString} value - Original formula.
 * @param {Teriock.System.FormulaString} delta - Modification to formula.
 * @returns {Teriock.System.FormulaString}
 */
export function boostFormula(value, delta) {
  if (formulaExists(value) && formulaExists(delta)) {
    return `sb(${value}, ${delta})`;
  }
  return value;
}

/**
 * Downgrade a formula deterministically.
 * @param {Teriock.System.FormulaString} value - Original formula.
 * @param {Teriock.System.FormulaString} delta - Modification to formula.
 * @returns {Teriock.System.FormulaString}
 */
export function downgradeDeterministicFormula(value, delta) {
  const terms = new game.teriock.Roll(value, {}).terms;
  if (terms.length === 1 && terms[0]?.fn === "min") {
    return value.replace(/\)$/, `, ${delta})`);
  }
  return `min(${value}, ${delta})`;
}

/**
 * Downgrade a formula indeterministically.
 * @param {Teriock.System.FormulaString} value - Original formula.
 * @param {Teriock.System.FormulaString} delta - Modification to formula.
 * @returns {Teriock.System.FormulaString}
 */
export function downgradeIndeterministicFormula(value, delta) {
  const valueTotal = game.teriock.Roll.meanValue(value);
  const deltaTotal = game.teriock.Roll.meanValue(delta);
  if (deltaTotal <= valueTotal) return delta;
  return value;
}

/**
 * Multiply a formula with something.
 * @param {Teriock.System.FormulaString} value - Original formula.
 * @param {Teriock.System.FormulaString} delta - Modification to formula.
 * @returns {Teriock.System.FormulaString}
 */
export function multiplyFormula(value, delta) {
  if (Number(delta) === 1) return value;
  const terms = new game.teriock.Roll(value, {}).terms;
  if (terms.length > 1) return `(${value}) * ${delta}`;
  return `${value} * ${delta}`;
}

/**
 * Upgrade a formula deterministically.
 * @param {Teriock.System.FormulaString} value - Original formula.
 * @param {Teriock.System.FormulaString} delta - Modification to formula.
 * @returns {Teriock.System.FormulaString}
 */
export function upgradeDeterministicFormula(value, delta) {
  const terms = new game.teriock.Roll(value, {}).terms;
  if (terms.length === 1 && terms[0]?.fn === "max") {
    return value.replace(/\)$/, `, ${delta})`);
  }
  return `max(${value}, ${delta})`;
}

/**
 * Upgrade a formula indeterministically.
 * @param {Teriock.System.FormulaString} value - Original formula.
 * @param {Teriock.System.FormulaString} delta - Modification to formula.
 * @returns {Teriock.System.FormulaString}
 */
export function upgradeIndeterministicFormula(value, delta) {
  const valueTotal = game.teriock.Roll.meanValue(value);
  const deltaTotal = game.teriock.Roll.meanValue(delta);
  if (deltaTotal >= valueTotal) return delta;
  return value;
}

/**
 * Transform a formula indeterministically.
 * @param {Teriock.System.FormulaString} value
 * @param {Teriock.System.FormulaString} delta
 * @param {number} mode
 * @returns {Teriock.System.FormulaString}
 */
export function manipulateFormula(value, delta, mode) {
  switch (mode) {
    case CONST.ACTIVE_EFFECT_MODES.ADD:
      return addFormula(value, delta);
    case CONST.ACTIVE_EFFECT_MODES.MULTIPLY:
      return multiplyFormula(value, delta);
    case CONST.ACTIVE_EFFECT_MODES.UPGRADE:
      return upgradeIndeterministicFormula(value, delta);
    case CONST.ACTIVE_EFFECT_MODES.DOWNGRADE:
      return downgradeIndeterministicFormula(value, delta);
    case CONST.ACTIVE_EFFECT_MODES.OVERRIDE:
      return delta;
    case CONST.ACTIVE_EFFECT_MODES.CUSTOM:
      return boostFormula(value, delta);
  }
  return value;
}

/**
 * Check if a formula would exist.
 * @param {Teriock.System.FormulaString|number} formula
 * @returns {boolean}
 */
export function formulaExists(formula) {
  if (!formula) return false;
  if (typeof formula === "string") {
    formula = formula.trim();
    return Boolean(formula.length > 0 && formula !== "0");
  } else {
    return Boolean(formula);
  }
}

/**
 * @param {RollTerm} term
 * @returns Set<string>
 */
function getTermTypes(term) {
  return new Set(
    term.flavor
      .toLowerCase()
      .split(" ")
      .map((type) => type.trim())
      .filter((_) => _),
  );
}

/**
 * @param {RollTerm} term
 * @param {Set<string>} types
 */
function setTermTypes(term, types) {
  term.options.flavor = Array.from(types)
    .filter((_) => _)
    .join(" ");
}

/**
 * @param {RollTerm} term
 * @param {Set<string>} types
 */
function removeTermTypes(term, types) {
  const existingTypes = getTermTypes(term);
  for (const type of types) existingTypes.delete(type);
  setTermTypes(term, existingTypes);
}

/**
 * @param {RollTerm} term
 * @param {Set<string>} types
 */
function addTermTypes(term, types) {
  const existingTypes = getTermTypes(term);
  for (const type of types) existingTypes.add(type);
  setTermTypes(term, existingTypes);
}

/**
 * @param {Teriock.System.FormulaString} formula
 * @param {Iterable<Teriock.System.IdentifierString>} types
 * @param {(term: RollTerm, types: Set<string>) => void} fn
 * @returns {Teriock.System.FormulaString}
 */
function processFormula(formula, types, fn) {
  if (!formulaExists(formula)) return formula;
  types = new Set(Array.from(types).filter((t) => isKebabCase(t)));
  const roll = new BaseRoll(formula);
  for (const term of roll._allTerms) fn(term, types);
  return roll.formula;
}

/**
 * Add types to a formula that supports them. All types must be identifiers.
 * @param {Teriock.System.FormulaString} formula
 * @param {Iterable<Teriock.System.IdentifierString>} types
 * @returns {Teriock.System.FormulaString}
 */
export function addTypesToFormula(formula, types) {
  return processFormula(formula, types, addTermTypes);
}

/**
 * Remove types from a formula that supports them. All types must be identifiers.
 * @param {Teriock.System.FormulaString} formula
 * @param {Iterable<Teriock.System.IdentifierString>} types
 * @returns {Teriock.System.FormulaString}
 */
export function removeTypesFromFormula(formula, types) {
  return processFormula(formula, types, removeTermTypes);
}

/**
 * Set types of a formula that supports them. All types must be identifiers.
 * @param {Teriock.System.FormulaString} formula
 * @param {Iterable<Teriock.System.IdentifierString>} types
 * @returns {Teriock.System.FormulaString}
 */
export function setTypesOfFormula(formula, types) {
  return processFormula(formula, types, setTermTypes);
}
