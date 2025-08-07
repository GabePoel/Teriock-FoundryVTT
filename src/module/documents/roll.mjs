const { Roll } = foundry.dice;

/**
 * A custom Roll class which enriches the provided flavor and uses a custom
 * chat template to display the flavor as enriched HTML. Also allows for custom
 * functions that Teriock requires.
 *
 * Relevant wiki pages:
 * - [Boosted](https://wiki.teriock.com/index.php/Keyword:Boosted)
 * - [Deboosted](https://wiki.teriock.com/index.php/Keyword:Deboosted)
 */
export default class TeriockRoll extends Roll {
  /** @inheritDoc */
  static CHAT_TEMPLATE =
    "systems/teriock/src/templates/document-templates/roll-templates/roll.hbs";

  /**
   * Creates a new TeriockRoll instance with enforced parsing and enrichment options.
   * @override
   * @param {string} formula - The roll formula to parse.
   * @param {object} data - Data to use for the roll.
   * @param {object} options - Options for the roll, including enrichment settings.
   */
  constructor(formula, data, options = {}) {
    const parsedFormula = TeriockRoll.#parseFormula(formula);
    super(parsedFormula, data, options);
    this.context = options.context || {};
  }

  /**
   * Parses a roll formula and pre-evaluates boost/deboost functions.
   *
   * Recursively processes the formula to find boost() and deboost() functions,
   * evaluates the dice within those functions, applies the boost/deboost logic,
   * and replaces the function calls with the resulting formula.
   *
   * Supports both full function names (boost/deboost/setboost) and short aliases (b/db/sb).
   *
   * @param {string} formula - The roll formula to parse
   * @returns {string} The parsed formula with boost/deboost functions evaluated
   *
   * @example
   * // Simple formula remains unchanged
   * TeriockRoll.parseFormula("2d4 + 1d6") // -> "2d4 + 1d6"
   *
   * @example
   * // Boost function gets evaluated
   * TeriockRoll.parseFormula("boost(2d4 + 1d6)") // -> "2d4 + 2d6"
   * TeriockRoll.parseFormula("b(2d4 + 1d6)") // -> "2d4 + 2d6"
   *
   * @example
   * // Mixed formula with boost function
   * TeriockRoll.parseFormula("boost(2d4 + 1d6) + 1d8") // -> "2d4 + 2d6 + 1d8"
   * TeriockRoll.parseFormula("b(2d4 + 1d6) + 1d8") // -> "2d4 + 2d6 + 1d8"
   *
   * @example
   * // Setboost function with specific number of boosts
   * TeriockRoll.parseFormula("setboost(1d6, 1)") // -> "2d6"
   * TeriockRoll.parseFormula("sb(1d6, 1)") // -> "2d6"
   * TeriockRoll.parseFormula("setboost(1d6, 2)") // -> "3d6"
   * TeriockRoll.parseFormula("setboost(1d6, -1)") // -> "0d6"
   *
   * @example
   * // Cancelling boost/deboost functions
   * TeriockRoll.parseFormula("boost(deboost(2d4 + 1d6))") // -> "2d4 + 1d6"
   * TeriockRoll.parseFormula("b(db(2d4 + 1d6))") // -> "2d4 + 1d6"
   */
  static #parseFormula(formula) {
    return TeriockRoll.#parseFormulaRecursive(formula);
  }

  /**
   * Recursively parses a formula to handle nested boost/deboost functions.
   *
   * @param {string} formula - The formula to parse
   * @returns {string} The parsed formula
   * @private
   */
  static #parseFormulaRecursive(formula) {
    // Find the outermost boost, deboost, or setboost function (including aliases)
    const boostMatch = formula.match(/(?:boost|b)\s*\(/);
    const deboostMatch = formula.match(/(?:deboost|db)\s*\(/);
    const setboostMatch = formula.match(/(?:setboost|sb)\s*\(/);

    if (!boostMatch && !deboostMatch && !setboostMatch) {
      return formula; // No functions to process
    }

    // Find the start of the first function
    const boostIndex = boostMatch ? boostMatch.index : Infinity;
    const deboostIndex = deboostMatch ? deboostMatch.index : Infinity;
    const setboostIndex = setboostMatch ? setboostMatch.index : Infinity;
    const firstFunctionIndex = Math.min(
      boostIndex,
      deboostIndex,
      setboostIndex,
    );

    // Split the formula into parts
    const beforeFunction = formula.substring(0, firstFunctionIndex);
    const functionStart = formula.substring(firstFunctionIndex);

    // Find the matching closing parenthesis
    const innerFormula = TeriockRoll.#extractFunctionContent(functionStart);
    const functionName = functionStart.match(
      /^(boost|b|deboost|db|setboost|sb)\s*\(/,
    )[1];
    const afterFunction = functionStart.substring(
      functionStart.indexOf(innerFormula) + innerFormula.length + 1,
    );

    // Recursively parse the inner formula
    const parsedInnerFormula = TeriockRoll.#parseFormulaRecursive(innerFormula);

    // Evaluate the function (map aliases to full names)
    let evaluatedFormula;
    if (functionName === "boost" || functionName === "b") {
      evaluatedFormula = TeriockRoll.#evaluateBoostFunction(
        parsedInnerFormula,
        true,
      );
    } else if (functionName === "deboost" || functionName === "db") {
      evaluatedFormula = TeriockRoll.#evaluateBoostFunction(
        parsedInnerFormula,
        false,
      );
    } else if (functionName === "setboost" || functionName === "sb") {
      evaluatedFormula =
        TeriockRoll.#evaluateSetboostFunction(parsedInnerFormula);
    }

    // Recursively parse the rest of the formula
    const parsedAfterFunction =
      TeriockRoll.#parseFormulaRecursive(afterFunction);

    return beforeFunction + evaluatedFormula + parsedAfterFunction;
  }

  /**
   * Extracts the content of a function call, handling nested parentheses.
   *
   * @param {string} functionCall - The function call starting with function name
   * @returns {string} The content inside the function parentheses
   * @private
   */
  static #extractFunctionContent(functionCall) {
    const openParenIndex = functionCall.indexOf("(");
    if (openParenIndex === -1) {
      foundry.ui.notifications.error(
        `Invalid function call: missing opening parenthesis`,
      );
    }

    let parenCount = 0;
    let contentStart = openParenIndex + 1;

    for (let i = contentStart; i < functionCall.length; i++) {
      const char = functionCall[i];
      if (char === "(") {
        parenCount++;
      } else if (char === ")") {
        if (parenCount === 0) {
          return functionCall.substring(contentStart, i);
        }
        parenCount--;
      }
    }

    foundry.ui.notifications.error(
      `Invalid function call: missing closing parenthesis`,
    );
  }

  /**
   * Evaluates a boost or deboost function by creating a temporary roll,
   * applying the boost/deboost, and returning the resulting formula.
   *
   * @param {string} innerFormula - The formula inside the boost/deboost function
   * @param {boolean} isBoost - True for boost, false for deboost
   * @returns {string} The resulting formula after boost/deboost is applied
   * @private
   */
  static #evaluateBoostFunction(innerFormula, isBoost) {
    try {
      // Create a temporary regular Roll to avoid circular dependency
      const tempRoll = new foundry.dice.Roll(innerFormula);

      // Apply boost or deboost logic directly
      if (isBoost) {
        TeriockRoll._boost(tempRoll);
      } else {
        TeriockRoll._deboost(tempRoll);
      }

      // Return the modified formula
      return tempRoll.formula;
    } catch (error) {
      console.warn(
        `Failed to evaluate ${isBoost ? "boost" : "deboost"} function:`,
        error,
      );
      return innerFormula; // Return original formula if evaluation fails
    }
  }

  /**
   * Evaluates a setboost function by creating a temporary roll,
   * applying the specified number of boosts/deboosts, and returning the resulting formula.
   *
   * @param {string} innerFormula - The formula inside the setboost function (e.g., "1d6, 1")
   * @returns {string} The resulting formula after setboost is applied
   * @private
   */
  static #evaluateSetboostFunction(innerFormula) {
    try {
      // Parse the parameters: "formula, number"
      const commaIndex = innerFormula.lastIndexOf(",");
      if (commaIndex === -1) {
        foundry.ui.notifications.error(
          `Invalid setboost function: missing comma separator`,
        );
        return innerFormula;
      }

      const formulaPart = innerFormula.substring(0, commaIndex).trim();
      const numberPart = innerFormula.substring(commaIndex + 1).trim();

      // Parse the number
      const boostNumber = parseInt(numberPart, 10);
      if (isNaN(boostNumber)) {
        foundry.ui.notifications.error(
          `Invalid setboost function: invalid number parameter "${numberPart}"`,
        );
        return innerFormula;
      }

      // Create a temporary regular Roll to avoid circular dependency
      const tempRoll = new foundry.dice.Roll(formulaPart);

      // Apply the specified number of boosts/deboosts
      if (boostNumber > 0) {
        for (let i = 0; i < boostNumber; i++) {
          TeriockRoll._boost(tempRoll);
        }
      } else if (boostNumber < 0) {
        for (let i = 0; i < Math.abs(boostNumber); i++) {
          TeriockRoll._deboost(tempRoll);
        }
      }
      // If boostNumber is 0, no changes are made

      // Return the modified formula
      return tempRoll.formula;
    } catch (error) {
      console.warn(`Failed to evaluate setboost function:`, error);
      return innerFormula; // Return original formula if evaluation fails
    }
  }

  /**
   * Applies boost logic to a roll by increasing the highest face die.
   * @private
   */
  static _boost(roll) {
    const die = selectWeightedMaxFaceDie(roll.dice);
    die._number = die._number + 1;
    roll.resetFormula();
  }

  /**
   * Applies deboost logic to a roll by decreasing the highest face die.
   * @private
   */
  static _deboost(roll) {
    const die = selectWeightedMaxFaceDie(roll.dice);
    die._number = Math.max(0, die._number - 1);
    roll.resetFormula();
  }

  /** @inheritDoc */
  async _prepareChatRenderContext(options = {}) {
    const context = await super._prepareChatRenderContext(options);
    if (this.context) {
      Object.assign(context, this.context);
    }
    return context;
  }

  /**
   * Applies a boost to this roll by increasing the highest face die.
   *
   * Relevant wiki pages:
   * - [Boosted](https://wiki.teriock.com/index.php/Keyword:Boosted)
   *
   * @returns {void}
   */
  boost() {
    TeriockRoll._boost(this);
  }

  /**
   * Applies a deboost to this roll by decreasing the highest face die.
   *
   * Relevant wiki pages:
   * - [Deboosted](https://wiki.teriock.com/index.php/Keyword:Deboosted)
   *
   * @returns {void}
   */
  deboost() {
    TeriockRoll._deboost(this);
  }

  /**
   * Sets the number of boosts or deboosts for this roll.
   * Positive numbers apply boosts, negative numbers apply deboosts.
   * @param {number} number - The number of boosts or deboosts to apply. Positive numbers boost, negative numbers
   *   deboost.
   * @returns {void}
   */
  setBoost(number) {
    if (number === 0) return;
    const method = number > 0 ? this.boost.bind(this) : this.deboost.bind(this);
    for (let i = 0; i < Math.abs(number); i++) {
      method();
    }
  }
}

/**
 */
function selectWeightedMaxFaceDie(diceTerms) {
  const maxFaces = Math.max(...diceTerms.map((term) => term.faces));
  const maxFaceTerms = diceTerms.filter((term) => term.faces === maxFaces);
  const totalWeight = maxFaceTerms.reduce((sum, term) => sum + term.number, 0);
  let r = Math.random() * totalWeight;
  for (const term of maxFaceTerms) {
    if (r < term.number) return term;
    r -= term.number;
  }
  return maxFaceTerms[maxFaceTerms.length - 1];
}
