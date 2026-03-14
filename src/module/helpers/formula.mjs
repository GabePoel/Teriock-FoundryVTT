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
  return `${value} ${operator} ${delta}`;
}

/**
 * Boost a formula.
 * @param {Teriock.System.FormulaString} value - Original formula.
 * @param {Teriock.System.FormulaString} delta - Modification to formula.
 * @returns {Teriock.System.FormulaString}
 */
export function boostFormula(value, delta) {
  if (formulaExists(value)) return `sb(${value}, ${delta})`;
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
 * @param {string|number} formula
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
 * Apply boosts to fields in active effect changes.
 * @type {ActiveEffectChangeHandler}
 * @param {AnyActor | AnyItem | TeriockTokenDocument} targetDoc
 * @param {ActiveEffectChangeData} change
 * @param {{field: DataField; replacementData: Record<string, unknown>; modifyTarget: boolean;}} [options]
 * @returns {Record<string, unknown> | void}
 */
export function boostHandler(targetDoc, change, options = {}) {
  const field = options.field || targetDoc.getFieldForProperty(change.key);
  if (typeof field._applyChangeBoost === "function") {
    const value = foundry.utils.getProperty(targetDoc, change.key);
    const delta = change.value;
    const update = field._applyChangeBoost(value, delta, targetDoc, change);
    if (update !== undefined) {
      foundry.utils.setProperty(targetDoc, change.key, update);
      return { [change.key]: update };
    }
  }
}
