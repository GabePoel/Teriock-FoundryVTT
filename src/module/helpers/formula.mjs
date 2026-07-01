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
  const minus = operator === "-" ? "-" : "";
  delta = delta.replace(/^[+-]/, "").trim();
  if (!formulaExists(value)) { return `${minus} ${delta}`.trim(); }
  if (!formulaExists(delta)) { return value; }
  return `${value} ${operator} ${delta}`;
}

/**
 * Subtract something from a formula.
 * @param {Teriock.System.FormulaString} value
 * @param {Teriock.System.FormulaString} delta
 * @returns {Teriock.System.FormulaString}
 */
export function subtractFormula(value, delta) {
  const operator = delta.startsWith("-") ? "+" : "-";
  const minus = operator === "-" ? "-" : "";
  delta = delta.replace(/^[+-]/, "").trim();
  if (!formulaExists(value)) { return `${minus} ${delta}`.trim(); }
  if (!formulaExists(delta)) { return value; }
  return `${value} ${operator} ${delta}`;
}

/**
 * Boost a formula.
 * @param {Teriock.System.FormulaString} value - Original formula.
 * @param {Teriock.System.FormulaString} delta - Modification to formula.
 * @returns {Teriock.System.FormulaString}
 */
export function boostFormula(value, delta) {
  if (formulaExists(value) && formulaExists(delta)) { return `sb(${value}, ${delta})`; }
  return value;
}

/**
 * Downgrade a formula deterministically.
 * @param {Teriock.System.FormulaString} value - Original formula.
 * @param {Teriock.System.FormulaString} delta - Modification to formula.
 * @returns {Teriock.System.FormulaString}
 */
export function downgradeDeterministicFormula(value, delta) {
  const terms = new teriock.dice.rolls.BaseRoll(value, {}).terms;
  if (terms.length === 1 && terms[0]?.fn === "min") { return value.replace(/\)$/, `, ${delta})`); }
  return `min(${value}, ${delta})`;
}

/**
 * Downgrade a formula indeterministically.
 * @param {Teriock.System.FormulaString} value - Original formula.
 * @param {Teriock.System.FormulaString} delta - Modification to formula.
 * @returns {Teriock.System.FormulaString}
 */
export function downgradeIndeterministicFormula(value, delta) {
  const valueTotal = teriock.dice.rolls.BaseRoll.meanValue(value);
  const deltaTotal = teriock.dice.rolls.BaseRoll.meanValue(delta);
  if (deltaTotal <= valueTotal) { return delta; }
  return value;
}

/**
 * Multiply a formula with something.
 * @param {Teriock.System.FormulaString} value - Original formula.
 * @param {Teriock.System.FormulaString} delta - Modification to formula.
 * @returns {Teriock.System.FormulaString}
 */
export function multiplyFormula(value, delta) {
  if (Number(delta) === 1) { return value; }
  const valueTerms = new teriock.dice.rolls.BaseRoll(value, {}).terms;
  const deltaTerms = new teriock.dice.rolls.BaseRoll(delta, {}).terms;
  const valueString = valueTerms.length > 1 ? `(${value})` : value;
  const deltaString = deltaTerms.length > 1 ? `(${delta})` : delta;
  return `${valueString} * ${deltaString}`;
}

/**
 * Substitute a formula with a new one where the substitution term is the old formula.
 * @param {Teriock.System.FormulaString} value
 * @param {Teriock.System.FormulaString} delta
 * @param {string} [substitutionTerm="base"]
 * @returns {Teriock.System.FormulaString}
 */
export function substituteFormula(value, delta, substitutionTerm = "base") {
  if (!formulaExists(value)) { return delta; }
  return BaseRoll.replaceFormulaData(delta, { [substitutionTerm]: value });
}

/**
 * Upgrade a formula deterministically.
 * @param {Teriock.System.FormulaString} value - Original formula.
 * @param {Teriock.System.FormulaString} delta - Modification to formula.
 * @returns {Teriock.System.FormulaString}
 */
export function upgradeDeterministicFormula(value, delta) {
  const terms = new teriock.dice.rolls.BaseRoll(value, {}).terms;
  if (terms.length === 1 && terms[0]?.fn === "max") { return value.replace(/\)$/, `, ${delta})`); }
  return `max(${value}, ${delta})`;
}

/**
 * Upgrade a formula indeterministically.
 * @param {Teriock.System.FormulaString} value - Original formula.
 * @param {Teriock.System.FormulaString} delta - Modification to formula.
 * @returns {Teriock.System.FormulaString}
 */
export function upgradeIndeterministicFormula(value, delta) {
  const valueTotal = teriock.dice.rolls.BaseRoll.meanValue(value);
  const deltaTotal = teriock.dice.rolls.BaseRoll.meanValue(delta);
  if (deltaTotal >= valueTotal) { return delta; }
  return value;
}

/**
 * Check if a formula would exist.
 * @param {Teriock.System.FormulaString|number} formula
 * @returns {boolean}
 */
export function formulaExists(formula) {
  return Boolean(formula) && (typeof formula === "string" && formula.trim() !== "0");
}

/**
 * @param {RollTerm} term
 * @returns Set<string>
 */
function getTermTypes(term) {
  return new Set(term.flavor.toLowerCase().split(" ").map(type => type.trim()).filter(Boolean));
}

/**
 * @param {RollTerm} term
 * @param {Set<string>} types
 */
function setTermTypes(term, types) {
  term.options.flavor = Array.from(types).filter(Boolean).join(" ");
}

/**
 * @param {RollTerm} term
 * @param {Set<string>} types
 */
function removeTermTypes(term, types) {
  const existingTypes = getTermTypes(term);
  for (const type of types) { existingTypes.delete(type); }
  setTermTypes(term, existingTypes);
}

/**
 * @param {RollTerm} term
 * @param {Set<string>} types
 */
function addTermTypes(term, types) {
  const existingTypes = getTermTypes(term);
  for (const type of types) { existingTypes.add(type); }
  setTermTypes(term, existingTypes);
}

/**
 * @param {Teriock.System.FormulaString} formula
 * @param {Iterable<Identifier>} types
 * @param {(term: RollTerm, types: Set<string>) => void} fn
 * @returns {Teriock.System.FormulaString}
 */
function processFormula(formula, types, fn) {
  if (["number", "string"].includes(typeof types)) { types = [types.toString()]; }
  if (!formulaExists(formula)) { return formula; }
  types = new Set(Array.from(types).filter(t => isKebabCase(t)));
  const roll = new BaseRoll(formula);
  for (const term of roll._allTerms) { fn(term, types); }
  return roll.formula;
}

/**
 * Add types to a formula that supports them. All types must be identifiers.
 * @param {Teriock.System.FormulaString} formula
 * @param {Iterable<Identifier>} types
 * @returns {Teriock.System.FormulaString}
 */
export function addTypesToFormula(formula, types) {
  return processFormula(formula, types, addTermTypes);
}

/**
 * Remove types from a formula that supports them. All types must be identifiers.
 * @param {Teriock.System.FormulaString} formula
 * @param {Iterable<Identifier>} types
 * @returns {Teriock.System.FormulaString}
 */
export function removeTypesFromFormula(formula, types) {
  return processFormula(formula, types, removeTermTypes);
}

/**
 * Set types of a formula that supports them. All types must be identifiers.
 * @param {Teriock.System.FormulaString} formula
 * @param {Iterable<Identifier>} types
 * @returns {Teriock.System.FormulaString}
 */
export function setTypesOfFormula(formula, types) {
  return processFormula(formula, types, setTermTypes);
}
