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
  if (deltaTotal <= valueTotal) {
    return delta;
  } else {
    return value;
  }
}

/**
 * Multiply a formula with something.
 * @param {Teriock.System.FormulaString} value - Original formula.
 * @param {Teriock.System.FormulaString} delta - Modification to formula.
 * @returns {Teriock.System.FormulaString}
 */
export function multiplyFormula(value, delta) {
  if (Number(delta) === 1) {
    return value;
  }
  const terms = new game.teriock.Roll(value, {}).terms;
  if (terms.length > 1) {
    return `(${value}) * ${delta}`;
  }
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
  if (deltaTotal >= valueTotal) {
    return delta;
  } else {
    return value;
  }
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
  if (!formula) {
    return false;
  }
  if (typeof formula === "string") {
    formula = formula.trim();
    return Boolean(formula.length > 0 && formula !== "0");
  } else {
    return Boolean(formula);
  }
}

/**
 * Add types to a formula that supports them. All types must be identifiers.
 * @param {Teriock.System.FormulaString} formula
 * @param {Iterable<Teriock.System.IdentifierString>} types
 * @returns {Teriock.System.FormulaString}
 */
export function addTypesToFormula(formula, types) {
  types = Array.from(types).filter((t) => isKebabCase(t));
  if (formulaExists(formula)) {
    const roll = new BaseRoll(formula);
    const terms = roll.terms.filter(
      (t) => !t.isDeterministic && !isNaN(Number(t.expression)),
    );
    terms.push(...roll.dice);
    terms.forEach((term) => {
      const existingTypes = term.flavor
        .toLowerCase()
        .split(" ")
        .map((type) => type.trim());
      existingTypes.push(...types);
      const reducedTypes = Array.from(new Set(types)).filter((t) => t);
      reducedTypes.sort((a, b) => a.localeCompare(b));
      term.options.flavor = reducedTypes.join(" ");
    });
    return roll.formula;
  }
  return formula;
}
