import { TeriockRoll } from "../dice/_module.mjs";

/**
 * Add something to a formula.
 * @param {string} value - Original formula.
 * @param {string} delta - Modification to formula.
 * @returns {string}
 */
export function addFormula(value, delta) {
  const operator = delta.startsWith("-") ? "-" : "+";
  delta = delta.replace(/^[+-]/, "").trim();
  return `${value} ${operator} ${delta}`;
}

/**
 * Downgrade a formula deterministically.
 * @param {string} value - Original formula.
 * @param {string} delta - Modification to formula.
 * @returns {string}
 */
export function downgradeDeterministicFormula(value, delta) {
  const terms = new TeriockRoll(value, {}).terms;
  if (terms.length === 1 && terms[0]?.fn === "min") {
    return value.replace(/\)$/, `, ${delta})`);
  }
  return `min(${value}, ${delta})`;
}

/**
 * Downgrade a formula indeterministically.
 * @param {string} value - Original formula.
 * @param {string} delta - Modification to formula.
 * @returns {string}
 */
export function downgradeIndeterministicFormula(value, delta) {
  const valueTotal = TeriockRoll.meanValue(value);
  const deltaTotal = TeriockRoll.meanValue(delta);
  if (deltaTotal <= valueTotal) {
    return delta;
  } else {
    return value;
  }
}

/**
 * Multiply a formula with something.
 * @param {string} value - Original formula.
 * @param {string} delta - Modification to formula.
 * @returns {string}
 */
export function multiplyFormula(value, delta) {
  if (Number(delta) === 1) {
    return value;
  }
  const terms = new TeriockRoll(value, {}).terms;
  if (terms.length > 1) {
    return `(${value}) * ${delta}`;
  }
  return `${value} * ${delta}`;
}

/**
 * Upgrade a formula deterministically.
 * @param {string} value - Original formula.
 * @param {string} delta - Modification to formula.
 * @returns {string}
 */
export function upgradeDeterministicFormula(value, delta) {
  const terms = new TeriockRoll(value, {}).terms;
  if (terms.length === 1 && terms[0]?.fn === "max") {
    return value.replace(/\)$/, `, ${delta})`);
  }
  return `max(${value}, ${delta})`;
}

/**
 * Upgrade a formula indeterministically.
 * @param {string} value - Original formula.
 * @param {string} delta - Modification to formula.
 * @returns {string}
 */
export function upgradeIndeterministicFormula(value, delta) {
  const valueTotal = TeriockRoll.meanValue(value);
  const deltaTotal = TeriockRoll.meanValue(delta);
  if (deltaTotal >= valueTotal) {
    return delta;
  } else {
    return value;
  }
}
